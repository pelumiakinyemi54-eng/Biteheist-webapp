const winston = require('winston');

/**
 * Review Response Time Analyzer
 * Analyzes restaurant owner responses to customer reviews
 */
class ReviewAnalyzer {
  /**
   * Analyze review response metrics
   * @param {Array} reviews - Array of reviews from Google Places
   * @returns {Object} Response time metrics and score
   */
  analyzeResponseTime(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        score: 0,
        avgResponseTime: 0,
        responseRate: 0,
        totalReviews: 0,
        respondedReviews: 0,
        hasData: false,
        message: 'No reviews available to analyze'
      };
    }

    let totalResponseTime = 0;
    let respondedCount = 0;
    let responseTimesInHours = [];

    // Analyze each review for owner responses
    reviews.forEach(review => {
      // Check if review has owner response (from Google Places API)
      if (review.ownerResponse || review.authorAttribution?.uri?.includes('owner')) {
        respondedCount++;

        // Calculate response time if timestamps available
        if (review.publishTime && review.ownerResponse?.publishTime) {
          const reviewTime = new Date(review.publishTime);
          const responseTime = new Date(review.ownerResponse.publishTime);
          const diffInHours = (responseTime - reviewTime) / (1000 * 60 * 60);

          if (diffInHours >= 0 && diffInHours < 8760) { // Sanity check: less than 1 year
            responseTimesInHours.push(diffInHours);
            totalResponseTime += diffInHours;
          }
        }
      }
    });

    const responseRate = respondedCount / reviews.length;
    const avgResponseTime = responseTimesInHours.length > 0
      ? totalResponseTime / responseTimesInHours.length
      : 0;

    // Calculate score based on response rate and speed
    let score = 100;

    // Response rate impact (up to -50 points)
    if (responseRate === 0) {
      score -= 50;
    } else if (responseRate < 0.3) {
      score -= 40;
    } else if (responseRate < 0.5) {
      score -= 30;
    } else if (responseRate < 0.7) {
      score -= 20;
    } else if (responseRate < 0.9) {
      score -= 10;
    }

    // Response time impact (up to -50 points)
    if (avgResponseTime > 0) {
      if (avgResponseTime > 168) { // 1 week
        score -= 40;
      } else if (avgResponseTime > 72) { // 3 days
        score -= 30;
      } else if (avgResponseTime > 48) { // 2 days
        score -= 20;
      } else if (avgResponseTime > 24) { // 1 day
        score -= 10;
      } else if (avgResponseTime > 12) { // 12 hours
        score -= 5;
      }
    }

    const result = {
      score: Math.max(0, Math.round(score)),
      avgResponseTime: Math.round(avgResponseTime),
      responseRate: Math.round(responseRate * 100) / 100,
      totalReviews: reviews.length,
      respondedReviews: respondedCount,
      hasData: true,
      breakdown: {
        fastResponses: responseTimesInHours.filter(t => t <= 24).length,
        mediumResponses: responseTimesInHours.filter(t => t > 24 && t <= 72).length,
        slowResponses: responseTimesInHours.filter(t => t > 72).length
      }
    };

    // Add helpful message
    if (responseRate === 0) {
      result.message = 'No responses to customer reviews detected';
    } else if (responseRate < 0.5) {
      result.message = `Only ${Math.round(responseRate * 100)}% of reviews have responses`;
    } else if (avgResponseTime > 72) {
      result.message = `Average response time of ${Math.round(avgResponseTime)}h is too slow`;
    } else if (responseRate >= 0.9 && avgResponseTime <= 24) {
      result.message = 'Excellent response rate and speed!';
    } else {
      result.message = 'Good customer engagement';
    }

    winston.info(`Review analysis: ${result.totalReviews} reviews, ${result.respondedReviews} responses (${Math.round(responseRate * 100)}%), avg ${result.avgResponseTime}h`);

    return result;
  }

  /**
   * Analyze review sentiment and patterns
   */
  analyzeReviewSentiment(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        positive: 0,
        neutral: 0,
        negative: 0,
        averageRating: 0
      };
    }

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let totalRating = 0;

    reviews.forEach(review => {
      const rating = review.rating || 0;
      totalRating += rating;

      if (rating >= 4) {
        positive++;
      } else if (rating >= 3) {
        neutral++;
      } else {
        negative++;
      }
    });

    return {
      positive,
      neutral,
      negative,
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      positivePercentage: Math.round((positive / reviews.length) * 100),
      negativePercentage: Math.round((negative / reviews.length) * 100)
    };
  }

  /**
   * Identify reviews that need immediate attention
   */
  identifyUrgentReviews(reviews) {
    if (!reviews || reviews.length === 0) {
      return [];
    }

    const urgentReviews = [];
    const now = new Date();

    reviews.forEach(review => {
      // Urgent if: low rating AND no response AND recent
      const isLowRating = review.rating <= 2;
      const hasNoResponse = !review.ownerResponse;

      let isRecent = false;
      if (review.publishTime) {
        const reviewDate = new Date(review.publishTime);
        const daysSinceReview = (now - reviewDate) / (1000 * 60 * 60 * 24);
        isRecent = daysSinceReview <= 7; // Within last week
      }

      if (isLowRating && hasNoResponse && isRecent) {
        urgentReviews.push({
          author: review.authorAttribution?.displayName || review.author || 'Anonymous',
          rating: review.rating,
          text: review.text?.text || review.text || '',
          publishTime: review.publishTime,
          relativeTime: review.relativePublishTimeDescription || review.relativeTime || ''
        });
      }
    });

    return urgentReviews;
  }
}

module.exports = ReviewAnalyzer;
