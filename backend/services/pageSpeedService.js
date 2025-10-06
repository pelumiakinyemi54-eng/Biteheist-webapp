const fetch = require('node-fetch');
const winston = require('winston');

/**
 * Google PageSpeed Insights API Service
 * Analyzes website performance and provides optimization recommendations
 */
class PageSpeedService {
  constructor() {
    // Use Places API key for PageSpeed (same key works for both)
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
    this.timeout = 30000; // 30 seconds for PageSpeed analysis
  }

  /**
   * Analyze website performance using Google PageSpeed Insights
   */
  async analyzeWebsite(url) {
    try {
      if (!url) {
        return this.getNoWebsiteResult();
      }

      // Ensure URL has protocol
      const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

      winston.info(`Analyzing PageSpeed for: ${normalizedUrl}`);

      const apiUrl = `${this.baseUrl}?url=${encodeURIComponent(normalizedUrl)}&key=${this.apiKey}&category=performance&strategy=mobile`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(apiUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        winston.warn(`PageSpeed API error ${response.status} for ${normalizedUrl}`);
        return this.getEstimatedResult(url);
      }

      const data = await response.json();

      // Extract metrics from Lighthouse results
      const lighthouseResult = data.lighthouseResult;
      const audits = lighthouseResult?.audits || {};
      const categories = lighthouseResult?.categories || {};

      // Core Web Vitals
      const metrics = {
        firstContentfulPaint: this.extractMetricValue(audits['first-contentful-paint']),
        largestContentfulPaint: this.extractMetricValue(audits['largest-contentful-paint']),
        totalBlockingTime: this.extractMetricValue(audits['total-blocking-time']),
        cumulativeLayoutShift: this.extractMetricValue(audits['cumulative-layout-shift']),
        speedIndex: this.extractMetricValue(audits['speed-index']),
        timeToInteractive: this.extractMetricValue(audits['interactive'])
      };

      // Overall performance score (0-100)
      const performanceScore = Math.round((categories.performance?.score || 0) * 100);

      // Calculate load time from metrics
      const loadTime = metrics.largestContentfulPaint || metrics.speedIndex || 0;

      const result = {
        score: performanceScore,
        loadTime: Math.round(loadTime / 100) / 10, // Convert to seconds with 1 decimal
        metrics: {
          firstContentfulPaint: Math.round(metrics.firstContentfulPaint / 100) / 10,
          largestContentfulPaint: Math.round(metrics.largestContentfulPaint / 100) / 10,
          cumulativeLayoutShift: Math.round(metrics.cumulativeLayoutShift * 100) / 100,
          totalBlockingTime: Math.round(metrics.totalBlockingTime / 100) / 10,
          speedIndex: Math.round(metrics.speedIndex / 100) / 10,
          timeToInteractive: Math.round(metrics.timeToInteractive / 100) / 10
        },
        hasWebsite: true,
        isRealData: true,
        url: normalizedUrl,
        analyzedAt: new Date().toISOString()
      };

      winston.info(`PageSpeed analysis complete: ${performanceScore} score, ${result.loadTime}s load time`);

      return result;

    } catch (error) {
      if (error.name === 'AbortError') {
        winston.warn(`PageSpeed analysis timeout for ${url}`);
      } else {
        winston.error(`PageSpeed analysis error: ${error.message}`);
      }

      // Fallback to estimated result
      return this.getEstimatedResult(url);
    }
  }

  /**
   * Extract metric value from audit result
   */
  extractMetricValue(audit) {
    if (!audit) return 0;

    // Some metrics use numericValue, others use displayValue
    return audit.numericValue ||
           parseFloat(audit.displayValue?.replace(/[^0-9.]/g, '')) ||
           0;
  }

  /**
   * Get result when no website exists
   */
  getNoWebsiteResult() {
    return {
      score: 0,
      loadTime: 0,
      metrics: {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0,
        speedIndex: 0,
        timeToInteractive: 0
      },
      hasWebsite: false,
      isRealData: false
    };
  }

  /**
   * Get estimated result when API fails (basic estimation based on URL)
   */
  getEstimatedResult(url) {
    // Basic estimation - assume average performance
    const estimatedLoadTime = 3.5; // Average load time
    const estimatedScore = 65; // Average score

    return {
      score: estimatedScore,
      loadTime: estimatedLoadTime,
      metrics: {
        firstContentfulPaint: 1.8,
        largestContentfulPaint: 2.8,
        cumulativeLayoutShift: 0.15,
        totalBlockingTime: 0.3,
        speedIndex: 3.0,
        timeToInteractive: 3.5
      },
      hasWebsite: true,
      isRealData: false,
      isEstimated: true,
      url
    };
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      const result = await this.analyzeWebsite('https://www.google.com');
      return {
        success: result.isRealData !== false,
        message: result.isRealData ? 'PageSpeed API connected' : 'PageSpeed API unavailable, using estimates',
        score: result.score
      };
    } catch (error) {
      return {
        success: false,
        message: `PageSpeed API test failed: ${error.message}`
      };
    }
  }
}

module.exports = PageSpeedService;
