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
  
  // For development, use environment variables or skip email sending
  console.log('📧 No email credentials provided - using simulation mode');
  return null;
};

const sendEmail = async (options) => {
  // For development mode, skip actual email sending and just log the details
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📧 Email Simulation (Development Mode):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📩 From: Smart Health Care <noreply@smarthealth.com>');
    console.log('📧 To:', options.email);
    console.log('📋 Subject:', options.subject);
    console.log('🔗 Reset URL:', options.resetUrl || 'N/A');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 TO RESET PASSWORD IN DEVELOPMENT:');
    console.log('   Copy this URL and open it in your browser:');
    console.log('   👉', options.resetUrl || 'N/A');
    console.log('');
    console.log('📝 Note: Email service is simulated in development mode.');
    console.log('   In production, set EMAIL_FROM and EMAIL_PASSWORD environment variables.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    return {
      success: true,
      messageId: 'dev-sim-' + Date.now(),
      note: 'Email simulated in development mode'
    };
  }

  // For production mode, try to send real email
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠️  No email transporter configured - email sending disabled');
      return {
        success: true,
        messageId: 'no-email-' + Date.now(),
        note: 'Email sending disabled - no credentials provided'
      };
    }

    const message = {
      from: `${process.env.FROM_NAME || 'Smart Health Care'} <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    console.log('\n📧 Sending real email in production mode...');
    const info = await transporter.sendMail(message);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send email in production:', error.message);
    throw new Error('Failed to send email');
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