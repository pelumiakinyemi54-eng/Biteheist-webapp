const winston = require('winston');

/**
 * TrafficEstimator Service
 * Calculates realistic traffic estimates based on live Google Places data
 */
class TrafficEstimator {
  /**
   * Estimate monthly visitors based on Google Places metrics
   * Uses industry research and statistical models
   */
  estimateMonthlyVisitors(restaurant) {
    const {
      rating = 0,
      totalRatings = 0,
      priceLevel = 2,
      types = []
    } = restaurant;

    // Base traffic calculation factors
    const factors = {
      rating: this.getRatingFactor(rating),
      reviewVolume: this.getReviewVolumeFactor(totalRatings),
      priceLevel: this.getPriceLevelFactor(priceLevel),
      restaurantType: this.getRestaurantTypeFactor(types)
    };

    // Industry averages (based on restaurant industry data)
    const baseMonthlyVisitors = 800; // Average small restaurant

    // Calculate estimated visitors
    const estimatedVisitors = Math.round(
      baseMonthlyVisitors *
      factors.rating *
      factors.reviewVolume *
      factors.priceLevel *
      factors.restaurantType
    );

    winston.debug(`Traffic estimation for ${restaurant.name}:`, {
      rating: `${rating} (${factors.rating}x)`,
      reviews: `${totalRatings} (${factors.reviewVolume}x)`,
      priceLevel: `${priceLevel} (${factors.priceLevel}x)`,
      type: `${factors.restaurantType}x`,
      estimated: estimatedVisitors
    });

    return {
      monthly: estimatedVisitors,
      weekly: Math.round(estimatedVisitors / 4.33),
      daily: Math.round(estimatedVisitors / 30),
      factors,
      confidence: this.calculateConfidence(totalRatings)
    };
  }

  /**
   * Estimate search impressions from Google Places data
   */
  estimateSearchImpressions(restaurant) {
    const { totalRatings = 0, rating = 0 } = restaurant;

    // Research shows: 1 review ≈ 50-100 views
    const viewsPerReview = 75;
    const monthlyImpressions = totalRatings * viewsPerReview;

    // Boost for high ratings
    const ratingBoost = rating >= 4.5 ? 1.3 : rating >= 4.0 ? 1.1 : 1.0;

    return Math.round(monthlyImpressions * ratingBoost);
  }

  /**
   * Calculate Click-Through Rate based on rating and ranking
   */
  estimateCTR(restaurant, rank) {
    // Industry CTR by position (based on search engine research)
    const positionCTR = {
      1: 0.284,  // 28.4%
      2: 0.153,  // 15.3%
      3: 0.098,  // 9.8%
      4: 0.067,  // 6.7%
      5: 0.048,  // 4.8%
    };

    const baseCTR = positionCTR[Math.min(rank, 5)] || 0.03;

    // Rating modifier
    const ratingModifier = restaurant.rating >= 4.5 ? 1.2 :
                          restaurant.rating >= 4.0 ? 1.0 :
                          restaurant.rating >= 3.5 ? 0.85 : 0.7;

    return Math.round(baseCTR * ratingModifier * 100) / 10; // Return as percentage
  }

  /**
   * Calculate rating impact factor
   */
  getRatingFactor(rating) {
    if (rating >= 4.5) return 1.5;
    if (rating >= 4.0) return 1.2;
    if (rating >= 3.5) return 1.0;
    if (rating >= 3.0) return 0.8;
    return 0.6;
  }

  /**
   * Calculate review volume factor
   */
  getReviewVolumeFactor(totalRatings) {
    if (totalRatings >= 500) return 2.0;
    if (totalRatings >= 200) return 1.7;
    if (totalRatings >= 100) return 1.4;
    if (totalRatings >= 50) return 1.2;
    if (totalRatings >= 25) return 1.0;
    return 0.8;
  }

  /**
   * Calculate price level factor
   */
  getPriceLevelFactor(priceLevel) {
    // Lower price = higher volume typically
    switch (priceLevel) {
      case 0: return 1.3; // Free/Very cheap
      case 1: return 1.4; // Inexpensive (fast food)
      case 2: return 1.0; // Moderate
      case 3: return 0.8; // Expensive
      case 4: return 0.6; // Very expensive
      default: return 1.0;
    }
  }

  /**
   * Calculate restaurant type factor
   */
  getRestaurantTypeFactor(types) {
    if (!types || types.length === 0) return 1.0;

    // High-traffic restaurant types
    const highTrafficTypes = [
      'fast_food_restaurant',
      'coffee_shop',
      'cafe',
      'pizza_restaurant',
      'sandwich_shop'
    ];

    // Medium-traffic restaurant types
    const mediumTrafficTypes = [
      'american_restaurant',
      'mexican_restaurant',
      'chinese_restaurant',
      'italian_restaurant'
    ];

    // Check for high traffic types
    if (types.some(t => highTrafficTypes.includes(t))) {
      return 1.3;
    }

    // Check for medium traffic types
    if (types.some(t => mediumTrafficTypes.includes(t))) {
      return 1.1;
    }

    // Fine dining or specialty (lower volume, higher value)
    if (types.includes('fine_dining_restaurant') || types.includes('steak_house')) {
      return 0.7;
    }

    return 1.0;
  }

  /**
   * Calculate confidence level based on data availability
   */
  calculateConfidence(totalRatings) {
    if (totalRatings >= 100) return 'high';
    if (totalRatings >= 50) return 'medium';
    if (totalRatings >= 25) return 'low';
    return 'very_low';
  }

  /**
   * Calculate traffic trend from historical snapshots
   */
  calculateTrafficTrend(currentVisitors, previousVisitors) {
    if (!previousVisitors) {
      return {
        change: 0,
        changePercent: 0,
        trend: 'new'
      };
    }

    const change = currentVisitors - previousVisitors;
    const changePercent = (change / previousVisitors) * 100;

    return {
      change,
      changePercent: Math.round(changePercent * 10) / 10,
      trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'
    };
  }

  /**
   * Calculate SEO impact on traffic
   * Based on industry research: 10-point SEO improvement = ~8-12% traffic increase
   */
  calculateSEOImpact(currentScore, previousScore, currentTraffic) {
    if (!previousScore) return { impact: 0, percentage: 0 };

    const scoreDifference = currentScore - previousScore;
    const impactPercentage = scoreDifference * 1.0; // 1% per point
    const estimatedImpact = Math.round(currentTraffic * (impactPercentage / 100));

    return {
      impact: estimatedImpact,
      percentage: Math.round(impactPercentage * 10) / 10,
      scoreChange: scoreDifference
    };
  }

  /**
   * Calculate correlation coefficient between SEO score and traffic
   */
  calculateCorrelation(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return {
        coefficient: 0,
        strength: 'insufficient_data'
      };
    }

    const scores = historicalData.map(d => d.overallScore);
    const visitors = historicalData.map(d => d.estimatedMonthlyVisitors);

    const coefficient = this.pearsonCorrelation(scores, visitors);

    return {
      coefficient: Math.round(coefficient * 100) / 100,
      strength: this.getCorrelationStrength(coefficient)
    };
  }

  /**
   * Pearson correlation coefficient calculation
   */
  pearsonCorrelation(x, y) {
    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get correlation strength label
   */
  getCorrelationStrength(coefficient) {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return 'very_strong';
    if (abs >= 0.6) return 'strong';
    if (abs >= 0.4) return 'moderate';
    if (abs >= 0.2) return 'weak';
    return 'very_weak';
  }
}

module.exports = TrafficEstimator;
