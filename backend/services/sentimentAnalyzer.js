const winston = require('winston');

/**
 * Review Sentiment Analysis Service
 * Analyzes customer reviews to extract insights, sentiment, and common themes
 */
class SentimentAnalyzer {
  /**
   * Analyze all reviews for sentiment and extract insights
   */
  analyzeReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return this.getEmptyAnalysis();
    }

    const analysis = {
      totalReviews: reviews.length,
      sentimentBreakdown: this.calculateSentimentBreakdown(reviews),
      commonThemes: this.extractCommonThemes(reviews),
      topComplaints: this.extractTopComplaints(reviews),
      topPraise: this.extractTopPraise(reviews),
      trendAnalysis: this.analyzeTrends(reviews),
      actionableInsights: []
    };

    // Generate actionable insights
    analysis.actionableInsights = this.generateInsights(analysis);

    winston.info(`Analyzed ${reviews.length} reviews, found ${analysis.commonThemes.length} themes`);

    return analysis;
  }

  /**
   * Calculate sentiment breakdown by rating
   */
  calculateSentimentBreakdown(reviews) {
    const breakdown = {
      positive: 0,  // 4-5 stars
      neutral: 0,   // 3 stars
      negative: 0   // 1-2 stars
    };

    reviews.forEach(review => {
      const rating = review.rating || 0;
      if (rating >= 4) breakdown.positive++;
      else if (rating === 3) breakdown.neutral++;
      else breakdown.negative++;
    });

    const total = reviews.length;

    return {
      positive: {
        count: breakdown.positive,
        percentage: Math.round((breakdown.positive / total) * 100)
      },
      neutral: {
        count: breakdown.neutral,
        percentage: Math.round((breakdown.neutral / total) * 100)
      },
      negative: {
        count: breakdown.negative,
        percentage: Math.round((breakdown.negative / total) * 100)
      },
      overallSentiment: this.determineOverallSentiment(breakdown, total)
    };
  }

  /**
   * Extract common themes from reviews using keyword analysis
   */
  extractCommonThemes(reviews) {
    const themes = {
      // Food quality keywords
      food: ['food', 'dish', 'meal', 'taste', 'flavor', 'delicious', 'fresh', 'quality'],

      // Service keywords
      service: ['service', 'waiter', 'waitress', 'staff', 'server', 'friendly', 'attentive', 'rude', 'slow'],

      // Ambiance keywords
      ambiance: ['ambiance', 'atmosphere', 'decor', 'music', 'noise', 'cozy', 'romantic', 'loud'],

      // Value keywords
      value: ['price', 'expensive', 'cheap', 'value', 'worth', 'overpriced', 'affordable'],

      // Cleanliness keywords
      cleanliness: ['clean', 'dirty', 'hygiene', 'sanitary', 'spotless', 'messy'],

      // Wait time keywords
      waitTime: ['wait', 'waiting', 'slow', 'quick', 'fast', 'long wait', 'prompt']
    };

    const themeCounts = {};
    const themeReviews = {};

    Object.keys(themes).forEach(theme => {
      themeCounts[theme] = 0;
      themeReviews[theme] = { positive: 0, negative: 0 };
    });

    reviews.forEach(review => {
      const text = (review.text || review.originalText?.text || '').toLowerCase();
      const rating = review.rating || 0;
      const isPositive = rating >= 4;

      Object.entries(themes).forEach(([theme, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          themeCounts[theme]++;
          if (isPositive) {
            themeReviews[theme].positive++;
          } else {
            themeReviews[theme].negative++;
          }
        }
      });
    });

    // Convert to array and sort by frequency
    const themeArray = Object.entries(themeCounts)
      .map(([theme, count]) => ({
        theme: this.formatThemeName(theme),
        mentionCount: count,
        positiveCount: themeReviews[theme].positive,
        negativeCount: themeReviews[theme].negative,
        sentiment: themeReviews[theme].positive >= themeReviews[theme].negative ? 'positive' : 'negative',
        percentage: Math.round((count / reviews.length) * 100)
      }))
      .filter(t => t.mentionCount > 0)
      .sort((a, b) => b.mentionCount - a.mentionCount);

    return themeArray;
  }

  /**
   * Extract top complaints from negative reviews
   */
  extractTopComplaints(reviews) {
    const negativeReviews = reviews.filter(r => r.rating <= 2);

    if (negativeReviews.length === 0) {
      return [];
    }

    const complaints = {
      'Slow service': ['slow', 'wait', 'waiting', 'long time', 'forever'],
      'Poor food quality': ['bad', 'terrible', 'awful', 'disgusting', 'cold', 'undercooked', 'overcooked'],
      'Rude staff': ['rude', 'disrespectful', 'mean', 'unprofessional', 'attitude'],
      'Overpriced': ['expensive', 'overpriced', 'too much', 'rip off', 'not worth'],
      'Dirty/unclean': ['dirty', 'filthy', 'gross', 'unclean', 'messy'],
      'Wrong order': ['wrong', 'mistake', 'incorrect', 'missing', 'forgot'],
      'Noisy/loud': ['loud', 'noisy', 'too loud', 'can\'t hear']
    };

    const complaintCounts = {};

    Object.entries(complaints).forEach(([complaint, keywords]) => {
      complaintCounts[complaint] = 0;
      negativeReviews.forEach(review => {
        const text = (review.text || review.originalText?.text || '').toLowerCase();
        if (keywords.some(keyword => text.includes(keyword))) {
          complaintCounts[complaint]++;
        }
      });
    });

    return Object.entries(complaintCounts)
      .map(([complaint, count]) => ({
        complaint,
        count,
        percentage: Math.round((count / negativeReviews.length) * 100)
      }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Extract top praise from positive reviews
   */
  extractTopPraise(reviews) {
    const positiveReviews = reviews.filter(r => r.rating >= 4);

    if (positiveReviews.length === 0) {
      return [];
    }

    const praise = {
      'Excellent food': ['delicious', 'amazing', 'excellent', 'best', 'incredible', 'fantastic'],
      'Great service': ['friendly', 'attentive', 'helpful', 'professional', 'excellent service'],
      'Good value': ['affordable', 'reasonable', 'good value', 'worth it'],
      'Nice atmosphere': ['cozy', 'beautiful', 'nice ambiance', 'lovely', 'romantic'],
      'Fast service': ['quick', 'fast', 'prompt', 'efficient'],
      'Fresh ingredients': ['fresh', 'quality', 'authentic', 'homemade']
    };

    const praiseCounts = {};

    Object.entries(praise).forEach(([item, keywords]) => {
      praiseCounts[item] = 0;
      positiveReviews.forEach(review => {
        const text = (review.text || review.originalText?.text || '').toLowerCase();
        if (keywords.some(keyword => text.includes(keyword))) {
          praiseCounts[item]++;
        }
      });
    });

    return Object.entries(praiseCounts)
      .map(([item, count]) => ({
        praise: item,
        count,
        percentage: Math.round((count / positiveReviews.length) * 100)
      }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Analyze trends in reviews over time
   */
  analyzeTrends(reviews) {
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => {
      const dateA = new Date(a.publishTime || a.time);
      const dateB = new Date(b.publishTime || b.time);
      return dateB - dateA;
    });

    const recent = sortedReviews.slice(0, Math.min(5, sortedReviews.length));
    const older = sortedReviews.slice(5);

    if (recent.length === 0) {
      return {
        trend: 'insufficient_data',
        message: 'Not enough reviews to analyze trends'
      };
    }

    const recentAvg = recent.reduce((sum, r) => sum + (r.rating || 0), 0) / recent.length;
    const olderAvg = older.length > 0
      ? older.reduce((sum, r) => sum + (r.rating || 0), 0) / older.length
      : recentAvg;

    const diff = recentAvg - olderAvg;

    let trend, message;
    if (diff > 0.3) {
      trend = 'improving';
      message = 'Recent reviews are more positive - keep it up!';
    } else if (diff < -0.3) {
      trend = 'declining';
      message = 'Recent reviews are worse - address issues quickly!';
    } else {
      trend = 'stable';
      message = 'Review sentiment is consistent over time';
    }

    return {
      trend,
      message,
      recentAverage: Number(recentAvg.toFixed(2)),
      previousAverage: Number(olderAvg.toFixed(2)),
      change: Number(diff.toFixed(2))
    };
  }

  /**
   * Generate actionable insights from analysis
   */
  generateInsights(analysis) {
    const insights = [];

    // High negative sentiment
    if (analysis.sentimentBreakdown.negative.percentage > 30) {
      insights.push({
        type: 'warning',
        title: 'High Negative Sentiment',
        message: `${analysis.sentimentBreakdown.negative.percentage}% of reviews are negative. Focus on improving service quality.`,
        action: 'Review top complaints and create action plan to address them'
      });
    }

    // Low response rate on negative reviews
    if (analysis.sentimentBreakdown.negative.count > 0) {
      insights.push({
        type: 'action',
        title: 'Respond to Negative Reviews',
        message: 'Responding to negative reviews can improve your rating by 0.12 stars',
        action: 'Respond professionally to all negative reviews within 24 hours'
      });
    }

    // Trending downward
    if (analysis.trendAnalysis.trend === 'declining') {
      insights.push({
        type: 'critical',
        title: 'Declining Review Trend',
        message: analysis.trendAnalysis.message,
        action: 'Investigate recent operational changes and address quality issues immediately'
      });
    }

    // Positive trend
    if (analysis.trendAnalysis.trend === 'improving') {
      insights.push({
        type: 'success',
        title: 'Improving Reviews',
        message: analysis.trendAnalysis.message,
        action: 'Continue current practices and ask happy customers for reviews'
      });
    }

    // Top complaint action
    if (analysis.topComplaints.length > 0) {
      const topComplaint = analysis.topComplaints[0];
      insights.push({
        type: 'action',
        title: `Most Common Complaint: ${topComplaint.complaint}`,
        message: `${topComplaint.count} customers mentioned this issue`,
        action: `Create specific action plan to address "${topComplaint.complaint}"`
      });
    }

    // Leverage top praise
    if (analysis.topPraise.length > 0) {
      const topPraise = analysis.topPraise[0];
      insights.push({
        type: 'opportunity',
        title: `Strength: ${topPraise.praise}`,
        message: `${topPraise.count} customers love this aspect`,
        action: `Highlight "${topPraise.praise}" in marketing and social media`
      });
    }

    return insights;
  }

  /**
   * Helper methods
   */
  determineOverallSentiment(breakdown, total) {
    const positivePercent = (breakdown.positive / total) * 100;
    const negativePercent = (breakdown.negative / total) * 100;

    if (positivePercent >= 70) return 'Very Positive';
    if (positivePercent >= 50) return 'Positive';
    if (negativePercent >= 40) return 'Negative';
    return 'Mixed';
  }

  formatThemeName(theme) {
    const names = {
      food: 'Food Quality',
      service: 'Service',
      ambiance: 'Ambiance',
      value: 'Value/Pricing',
      cleanliness: 'Cleanliness',
      waitTime: 'Wait Times'
    };
    return names[theme] || theme;
  }

  getEmptyAnalysis() {
    return {
      totalReviews: 0,
      sentimentBreakdown: {
        positive: { count: 0, percentage: 0 },
        neutral: { count: 0, percentage: 0 },
        negative: { count: 0, percentage: 0 },
        overallSentiment: 'No reviews'
      },
      commonThemes: [],
      topComplaints: [],
      topPraise: [],
      trendAnalysis: {
        trend: 'insufficient_data',
        message: 'No reviews to analyze'
      },
      actionableInsights: [{
        type: 'info',
        title: 'Get More Reviews',
        message: 'No reviews found to analyze',
        action: 'Ask customers to leave reviews to build your reputation'
      }]
    };
  }
}

module.exports = SentimentAnalyzer;
