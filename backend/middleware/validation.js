const { body } = require('express-validator');

// User registration validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Update details validation
const validateUpdateDetails = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// Update password validation
const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];

// Reset password validation
const validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Profile update validation
const validateUpdateProfile = [
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  
  body('healthConditions')
    .optional()
    .isArray()
    .withMessage('Health conditions must be an array'),
  
  body('healthConditions.*')
    .optional()
    .isIn(['Diabetes', 'PCOS', 'High Blood Pressure', 'None'])
    .withMessage('Invalid health condition'),
  
  body('fitnessGoal')
    .optional()
    .isIn(['Muscle Building', 'Fat Burning', 'Weight Gain', 'General Fitness'])
    .withMessage('Invalid fitness goal')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateDetails,
  validateUpdatePassword,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateProfile
}; 