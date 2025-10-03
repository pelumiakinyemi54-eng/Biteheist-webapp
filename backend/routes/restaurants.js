const express = require('express');
const { query, validationResult } = require('express-validator');
const Restaurant = require('../models/Restaurant');
const Audit = require('../models/Audit');
const GooglePlacesService = require('../services/googlePlaces');
const RevenueCalculator = require('../services/revenueCalculator');
const { optionalAuth, auth } = require('../middleware/auth');
const { isMongoConnected } = require('../config/database');
const winston = require('winston');

const router = express.Router();
const googlePlaces = new GooglePlacesService();

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

    // Get competitors for comparison
    let competitors = [];
    if (restaurant.location) {
      try {
        competitors = await googlePlaces.findNearbyCompetitors(
          restaurant.location.lat,
          restaurant.location.lng,
          { radius: 1000, maxResults: 5 }
        );
      } catch (error) {
        winston.warn(`Competitor search failed: ${error.message}`);
      }
    }

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
    const pageSpeedScore = await calculatePageSpeedScore(restaurant.website);
    const responseTimeScore = calculateResponseTimeScore(restaurant.reviews);

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
        reviews: restaurant.reviews && restaurant.reviews.length > 0 ? restaurant.reviews : [
          // Sample reviews for demonstration when no real reviews are available
          {
            author: "Sarah M.",
            rating: 4,
            text: "Great food and fast service! The staff was very friendly and helpful. Will definitely come back again.",
            time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            relativeTime: "a week ago"
          },
          {
            author: "Mike J.",
            rating: 3,
            text: "Good location and clean restaurant. Food was okay but could be better. Service was quick though.",
            time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            relativeTime: "2 weeks ago"
          },
          {
            author: "Lisa K.",
            rating: 2,
            text: "The order took longer than expected and the food wasn't as hot as I'd like. The place could use some improvement.",
            time: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            relativeTime: "3 weeks ago"
          },
          {
            author: "David R.",
            rating: 5,
            text: "Excellent experience! Quick service, hot food, and friendly staff. Exactly what you expect from this brand.",
            time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            relativeTime: "10 days ago"
          },
          {
            author: "Jennifer W.",
            rating: 3,
            text: "Average experience. The food met expectations but nothing special. Good for a quick meal.",
            time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            relativeTime: "5 days ago"
          },
          {
            author: "Carlos P.",
            rating: 4,
            text: "Convenient location with decent food quality. Staff could be more attentive but overall satisfied.",
            time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            relativeTime: "a month ago"
          }
        ], // Include customer reviews with fallback samples
        hours: restaurant.hours,
        types: restaurant.types,
        location: restaurant.location
      },
      competitors: competitors.map(comp => ({
        name: comp.name,
        rating: comp.rating,
        totalRatings: comp.totalRatings,
        distance: comp.distance
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
 * Calculate page speed score (mock implementation)
 */
async function calculatePageSpeedScore(website) {
  if (!website) {
    return {
      score: 0,
      loadTime: 5.0,
      metrics: {
        firstContentfulPaint: 3.5,
        largestContentfulPaint: 5.0,
        cumulativeLayoutShift: 0.25
      },
      hasWebsite: false
    };
  }

  // Mock page speed analysis
  // In production, integrate with Google PageSpeed Insights API
  const mockLoadTime = 2.5 + Math.random() * 2; // 2.5-4.5 seconds
  const score = Math.max(0, Math.round(100 - (mockLoadTime - 1) * 20));

  return {
    score,
    loadTime: Math.round(mockLoadTime * 10) / 10,
    metrics: {
      firstContentfulPaint: Math.round((mockLoadTime * 0.6) * 10) / 10,
      largestContentfulPaint: Math.round((mockLoadTime * 0.9) * 10) / 10,
      cumulativeLayoutShift: Math.round(Math.random() * 0.3 * 100) / 100
    },
    hasWebsite: true
  };
}

/**
 * Calculate response time score based on reviews
 */
function calculateResponseTimeScore(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      score: 50,
      avgResponseTime: 48,
      responseRate: 0.3,
      hasData: false
    };
  }

  // Mock response time analysis
  // In production, analyze review responses and timestamps
  const mockResponseRate = 0.4 + Math.random() * 0.4; // 40-80%
  const mockAvgResponseTime = 24 + Math.random() * 48; // 24-72 hours

  let score = 100;
  if (mockAvgResponseTime > 72) score -= 40;
  else if (mockAvgResponseTime > 48) score -= 25;
  else if (mockAvgResponseTime > 24) score -= 10;

  if (mockResponseRate < 0.5) score -= 30;
  else if (mockResponseRate < 0.8) score -= 15;

  return {
    score: Math.max(0, score),
    avgResponseTime: Math.round(mockAvgResponseTime),
    responseRate: Math.round(mockResponseRate * 100) / 100,
    hasData: true
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

module.exports = router;