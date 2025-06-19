const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect: auth } = require('../middleware/auth');
const OpenAIService = require('../services/openaiService');

const router = express.Router();

// @route   POST /api/ai/generate-workout-plan
// @desc    Generate AI workout plan
// @access  Private
router.post('/generate-workout-plan', 
  auth,
  [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isLength({ min: 50 })
      .withMessage('Prompt must be at least 50 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { prompt } = req.body;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'OpenAI API key not configured on server'
        });
      }

      // Generate workout plan using OpenAI
      const openaiService = new OpenAIService();
      const workoutPlan = await openaiService.generateWorkoutPlan(prompt);

      res.json({
        success: true,
        message: 'Workout plan generated successfully',
        data: workoutPlan
      });

    } catch (error) {
      console.error('Error generating workout plan:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          success: false,
          message: 'OpenAI API quota exceeded. Please try again later.'
        });
      }
      
      if (error.code === 'invalid_api_key') {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenAI API key configuration'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate workout plan'
      });
    }
  }
);

// @route   POST /api/ai/generate-diet-plan
// @desc    Generate AI diet plan
// @access  Private
router.post('/generate-diet-plan', 
  auth,
  [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isLength({ min: 50 })
      .withMessage('Prompt must be at least 50 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { prompt } = req.body;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'OpenAI API key not configured on server'
        });
      }

      // Generate diet plan using OpenAI
      const openaiService = new OpenAIService();
      const dietPlan = await openaiService.generateDietPlan(prompt);

      res.json({
        success: true,
        message: 'Diet plan generated successfully',
        data: dietPlan
      });

    } catch (error) {
      console.error('Error generating diet plan:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          success: false,
          message: 'OpenAI API quota exceeded. Please try again later.'
        });
      }
      
      if (error.code === 'invalid_api_key') {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenAI API key configuration'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate diet plan'
      });
    }
  }
);

// @route   POST /api/ai/generate-recommendations
// @desc    Generate AI health recommendations
// @access  Private
router.post('/generate-recommendations', 
  auth,
  [
    body('prompt')
      .notEmpty()
      .withMessage('Prompt is required')
      .isLength({ min: 50 })
      .withMessage('Prompt must be at least 50 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          errors: errors.array() 
        });
      }

      const { prompt } = req.body;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: 'OpenAI API key not configured on server'
        });
      }

      // Generate AI recommendations using OpenAI
      const openaiService = new OpenAIService();
      const recommendations = await openaiService.generateAIRecommendations(prompt);

      res.json({
        success: true,
        message: 'AI recommendations generated successfully',
        data: recommendations
      });

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          success: false,
          message: 'OpenAI API quota exceeded. Please try again later.'
        });
      }
      
      if (error.code === 'invalid_api_key') {
        return res.status(401).json({
          success: false,
          message: 'Invalid OpenAI API key configuration'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate AI recommendations'
      });
    }
  }
);

// @route   GET /api/ai/status
// @desc    Check AI service status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const isConfigured = !!process.env.OPENAI_API_KEY;
    
    res.json({
      success: true,
      data: {
        openai_configured: isConfigured,
        model: 'gpt-4o',
        status: isConfigured ? 'ready' : 'not_configured'
      }
    });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service status'
    });
  }
});

// Add GET handler for /generate-diet-plan
router.get('/generate-diet-plan', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'GET method not allowed. Please use POST for this endpoint.'
  });
});

// Add GET handler for /generate-workout-plan
router.get('/generate-workout-plan', (req, res) => {
  res.status(405).json({
    success: false,
    message: 'GET method not allowed. Please use POST for this endpoint.'
  });
});

module.exports = router; 