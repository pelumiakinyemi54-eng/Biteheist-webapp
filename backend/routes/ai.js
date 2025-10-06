const express = require('express');
const OpenAIService = require('../services/openaiService');
const { optionalAuth } = require('../middleware/auth');
const winston = require('winston');

const router = express.Router();
const openaiService = new OpenAIService();

/**
 * @route   POST /api/ai/generate-review-response
 * @desc    Generate AI-powered response to a customer review
 * @access  Public
 */
router.post('/generate-review-response', optionalAuth, async (req, res) => {
  try {
    const { review, restaurantContext } = req.body;

    if (!review) {
      return res.status(400).json({
        success: false,
        message: 'Review data is required'
      });
    }

    winston.info('Generating AI review response');

    const result = await openaiService.generateReviewResponse(review, restaurantContext || {});

    res.json(result);

  } catch (error) {
    winston.error(`AI review response error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate review response',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/ai/generate-batch-responses
 * @desc    Generate AI responses for multiple reviews
 * @access  Public
 */
router.post('/generate-batch-responses', optionalAuth, async (req, res) => {
  try {
    const { reviews, restaurantContext } = req.body;

    if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({
        success: false,
        message: 'Reviews array is required'
      });
    }

    winston.info(`Generating AI responses for ${reviews.length} reviews`);

    const results = await openaiService.generateBatchResponses(reviews, restaurantContext || {});

    res.json({
      success: true,
      responses: results,
      totalProcessed: results.length
    });

  } catch (error) {
    winston.error(`Batch AI response error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch responses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
