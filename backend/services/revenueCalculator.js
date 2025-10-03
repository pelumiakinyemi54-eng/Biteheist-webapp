/**
 * Revenue Impact Calculator for Restaurant SEO Audit
 * Calculates monetary losses based on various performance metrics
 */

class RevenueCalculator {
  constructor(params = {}) {
    // Default parameters - can be overridden
    this.defaultAOV = params.averageOrderValue || parseFloat(process.env.DEFAULT_AOV) || 28;
    this.defaultConversionRate = params.conversionRate || parseFloat(process.env.DEFAULT_CONVERSION_RATE) || 0.03;
    this.defaultMonthlyVisitors = params.monthlyVisitors || parseInt(process.env.DEFAULT_MONTHLY_VISITORS) || 1000;

    // Industry benchmarks
    this.benchmarks = {
      idealRating: 4.5,
      idealLoadTime: 2.0, // seconds
      idealResponseTime: 24, // hours
      idealSeoScore: 85,
      maxAcceptableLoadTime: 3.0
    };
  }

  /**
   * Calculate SEO Revenue Loss
   * Formula: (Traffic Loss % based on score) × (Monthly Visitors) × (Conversion Rate) × (AOV)
   */
  calculateSeoRevenueLoss(seoScore, monthlyVisitors = this.defaultMonthlyVisitors) {
    // Convert score to traffic loss percentage
    // Poor SEO (0-40): 60-80% traffic loss
    // Average SEO (41-70): 30-60% traffic loss
    // Good SEO (71-85): 10-30% traffic loss
    // Excellent SEO (86-100): 0-10% traffic loss

    let trafficLossPercent;
    if (seoScore <= 40) {
      trafficLossPercent = 0.6 + (40 - seoScore) * 0.005; // 60-80%
    } else if (seoScore <= 70) {
      trafficLossPercent = 0.3 + (70 - seoScore) * 0.01; // 30-60%
    } else if (seoScore <= 85) {
      trafficLossPercent = 0.1 + (85 - seoScore) * 0.0133; // 10-30%
    } else {
      trafficLossPercent = Math.max(0, (100 - seoScore) * 0.01); // 0-10%
    }

    const lostVisitors = monthlyVisitors * trafficLossPercent;
    const monthlyLoss = lostVisitors * this.defaultConversionRate * this.defaultAOV;

    return {
      monthlyLoss: Math.round(monthlyLoss),
      annualLoss: Math.round(monthlyLoss * 12),
      trafficLossPercent: Math.round(trafficLossPercent * 100),
      lostVisitors: Math.round(lostVisitors),
      lostOrders: Math.round(lostVisitors * this.defaultConversionRate)
    };
  }

  /**
   * Calculate Page Speed Revenue Loss
   * Formula: (Load Time Penalty) × (Bounce Rate Impact) × (Monthly Visitors) × (Conversion Rate) × (AOV)
   */
  calculatePageSpeedRevenueLoss(loadTime, monthlyVisitors = this.defaultMonthlyVisitors) {
    // Bounce rate increases dramatically with load time
    // 1s = 7% bounce rate increase
    // 3s = 32% bounce rate increase
    // 5s = 90% bounce rate increase

    let bounceRateIncrease;
    if (loadTime <= 1) {
      bounceRateIncrease = 0;
    } else if (loadTime <= 3) {
      bounceRateIncrease = 0.07 + (loadTime - 1) * 0.125; // 7-32%
    } else if (loadTime <= 5) {
      bounceRateIncrease = 0.32 + (loadTime - 3) * 0.29; // 32-90%
    } else {
      bounceRateIncrease = Math.min(0.95, 0.9 + (loadTime - 5) * 0.01); // 90-95%
    }

    const lostVisitors = monthlyVisitors * bounceRateIncrease;
    const monthlyLoss = lostVisitors * this.defaultConversionRate * this.defaultAOV;

    return {
      monthlyLoss: Math.round(monthlyLoss),
      annualLoss: Math.round(monthlyLoss * 12),
      bounceRateIncrease: Math.round(bounceRateIncrease * 100),
      lostVisitors: Math.round(lostVisitors),
      lostOrders: Math.round(lostVisitors * this.defaultConversionRate),
      loadTime: loadTime
    };
  }

  /**
   * Calculate Review Revenue Loss
   * Formula: (Rating Gap from 4.5★) × (Visibility Loss %) × (Search Volume) × (Conversion Rate) × (AOV)
   */
  calculateReviewRevenueLoss(currentRating, totalReviews, monthlyVisitors = this.defaultMonthlyVisitors) {
    const ratingGap = Math.max(0, this.benchmarks.idealRating - currentRating);

    // Each 0.1 star below 4.5 reduces visibility by ~5%
    // Low review count also impacts visibility
    const ratingVisibilityLoss = ratingGap * 0.5; // 50% per full star

    // Review count impact (fewer than 50 reviews hurts visibility)
    let reviewCountPenalty = 0;
    if (totalReviews < 10) {
      reviewCountPenalty = 0.3; // 30% penalty
    } else if (totalReviews < 25) {
      reviewCountPenalty = 0.2; // 20% penalty
    } else if (totalReviews < 50) {
      reviewCountPenalty = 0.1; // 10% penalty
    }

    const totalVisibilityLoss = Math.min(0.8, ratingVisibilityLoss + reviewCountPenalty);
    const lostVisitors = monthlyVisitors * totalVisibilityLoss;
    const monthlyLoss = lostVisitors * this.defaultConversionRate * this.defaultAOV;

    return {
      monthlyLoss: Math.round(monthlyLoss),
      annualLoss: Math.round(monthlyLoss * 12),
      ratingGap: Math.round(ratingGap * 10) / 10,
      visibilityLoss: Math.round(totalVisibilityLoss * 100),
      lostVisitors: Math.round(lostVisitors),
      lostOrders: Math.round(lostVisitors * this.defaultConversionRate),
      currentRating: currentRating,
      totalReviews: totalReviews
    };
  }

  /**
   * Calculate Response Time Revenue Loss
   * Formula: (Poor Response Rate %) × (Engagement Impact) × (Monthly Visitors) × (Conversion Rate) × (AOV)
   */
  calculateResponseTimeRevenueLoss(avgResponseTime, responseRate, monthlyVisitors = this.defaultMonthlyVisitors) {
    // Response time impact on customer engagement
    // Ideal: <24 hours, Good: <48 hours, Poor: >72 hours

    let engagementLoss = 0;

    // Response time penalty
    if (avgResponseTime > 72) {
      engagementLoss += 0.4; // 40% loss for very slow response
    } else if (avgResponseTime > 48) {
      engagementLoss += 0.25; // 25% loss for slow response
    } else if (avgResponseTime > 24) {
      engagementLoss += 0.1; // 10% loss for acceptable response
    }

    // Response rate penalty (if less than 80% response rate)
    if (responseRate < 0.5) {
      engagementLoss += 0.3; // 30% additional loss
    } else if (responseRate < 0.8) {
      engagementLoss += 0.15; // 15% additional loss
    }

    engagementLoss = Math.min(0.7, engagementLoss); // Cap at 70%

    const lostVisitors = monthlyVisitors * engagementLoss;
    const monthlyLoss = lostVisitors * this.defaultConversionRate * this.defaultAOV;

    return {
      monthlyLoss: Math.round(monthlyLoss),
      annualLoss: Math.round(monthlyLoss * 12),
      engagementLoss: Math.round(engagementLoss * 100),
      lostVisitors: Math.round(lostVisitors),
      lostOrders: Math.round(lostVisitors * this.defaultConversionRate),
      avgResponseTime: avgResponseTime,
      responseRate: Math.round(responseRate * 100)
    };
  }

  /**
   * Calculate total revenue impact across all metrics
   */
  calculateTotalRevenueLoss(metrics) {
    const {
      seoScore = 50,
      loadTime = 4,
      rating = 3.8,
      totalReviews = 25,
      avgResponseTime = 48,
      responseRate = 0.6,
      monthlyVisitors = this.defaultMonthlyVisitors
    } = metrics;

    const seoLoss = this.calculateSeoRevenueLoss(seoScore, monthlyVisitors);
    const speedLoss = this.calculatePageSpeedRevenueLoss(loadTime, monthlyVisitors);
    const reviewLoss = this.calculateReviewRevenueLoss(rating, totalReviews, monthlyVisitors);
    const responseLoss = this.calculateResponseTimeRevenueLoss(avgResponseTime, responseRate, monthlyVisitors);

    const totalMonthlyLoss = seoLoss.monthlyLoss + speedLoss.monthlyLoss +
                            reviewLoss.monthlyLoss + responseLoss.monthlyLoss;
    const totalAnnualLoss = totalMonthlyLoss * 12;

    // Calculate overall score (weighted average)
    const weights = { seo: 0.3, speed: 0.2, reviews: 0.3, response: 0.2 };
    const speedScore = Math.max(0, 100 - (loadTime - 1) * 20); // Convert load time to score
    const reviewScore = (rating / 5) * 100;
    const responseScore = Math.max(0, 100 - (avgResponseTime / 24) * 20) * responseRate;

    const overallScore = Math.round(
      seoScore * weights.seo +
      speedScore * weights.speed +
      reviewScore * weights.reviews +
      responseScore * weights.response
    );

    // Determine grade
    let grade;
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      seoLoss,
      speedLoss,
      reviewLoss,
      responseLoss,
      totalMonthlyLoss: Math.round(totalMonthlyLoss),
      totalAnnualLoss: Math.round(totalAnnualLoss),
      overallScore,
      grade,
      parameters: {
        averageOrderValue: this.defaultAOV,
        conversionRate: this.defaultConversionRate,
        monthlyVisitors
      }
    };
  }

  /**
   * Generate revenue-focused messaging for each metric
   */
  generateRevenueMessages(analysis) {
    const messages = {
      seo: this.generateSeoMessage(analysis.seoLoss),
      speed: this.generateSpeedMessage(analysis.speedLoss),
      reviews: this.generateReviewMessage(analysis.reviewLoss),
      response: this.generateResponseMessage(analysis.responseLoss),
      total: this.generateTotalMessage(analysis)
    };

    return messages;
  }

  generateSeoMessage(seoLoss) {
    if (seoLoss.monthlyLoss > 2000) {
      return `Your poor SEO is costing you $${seoLoss.monthlyLoss.toLocaleString()} every month in lost orders. That's $${seoLoss.annualLoss.toLocaleString()} per year you're leaving on the table.`;
    } else if (seoLoss.monthlyLoss > 500) {
      return `Your SEO could be better - you're missing out on $${seoLoss.monthlyLoss.toLocaleString()} monthly ($${seoLoss.annualLoss.toLocaleString()} yearly) in potential revenue.`;
    } else {
      return `Your SEO is performing well, but there's still $${seoLoss.monthlyLoss.toLocaleString()} monthly in optimization opportunities.`;
    }
  }

  generateSpeedMessage(speedLoss) {
    if (speedLoss.loadTime > 4) {
      return `Your slow website loses $${speedLoss.monthlyLoss.toLocaleString()} monthly. Visitors leave before seeing your menu, costing you ${speedLoss.lostOrders} potential orders.`;
    } else if (speedLoss.loadTime > 3) {
      return `Your website speed is costing you $${speedLoss.monthlyLoss.toLocaleString()} per month. Faster loading means more customers stay and order.`;
    } else {
      return `Your website speed is good, but optimizing further could save $${speedLoss.monthlyLoss.toLocaleString()} monthly.`;
    }
  }

  generateReviewMessage(reviewLoss) {
    if (reviewLoss.currentRating < 4.0) {
      return `Your ${reviewLoss.currentRating}★ rating means $${reviewLoss.monthlyLoss.toLocaleString()} in missed sales each month. Competitors with 4.5★ get ${Math.round(reviewLoss.visibilityLoss)}% more customers.`;
    } else if (reviewLoss.totalReviews < 25) {
      return `You need more reviews! Your low review count costs $${reviewLoss.monthlyLoss.toLocaleString()} monthly in reduced visibility.`;
    } else {
      return `Your reviews are performing well, but reaching 4.5★ could add $${reviewLoss.monthlyLoss.toLocaleString()} monthly revenue.`;
    }
  }

  generateResponseMessage(responseLoss) {
    if (responseLoss.avgResponseTime > 48) {
      return `Slow customer response times cost $${responseLoss.monthlyLoss.toLocaleString()} monthly. Quick responses build trust and drive orders.`;
    } else {
      return `Your response time is good, but optimizing customer engagement could add $${responseLoss.monthlyLoss.toLocaleString()} monthly.`;
    }
  }

  generateTotalMessage(analysis) {
    const { totalMonthlyLoss, totalAnnualLoss, grade } = analysis;

    if (grade === 'F' || grade === 'D') {
      return `Critical: You're losing $${totalMonthlyLoss.toLocaleString()}/month ($${totalAnnualLoss.toLocaleString()}/year) across SEO, speed, and reviews. Immediate action needed.`;
    } else if (grade === 'C') {
      return `Warning: $${totalMonthlyLoss.toLocaleString()} monthly revenue at risk. With focused improvements, you could capture this lost business.`;
    } else if (grade === 'B') {
      return `Good performance, but $${totalMonthlyLoss.toLocaleString()} monthly optimization opportunity exists to reach peak performance.`;
    } else {
      return `Excellent! You're maximizing revenue potential with minimal losses of only $${totalMonthlyLoss.toLocaleString()} monthly.`;
    }
  }

  /**
   * Estimate monthly visitors based on restaurant data
   */
  estimateMonthlyVisitors(restaurantData) {
    const { rating = 3.5, totalReviews = 0, priceLevel = 2 } = restaurantData;

    // Base estimate on reviews (rough correlation)
    let baseVisitors;
    if (totalReviews < 10) baseVisitors = 200;
    else if (totalReviews < 50) baseVisitors = 500;
    else if (totalReviews < 100) baseVisitors = 1000;
    else if (totalReviews < 500) baseVisitors = 2000;
    else baseVisitors = 5000;

    // Adjust for rating (higher rating = more visitors)
    const ratingMultiplier = Math.max(0.5, rating / 4.5);

    // Adjust for price level (higher price = fewer visitors but higher AOV)
    const priceMultiplier = priceLevel === 1 ? 1.3 :
                           priceLevel === 2 ? 1.0 :
                           priceLevel === 3 ? 0.8 : 0.6;

    return Math.round(baseVisitors * ratingMultiplier * priceMultiplier);
  }
}

module.exports = RevenueCalculator;