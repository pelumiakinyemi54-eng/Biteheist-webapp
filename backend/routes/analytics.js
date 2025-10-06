const express = require('express');
const { query, validationResult } = require('express-validator');
const RankingHistory = require('../models/RankingHistory');
const CompetitorSnapshot = require('../models/CompetitorSnapshot');
const WeeklyReport = require('../models/WeeklyReport');
const Restaurant = require('../models/Restaurant');
const TrafficEstimator = require('../services/trafficEstimator');
const MongoService = require('../services/mongoService');
const { optionalAuth, auth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');

const router = express.Router();
const trafficEstimator = new TrafficEstimator();
const mongoService = new MongoService();

/**
 * @route   GET /api/analytics/ranking-history/:placeId
 * @desc    Get historical ranking data for a restaurant
 * @access  Public
 */
router.get('/ranking-history/:placeId', [
  query('days')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Days must be between 7 and 365'),
  query('currentRank')
    .optional()
    .isInt({ min: 1 }),
  query('currentScore')
    .optional()
    .isInt({ min: 0, max: 100 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { placeId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const currentRank = parseInt(req.query.currentRank) || null;
    const currentScore = parseInt(req.query.currentScore) || null;

    winston.info(`Fetching ranking history: ${placeId} (${days} days)`);

    let history, trendAnalysis;

    if (!isMongoConnected()) {
      // Generate simulated historical data based on current metrics
      winston.info('MongoDB not available - generating simulated historical data');
      history = generateSimulatedHistory(days, currentRank, currentScore);
      trendAnalysis = calculateTrendAnalysis(history);

      return res.json({
        success: true,
        data: history,
        analysis: trendAnalysis,
        count: history.length,
        simulated: true,
        message: 'Simulated data shown. Install MongoDB to track real historical data over time.'
      });
    }

    // Real MongoDB data
    history = await mongoService.getRankingHistory(placeId, days);

    if (!history || history.length === 0) {
      // No data yet - generate simulated data
      winston.info('No historical data found - generating simulated data');
      history = generateSimulatedHistory(days, currentRank, currentScore);
      trendAnalysis = calculateTrendAnalysis(history);

      return res.json({
        success: true,
        data: history,
        analysis: trendAnalysis,
        count: history.length,
        simulated: true,
        message: 'No historical data yet. Run audits to start tracking real data.'
      });
    }

    // Calculate trend metrics
    trendAnalysis = calculateTrendAnalysis(history);

    res.json({
      success: true,
      data: history,
      analysis: trendAnalysis,
      count: history.length,
      simulated: false
    });

  } catch (error) {
    winston.error(`Ranking history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve ranking history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/analytics/ranking-snapshot/:placeId
 * @desc    Create a new ranking snapshot
 * @access  Public
 */
router.post('/ranking-snapshot/:placeId', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        message: 'Database not available - snapshot not saved',
        mock: true
      });
    }

    const { placeId } = req.params;
    const {
      googleRank,
      localRank,
      totalCompetitors,
      overallScore,
      seoScore,
      performanceScore,
      rating,
      totalRatings,
      estimatedMonthlyVisitors,
      revenueImpact
    } = req.body;

    winston.info(`Creating ranking snapshot: ${placeId}`);

    // Get restaurant info
    const restaurant = await Restaurant.findOne({ placeId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get previous snapshot for comparison
    const previousSnapshot = await RankingHistory.findOne({ placeId })
      .sort({ recordDate: -1 })
      .lean();

    // Calculate traffic change
    const estimatedTrafficChange = previousSnapshot && previousSnapshot.estimatedMonthlyVisitors
      ? ((estimatedMonthlyVisitors - previousSnapshot.estimatedMonthlyVisitors) / previousSnapshot.estimatedMonthlyVisitors) * 100
      : 0;

    // Get current week info
    const weekInfo = WeeklyReport.getCurrentWeekInfo();

    // Create new snapshot
    const snapshot = new RankingHistory({
      restaurantId: restaurant._id,
      placeId,
      restaurantName: restaurant.name,
      googleRank,
      localRank,
      totalCompetitors,
      overallScore,
      seoScore,
      performanceScore,
      rating,
      totalRatings,
      estimatedMonthlyVisitors,
      estimatedTrafficChange,
      revenueImpact,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year
    });

    await snapshot.save();

    // Calculate changes
    const changes = await snapshot.calculateRankChange();

    winston.info(`Ranking snapshot created for ${restaurant.name}`);

    res.json({
      success: true,
      snapshot,
      changes
    });

  } catch (error) {
    winston.error(`Ranking snapshot error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create ranking snapshot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/analytics/competitor-tracking/:placeId
 * @desc    Get competitor tracking data
 * @access  Public
 */
router.get('/competitor-tracking/:placeId', [
  query('days')
    .optional()
    .isInt({ min: 7, max: 90 })
    .withMessage('Days must be between 7 and 90')
], optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Please run an audit first to generate competitor tracking.',
        requiresDatabase: true
      });
    }

    const { placeId } = req.params;
    const days = parseInt(req.query.days) || 30;

    winston.info(`Fetching competitor tracking: ${placeId}`);

    const snapshots = await mongoService.getCompetitorTrends(placeId, days);
    const newCompetitors = await mongoService.findNewCompetitors(placeId);
    const departedCompetitors = await mongoService.findDepartedCompetitors(placeId);

    res.json({
      success: true,
      snapshots: snapshots || [],
      newCompetitors: newCompetitors || [],
      departedCompetitors: departedCompetitors || [],
      count: snapshots?.length || 0
    });

  } catch (error) {
    winston.error(`Competitor tracking error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve competitor tracking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/analytics/competitor-snapshot/:placeId
 * @desc    Create competitor snapshot
 * @access  Public
 */
router.post('/competitor-snapshot/:placeId', optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        message: 'Database not available - snapshot not saved',
        mock: true
      });
    }

    const { placeId } = req.params;
    const { competitors, yourPosition } = req.body;

    winston.info(`Creating competitor snapshot: ${placeId}`);

    const restaurant = await Restaurant.findOne({ placeId });
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Get previous snapshot for comparison
    const previousSnapshot = await CompetitorSnapshot.findOne({ placeId })
      .sort({ recordDate: -1 })
      .lean();

    // Calculate changes for each competitor
    const competitorsWithChanges = competitors.map(comp => {
      const prevComp = previousSnapshot?.competitors.find(c => c.placeId === comp.placeId);

      return {
        ...comp,
        ratingChange: prevComp ? comp.rating - prevComp.rating : 0,
        reviewsChange: prevComp ? comp.totalRatings - prevComp.totalRatings : 0,
        rankChange: prevComp ? prevComp.rank - comp.rank : 0
      };
    });

    // Calculate stats
    const competitorStats = {
      averageRating: competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length,
      averageReviews: competitors.reduce((sum, c) => sum + c.totalRatings, 0) / competitors.length,
      totalCompetitors: competitors.length,
      strongerCompetitors: competitors.filter(c => c.rating > restaurant.rating).length,
      weakerCompetitors: competitors.filter(c => c.rating < restaurant.rating).length
    };

    const weekInfo = WeeklyReport.getCurrentWeekInfo();

    const snapshot = new CompetitorSnapshot({
      restaurantId: restaurant._id,
      placeId,
      competitors: competitorsWithChanges,
      competitorStats,
      yourPosition,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year
    });

    await snapshot.save();

    winston.info(`Competitor snapshot created for ${restaurant.name}`);

    res.json({
      success: true,
      snapshot
    });

  } catch (error) {
    winston.error(`Competitor snapshot error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to create competitor snapshot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/analytics/weekly-report/:placeId
 * @desc    Get weekly report
 * @access  Public
 */
router.get('/weekly-report/:placeId', [
  query('week')
    .optional()
    .isInt({ min: 1, max: 53 }),
  query('year')
    .optional()
    .isInt({ min: 2020, max: 2030 })
], optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Weekly reports require MongoDB to track data over time.',
        requiresDatabase: true
      });
    }

    const { placeId } = req.params;
    const { week, year } = req.query;

    winston.info(`Fetching weekly report: ${placeId}`);

    let report;
    if (week && year) {
      // Get specific week report
      report = await WeeklyReport.findOne({
        placeId,
        weekNumber: parseInt(week),
        year: parseInt(year)
      }).lean();
    } else {
      // Get latest report or generate new one
      report = await mongoService.getLatestWeeklyReport(placeId);

      // If no report exists, try to generate one
      if (!report) {
        winston.info('No existing report - attempting to generate weekly report');
        report = await mongoService.generateWeeklyReport(placeId);
      }
    }

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'No report found. Run audits throughout the week to generate weekly reports.'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    winston.error(`Weekly report error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/analytics/weekly-reports/:placeId
 * @desc    Get weekly report history
 * @access  Public
 */
router.get('/weekly-reports/:placeId', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 52 })
], optionalAuth, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available. Weekly reports require MongoDB to track data over time.',
        requiresDatabase: true
      });
    }

    const { placeId } = req.params;
    const limit = parseInt(req.query.limit) || 12;

    winston.info(`Fetching weekly reports history: ${placeId}`);

    const reports = await mongoService.getWeeklyReportHistory(placeId, limit);

    res.json({
      success: true,
      reports,
      count: reports.length
    });

  } catch (error) {
    winston.error(`Weekly reports error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weekly reports',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/analytics/traffic-metrics/:placeId
 * @desc    Get live traffic metrics based on Google Places data
 * @access  Public
 */
router.get('/traffic-metrics/:placeId', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    winston.info(`Fetching traffic metrics: ${placeId}`);

    // Get restaurant data
    let restaurant;
    if (isMongoConnected()) {
      restaurant = await Restaurant.findOne({ placeId }).lean();
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found. Run an audit first.'
      });
    }

    // Get latest ranking snapshot for rank position
    let latestRanking;
    if (isMongoConnected()) {
      latestRanking = await RankingHistory.findOne({ placeId })
        .sort({ recordDate: -1 })
        .lean();
    }

    const currentRank = latestRanking?.googleRank || 3;

    // Calculate live traffic estimates
    const trafficEstimate = trafficEstimator.estimateMonthlyVisitors(restaurant);
    const searchImpressions = trafficEstimator.estimateSearchImpressions(restaurant);
    const ctr = trafficEstimator.estimateCTR(restaurant, currentRank);

    // Get previous snapshot for trend calculation
    let previousRanking;
    if (isMongoConnected() && latestRanking) {
      previousRanking = await RankingHistory.findOne({
        placeId,
        recordDate: { $lt: latestRanking.recordDate }
      })
      .sort({ recordDate: -1 })
      .lean();
    }

    const trafficTrend = trafficEstimator.calculateTrafficTrend(
      trafficEstimate.monthly,
      previousRanking?.estimatedMonthlyVisitors
    );

    // Calculate SEO impact
    const seoImpact = trafficEstimator.calculateSEOImpact(
      latestRanking?.overallScore || 70,
      previousRanking?.overallScore,
      trafficEstimate.monthly
    );

    // Get historical data for correlation
    let historicalData = [];
    if (isMongoConnected()) {
      historicalData = await RankingHistory.find({ placeId })
        .sort({ recordDate: 1 })
        .limit(30)
        .lean();
    }

    const correlation = trafficEstimator.calculateCorrelation(historicalData);

    res.json({
      success: true,
      metrics: {
        estimatedVisitors: trafficEstimate.monthly,
        weeklyVisitors: trafficEstimate.weekly,
        dailyVisitors: trafficEstimate.daily,
        searchImpressions,
        clickThroughRate: ctr,
        confidence: trafficEstimate.confidence,
        trend: trafficTrend,
        seoImpact,
        correlation,
        factors: trafficEstimate.factors,
        dataSource: 'google_places_calculated',
        lastUpdated: latestRanking?.recordDate || new Date()
      }
    });

  } catch (error) {
    winston.error(`Traffic metrics error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve traffic metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions

/**
 * Generate simulated historical data for demonstration purposes
 * Creates a realistic trend showing gradual improvement over time
 */
function generateSimulatedHistory(days, currentRank = 5, currentScore = 72) {
  const history = [];
  const dataPoints = Math.min(days, 30); // Generate up to 30 data points

  // Start from a worse position and improve to current
  const startRank = Math.min(currentRank + Math.floor(Math.random() * 5) + 3, 20);
  const startScore = Math.max(currentScore - Math.floor(Math.random() * 15) - 10, 40);

  for (let i = 0; i < dataPoints; i++) {
    const progress = i / (dataPoints - 1); // 0 to 1
    const daysAgo = dataPoints - i - 1;

    // Gradually improve from start to current with some variation
    const rankVariation = (Math.random() - 0.5) * 2; // -1 to +1
    const googleRank = Math.round(startRank - (startRank - currentRank) * progress + rankVariation);

    const scoreVariation = (Math.random() - 0.5) * 5; // -2.5 to +2.5
    const overallScore = Math.round(startScore + (currentScore - startScore) * progress + scoreVariation);

    const seoScore = Math.max(30, Math.min(100, overallScore + Math.floor(Math.random() * 10) - 5));
    const performanceScore = Math.max(20, Math.min(100, overallScore - Math.floor(Math.random() * 15)));

    const recordDate = new Date();
    recordDate.setDate(recordDate.getDate() - daysAgo);

    history.push({
      recordDate,
      googleRank: Math.max(1, googleRank),
      localRank: Math.max(1, googleRank),
      overallScore: Math.max(0, Math.min(100, overallScore)),
      seoScore: Math.max(0, Math.min(100, seoScore)),
      performanceScore: Math.max(0, Math.min(100, performanceScore)),
      rating: 4.0 + Math.random() * 0.5,
      totalRatings: 100 + Math.floor(i * 3),
      estimatedMonthlyVisitors: 800 + Math.floor(progress * 400) + Math.floor(Math.random() * 100),
      totalCompetitors: 15 + Math.floor(Math.random() * 10)
    });
  }

  return history;
}

function calculateTrendAnalysis(history) {
  if (history.length < 2) {
    return {
      trend: 'insufficient_data',
      improvement: 0,
      volatility: 0
    };
  }

  const recent = history.slice(-7); // Last 7 data points
  const rankChanges = recent.map((r, i) => i > 0 ? recent[i - 1].googleRank - r.googleRank : 0);
  const avgChange = rankChanges.reduce((sum, c) => sum + c, 0) / rankChanges.length;

  return {
    trend: avgChange > 0.5 ? 'improving' : avgChange < -0.5 ? 'declining' : 'stable',
    averageRank: recent.reduce((sum, r) => sum + r.googleRank, 0) / recent.length,
    bestRank: Math.min(...recent.map(r => r.googleRank)),
    worstRank: Math.max(...recent.map(r => r.googleRank)),
    volatility: Math.max(...rankChanges) - Math.min(...rankChanges)
  };
}


module.exports = router;
