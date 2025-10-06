const nodemailer = require('nodemailer');
const winston = require('winston');
const fs = require('fs');

class EmailService {
  constructor() {
    this.transporter = null;
    this.configured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration exists
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };

      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        winston.warn('Email service not configured - SMTP credentials missing');
        this.configured = false;
        return;
      }

      this.transporter = nodemailer.createTransport(emailConfig);
      this.configured = true;

      // Verify connection
      this.transporter.verify((error) => {
        if (error) {
          winston.error(`Email service verification failed: ${error.message}`);
          this.configured = false;
        } else {
          winston.info('Email service configured and ready');
        }
      });

    } catch (error) {
      winston.error(`Email service initialization failed: ${error.message}`);
      this.configured = false;
    }
  }

  /**
   * Send audit report via email
   */
  async sendAuditReport(recipientEmail, reportPath, restaurantName, branding = {}) {
    if (!this.configured) {
      winston.warn('Email service not configured - cannot send report');
      return {
        success: false,
        message: 'Email service not configured. Please set SMTP credentials in environment variables.'
      };
    }

    try {
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        email: branding.email || process.env.SMTP_USER,
        primaryColor: branding.primaryColor || '#FF6B35'
      };

      const mailOptions = {
        from: `"${brand.companyName}" <${brand.email}>`,
        to: recipientEmail,
        subject: `Your SEO Audit Report - ${restaurantName}`,
        html: this.getAuditEmailTemplate(restaurantName, brand),
        attachments: [
          {
            filename: `SEO-Audit-Report-${restaurantName}.pdf`,
            path: reportPath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);

      winston.info(`Audit report sent to ${recipientEmail}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        message: 'Report sent successfully'
      };

    } catch (error) {
      winston.error(`Failed to send audit report: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send scheduled weekly report
   */
  async sendWeeklyReport(recipientEmail, reportData, branding = {}) {
    if (!this.configured) {
      winston.warn('Email service not configured');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        email: branding.email || process.env.SMTP_USER
      };

      const mailOptions = {
        from: `"${brand.companyName}" <${brand.email}>`,
        to: recipientEmail,
        subject: `Weekly SEO Performance Report - Week ${reportData.weekNumber}`,
        html: this.getWeeklyReportTemplate(reportData, brand)
      };

      const info = await this.transporter.sendMail(mailOptions);

      winston.info(`Weekly report sent to ${recipientEmail}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      winston.error(`Failed to send weekly report: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send comparison report for multiple restaurants
   */
  async sendComparisonReport(recipientEmail, reportPath, restaurantCount, branding = {}) {
    if (!this.configured) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        email: branding.email || process.env.SMTP_USER
      };

      const mailOptions = {
        from: `"${brand.companyName}" <${brand.email}>`,
        to: recipientEmail,
        subject: `Multi-Restaurant Performance Report - ${restaurantCount} Locations`,
        html: this.getComparisonEmailTemplate(restaurantCount, brand),
        attachments: [
          {
            filename: 'Restaurant-Comparison-Report.pdf',
            path: reportPath
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);

      winston.info(`Comparison report sent to ${recipientEmail}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      winston.error(`Failed to send comparison report: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Send alert notification
   */
  async sendAlert(recipientEmail, alertData, branding = {}) {
    if (!this.configured) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        email: branding.email || process.env.SMTP_USER,
        primaryColor: branding.primaryColor || '#FF6B35'
      };

      const mailOptions = {
        from: `"${brand.companyName} Alerts" <${brand.email}>`,
        to: recipientEmail,
        subject: `Alert: ${alertData.title}`,
        html: this.getAlertEmailTemplate(alertData, brand)
      };

      const info = await this.transporter.sendMail(mailOptions);

      winston.info(`Alert sent to ${recipientEmail}: ${alertData.title}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      winston.error(`Failed to send alert: ${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Email Templates

  getAuditEmailTemplate(restaurantName, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${brand.primaryColor}; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background-color: ${brand.primaryColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${brand.companyName}</h1>
            <p>Restaurant SEO Audit Report</p>
          </div>
          <div class="content">
            <h2>Hi there!</h2>
            <p>Your comprehensive SEO audit report for <strong>${restaurantName}</strong> is ready.</p>
            <p>This detailed report includes:</p>
            <ul>
              <li>Overall SEO performance score</li>
              <li>Competitor analysis</li>
              <li>Traffic and revenue impact estimates</li>
              <li>AI-powered recommendations</li>
              <li>Action items to improve your rankings</li>
            </ul>
            <p>Please find the complete report attached to this email.</p>
            <p>Review the recommendations and take action to improve your online visibility and attract more customers.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWeeklyReportTemplate(reportData, brand) {
    const rankChange = reportData.rankChange || 0;
    const rankEmoji = rankChange > 0 ? '📈' : rankChange < 0 ? '📉' : '➡️';
    const rankText = rankChange > 0 ? `Up ${rankChange} positions` : rankChange < 0 ? `Down ${Math.abs(rankChange)} positions` : 'No change';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .metric { background: white; padding: 20px; margin: 10px 0; border-left: 4px solid #667eea; }
          .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .metric-label { color: #666; font-size: 14px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${brand.companyName}</h1>
            <h2>Weekly Performance Report</h2>
            <p>Week ${reportData.weekNumber}, ${reportData.year}</p>
          </div>
          <div style="padding: 20px;">
            <h3>Hi ${reportData.restaurantName} Team!</h3>
            <p>Here's your weekly SEO performance summary:</p>

            <div class="metric">
              <div class="metric-label">Google Ranking</div>
              <div class="metric-value">#${reportData.currentRank || 'N/A'} ${rankEmoji}</div>
              <div>${rankText}</div>
            </div>

            <div class="metric">
              <div class="metric-label">Overall SEO Score</div>
              <div class="metric-value">${reportData.overallScore || 'N/A'}/100</div>
            </div>

            <div class="metric">
              <div class="metric-label">Estimated Monthly Visitors</div>
              <div class="metric-value">${reportData.estimatedVisitors?.toLocaleString() || 'N/A'}</div>
            </div>

            <h3>This Week's Highlights:</h3>
            <ul>
              ${reportData.highlights?.map(h => `<li>${h}</li>`).join('') || '<li>Continue monitoring your performance</li>'}
            </ul>

            <p>Keep up the great work! Check your dashboard for detailed insights.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getComparisonEmailTemplate(restaurantCount, brand) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #004E89; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${brand.companyName}</h1>
            <p>Multi-Restaurant Performance Report</p>
          </div>
          <div class="content">
            <h2>Your Comparison Report is Ready!</h2>
            <p>We've analyzed and compared <strong>${restaurantCount} restaurant locations</strong> across key performance metrics.</p>
            <p>This report includes:</p>
            <ul>
              <li>Side-by-side performance comparison</li>
              <li>Rankings for each location</li>
              <li>SEO scores and benchmarks</li>
              <li>Insights to help underperforming locations</li>
            </ul>
            <p>Review the attached PDF for complete details.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAlertEmailTemplate(alertData, brand) {
    const severityColor = {
      critical: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    }[alertData.severity] || '#666';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-box { background-color: ${severityColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-box">
            <h1>⚠️ Alert</h1>
            <h2>${alertData.title}</h2>
          </div>
          <div class="content">
            <p>${alertData.message}</p>
            ${alertData.actionRequired ? '<p><strong>Action Required:</strong> ' + alertData.actionRequired + '</p>' : ''}
            <p><em>Detected at: ${new Date(alertData.timestamp).toLocaleString()}</em></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${brand.companyName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  isConfigured() {
    return this.configured;
  }
}

module.exports = EmailService;
