const express = require('express');
const router = express.Router();
const BrandingSettings = require('../models/BrandingSettings');
const { optionalAuth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');

/**
 * @route   GET /api/branding/:userId
 * @desc    Get branding settings for a user
 * @access  Public
 */
router.get('/:userId', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        data: BrandingSettings.getDefaultBranding(),
        usingDefaults: true,
        message: 'Using default branding (database not available)'
      });
    }

    const { userId } = req.params;

    let settings = await BrandingSettings.findOne({ userId });

    if (!settings) {
      // Return defaults if no custom settings found
      return res.json({
        success: true,
        data: BrandingSettings.getDefaultBranding(),
        usingDefaults: true
      });
    }

    res.json({
      success: true,
      data: settings,
      usingDefaults: false
    });

  } catch (error) {
    winston.error(`Get branding failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve branding settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/branding
 * @desc    Create or update branding settings
 * @access  Public
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Cannot save branding settings.'
      });
    }

    const { userId, ...brandingData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    winston.info(`Updating branding settings for user: ${userId}`);

    // Find existing or create new
    let settings = await BrandingSettings.findOne({ userId });

    if (settings) {
      // Update existing
      Object.assign(settings, brandingData);
      await settings.save();
    } else {
      // Create new
      settings = new BrandingSettings({
        userId,
        ...brandingData
      });
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Branding settings saved successfully',
      data: settings
    });

  } catch (error) {
    winston.error(`Save branding failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to save branding settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/branding/:userId
 * @desc    Update specific branding fields
 * @access  Public
 */
router.put('/:userId', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { userId } = req.params;
    const updates = req.body;

    winston.info(`Updating branding for user: ${userId}`);

    let settings = await BrandingSettings.findOne({ userId });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Branding settings not found. Create settings first.'
      });
    }

    // Update only provided fields
    Object.keys(updates).forEach(key => {
      if (settings.schema.paths[key]) {
        settings[key] = updates[key];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Branding settings updated successfully',
      data: settings
    });

  } catch (error) {
    winston.error(`Update branding failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to update branding settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/branding/:userId
 * @desc    Reset branding to defaults
 * @access  Public
 */
router.delete('/:userId', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { userId } = req.params;

    winston.info(`Resetting branding for user: ${userId}`);

    await BrandingSettings.deleteOne({ userId });

    res.json({
      success: true,
      message: 'Branding reset to defaults',
      data: BrandingSettings.getDefaultBranding()
    });

  } catch (error) {
    winston.error(`Reset branding failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to reset branding'
    });
  }
});

/**
 * @route   GET /api/branding/:userId/preview
 * @desc    Get branding preview for reports
 * @access  Public
 */
router.get('/:userId/preview', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        preview: BrandingSettings.getDefaultBranding()
      });
    }

    const { userId } = req.params;

    let settings = await BrandingSettings.findOne({ userId });

    if (!settings) {
      return res.json({
        success: true,
        preview: BrandingSettings.getDefaultBranding()
      });
    }

    const preview = {
      report: settings.getBrandingForReports(),
      email: settings.getBrandingForEmails(),
      whiteLabelEnabled: settings.canUseWhiteLabel(),
      tier: settings.tier
    };

    res.json({
      success: true,
      preview
    });

  } catch (error) {
    winston.error(`Get branding preview failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get preview'
    });
  }
});

/**
 * @route   POST /api/branding/:userId/upgrade
 * @desc    Upgrade tier for white-label features
 * @access  Public
 */
router.post('/:userId/upgrade', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { userId } = req.params;
    const { tier } = req.body;

    if (!['free', 'basic', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier'
      });
    }

    winston.info(`Upgrading tier for user ${userId} to ${tier}`);

    let settings = await BrandingSettings.findOne({ userId });

    if (!settings) {
      settings = new BrandingSettings({ userId });
    }

    settings.tier = tier;

    // Enable white-label for pro and enterprise
    if (['pro', 'enterprise'].includes(tier)) {
      settings.whiteLabelEnabled = true;
    }

    await settings.save();

    res.json({
      success: true,
      message: `Tier upgraded to ${tier}`,
      data: settings
    });

  } catch (error) {
    winston.error(`Tier upgrade failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade tier'
    });
  }
});

module.exports = router;
