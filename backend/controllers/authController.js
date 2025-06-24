const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const sendTokenResponse = require('../utils/sendTokenResponse');
const { sendPasswordResetEmail } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  const { username, email, password } = req.body;

  try {
    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    // Handle duplicate key errors (email or username already exists)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      if (field === 'email') {
        return next(new ErrorResponse('An account with this email already exists. Please try logging in instead.', 409));
      } else if (field === 'username') {
        return next(new ErrorResponse('This username is already taken. Please choose a different one.', 409));
      } else {
        return next(new ErrorResponse('Registration failed. Please try again.', 400));
      }
    }
    
    // Handle other mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join('. '), 400));
    }
    
    // For any other errors, pass them to the error handler
    return next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('No account found with this email address. Please register first or check your email.', 404));
  }

  // Check if account is locked
  if (user.isLocked()) {
    return next(new ErrorResponse('Account is temporarily locked due to too many failed login attempts. Please try again later.', 423));
  }

  // Check if password matches
  const isMatch = await user.correctPassword(password, user.password);

  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    return next(new ErrorResponse('Incorrect password. Please check your password and try again.', 401));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 }
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Send token response
  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  // User is already available in req.user from protect middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { age, gender, height, weight, healthConditions, fitnessGoal, profileImage } = req.body;

  const profileData = {};
  if (age !== undefined) profileData.age = age;
  if (gender !== undefined) profileData.gender = gender;
  if (height !== undefined) profileData.height = height;
  if (weight !== undefined) profileData.weight = weight;
  if (healthConditions !== undefined) profileData.healthConditions = healthConditions;
  if (fitnessGoal !== undefined) profileData.fitnessGoal = fitnessGoal;
  if (profileImage !== undefined) profileData.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { profile: { ...req.user.profile, ...profileData } },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  const { email } = req.body;

  // Check if user exists with this email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // For better UX, let the user know if email doesn't exist
    return next(new ErrorResponse('No account found with this email address. Please check your email or register for a new account.', 404));
  }

  // Check if user account is active
  if (!user.isActive) {
    return next(new ErrorResponse('Account is deactivated. Please contact support.', 403));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  try {
    // Try to send email
    const emailResult = await sendPasswordResetEmail(user, resetToken, req);

    // Log for development debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🔐 Password Reset Process:');
      console.log('User:', user.email);
      console.log('Reset URL:', `http://localhost:5173/reset-password/${resetToken}`);
      console.log('Token expires in 10 minutes');
      console.log('Email Status:', emailResult?.note || 'Sent successfully');
      console.log('==========================================\n');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.',
      resetInfo: {
        email: user.email,
        expiresIn: '10 minutes'
      },
      ...(process.env.NODE_ENV === 'development' && emailResult?.note && {
        devNote: 'Email service may not be configured. In production, please set up proper email credentials.'
      })
    });
  } catch (error) {
    console.error('Password reset email error:', error);
    
    // In development mode, don't fail completely if email doesn't work
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Email failed in development, but allowing password reset to continue...');
      console.log('Reset URL for testing:', `http://localhost:5173/reset-password/${resetToken}`);
      
      res.status(200).json({
        success: true,
        message: 'Password reset token generated. In development mode, email sending failed but you can use the reset URL from the server logs.',
        resetInfo: {
          email: user.email,
          expiresIn: '10 minutes'
        },
        devNote: 'Email service not configured for development. Check server logs for reset URL.'
      });
      return;
    }
    
    // Reset the token fields if email failed in production
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Failed to send password reset email. Please check your email address and try again later.', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ErrorResponse(errorMessages.join(', '), 400));
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetPasswordToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Reset login attempts
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Delete user account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
const deleteAccount = asyncHandler(async (req, res, next) => {
  // Get the user ID from the authenticated request
  const userId = req.user.id;

  try {
    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Clear the token cookie
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Account has been permanently deleted',
      data: {}
    });
  } catch (error) {
    return next(new ErrorResponse('Error deleting account', 500));
  }
});

// @desc    Get user stats (Admin only)
// @route   GET /api/auth/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res, next) => {
  const stats = await User.getUserStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount,
  getUserStats,
}; 