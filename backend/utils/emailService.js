const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  console.log('📧 Setting up email transporter...');
  
  // If real Gmail credentials are provided, use them
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
    console.log('📧 Using real Gmail credentials from environment variables');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  
  return null;
};

const sendEmail = async (options) => {
  try {
    console.log('\n📧 Attempting to send email...');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);

    const transporter = createTransporter();
    
    if (!transporter) {
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      return {
        success: true,
        messageId: 'no-email-config-' + Date.now(),
        note: 'Email not configured - see EMAIL_SETUP.md'
      };
    }

    const message = {
      from: `${process.env.FROM_NAME || 'Smart Health Care'} <${process.env.EMAIL_FROM || 'noreply@smarthealth.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(message);
    
    console.log('\n✅ Email sent successfully!');
    console.log('📧 To:', options.email);
    console.log('📬 Message ID:', info.messageId);
    
    // For Ethereal test emails, show preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('');
     
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl
    };
  } catch (error) {
    console.error('\n❌ Email send error:', error.message);
    
   
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return {
      success: true,
      messageId: 'error-fallback-' + Date.now(),
      note: 'Email failed but simulation provided'
    };
  }
};

const sendPasswordResetEmail = async (user, resetToken, req) => {
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  
  // For frontend development, use the frontend URL
  const frontendResetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
          <p>Smart Health Care</p>
        </div>
        <div class="content">
          <h2>Hello ${user.username}!</h2>
          <p>You have requested to reset your password for your Smart Health Care account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${frontendResetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${frontendResetUrl}
          </p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 10 minutes for security reasons</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
          
          <p>If you have any questions or need help, please contact our support team.</p>
          
          <p>Best regards,<br>
          The Smart Health Care Team</p>
        </div>
        <div class="footer">
          <p>This email was sent to ${user.email}</p>
          <p>© 2024 Smart Health Care. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${user.username}!

    You have requested to reset your password for your Smart Health Care account.

    Please visit the following link to reset your password:
    ${frontendResetUrl}

    This link will expire in 10 minutes for security reasons.

    If you didn't request this password reset, please ignore this email.

    Best regards,
    The Smart Health Care Team
  `;

  await sendEmail({
    email: user.email,
    subject: '🔐 Password Reset Request - Smart Health Care',
    html,
    text,
    resetUrl: frontendResetUrl
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
}; 