const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

class PDFReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.ensureReportsDirectory();
  }

  ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generate a comprehensive SEO audit report with branding
   * @param {Object} data - Restaurant data and audit results
   * @param {Object} branding - White-label branding options
   * @returns {Promise<string>} - Path to generated PDF
   */
  async generateAuditReport(data, branding = {}) {
    try {
      const {
        restaurant,
        competitors,
        seoAnalysis,
        performanceMetrics,
        rankingHistory,
        trafficMetrics,
        aiInsights
      } = data;

      // White-label branding defaults
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        logo: branding.logo || null,
        primaryColor: branding.primaryColor || '#FF6B35',
        secondaryColor: branding.secondaryColor || '#004E89',
        website: branding.website || 'www.biteheist.com',
        email: branding.email || 'support@biteheist.com',
        phone: branding.phone || null,
        footerText: branding.footerText || 'Powered by BiteHeist'
      };

      const filename = `audit-report-${restaurant.placeId}-${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Page counter
      let pageNumber = 1;

      // Header function
      const addHeader = () => {
        doc.fontSize(10)
          .fillColor('#666')
          .text(brand.companyName, 50, 30, { align: 'left' })
          .text(`Page ${pageNumber}`, 50, 30, { align: 'right' });
        pageNumber++;
      };

      // Footer function
      const addFooter = () => {
        doc.fontSize(8)
          .fillColor('#999')
          .text(brand.footerText, 50, doc.page.height - 30, {
            align: 'center',
            width: doc.page.width - 100
          });
      };

      // Cover Page
      doc.fontSize(36)
        .fillColor(brand.primaryColor)
        .text(brand.companyName, { align: 'center' });

      doc.moveDown(1);
      doc.fontSize(28)
        .fillColor('#333')
        .text('Restaurant SEO Audit Report', { align: 'center' });

      doc.moveDown(2);
      doc.fontSize(20)
        .fillColor(brand.secondaryColor)
        .text(restaurant.name, { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(12)
        .fillColor('#666')
        .text(restaurant.address || 'Address not available', { align: 'center' });

      doc.moveDown(3);
      doc.fontSize(12)
        .fillColor('#333')
        .text(`Report Date: ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}`, { align: 'center' });

      if (brand.website) {
        doc.moveDown(0.5);
        doc.fontSize(10)
          .fillColor(brand.primaryColor)
          .text(brand.website, { align: 'center' });
      }

      addFooter();

      // Page 2: Executive Summary
      doc.addPage();
      addHeader();

      doc.fontSize(24)
        .fillColor(brand.primaryColor)
        .text('Executive Summary', 50, 80);

      doc.moveDown(1);
      doc.fontSize(12)
        .fillColor('#333');

      const overallScore = seoAnalysis?.overallScore || 0;
      const scoreColor = overallScore >= 80 ? '#10B981' : overallScore >= 60 ? '#F59E0B' : '#EF4444';

      doc.fontSize(16)
        .fillColor('#666')
        .text('Overall SEO Score', 50, 140);

      doc.fontSize(48)
        .fillColor(scoreColor)
        .text(`${overallScore}/100`, 50, 165);

      // Key Metrics Grid
      doc.fontSize(14)
        .fillColor('#666')
        .text('Key Performance Indicators', 50, 240);

      const metrics = [
        { label: 'Google Ranking', value: `#${rankingHistory?.currentRank || 'N/A'}`, x: 50, y: 270 },
        { label: 'Monthly Visitors', value: trafficMetrics?.estimatedVisitors || 'N/A', x: 300, y: 270 },
        { label: 'Total Competitors', value: competitors?.length || 0, x: 50, y: 330 },
        { label: 'Star Rating', value: `${restaurant.rating || 'N/A'} ⭐`, x: 300, y: 330 }
      ];

      metrics.forEach(metric => {
        doc.roundedRect(metric.x, metric.y, 200, 50, 5)
          .fillAndStroke('#F9FAFB', '#E5E7EB');

        doc.fontSize(10)
          .fillColor('#666')
          .text(metric.label, metric.x + 10, metric.y + 10);

        doc.fontSize(16)
          .fillColor('#333')
          .text(metric.value, metric.x + 10, metric.y + 28);
      });

      // Critical Issues
      if (seoAnalysis?.issues && seoAnalysis.issues.length > 0) {
        doc.fontSize(14)
          .fillColor('#EF4444')
          .text('Critical Issues Found', 50, 400);

        let yPos = 425;
        seoAnalysis.issues.slice(0, 5).forEach((issue, index) => {
          doc.fontSize(10)
            .fillColor('#666')
            .text(`${index + 1}. ${issue.description || issue}`, 60, yPos);
          yPos += 20;
        });
      }

      addFooter();

      // Page 3: SEO Analysis Details
      doc.addPage();
      addHeader();

      doc.fontSize(24)
        .fillColor(brand.primaryColor)
        .text('SEO Analysis', 50, 80);

      doc.moveDown(1);

      const seoScores = [
        { name: 'Technical SEO', score: seoAnalysis?.seoScore || 0 },
        { name: 'Performance', score: performanceMetrics?.performanceScore || 0 },
        { name: 'Content Quality', score: seoAnalysis?.contentScore || 75 },
        { name: 'Local SEO', score: seoAnalysis?.localSeoScore || 80 }
      ];

      let yPosition = 130;
      seoScores.forEach(item => {
        const scoreColor = item.score >= 80 ? '#10B981' : item.score >= 60 ? '#F59E0B' : '#EF4444';

        doc.fontSize(12)
          .fillColor('#333')
          .text(item.name, 50, yPosition);

        doc.fontSize(12)
          .fillColor(scoreColor)
          .text(`${item.score}/100`, 450, yPosition);

        // Progress bar
        const barWidth = 300;
        const fillWidth = (item.score / 100) * barWidth;

        doc.rect(50, yPosition + 20, barWidth, 10)
          .fillAndStroke('#E5E7EB', '#E5E7EB');

        doc.rect(50, yPosition + 20, fillWidth, 10)
          .fill(scoreColor);

        yPosition += 60;
      });

      addFooter();

      // Page 4: Competitor Analysis
      if (competitors && competitors.length > 0) {
        doc.addPage();
        addHeader();

        doc.fontSize(24)
          .fillColor(brand.primaryColor)
          .text('Competitor Analysis', 50, 80);

        doc.moveDown(1);

        doc.fontSize(12)
          .fillColor('#666')
          .text(`Analyzed ${competitors.length} competitors in your area`, 50, 120);

        // Table Header
        const tableTop = 160;
        const col1 = 50;
        const col2 = 250;
        const col3 = 350;
        const col4 = 450;

        doc.fontSize(10)
          .fillColor('#666')
          .text('Restaurant', col1, tableTop)
          .text('Rating', col2, tableTop)
          .text('Reviews', col3, tableTop)
          .text('Rank', col4, tableTop);

        doc.moveTo(col1, tableTop + 15)
          .lineTo(520, tableTop + 15)
          .stroke('#E5E7EB');

        // Table Rows
        let rowY = tableTop + 25;
        competitors.slice(0, 15).forEach((comp, index) => {
          if (rowY > 700) {
            doc.addPage();
            addHeader();
            rowY = 80;
          }

          const isYourRestaurant = comp.placeId === restaurant.placeId;
          const textColor = isYourRestaurant ? brand.primaryColor : '#333';

          doc.fontSize(9)
            .fillColor(textColor)
            .text(comp.name.substring(0, 30), col1, rowY)
            .text(comp.rating?.toFixed(1) || 'N/A', col2, rowY)
            .text(comp.totalRatings || 'N/A', col3, rowY)
            .text(`#${index + 1}`, col4, rowY);

          rowY += 20;
        });

        addFooter();
      }

      // Page 5: Traffic & Revenue Impact
      if (trafficMetrics) {
        doc.addPage();
        addHeader();

        doc.fontSize(24)
          .fillColor(brand.primaryColor)
          .text('Traffic & Revenue Analysis', 50, 80);

        doc.moveDown(2);

        const trafficData = [
          {
            label: 'Estimated Monthly Visitors',
            value: trafficMetrics.estimatedVisitors?.toLocaleString() || 'N/A',
            change: trafficMetrics.trend || null
          },
          {
            label: 'Weekly Visitors',
            value: trafficMetrics.weeklyVisitors?.toLocaleString() || 'N/A',
            change: null
          },
          {
            label: 'Search Impressions',
            value: trafficMetrics.searchImpressions?.toLocaleString() || 'N/A',
            change: null
          },
          {
            label: 'Click-Through Rate',
            value: `${(trafficMetrics.clickThroughRate * 100)?.toFixed(1)}%` || 'N/A',
            change: null
          }
        ];

        let trafficY = 140;
        trafficData.forEach(item => {
          doc.fontSize(12)
            .fillColor('#666')
            .text(item.label, 50, trafficY);

          doc.fontSize(18)
            .fillColor('#333')
            .text(item.value, 50, trafficY + 20);

          if (item.change) {
            const changeColor = item.change > 0 ? '#10B981' : '#EF4444';
            doc.fontSize(10)
              .fillColor(changeColor)
              .text(`${item.change > 0 ? '+' : ''}${item.change}%`, 250, trafficY + 25);
          }

          trafficY += 70;
        });

        addFooter();
      }

      // Page 6: AI Insights & Recommendations
      if (aiInsights) {
        doc.addPage();
        addHeader();

        doc.fontSize(24)
          .fillColor(brand.primaryColor)
          .text('AI-Powered Recommendations', 50, 80);

        doc.moveDown(1);

        doc.fontSize(12)
          .fillColor('#666')
          .text(aiInsights.summary || 'Advanced AI analysis of your restaurant\'s online presence.', 50, 120, {
            width: 500,
            align: 'left'
          });

        if (aiInsights.recommendations && aiInsights.recommendations.length > 0) {
          doc.moveDown(2);
          doc.fontSize(14)
            .fillColor('#333')
            .text('Top Recommendations', 50, 180);

          let recY = 210;
          aiInsights.recommendations.slice(0, 8).forEach((rec, index) => {
            if (recY > 700) {
              doc.addPage();
              addHeader();
              recY = 80;
            }

            doc.fontSize(11)
              .fillColor(brand.secondaryColor)
              .text(`${index + 1}. ${rec.title || rec}`, 50, recY);

            if (rec.description) {
              doc.fontSize(9)
                .fillColor('#666')
                .text(rec.description, 60, recY + 15, { width: 480 });
              recY += 50;
            } else {
              recY += 25;
            }
          });
        }

        addFooter();
      }

      // Final Page: Contact & Next Steps
      doc.addPage();
      addHeader();

      doc.fontSize(24)
        .fillColor(brand.primaryColor)
        .text('Next Steps', 50, 80);

      doc.moveDown(2);

      doc.fontSize(12)
        .fillColor('#333')
        .text('Thank you for choosing ' + brand.companyName + ' for your restaurant SEO audit.', 50, 140, {
          width: 500
        });

      doc.moveDown(1);
      doc.text('To improve your online presence and rankings, we recommend:', 50, 180, {
        width: 500
      });

      const nextSteps = [
        'Address critical SEO issues identified in this report',
        'Implement recommended optimizations within 30 days',
        'Monitor your rankings and traffic weekly',
        'Respond to customer reviews regularly',
        'Schedule a follow-up audit in 90 days'
      ];

      let stepY = 230;
      nextSteps.forEach((step, index) => {
        doc.fontSize(11)
          .fillColor('#333')
          .text(`${index + 1}. ${step}`, 60, stepY);
        stepY += 25;
      });

      doc.moveDown(3);

      doc.fontSize(14)
        .fillColor(brand.primaryColor)
        .text('Contact Us', 50, 400);

      doc.fontSize(11)
        .fillColor('#666')
        .text(brand.companyName, 50, 430);

      if (brand.email) {
        doc.text(`Email: ${brand.email}`, 50, 450);
      }

      if (brand.phone) {
        doc.text(`Phone: ${brand.phone}`, 50, 470);
      }

      if (brand.website) {
        doc.fillColor(brand.primaryColor)
          .text(brand.website, 50, 490);
      }

      addFooter();

      // Finalize PDF
      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          winston.info(`PDF report generated: ${filename}`);
          resolve(filepath);
        });

        stream.on('error', (error) => {
          winston.error(`PDF generation error: ${error.message}`);
          reject(error);
        });
      });

    } catch (error) {
      winston.error(`PDF report generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a multi-restaurant comparison report
   */
  async generateComparisonReport(restaurants, branding = {}) {
    try {
      const brand = {
        companyName: branding.companyName || 'BiteHeist',
        primaryColor: branding.primaryColor || '#FF6B35',
        secondaryColor: branding.secondaryColor || '#004E89',
        footerText: branding.footerText || 'Powered by BiteHeist'
      };

      const filename = `comparison-report-${Date.now()}.pdf`;
      const filepath = path.join(this.reportsDir, filename);

      const doc = new PDFDocument({ size: 'A4', margins: { top: 50, bottom: 50, left: 50, right: 50 } });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Cover page
      doc.fontSize(32)
        .fillColor(brand.primaryColor)
        .text('Multi-Restaurant Dashboard Report', { align: 'center' });

      doc.moveDown(2);
      doc.fontSize(14)
        .fillColor('#666')
        .text(`Comparing ${restaurants.length} Restaurants`, { align: 'center' });

      doc.moveDown(1);
      doc.fontSize(12)
        .text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

      // Comparison table
      doc.addPage();
      doc.fontSize(20)
        .fillColor(brand.primaryColor)
        .text('Performance Comparison', 50, 80);

      const tableTop = 140;
      let rowY = tableTop;

      // Header
      doc.fontSize(9)
        .fillColor('#666')
        .text('Restaurant', 50, rowY)
        .text('Score', 250, rowY)
        .text('Rank', 330, rowY)
        .text('Rating', 400, rowY)
        .text('Reviews', 470, rowY);

      rowY += 20;

      // Rows
      restaurants.forEach((rest, index) => {
        if (rowY > 700) {
          doc.addPage();
          rowY = 80;
        }

        doc.fontSize(9)
          .fillColor('#333')
          .text(rest.name.substring(0, 25), 50, rowY)
          .text(rest.overallScore || 'N/A', 250, rowY)
          .text(`#${rest.rank || index + 1}`, 330, rowY)
          .text(rest.rating?.toFixed(1) || 'N/A', 400, rowY)
          .text(rest.totalRatings || 'N/A', 470, rowY);

        rowY += 25;
      });

      doc.end();

      return new Promise((resolve, reject) => {
        stream.on('finish', () => {
          winston.info(`Comparison report generated: ${filename}`);
          resolve(filepath);
        });
        stream.on('error', reject);
      });

    } catch (error) {
      winston.error(`Comparison report generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete old reports (cleanup)
   */
  cleanupOldReports(daysOld = 30) {
    const files = fs.readdirSync(this.reportsDir);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;

    files.forEach(file => {
      const filepath = path.join(this.reportsDir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        winston.info(`Deleted old report: ${file}`);
      }
    });
  }
}

module.exports = PDFReportGenerator;
