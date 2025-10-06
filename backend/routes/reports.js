const express = require('express');
const router = express.Router();
const PDFReportGenerator = require('../services/pdfReportGenerator');
const EmailService = require('../services/emailService');
const { getSchedulerInstance } = require('../services/schedulerService');
const BrandingSettings = require('../models/BrandingSettings');
const { optionalAuth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');
const path = require('path');

const pdfGenerator = new PDFReportGenerator();
const emailService = new EmailService();

/**
 * @route   POST /api/reports/generate
 * @desc    Generate a PDF audit report
 * @access  Public
 */
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { restaurantData, branding } = req.body;

    if (!restaurantData) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant data is required'
      });
    }

    winston.info(`Generating PDF report for ${restaurantData.restaurant?.name}`);

    // Get user branding if available
    let brandingConfig = branding;
    if (!brandingConfig && req.user && isMongoConnected()) {
      const settings = await BrandingSettings.findOne({ userId: req.user.id });
      if (settings) {
        brandingConfig = settings.getBrandingForReports();
      }
    }

    // Generate PDF
    const filepath = await pdfGenerator.generateAuditReport(restaurantData, brandingConfig);

    res.json({
      success: true,
      message: 'Report generated successfully',
      filepath: path.basename(filepath),
      downloadUrl: `/api/reports/download/${path.basename(filepath)}`
    });

  } catch (error) {
    winston.error(`Report generation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/reports/generate-comparison
 * @desc    Generate a multi-restaurant comparison report
 * @access  Public
 */
router.post('/generate-comparison', optionalAuth, async (req, res) => {
  try {
    const { restaurants, branding } = req.body;

    if (!restaurants || restaurants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 restaurants required for comparison'
      });
    }

    winston.info(`Generating comparison report for ${restaurants.length} restaurants`);

    // Get user branding if available
    let brandingConfig = branding;
    if (!brandingConfig && req.user && isMongoConnected()) {
      const settings = await BrandingSettings.findOne({ userId: req.user.id });
      if (settings) {
        brandingConfig = settings.getBrandingForReports();
      }
    }

    // Generate comparison PDF
    const filepath = await pdfGenerator.generateComparisonReport(restaurants, brandingConfig);

    res.json({
      success: true,
      message: 'Comparison report generated successfully',
      filepath: path.basename(filepath),
      downloadUrl: `/api/reports/download/${path.basename(filepath)}`
    });

  } catch (error) {
    winston.error(`Comparison report generation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to generate comparison report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/reports/email
 * @desc    Email a report to recipient
 * @access  Public
 */
router.post('/email', optionalAuth, async (req, res) => {
  try {
    const { recipientEmail, reportPath, restaurantName, branding } = req.body;

    if (!recipientEmail || !reportPath || !restaurantName) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email, report path, and restaurant name are required'
      });
    }

    if (!emailService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Email service not configured. Please contact administrator.'
      });
    }

    winston.info(`Sending report to ${recipientEmail}`);

    // Get user branding if available
    let brandingConfig = branding;
    if (!brandingConfig && req.user && isMongoConnected()) {
      const settings = await BrandingSettings.findOne({ userId: req.user.id });
      if (settings) {
        brandingConfig = settings.getBrandingForEmails();
      }
    }

    const fullPath = path.join(pdfGenerator.reportsDir, reportPath);
    const result = await emailService.sendAuditReport(
      recipientEmail,
      fullPath,
      restaurantName,
      brandingConfig
    );

    res.json(result);

  } catch (error) {
    winston.error(`Email sending failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/reports/download/:filename
 * @desc    Download a generated report
 * @access  Public
 */
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Security: prevent directory traversal
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    const filepath = path.join(pdfGenerator.reportsDir, filename);

    res.download(filepath, (error) => {
      if (error) {
        winston.error(`Download failed: ${error.message}`);
        res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
    });

  } catch (error) {
    winston.error(`Download error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Download failed'
    });
  }
});

/**
 * @route   POST /api/reports/schedule
 * @desc    Schedule recurring reports
 * @access  Public
 */
router.post('/schedule', optionalAuth, async (req, res) => {
  try {
    const { placeId, schedule, email, options } = req.body;

    if (!placeId || !schedule || !email) {
      return res.status(400).json({
        success: false,
        message: 'Place ID, schedule, and email are required'
      });
    }

    winston.info(`Scheduling report for ${placeId}: ${schedule}`);

    const scheduler = getSchedulerInstance();
    const result = scheduler.scheduleCustomReport(placeId, schedule, email, options);

    res.json(result);

  } catch (error) {
    winston.error(`Schedule failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/reports/schedule/:jobId
 * @desc    Cancel scheduled report
 * @access  Public
 */
router.delete('/schedule/:jobId', optionalAuth, async (req, res) => {
  try {
    const { jobId } = req.params;

    winston.info(`Cancelling scheduled job: ${jobId}`);

    const scheduler = getSchedulerInstance();
    const result = scheduler.cancelScheduledJob(jobId);

    res.json(result);

  } catch (error) {
    winston.error(`Cancel schedule failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel schedule'
    });
  }
});

/**
 * @route   GET /api/reports/scheduled
 * @desc    Get all scheduled reports
 * @access  Public
 */
router.get('/scheduled', optionalAuth, async (req, res) => {
  try {
    const scheduler = getSchedulerInstance();
    const jobs = scheduler.getScheduledJobs();

    res.json({
      success: true,
      jobs
    });

  } catch (error) {
    winston.error(`Get scheduled jobs failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve scheduled jobs'
    });
  }
});

module.exports = router;
