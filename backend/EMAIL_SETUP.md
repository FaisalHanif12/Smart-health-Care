# 📧 Email Setup Guide - Send Real Emails to Gmail

## Quick Setup (5 minutes)

To send real password reset emails to Gmail inboxes, follow these steps:

### Step 1: Enable Gmail App Password

1. **Go to Google Account Settings**: https://myaccount.google.com/
2. **Security** → **2-Step Verification** (enable if not already)
3. **App Passwords** → **Generate new password**
4. **Select "Mail"** as the app type
5. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### Step 2: Create Environment File

Create a file named `.env` in the `backend` folder with:

```bash
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop
FROM_NAME=Smart Health Care
NODE_ENV=development
```

**Replace with your actual:**
- `your-email@gmail.com` → Your Gmail address
- `abcd-efgh-ijkl-mnop` → Your 16-character app password

### Step 3: Restart Server

```bash
cd backend
npm start
```

### Step 4: Test

1. Go to **Forgot Password**
2. Enter any email (it will be sent to the configured Gmail)
3. Check your Gmail inbox for the reset email!

## 🎯 Result

- ✅ **Real emails** sent to Gmail inbox
- ✅ **Professional email design** 
- ✅ **Working reset links**
- ✅ **Secure delivery**

## ⚠️ Security Notes

- ✅ `.env` file is already in `.gitignore`
- ✅ Never commit email credentials to Git
- ✅ App passwords are safer than main password
- ✅ Can revoke app password anytime

## 🆘 Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify app password is correct
- Ensure 2-factor authentication is enabled
- Try generating a new app password

**Server error?**
- Check console for error messages
- Verify .env file syntax
- Restart the server after changes 