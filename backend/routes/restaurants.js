const express = require('express');
const { query, validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const Audit = require('../models/Audit');
const RankingHistory = require('../models/RankingHistory');
const CompetitorSnapshot = require('../models/CompetitorSnapshot');
const GooglePlacesService = require('../services/googlePlaces');
const PageSpeedService = require('../services/pageSpeedService');
const ReviewAnalyzer = require('../services/reviewAnalyzer');
const RankingService = require('../services/rankingService');
const RevenueCalculator = require('../services/revenueCalculator');
const SEOIssueDetector = require('../services/seoIssueDetector');
const SentimentAnalyzer = require('../services/sentimentAnalyzer');
const TaskQueue = require('../services/taskQueue');
const MongoService = require('../services/mongoService');
const { optionalAuth, auth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');

const router = express.Router();
const googlePlaces = new GooglePlacesService();
const pageSpeedService = new PageSpeedService();
const reviewAnalyzer = new ReviewAnalyzer();
const rankingService = new RankingService();
const seoIssueDetector = new SEOIssueDetector();
const sentimentAnalyzer = new SentimentAnalyzer();
const taskQueue = new TaskQueue();
const mongoService = new MongoService();

/**
 * @route   GET /api/restaurants/search
 * @desc    Search for restaurants
 * @access  Public
 */
router.get('/search', [
  query('query')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
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

    const { query: searchQuery, limit = 10 } = req.query;

    winston.info(`Restaurant search: "${searchQuery}" by ${req.user?.email || 'anonymous'}`);

    // Search using Google Places API
    const restaurants = await googlePlaces.searchRestaurants(searchQuery, {
      maxResults: parseInt(limit)
    });

    res.json({
      success: true,
      results: restaurants,
      count: restaurants.length
    });

  } catch (error) {
    winston.error(`Restaurant search error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/restaurants/:placeId
 * @desc    Get restaurant details
 * @access  Public
 */
router.get('/:placeId', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    winston.info(`Restaurant details: ${placeId} by ${req.user?.email || 'anonymous'}`);

    let restaurant;
    let cached = false;

    if (isMongoConnected()) {
      // Try to get cached data if MongoDB is available
      restaurant = await Restaurant.findOne({ placeId });

      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
      const needsUpdate = !restaurant ||
                         (Date.now() - restaurant.lastUpdated.getTime()) > cacheExpiry;

      if (needsUpdate) {
        // Fetch fresh data from Google Places
        const restaurantData = await googlePlaces.getRestaurantDetails(placeId);

        if (restaurant) {
          // Update existing record
          Object.assign(restaurant, {
            name: restaurantData.name,
            address: restaurantData.address,
            phone: restaurantData.phone,
            website: restaurantData.website,
            location: restaurantData.location,
            rating: restaurantData.rating,
            totalRatings: restaurantData.totalRatings,
            priceLevel: restaurantData.priceLevel,
            types: restaurantData.types,
            hours: restaurantData.hours,
            photos: restaurantData.photos.map(photo => ({
              photoReference: photo.reference,
              width: photo.width,
              height: photo.height
            })),
            reviews: restaurantData.reviews,
            googleData: restaurantData.rawData,
            lastUpdated: new Date()
          });
        } else {
          // Create new record
          restaurant = new Restaurant({
            placeId,
            name: restaurantData.name,
            address: restaurantData.address,
            phone: restaurantData.phone,
            website: restaurantData.website,
            location: restaurantData.location,
            rating: restaurantData.rating,
            totalRatings: restaurantData.totalRatings,
            priceLevel: restaurantData.priceLevel,
            types: restaurantData.types,
            hours: restaurantData.hours,
            photos: restaurantData.photos.map(photo => ({
              photoReference: photo.reference,
              width: photo.width,
              height: photo.height
            })),
            reviews: restaurantData.reviews,
            googleData: restaurantData.rawData,
            lastUpdated: new Date()
          });
        }

        await restaurant.save();
      } else {
        cached = true;
      }
    } else {
      // MongoDB not available, fetch directly from Google Places
      winston.info('MongoDB not available, fetching fresh data from Google Places');
      const restaurantData = await googlePlaces.getRestaurantDetails(placeId);

      restaurant = {
        placeId,
        name: restaurantData.name,
        address: restaurantData.address,
        phone: restaurantData.phone,
        website: restaurantData.website,
        location: restaurantData.location,
        rating: restaurantData.rating,
        totalRatings: restaurantData.totalRatings,
        priceLevel: restaurantData.priceLevel,
        types: restaurantData.types,
        hours: restaurantData.hours,
        photos: restaurantData.photos.map(photo => ({
          photoReference: photo.reference,
          width: photo.width,
          height: photo.height
        })),
        reviews: restaurantData.reviews,
        googleData: restaurantData.rawData,
        lastUpdated: new Date()
      };
    }

    res.json({
      success: true,
      restaurant: restaurant.toJSON ? restaurant.toJSON() : restaurant,
      cached
    });

  } catch (error) {
    winston.error(`Restaurant details error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get restaurant details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/restaurants/:placeId/audit
 * @desc    Run SEO audit for a restaurant
 * @access  Public (but better with auth)
 */
router.post('/:placeId/audit', optionalAuth, async (req, res) => {
  try {
    const { placeId } = req.params;

    winston.info(`Restaurant audit: ${placeId} by ${req.user?.email || 'anonymous'}`);

    // Get restaurant details first
    let restaurant;

    if (isMongoConnected()) {
      restaurant = await Restaurant.findOne({ placeId });

      if (!restaurant) {
        // Fetch from Google Places if not in database
        const restaurantData = await googlePlaces.getRestaurantDetails(placeId);

        restaurant = new Restaurant({
          placeId,
          name: restaurantData.name,
          address: restaurantData.address,
          phone: restaurantData.phone,
          website: restaurantData.website,
          location: restaurantData.location,
          rating: restaurantData.rating,
          totalRatings: restaurantData.totalRatings,
          priceLevel: restaurantData.priceLevel,
          types: restaurantData.types,
          hours: restaurantData.hours,
          photos: restaurantData.photos.map(photo => ({
            photoReference: photo.reference,
            width: photo.width,
            height: photo.height
          })),
          reviews: restaurantData.reviews,
          googleData: restaurantData.rawData,
          lastUpdated: new Date()
        });

        await restaurant.save();
      }
    } else {
      // MongoDB not available, fetch directly from Google Places
      winston.info('MongoDB not available, fetching fresh data for audit');
      const restaurantData = await googlePlaces.getRestaurantDetails(placeId);

      restaurant = {
        placeId,
        name: restaurantData.name,
        address: restaurantData.address,
        phone: restaurantData.phone,
        website: restaurantData.website,
        location: restaurantData.location,
        rating: restaurantData.rating,
        totalRatings: restaurantData.totalRatings,
        priceLevel: restaurantData.priceLevel,
        types: restaurantData.types,
        hours: restaurantData.hours,
        photos: restaurantData.photos.map(photo => ({
          photoReference: photo.reference,
          width: photo.width,
          height: photo.height
        })),
        reviews: restaurantData.reviews,
        googleData: restaurantData.rawData,
        lastUpdated: new Date()
      };
    }

    // Get competitors for comparison (prioritizing food type similarity)
    let competitors = [];
    if (restaurant.location) {
      try {
        // First attempt: 10km radius
        competitors = await googlePlaces.findNearbyCompetitors(
          restaurant.location.lat,
          restaurant.location.lng,
          {
            radius: 10000,  // 10km radius to find more similar restaurants
            maxResults: 20, // Get more to accurately calculate ranking
            restaurantTypes: restaurant.types || []
          }
        );

        // Fallback: If no competitors found, expand search radius to 25km
        if (competitors.length === 0) {
          winston.info(`No competitors found in 10km, expanding to 25km radius`);
          competitors = await googlePlaces.findNearbyCompetitors(
            restaurant.location.lat,
            restaurant.location.lng,
            {
              radius: 25000,  // 25km radius
              maxResults: 20,
              restaurantTypes: restaurant.types || []
            }
          );
        }

        // Second fallback: If still no competitors, try 50km without food type filtering
        if (competitors.length === 0) {
          winston.info(`No competitors found in 25km, expanding to 50km radius without strict filtering`);
          competitors = await googlePlaces.findNearbyCompetitors(
            restaurant.location.lat,
            restaurant.location.lng,
            {
              radius: 50000,  // 50km radius
              maxResults: 10,
              restaurantTypes: [] // Remove type filtering to get any restaurants
            }
          );
        }

        if (competitors.length === 0) {
          winston.warn(`No competitors found even after expanding search to 50km`);
        }
      } catch (error) {
        winston.warn(`Competitor search failed: ${error.message}`);
      }
    }

    // Calculate accurate Google search ranking based on food type similarity
    const rankingData = rankingService.calculateGoogleRank(restaurant, competitors);
    const googleRank = rankingData.googleRank;
    const localRank = rankingData.googleRank; // Same for now

    winston.info(`Ranking: ${restaurant.name} is #${googleRank} among ${competitors.length + 1} similar restaurants`);

    // Initialize revenue calculator
    const revenueCalculator = new RevenueCalculator();

    // Estimate monthly visitors based on restaurant data
    const monthlyVisitors = revenueCalculator.estimateMonthlyVisitors({
      rating: restaurant.rating,
      totalReviews: restaurant.totalRatings,
      priceLevel: restaurant.priceLevel
    });

    // Calculate SEO metrics and scores
    const seoScore = calculateSeoScore(restaurant);
    const pageSpeedScore = await pageSpeedService.analyzeWebsite(restaurant.website);
    const responseTimeScore = reviewAnalyzer.analyzeResponseTime(restaurant.reviews);

    // Prepare metrics for revenue calculation
    const metrics = {
      seoScore: seoScore.score,
      loadTime: pageSpeedScore.loadTime,
      rating: restaurant.rating,
      totalReviews: restaurant.totalRatings,
      avgResponseTime: responseTimeScore.avgResponseTime,
      responseRate: responseTimeScore.responseRate,
      monthlyVisitors
    };

    // Calculate revenue impact
    const revenueAnalysis = revenueCalculator.calculateTotalRevenueLoss(metrics);

    // Generate revenue-focused messages
    const messages = revenueCalculator.generateRevenueMessages(revenueAnalysis);

    // Prepare audit result
    const auditResult = {
      restaurant: {
        placeId: restaurant.placeId,
        name: restaurant.name,
        address: restaurant.address,
        rating: restaurant.rating,
        totalRatings: restaurant.totalRatings,
        website: restaurant.website,
        phone: restaurant.phone,
        photos: restaurant.photos.slice(0, 3), // First 3 photos
        reviews: restaurant.reviews || [], // Real reviews from Google Places
        hours: restaurant.hours,
        types: restaurant.types,
        location: restaurant.location
      },
      ranking: {
        googleRank,
        localRank,
        totalCompetitors: competitors.length,
        similarRestaurants: rankingData.analysis.similarRestaurants,
        strongerCompetitors: rankingData.analysis.strongerCompetitors,
        yourScore: rankingData.yourScore,
        topCompetitors: rankingData.scoredRestaurants.slice(0, 5).map(r => ({
          name: r.name,
          rank: rankingData.scoredRestaurants.indexOf(r) + 1,
          rating: r.rating,
          totalRatings: r.totalRatings,
          similarityScore: Math.round(r.similarityScore),
          distance: r.distance
        }))
      },
      competitors: competitors.slice(0, 10).map(comp => ({ // Show top 10 competitors
        name: comp.name,
        rating: comp.rating,
        totalRatings: comp.totalRatings,
        distance: comp.distance,
        types: comp.types || []
      })),
      scores: {
        seo: seoScore,
        pageSpeed: pageSpeedScore,
        reviews: {
          score: Math.round((restaurant.rating / 5) * 100),
          rating: restaurant.rating,
          totalReviews: restaurant.totalRatings,
          averageCompetitorRating: competitors.length > 0
            ? Math.round(competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length * 10) / 10
            : 4.2
        },
        responseTime: responseTimeScore,
        overall: revenueAnalysis.overallScore
      },
      revenueImpact: {
        monthly: revenueAnalysis.totalMonthlyLoss,
        annual: revenueAnalysis.totalAnnualLoss,
        breakdown: {
          seo: revenueAnalysis.seoLoss.monthlyLoss,
          speed: revenueAnalysis.speedLoss.monthlyLoss,
          reviews: revenueAnalysis.reviewLoss.monthlyLoss,
          response: revenueAnalysis.responseLoss.monthlyLoss
        }
      },
      messages,
      grade: revenueAnalysis.grade,
      actionItems: generateActionItems(seoScore, pageSpeedScore, restaurant, competitors),
      parameters: {
        monthlyVisitors,
        averageOrderValue: revenueAnalysis.parameters.averageOrderValue,
        conversionRate: revenueAnalysis.parameters.conversionRate
      },
      auditDate: new Date().toISOString()
    };

    // NEW FEATURES: Add advanced analytics
    // 1. SEO Issue Detection with Fix Recommendations
    const seoIssues = seoIssueDetector.detectIssues(auditResult);
    auditResult.seoIssues = seoIssues;
    auditResult.seoImpact = seoIssueDetector.calculateTotalImpact(seoIssues);

    // 2. Review Sentiment Analysis
    const sentimentAnalysis = sentimentAnalyzer.analyzeReviews(restaurant.reviews || []);
    auditResult.sentimentAnalysis = sentimentAnalysis;

    // 3. Priority Task Queue by Revenue Impact
    const priorityTasks = taskQueue.generateTaskQueue(seoIssues, sentimentAnalysis, auditResult);
    auditResult.taskQueue = priorityTasks;

    // Save audit to database if user is authenticated and MongoDB is connected
    let savedAudit = null;
    if (req.user && isMongoConnected()) {
      try {
        savedAudit = new Audit({
          userId: req.user._id,
          restaurantName: restaurant.name,
          placeId: restaurant.placeId,
          address: restaurant.address,
          rating: restaurant.rating,
          overallScore: auditResult.scores.overall,
          seoScore: auditResult.scores.seo.score,
          performance: auditResult.scores.pageSpeed.score,
          accessibility: 85, // Default value
          bestPractices: 80, // Default value
          pageSpeedMetrics: {
            lcp: auditResult.scores.pageSpeed.metrics.largestContentfulPaint,
            fcp: auditResult.scores.pageSpeed.metrics.firstContentfulPaint,
            cls: auditResult.scores.pageSpeed.metrics.cumulativeLayoutShift
          },
          revenueImpact: {
            estimatedLoss: auditResult.revenueImpact.monthly,
            potentialGain: auditResult.revenueImpact.annual
          }
        });

        await savedAudit.save();
        winston.info(`Audit saved for user ${req.user.email}: ${restaurant.name}`);
      } catch (error) {
        winston.error(`Failed to save audit: ${error.message}`);
        // Don't fail the request if audit save fails
      }
    }

    // SAVE HISTORICAL DATA: Save ranking and competitor snapshots (public audits too)
    if (isMongoConnected()) {
      // Save ranking history snapshot (non-blocking)
      mongoService.saveRankingSnapshot(auditResult).catch(err => {
        winston.error(`Failed to save ranking snapshot: ${err.message}`);
      });

      // Save competitor snapshot (non-blocking)
      mongoService.saveCompetitorSnapshot(auditResult).catch(err => {
        winston.error(`Failed to save competitor snapshot: ${err.message}`);
      });
    }

    res.json({
      success: true,
      audit: auditResult,
      saved: !!savedAudit,
      isAuthenticated: !!req.user
    });

  } catch (error) {
    winston.error(`Restaurant audit error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Audit failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/restaurants/audits/history
 * @desc    Get user's audit history
 * @access  Private
 */
router.get('/audits/history', auth, async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    if (!isMongoConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const audits = await Audit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await Audit.countDocuments({ userId: req.user._id });

    winston.info(`Audit history retrieved for ${req.user.email}: ${audits.length} results`);

    res.json({
      success: true,
      audits,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    winston.error(`Audit history error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Calculate SEO score based on available data
 */
function calculateSeoScore(restaurant) {
  let score = 0;
  const factors = {
    googleMyBusiness: 0,
    onlinePresence: 0,
    reviewManagement: 0,
    websiteOptimization: 0
  };

  // Google My Business completeness (40 points)
  let gmbScore = 0;
  if (restaurant.name) gmbScore += 5;
  if (restaurant.address) gmbScore += 5;
  if (restaurant.phone) gmbScore += 5;
  if (restaurant.hours) gmbScore += 5;
  if (restaurant.photos && restaurant.photos.length > 0) gmbScore += 10;
  if (restaurant.photos && restaurant.photos.length > 5) gmbScore += 5;
  if (restaurant.types && restaurant.types.length > 0) gmbScore += 5;

  factors.googleMyBusiness = gmbScore;
  score += gmbScore;

  // Online Reviews (30 points)
  if (restaurant.rating >= 4.5) factors.reviewManagement += 15;
  else if (restaurant.rating >= 4.0) factors.reviewManagement += 12;
  else if (restaurant.rating >= 3.5) factors.reviewManagement += 8;
  else factors.reviewManagement += 4;

  if (restaurant.totalRatings >= 100) factors.reviewManagement += 15;
  else if (restaurant.totalRatings >= 50) factors.reviewManagement += 10;
  else if (restaurant.totalRatings >= 25) factors.reviewManagement += 5;

  score += factors.reviewManagement;

  // Website presence (20 points)
  if (restaurant.website) {
    factors.websiteOptimization = 15; // Assume basic optimization
    score += factors.websiteOptimization;
  }

  // Online presence (10 points)
  factors.onlinePresence = 8; // Assume decent presence since they're on Google
  score += factors.onlinePresence;

  return {
    score: Math.min(100, score),
    factors,
    breakdown: {
      googleMyBusiness: `${factors.googleMyBusiness}/40`,
      reviewManagement: `${factors.reviewManagement}/30`,
      websiteOptimization: `${factors.websiteOptimization}/20`,
      onlinePresence: `${factors.onlinePresence}/10`
    }
  };
}


/**
 * Generate actionable items based on audit results
 */
function generateActionItems(seoScore, pageSpeedScore, restaurant, competitors) {
  const items = [];

  // SEO recommendations
  if (seoScore.score < 70) {
    if (!restaurant.website) {
      items.push({
        priority: 'high',
        category: 'SEO',
        title: 'Create a professional website',
        description: 'Having a website increases visibility and credibility significantly.',
        estimatedRevenue: 1200,
        timeframe: '2-4 weeks'
      });
    }

    if (restaurant.photos.length < 10) {
      items.push({
        priority: 'medium',
        category: 'SEO',
        title: 'Add more high-quality photos',
        description: 'Upload at least 10 professional photos of food, interior, and exterior.',
        estimatedRevenue: 400,
        timeframe: '1 week'
      });
    }

    if (restaurant.totalRatings < 50) {
      items.push({
        priority: 'high',
        category: 'Reviews',
        title: 'Increase customer reviews',
        description: 'Actively ask satisfied customers to leave reviews on Google.',
        estimatedRevenue: 800,
        timeframe: '4-8 weeks'
      });
    }
  }

  // Page speed recommendations
  if (pageSpeedScore.score < 80 && restaurant.website) {
    items.push({
      priority: 'high',
      category: 'Website',
      title: 'Optimize website loading speed',
      description: 'Compress images and improve hosting to reduce load time.',
      estimatedRevenue: 600,
      timeframe: '1-2 weeks'
    });
  }

  // Competitive analysis
  if (competitors.length > 0) {
    const avgCompetitorRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
    if (restaurant.rating < avgCompetitorRating - 0.2) {
      items.push({
        priority: 'high',
        category: 'Reviews',
        title: 'Improve service quality',
        description: `Your ${restaurant.rating}★ rating is below competitors' ${avgCompetitorRating.toFixed(1)}★ average.`,
        estimatedRevenue: 1000,
        timeframe: '4-12 weeks'
      });
    }
  }

  return items.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Save analytics snapshots (ranking history and competitor data)
 */
async function saveAnalyticsSnapshots(restaurant, auditResult, competitors) {
  try {
    const WeeklyReport = require('../models/WeeklyReport');
    const weekInfo = WeeklyReport.getCurrentWeekInfo();

    // Use the ranking data from audit result (already calculated accurately)
    const googleRank = auditResult.ranking?.googleRank || 1;
    const localRank = auditResult.ranking?.localRank || googleRank;

    // Save ranking history snapshot
    const rankingSnapshot = new RankingHistory({
      restaurantId: restaurant._id || null,
      placeId: restaurant.placeId,
      restaurantName: restaurant.name,
      googleRank,
      localRank,
      totalCompetitors: competitors.length,
      overallScore: auditResult.scores.overall,
      seoScore: auditResult.scores.seo.score,
      performanceScore: auditResult.scores.pageSpeed.score,
      rating: restaurant.rating,
      totalRatings: restaurant.totalRatings,
      estimatedMonthlyVisitors: auditResult.parameters?.monthlyVisitors || 1000,
      revenueImpact: auditResult.revenueImpact,
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year
    });

    await rankingSnapshot.save();
    winston.info(`Ranking snapshot saved for ${restaurant.name}`);

    // Save competitor snapshot
    const competitorsWithRank = competitors.map((comp, index) => {
      const rank = sortedByRating.findIndex(r => r.name === comp.name) + 1;
      return {
        placeId: comp.placeId || `temp_${index}`,
        name: comp.name,
        rating: comp.rating,
        totalRatings: comp.totalRatings || comp.user_ratings_total,
        distance: comp.distance || 0,
        rank,
        types: comp.types || [],
        ratingChange: 0,
        reviewsChange: 0,
        rankChange: 0
      };
    });

    const competitorStats = {
      averageRating: competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / competitors.length,
      averageReviews: competitors.reduce((sum, c) => sum + (c.totalRatings || c.user_ratings_total || 0), 0) / competitors.length,
      totalCompetitors: competitors.length,
      strongerCompetitors: competitors.filter(c => (c.rating || 0) > restaurant.rating).length,
      weakerCompetitors: competitors.filter(c => (c.rating || 0) < restaurant.rating).length
    };

    const competitorSnapshot = new CompetitorSnapshot({
      restaurantId: restaurant._id || null,
      placeId: restaurant.placeId,
      competitors: competitorsWithRank,
      competitorStats,
      yourPosition: {
        rank: googleRank,
        percentile: Math.round((1 - (googleRank - 1) / allRestaurants.length) * 100)
      },
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year
    });

    await competitorSnapshot.save();
    winston.info(`Competitor snapshot saved for ${restaurant.name}`);

  } catch (error) {
    winston.error(`Error saving analytics snapshots: ${error.message}`);
    throw error;
  }
}

/**
 * @route   POST /api/restaurants/keyword-ranking
 * @desc    Get keyword ranking across multiple cities
 * @access  Public
 */
router.post('/keyword-ranking', optionalAuth, async (req, res) => {
  try {
    const { placeId, restaurantName, cuisine, city, lat, lng } = req.body;

    // Validate required fields
    if (!placeId || !cuisine || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: placeId, cuisine, and city are required'
      });
    }

    winston.info(`Keyword ranking search: ${cuisine} in ${city} for ${restaurantName || placeId}`);

    const { getSurroundingCities, getSearchVariations } = require('../utils/locationHelper');

    // Get surrounding cities if lat/lng provided
    let cities = [{ name: city, distance: 0 }];
    if (lat && lng) {
      const surroundingCities = await getSurroundingCities(lat, lng, 25, 5);
      cities = [{ name: city, distance: 0 }, ...surroundingCities];
    }

    // Generate search variations
    const keywords = [
      `${cuisine}`,
      `${cuisine} restaurant`,
      `best ${cuisine}`,
      `top ${cuisine}`
    ];

    const rankings = [];
    const allCompetitors = new Map(); // Track unique competitors across all searches

    // Search each city/keyword combination
    for (const cityObj of cities) {
      for (const keyword of keywords) {
        try {
          const searchQuery = `${keyword} in ${cityObj.name}`;

          // Search for restaurants with this keyword
          const results = await googlePlaces.searchRestaurants(searchQuery, {
            maxResults: 20,
            location: lat && lng ? { latitude: lat, longitude: lng } : undefined
          });

          // Find target restaurant position
          const position = results.findIndex(r => r.placeId === placeId) + 1;

          // Track top 3 competitors
          const topThree = results.slice(0, 3).filter(r => r.placeId !== placeId);
          topThree.forEach(comp => {
            if (!allCompetitors.has(comp.placeId)) {
              allCompetitors.set(comp.placeId, {
                ...comp,
                appearances: 1
              });
            } else {
              allCompetitors.get(comp.placeId).appearances++;
            }
          });

          rankings.push({
            keyword: searchQuery,
            city: cityObj.name,
            distance: cityObj.distance,
            position: position || null,
            inTopTwenty: position > 0 && position <= 20,
            topCompetitors: topThree.map(c => ({
              placeId: c.placeId,
              name: c.name,
              rating: c.rating,
              totalRatings: c.totalRatings
            }))
          });

        } catch (error) {
          winston.error(`Keyword search failed for ${keyword} in ${cityObj.name}: ${error.message}`);
        }
      }
    }

    // Sort competitors by appearance frequency
    const topCompetitors = Array.from(allCompetitors.values())
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 3)
      .map(comp => ({
        placeId: comp.placeId,
        name: comp.name,
        rating: comp.rating,
        totalRatings: comp.totalRatings,
        appearances: comp.appearances
      }));

    // Calculate summary statistics
    const positionsFound = rankings.filter(r => r.position).map(r => r.position);
    const avgPosition = positionsFound.length > 0
      ? Math.round(positionsFound.reduce((a, b) => a + b, 0) / positionsFound.length)
      : null;

    const inTopTen = rankings.filter(r => r.position && r.position <= 10).length;
    const inTopTwenty = rankings.filter(r => r.position && r.position <= 20).length;
    const notRanked = rankings.filter(r => !r.position).length;

    res.json({
      success: true,
      summary: {
        avgPosition,
        inTopTen,
        inTopTwenty,
        notRanked,
        totalSearches: rankings.length
      },
      rankings: rankings.sort((a, b) => {
        // Sort by: in top 20 first, then by position, then by distance
        if (a.inTopTwenty && !b.inTopTwenty) return -1;
        if (!a.inTopTwenty && b.inTopTwenty) return 1;
        if (a.position && b.position) return a.position - b.position;
        return a.distance - b.distance;
      }),
      topCompetitors
    });

  } catch (error) {
    winston.error(`Keyword ranking error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Keyword ranking search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;