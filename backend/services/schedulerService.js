const cron = require('node-cron');
const winston = require('winston');
const EmailService = require('./emailService');
const MongoService = require('./mongoService');
const PDFReportGenerator = require('./pdfReportGenerator');
const { isMongoConnected } = require('../config/database');

class SchedulerService {
  constructor() {
    this.emailService = new EmailService();
    this.mongoService = new MongoService();
    this.pdfGenerator = new PDFReportGenerator();
    this.scheduledJobs = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the scheduler with default jobs
   */
  initialize() {
    if (this.initialized) {
      winston.warn('Scheduler already initialized');
      return;
    }

    winston.info('Initializing scheduler service...');

    // Weekly report - Every Monday at 9:00 AM
    this.scheduleWeeklyReports();

    // Daily cleanup - Every day at 2:00 AM
    this.scheduleDailyCleanup();

    // Monthly summary - First day of month at 10:00 AM
    this.scheduleMonthlySummary();

    this.initialized = true;
    winston.info('Scheduler service initialized');
  }

  /**
   * Schedule weekly reports for all restaurants
   */
  scheduleWeeklyReports() {
    // Runs every Monday at 9:00 AM
    const job = cron.schedule('0 9 * * 1', async () => {
      winston.info('Running scheduled weekly reports...');

      if (!isMongoConnected()) {
        winston.warn('MongoDB not connected - skipping weekly reports');
        return;
      }

      try {
        const subscriptions = await this.getActiveSubscriptions();

        for (const sub of subscriptions) {
          await this.sendWeeklyReportForRestaurant(sub);
        }

        winston.info(`Weekly reports sent to ${subscriptions.length} subscribers`);
      } catch (error) {
        winston.error(`Weekly report job failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    this.scheduledJobs.set('weekly-reports', job);
    winston.info('Weekly reports scheduled for Mondays at 9:00 AM');
  }

  /**
   * Schedule daily cleanup tasks
   */
  scheduleDailyCleanup() {
    // Runs every day at 2:00 AM
    const job = cron.schedule('0 2 * * *', async () => {
      winston.info('Running daily cleanup...');

      try {
        // Clean up old PDF reports (older than 30 days)
        this.pdfGenerator.cleanupOldReports(30);

        // Clean up old logs if needed
        // Add other cleanup tasks here

        winston.info('Daily cleanup completed');
      } catch (error) {
        winston.error(`Daily cleanup failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    this.scheduledJobs.set('daily-cleanup', job);
    winston.info('Daily cleanup scheduled for 2:00 AM');
  }

  /**
   * Schedule monthly summary reports
   */
  scheduleMonthlySummary() {
    // Runs on the 1st of every month at 10:00 AM
    const job = cron.schedule('0 10 1 * *', async () => {
      winston.info('Running monthly summary reports...');

      if (!isMongoConnected()) {
        winston.warn('MongoDB not connected - skipping monthly summary');
        return;
      }

      try {
        const subscriptions = await this.getActiveSubscriptions();

        for (const sub of subscriptions) {
          await this.sendMonthlySummary(sub);
        }

        winston.info(`Monthly summaries sent to ${subscriptions.length} subscribers`);
      } catch (error) {
        winston.error(`Monthly summary job failed: ${error.message}`);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York"
    });

    this.scheduledJobs.set('monthly-summary', job);
    winston.info('Monthly summaries scheduled for 1st of month at 10:00 AM');
  }

  /**
   * Schedule custom report for a specific restaurant
   * @param {string} placeId - Restaurant place ID
   * @param {string} cronExpression - Cron expression (e.g., '0 9 * * 1' for weekly)
   * @param {string} email - Recipient email
   * @param {Object} options - Additional options
   */
  scheduleCustomReport(placeId, cronExpression, email, options = {}) {
    try {
      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        throw new Error('Invalid cron expression');
      }

      const jobId = `custom-${placeId}-${Date.now()}`;

      const job = cron.schedule(cronExpression, async () => {
        winston.info(`Running custom report for ${placeId}`);

        try {
          await this.sendCustomReport(placeId, email, options);
        } catch (error) {
          winston.error(`Custom report failed for ${placeId}: ${error.message}`);
        }
      }, {
        scheduled: true,
        timezone: options.timezone || "America/New_York"
      });

      this.scheduledJobs.set(jobId, job);

      winston.info(`Custom report scheduled: ${jobId}`);

      return {
        success: true,
        jobId,
        schedule: cronExpression,
        message: 'Custom report scheduled successfully'
      };

    } catch (error) {
      winston.error(`Failed to schedule custom report: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Cancel a scheduled job
   */
  cancelScheduledJob(jobId) {
    const job = this.scheduledJobs.get(jobId);

    if (!job) {
      return {
        success: false,
        message: 'Job not found'
      };
    }

    job.stop();
    this.scheduledJobs.delete(jobId);

    winston.info(`Scheduled job cancelled: ${jobId}`);

    return {
      success: true,
      message: 'Job cancelled successfully'
    };
  }

  /**
   * Get all active scheduled jobs
   */
  getScheduledJobs() {
    const jobs = [];

    this.scheduledJobs.forEach((job, jobId) => {
      jobs.push({
        id: jobId,
        running: job.running || false
      });
    });

    return jobs;
  }

  /**
   * Send weekly report for a restaurant
   */
  async sendWeeklyReportForRestaurant(subscription) {
    try {
      const { placeId, email, branding } = subscription;

      // Get latest weekly report
      const report = await this.mongoService.getLatestWeeklyReport(placeId);

      if (!report) {
        winston.warn(`No weekly report available for ${placeId}`);
        return;
      }

      // Send email
      await this.emailService.sendWeeklyReport(email, report, branding);

      winston.info(`Weekly report sent to ${email} for ${placeId}`);

    } catch (error) {
      winston.error(`Failed to send weekly report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send monthly summary
   */
  async sendMonthlySummary(subscription) {
    try {
      const { placeId, email, branding } = subscription;

      // Get last 4 weekly reports
      const reports = await this.mongoService.getWeeklyReportHistory(placeId, 4);

      if (!reports || reports.length === 0) {
        winston.warn(`No monthly data available for ${placeId}`);
        return;
      }

      // Calculate monthly metrics
      const monthlyData = this.calculateMonthlyMetrics(reports);

      // Send email with summary
      await this.emailService.sendAlert(email, {
        title: 'Monthly Performance Summary',
        severity: 'info',
        message: `Your restaurant's performance summary for the past month.`,
        timestamp: new Date()
      }, branding);

      winston.info(`Monthly summary sent to ${email}`);

    } catch (error) {
      winston.error(`Failed to send monthly summary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send custom report
   */
  async sendCustomReport(placeId, email, options = {}) {
    try {
      // Get restaurant data
      const report = await this.mongoService.getLatestWeeklyReport(placeId);

      if (!report) {
        winston.warn(`No report data available for ${placeId}`);
        return;
      }

      // Generate and send based on options
      if (options.type === 'pdf') {
        // Generate PDF and send
        const pdfPath = await this.pdfGenerator.generateAuditReport(report, options.branding);
        await this.emailService.sendAuditReport(email, pdfPath, report.restaurantName, options.branding);
      } else {
        // Send email summary
        await this.emailService.sendWeeklyReport(email, report, options.branding);
      }

      winston.info(`Custom report sent to ${email}`);

    } catch (error) {
      winston.error(`Failed to send custom report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get active subscriptions from database
   * This would query your database for users who have enabled scheduled reports
   */
  async getActiveSubscriptions() {
    // Mock implementation - replace with actual database query
    // In production, this would fetch from a subscriptions collection
    if (!isMongoConnected()) {
      return [];
    }

    try {
      // TODO: Implement actual subscription model and query
      // const subscriptions = await Subscription.find({ active: true });
      // return subscriptions;

      return []; // Return empty for now
    } catch (error) {
      winston.error(`Failed to get subscriptions: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate monthly metrics from weekly reports
   */
  calculateMonthlyMetrics(weeklyReports) {
    const metrics = {
      averageScore: 0,
      totalVisitors: 0,
      rankImprovement: 0,
      weeksCovered: weeklyReports.length
    };

    if (weeklyReports.length === 0) return metrics;

    // Calculate averages
    weeklyReports.forEach(report => {
      metrics.averageScore += report.overallScore || 0;
      metrics.totalVisitors += report.estimatedVisitors || 0;
    });

    metrics.averageScore = Math.round(metrics.averageScore / weeklyReports.length);

    // Calculate rank improvement
    if (weeklyReports.length >= 2) {
      const firstWeek = weeklyReports[0];
      const lastWeek = weeklyReports[weeklyReports.length - 1];
      metrics.rankImprovement = (firstWeek.currentRank || 0) - (lastWeek.currentRank || 0);
    }

    return metrics;
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.scheduledJobs.forEach((job, jobId) => {
      job.stop();
      winston.info(`Stopped scheduled job: ${jobId}`);
    });

    this.scheduledJobs.clear();
    this.initialized = false;
    winston.info('All scheduled jobs stopped');
  }
}

// Singleton instance
let schedulerInstance = null;

function getSchedulerInstance() {
  if (!schedulerInstance) {
    schedulerInstance = new SchedulerService();
  }
  return schedulerInstance;
}

module.exports = { SchedulerService, getSchedulerInstance };
