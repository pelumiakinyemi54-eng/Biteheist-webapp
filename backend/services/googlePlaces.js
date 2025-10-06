const fetch = require('node-fetch');
const winston = require('winston');

/**
 * Google Places API (NEW) Service
 * Uses the latest Places API with proper error handling and rate limiting
 */
class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://places.googleapis.com/v1';
    this.timeout = parseInt(process.env.REQUEST_TIMEOUT) || 10000;

    if (!this.apiKey) {
      throw new Error('Google Places API key is required');
    }
  }

  /**
   * Search for restaurants by text query
   */
  async searchRestaurants(query, options = {}) {
    try {
      const {
        maxResults = 10,
        location = { latitude: 25.7617, longitude: -80.1918 }, // Miami default
        radius = 50000
      } = options;

      winston.info(`Searching restaurants: ${query}`);

      const url = `${this.baseUrl}/places:searchText`;

      const requestBody = {
        textQuery: query,
        includedType: 'restaurant',
        maxResultCount: maxResults,
        locationBias: {
          circle: {
            center: location,
            radius: radius
          }
        }
      };

      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.location,places.types'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.places) {
        return [];
      }

      // Transform to consistent format
      return response.places.map(place => ({
        placeId: place.id,
        name: place.displayName?.text || 'Unknown',
        address: place.formattedAddress || '',
        rating: place.rating || 0,
        totalRatings: place.userRatingCount || 0,
        priceLevel: this.convertPriceLevel(place.priceLevel),
        location: place.location ? {
          lat: place.location.latitude,
          lng: place.location.longitude
        } : null,
        photos: place.photos?.map(photo => ({
          reference: photo.name,
          width: photo.widthPx,
          height: photo.heightPx
        })) || [],
        types: place.types || []
      }));

    } catch (error) {
      winston.error(`Restaurant search failed: ${error.message}`);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  /**
   * Get detailed restaurant information
   */
  async getRestaurantDetails(placeId) {
    try {
      winston.info(`Getting restaurant details: ${placeId}`);

      const url = `${this.baseUrl}/places/${placeId}`;

      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,reviews,regularOpeningHours,photos,location,priceLevel,types,googleMapsUri'
        }
      });

      if (!response) {
        throw new Error('Restaurant not found');
      }

      // Transform to consistent format
      return {
        placeId: response.id,
        name: response.displayName?.text || 'Unknown',
        address: response.formattedAddress || '',
        phone: response.nationalPhoneNumber || '',
        website: response.websiteUri || '',
        rating: response.rating || 0,
        totalRatings: response.userRatingCount || 0,
        priceLevel: this.convertPriceLevel(response.priceLevel),
        location: response.location ? {
          lat: response.location.latitude,
          lng: response.location.longitude
        } : null,
        photos: response.photos?.map(photo => ({
          reference: photo.name,
          width: photo.widthPx,
          height: photo.heightPx,
          authorAttributions: photo.authorAttributions
        })) || [],
        reviews: response.reviews?.map(review => ({
          author: review.authorAttribution?.displayName || 'Anonymous',
          rating: review.rating || 0,
          text: review.text?.text || '',
          time: review.publishTime ? new Date(review.publishTime) : null,
          relativeTime: review.relativePublishTimeDescription || ''
        })) || [],
        hours: this.formatOpeningHours(response.regularOpeningHours),
        types: response.types || [],
        googleMapsUri: response.googleMapsUri || '',
        // Raw data for caching
        rawData: response
      };

    } catch (error) {
      winston.error(`Restaurant details failed: ${error.message}`);
      throw new Error(`Details failed: ${error.message}`);
    }
  }

  /**
   * Find nearby competitors (prioritizes food type similarity over distance)
   */
  async findNearbyCompetitors(lat, lng, options = {}) {
    try {
      const { radius = 10000, maxResults = 5, restaurantTypes = [] } = options; // Get 5 competitors

      winston.info(`Finding competitors near ${lat}, ${lng}`);

      const url = `${this.baseUrl}/places:searchNearby`;

      const requestBody = {
        includedTypes: ['restaurant'],
        maxResultCount: 10, // Get 10 results to filter down to 5 best matches
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radius
          }
        },
        rankPreference: 'POPULARITY' // Rank by popularity, not just distance
      };

      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.types'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.places) {
        return [];
      }

      // Extract food-related types from the restaurant
      const foodTypes = this.extractFoodTypes(restaurantTypes);

      winston.info(`Restaurant food types: ${foodTypes.join(', ')}`);

      // Score and rank competitors by food type similarity
      let scoredPlaces = response.places.map(place => {
        const competitorFoodTypes = this.extractFoodTypes(place.types || []);

        // Calculate food type similarity score (0-100)
        let similarityScore = 0;
        if (foodTypes.length > 0 && competitorFoodTypes.length > 0) {
          const matches = competitorFoodTypes.filter(type => foodTypes.includes(type));
          const union = new Set([...foodTypes, ...competitorFoodTypes]);
          similarityScore = (matches.length / union.size) * 100;
        }

        return {
          place,
          foodTypes: competitorFoodTypes,
          similarityScore
        };
      });

      // Filter: keep only restaurants with similar food types (>30% similarity)
      // OR if no food types available, keep all
      if (foodTypes.length > 0) {
        scoredPlaces = scoredPlaces.filter(sp => sp.similarityScore > 30);
        winston.info(`Filtered to ${scoredPlaces.length} restaurants with similar food type (>${30}% similarity)`);
      }

      // Sort by similarity score (highest first), then by rating
      scoredPlaces.sort((a, b) => {
        if (b.similarityScore !== a.similarityScore) {
          return b.similarityScore - a.similarityScore;
        }
        return (b.place.rating || 0) - (a.place.rating || 0);
      });

      // Log top competitors
      scoredPlaces.slice(0, maxResults).forEach(sp => {
        winston.info(`✓ ${sp.place.displayName?.text}: ${Math.round(sp.similarityScore)}% similar (${sp.foodTypes.join(', ')})`);
      });

      // Transform and calculate distances
      return scoredPlaces.slice(0, maxResults).map(({ place }) => {
        const distance = this.calculateDistance(
          lat, lng,
          place.location.latitude,
          place.location.longitude
        );

        return {
          placeId: place.id,
          name: place.displayName?.text || 'Unknown',
          address: place.formattedAddress || '',
          rating: place.rating || 0,
          totalRatings: place.userRatingCount || 0,
          priceLevel: this.convertPriceLevel(place.priceLevel),
          distance: distance,
          location: {
            lat: place.location.latitude,
            lng: place.location.longitude
          },
          types: place.types || []
        };
      });

    } catch (error) {
      winston.error(`Competitor search failed: ${error.message}`);
      // Return empty array for competitors as it's not critical
      return [];
    }
  }

  /**
   * Extract food-related types from Google Places types array
   * This filters out generic types and focuses on cuisine/food categories
   */
  extractFoodTypes(types) {
    if (!types || !Array.isArray(types)) return [];

    // Common food-specific types to look for
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

    // Filter types to only include food-related categories
    return types.filter(type => foodTypePatterns.includes(type));
  }

  /**
   * Get photo URL from photo reference
   */
  getPhotoUrl(photoReference, maxWidth = 400) {
    if (!photoReference) return null;

    // Handle both old and new photo reference formats
    const photoName = photoReference.includes('/') ? photoReference : `places/${photoReference}/photos/${photoReference}`;

    return `${this.baseUrl}/${photoName}/media?maxWidthPx=${maxWidth}&key=${this.apiKey}`;
  }

  /**
   * Make HTTP request with timeout and error handling
   */
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        winston.error(`API Error ${response.status}: ${errorText}`);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  /**
   * Convert new API price level to legacy format
   */
  convertPriceLevel(priceLevel) {
    if (!priceLevel) return 0;

    const priceLevelMap = {
      'PRICE_LEVEL_FREE': 0,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };

    return priceLevelMap[priceLevel] || 0;
  }

  /**
   * Format opening hours from new API format
   */
  formatOpeningHours(regularOpeningHours) {
    if (!regularOpeningHours || !regularOpeningHours.periods) {
      return null;
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayText = [];

    for (let day = 0; day < 7; day++) {
      const dayPeriods = regularOpeningHours.periods.filter(period =>
        period.open && period.open.day === day
      );

      if (dayPeriods.length === 0) {
        weekdayText.push(`${days[day]}: Closed`);
      } else {
        const hours = dayPeriods.map(period => {
          const openTime = this.formatTime(period.open);
          const closeTime = period.close ? this.formatTime(period.close) : '11:59 PM';
          return `${openTime} - ${closeTime}`;
        }).join(', ');

        weekdayText.push(`${days[day]}: ${hours}`);
      }
    }

    return {
      weekdayText,
      periods: regularOpeningHours.periods
    };
  }

  /**
   * Format time from API format
   */
  formatTime(timeObj) {
    if (!timeObj || timeObj.hour === undefined) return '';

    const hour = timeObj.hour;
    const minute = timeObj.minute || 0;

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');

    return `${displayHour}:${displayMinute} ${period}`;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return Math.round(d * 100) / 100;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      // Simple test search
      const results = await this.searchRestaurants('test restaurant', { maxResults: 1 });
      return {
        success: true,
        message: 'Google Places API connection successful',
        resultsCount: results.length
      };
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`
      };
    }
  }
}

module.exports = GooglePlacesService;