const express = require('express');
const {
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
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgotpassword', validateForgotPassword, forgotPassword);
router.put('/resetpassword/:resettoken', validateResetPassword, resetPassword);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', validateUpdateDetails, updateDetails);
router.put('/updateprofile', validateUpdateProfile, updateProfile);
router.put('/updatepassword', validateUpdatePassword, updatePassword);
router.delete('/deleteaccount', deleteAccount);

// Admin only routes
router.get('/stats', authorize('admin'), getUserStats);

module.exports = router; 