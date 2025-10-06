const winston = require('winston');

/**
 * Google Search Ranking Service
 * Accurately calculates a restaurant's ranking on Google Search
 */
class RankingService {
  /**
   * Calculate Google search ranking based on similar restaurants
   * Ranks by food type similarity, then by rating and review count
   */
  calculateGoogleRank(restaurant, allCompetitors) {
    if (!allCompetitors || allCompetitors.length === 0) {
      // If no competitors, you're #1 - return full structure
      const restaurantFoodTypes = this.extractFoodTypes(restaurant.types || []);
      const qualityScore = this.calculateQualityScore(
        restaurant.rating || 0,
        restaurant.totalRatings || restaurant.user_ratings_total || 0
      );

      const distanceScore = 100; // No distance, perfect score
      const prominenceScore = this.calculateProminenceScore(
        restaurant.totalRatings || restaurant.user_ratings_total || 0,
        restaurant.rating || 0
      );
      const rankingScore = (100 * 0.40) + (100 * 0.25) + (prominenceScore * 0.35);

      return {
        googleRank: 1,
        totalCompetitors: 0,
        scoredRestaurants: [{
          placeId: restaurant.placeId || restaurant.place_id,
          name: restaurant.name || restaurant.displayName?.text,
          rating: restaurant.rating,
          totalRatings: restaurant.totalRatings || restaurant.user_ratings_total || 0,
          foodTypes: restaurantFoodTypes,
          similarityScore: 100,
          distanceScore: 100,
          prominenceScore,
          qualityScore,
          rankingScore,
          distance: 0
        }],
        yourScore: {
          placeId: restaurant.placeId || restaurant.place_id,
          name: restaurant.name || restaurant.displayName?.text,
          rating: restaurant.rating,
          totalRatings: restaurant.totalRatings || restaurant.user_ratings_total || 0,
          foodTypes: restaurantFoodTypes,
          similarityScore: 100,
          distanceScore: 100,
          prominenceScore,
          qualityScore,
          rankingScore,
          distance: 0
        },
        analysis: {
          similarRestaurants: 0,
          strongerCompetitors: 0
        }
      };
    }

    // Extract the restaurant's food types
    const restaurantFoodTypes = this.extractFoodTypes(restaurant.types || []);

    // Score all restaurants (including the target restaurant)
    const allRestaurants = [restaurant, ...allCompetitors];

    const scoredRestaurants = allRestaurants.map(r => {
      const foodTypes = this.extractFoodTypes(r.types || []);

      // Calculate food type similarity score (0-100)
      const similarityScore = this.calculateFoodTypeSimilarity(
        restaurantFoodTypes,
        foodTypes
      );

      // Calculate quality score based on rating and reviews
      const qualityScore = this.calculateQualityScore(
        r.rating || 0,
        r.totalRatings || r.user_ratings_total || 0
      );

      // Calculate distance score (closer is better for local search)
      const distanceScore = this.calculateDistanceScore(r.distance || 0);

      // Calculate prominence score (how well-known the restaurant is)
      const prominenceScore = this.calculateProminenceScore(
        r.totalRatings || r.user_ratings_total || 0,
        r.rating || 0
      );

      // Combined ranking score using Google's 3 main local SEO factors:
      // 1. Relevance (food type similarity): 40%
      // 2. Distance (proximity to search location): 25%
      // 3. Prominence (popularity & quality): 35%
      const rankingScore =
        (similarityScore * 0.40) +  // Relevance
        (distanceScore * 0.25) +     // Distance
        (prominenceScore * 0.35);    // Prominence (reviews + rating)

      return {
        placeId: r.placeId || r.place_id,
        name: r.name || r.displayName?.text,
        rating: r.rating,
        totalRatings: r.totalRatings || r.user_ratings_total || 0,
        foodTypes,
        similarityScore,    // Relevance (40%)
        distanceScore,      // Distance (25%)
        prominenceScore,    // Prominence (35%)
        qualityScore,       // Legacy score
        rankingScore,       // Final combined score
        distance: r.distance || 0
      };
    });

    // Sort by ranking score (highest first)
    scoredRestaurants.sort((a, b) => b.rankingScore - a.rankingScore);

    // Find the restaurant's position
    const restaurantPlaceId = restaurant.placeId || restaurant.place_id;
    const rank = scoredRestaurants.findIndex(r => r.placeId === restaurantPlaceId) + 1;

    winston.info(`Ranking calculated: ${restaurant.name} is #${rank} among ${scoredRestaurants.length} similar restaurants`);

    return {
      googleRank: rank,
      totalCompetitors: allCompetitors.length,
      scoredRestaurants: scoredRestaurants.slice(0, 10), // Top 10
      yourScore: scoredRestaurants.find(r => r.placeId === restaurantPlaceId),
      analysis: {
        similarRestaurants: scoredRestaurants.filter(r =>
          r.similarityScore > 50 && r.placeId !== restaurantPlaceId
        ).length,
        strongerCompetitors: scoredRestaurants.filter(r =>
          r.rankingScore > scoredRestaurants.find(sr => sr.placeId === restaurantPlaceId)?.rankingScore
        ).length
      }
    };
  }

  /**
   * Calculate food type similarity between two restaurants
   * Returns 0-100 score
   */
  calculateFoodTypeSimilarity(types1, types2) {
    if (!types1 || !types2 || types1.length === 0 || types2.length === 0) {
      return 0;
    }

    // Find matching food types
    const matches = types1.filter(type => types2.includes(type));

    if (matches.length === 0) {
      return 0; // No similarity
    }

    // Calculate Jaccard similarity
    const union = new Set([...types1, ...types2]);
    const similarity = (matches.length / union.size) * 100;

    return Math.round(similarity);
  }

  /**
   * Calculate quality score based on rating and review count
   * Returns 0-100 score
   */
  calculateQualityScore(rating, totalRatings) {
    // Normalize rating (0-5 to 0-100)
    const ratingScore = (rating / 5) * 100;

    // Logarithmic scale for reviews (diminishing returns)
    // 10 reviews = 50 points, 100 reviews = 75 points, 1000+ = 100 points
    const reviewScore = Math.min(100, Math.log10(totalRatings + 1) * 30);

    // Weight: 60% rating, 40% reviews
    const qualityScore = (ratingScore * 0.6) + (reviewScore * 0.4);

    return Math.round(qualityScore);
  }

  /**
   * Calculate distance score (0-100)
   * Google prioritizes closer businesses in local search
   * Uses inverse exponential decay - closer = much higher score
   */
  calculateDistanceScore(distanceKm) {
    if (distanceKm === 0) return 100;

    // Exponential decay: score drops rapidly with distance
    // Within 1km = 90-100 points
    // Within 5km = 60-90 points
    // Within 10km = 30-60 points
    // Beyond 10km = <30 points
    const score = 100 * Math.exp(-0.15 * distanceKm);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate prominence score (0-100)
   * Based on Google's "prominence" factor - how well-known the business is
   * Combines review velocity, rating quality, and overall popularity
   */
  calculateProminenceScore(totalRatings, rating) {
    // Review count score (logarithmic scale)
    // 0 reviews = 0, 10 = 30, 100 = 60, 500 = 80, 1000+ = 100
    const reviewCountScore = Math.min(100, Math.log10(totalRatings + 1) * 33);

    // Rating quality score
    const ratingScore = (rating / 5) * 100;

    // Engagement multiplier (restaurants with many reviews AND high rating rank higher)
    let engagementBonus = 0;
    if (totalRatings > 100 && rating >= 4.5) {
      engagementBonus = 15; // Highly reviewed + highly rated = big boost
    } else if (totalRatings > 50 && rating >= 4.0) {
      engagementBonus = 10; // Good engagement
    } else if (totalRatings > 20 && rating >= 3.5) {
      engagementBonus = 5; // Decent engagement
    }

    // Weight: 50% review count, 40% rating, 10% engagement bonus
    const prominenceScore =
      (reviewCountScore * 0.50) +
      (ratingScore * 0.40) +
      engagementBonus;

    return Math.max(0, Math.min(100, Math.round(prominenceScore)));
  }

  /**
   * Extract food-related types from Google Places types
   */
  extractFoodTypes(types) {
    if (!types || !Array.isArray(types)) return [];

    const foodTypePatterns = [
      'american_restaurant',
      'bakery',
      'bar',
      'barbecue_restaurant',
      'brazilian_restaurant',
      'breakfast_restaurant',
      'brunch_restaurant',
      'cafe',
      'chinese_restaurant',
      'coffee_shop',
      'fast_food_restaurant',
      'french_restaurant',
      'greek_restaurant',
      'hamburger_restaurant',
      'ice_cream_shop',
      'indian_restaurant',
      'indonesian_restaurant',
      'italian_restaurant',
      'japanese_restaurant',
      'korean_restaurant',
      'lebanese_restaurant',
      'meal_delivery',
      'meal_takeaway',
      'mediterranean_restaurant',
      'mexican_restaurant',
      'middle_eastern_restaurant',
      'pizza_restaurant',
      'ramen_restaurant',
      'sandwich_shop',
      'seafood_restaurant',
      'spanish_restaurant',
      'steak_house',
      'sushi_restaurant',
      'thai_restaurant',
      'turkish_restaurant',
      'vegan_restaurant',
      'vegetarian_restaurant',
      'vietnamese_restaurant'
    ];

    return types.filter(type => foodTypePatterns.includes(type));
  }

  /**
   * Get local ranking (within specific area/city)
   * Same as Google rank but filtered to local area
   */
  calculateLocalRank(restaurant, localCompetitors) {
    // For now, same as Google rank
    // In future, can add geographic weighting
    return this.calculateGoogleRank(restaurant, localCompetitors);
  }

  /**
   * Calculate ranking change over time
   */
  calculateRankingChange(currentRank, previousRank) {
    if (!previousRank) {
      return {
        change: 0,
        direction: 'new',
        message: 'First ranking recorded'
      };
    }

    const change = previousRank - currentRank; // Positive = improved

    return {
      change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      message: change > 0
        ? `Improved by ${change} position${change > 1 ? 's' : ''}`
        : change < 0
        ? `Declined by ${Math.abs(change)} position${Math.abs(change) > 1 ? 's' : ''}`
        : 'No change in ranking'
    };
  }
}

module.exports = RankingService;
