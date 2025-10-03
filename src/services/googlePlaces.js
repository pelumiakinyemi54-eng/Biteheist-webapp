// services/googlePlaces.js
import axios from 'axios'

const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

// CORS proxy for development - you'll need to handle CORS in production
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

class GooglePlacesService {
  constructor() {
    this.apiKey = API_KEY
  }

  /**
   * Search for restaurants using Google Places Text Search
   */
  async searchRestaurants(query) {
    try {
      // For production, you'll need to implement this via your backend
      // This is a client-side implementation for demo purposes
      
      const url = `${BASE_URL}/textsearch/json`
      const params = {
        query: `${query} restaurant`,
        type: 'restaurant',
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,rating,user_ratings_total,geometry,photos,price_level'
      }

      // In production, make this call from your backend to avoid CORS
      const response = await this.makeProxiedRequest(url, params)
      
      if (response.data && response.data.status === 'OK') {
        return response.data.results || []
      } else {
        console.warn('Google Places API response:', response.data)
        return this.getMockSearchResults(query)
      }
    } catch (error) {
      console.error('Google Places search error:', error)
      // Return mock data for development
      return this.getMockSearchResults(query)
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(placeId) {
    try {
      const url = `${BASE_URL}/details/json`
      const params = {
        place_id: placeId,
        key: this.apiKey,
        fields: 'place_id,name,formatted_address,rating,user_ratings_total,reviews,photos,website,formatted_phone_number,opening_hours,geometry'
      }

      const response = await this.makeProxiedRequest(url, params)
      
      if (response.data && response.data.status === 'OK') {
        return response.data.result
      } else {
        return this.getMockPlaceDetails(placeId)
      }
    } catch (error) {
      console.error('Google Places details error:', error)
      return this.getMockPlaceDetails(placeId)
    }
  }

  /**
   * Find nearby competitors
   */
  async findNearbyRestaurants(lat, lng, radius = 1000) {
    try {
      const url = `${BASE_URL}/nearbysearch/json`
      const params = {
        location: `${lat},${lng}`,
        radius: radius,
        type: 'restaurant',
        key: this.apiKey
      }

      const response = await this.makeProxiedRequest(url, params)
      
      if (response.data && response.data.status === 'OK') {
        return response.data.results || []
      } else {
        return this.getMockCompetitors()
      }
    } catch (error) {
      console.error('Nearby search error:', error)
      return this.getMockCompetitors()
    }
  }

  /**
   * Make proxied request to avoid CORS (development only)
   */
  async makeProxiedRequest(url, params) {
    const queryString = new URLSearchParams(params).toString()
    const fullUrl = `${url}?${queryString}`
    
    try {
      // First try direct request (will work if CORS is properly configured)
      return await axios.get(fullUrl)
    } catch (error) {
      if (error.response?.status === 0 || error.message.includes('CORS')) {
        // Try with CORS proxy for development
        console.warn('CORS error detected, using proxy for development')
        return await axios.get(`${PROXY_URL}${fullUrl}`)
      }
      throw error
    }
  }

  /**
   * Mock search results for development/demo
   */
  getMockSearchResults(query) {
    const mockResults = [
      {
        place_id: 'ChIJgUbEo8cfqokR5lP9_Wh_DaM',
        name: "Talkin' Tacos",
        formatted_address: '1234 Ocean Drive, Miami Beach, FL 33139, USA',
        rating: 4.2,
        user_ratings_total: 156,
        price_level: 2
      },
      {
        place_id: 'ChIJXYZ123456789',
        name: 'Taco Bell',
        formatted_address: '5678 Collins Avenue, Miami Beach, FL 33140, USA',
        rating: 3.8,
        user_ratings_total: 89,
        price_level: 1
      },
      {
        place_id: 'ChIJABC987654321',
        name: 'El Taco Loco',
        formatted_address: '9012 Washington Avenue, Miami Beach, FL 33141, USA',
        rating: 4.5,
        user_ratings_total: 234,
        price_level: 2
      }
    ]

    // Filter results based on query for more realistic behavior
    return mockResults.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes('taco') ||
      query.toLowerCase().includes('miami')
    )
  }

  /**
   * Mock place details
   */
  getMockPlaceDetails(placeId) {
    return {
      place_id: placeId,
      name: "Talkin' Tacos",
      formatted_address: '1234 Ocean Drive, Miami Beach, FL 33139, USA',
      rating: 4.2,
      user_ratings_total: 156,
      website: 'https://www.talkintacos.com',
      formatted_phone_number: '(305) 555-0123',
      reviews: [
        {
          author_name: 'John Doe',
          rating: 5,
          text: 'Amazing tacos! Will definitely come back.',
          time: Date.now() / 1000 - 86400 * 7
        },
        {
          author_name: 'Jane Smith', 
          rating: 4,
          text: 'Good food but service could be faster.',
          time: Date.now() / 1000 - 86400 * 14
        }
      ],
      geometry: {
        location: {
          lat: 25.7617,
          lng: -80.1918
        }
      }
    }
  }

  /**
   * Mock competitors data
   */
  getMockCompetitors() {
    return [
      {
        place_id: 'comp_1',
        name: 'Pizza Palace',
        vicinity: '0.2 miles away',
        rating: 4.3,
        user_ratings_total: 234,
        price_level: 2
      },
      {
        place_id: 'comp_2',
        name: 'Burger Barn',
        vicinity: '0.4 miles away',
        rating: 3.9,
        user_ratings_total: 156,
        price_level: 1
      },
      {
        place_id: 'comp_3',
        name: 'Taco Time',
        vicinity: '0.6 miles away',
        rating: 4.1,
        user_ratings_total: 89,
        price_level: 2
      },
      {
        place_id: 'comp_4',
        name: 'Sandwich Shop',
        vicinity: '0.8 miles away',
        rating: 4.5,
        user_ratings_total: 312,
        price_level: 3
      },
      {
        place_id: 'comp_5',
        name: 'Deli Delicious',
        vicinity: '1.0 miles away',
        rating: 3.8,
        user_ratings_total: 67,
        price_level: 2
      }
    ]
  }

  /**
   * Run audit for a restaurant using backend API
   */
  async auditRestaurant(placeId) {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
      const response = await axios.post(`${BACKEND_URL}/api/restaurants/${placeId}/audit`)

      if (response.data && response.data.success) {
        return this.transformAuditData(response.data.audit)
      } else {
        console.warn('Backend audit failed, using mock data')
        return this.getMockAuditData(placeId)
      }
    } catch (error) {
      console.error('Audit API error:', error)
      return this.getMockAuditData(placeId)
    }
  }

  /**
   * Transform backend audit data to frontend format
   */
  transformAuditData(audit) {
    return {
      restaurant: {
        name: audit.restaurant.name,
        address: audit.restaurant.address,
        rating: audit.restaurant.rating,
        total_ratings: audit.restaurant.totalRatings,
        website: audit.restaurant.website,
        phone: audit.restaurant.phone,
        photos: audit.restaurant.photos || [],
        reviews: audit.restaurant.reviews || []
      },
      overallScore: audit.scores.overall,
      grade: audit.grade,
      metrics: {
        seo: audit.scores.seo.score,
        performance: audit.scores.pageSpeed.score,
        reviews: audit.scores.reviews.score,
        responseTime: audit.scores.responseTime.score
      },
      competitors: audit.competitors || [],
      seoIssues: this.transformSeoIssues(audit.scores.seo, audit.restaurant),
      pagespeed: {
        score: audit.scores.pageSpeed.score,
        loadTime: audit.scores.pageSpeed.loadTime,
        metrics: audit.scores.pageSpeed.metrics
      },
      revenueImpact: audit.revenueImpact,
      actionItems: audit.actionItems || [],
      messages: audit.messages || []
    }
  }

  /**
   * Transform SEO score data to issues format
   */
  transformSeoIssues(seoScore, restaurant) {
    const issues = []

    if (!restaurant.website) {
      issues.push({
        title: 'No Website Found',
        description: 'Missing official website reduces online visibility',
        severity: 'high',
        impact: 'High revenue impact - customers can\'t find menu or place orders online'
      })
    }

    if (restaurant.photos.length < 10) {
      issues.push({
        title: 'Insufficient Photos',
        description: `Only ${restaurant.photos.length} photos available`,
        severity: 'medium',
        impact: 'Medium revenue impact - visual content drives engagement'
      })
    }

    if (restaurant.totalRatings < 50) {
      issues.push({
        title: 'Low Review Count',
        description: `Only ${restaurant.totalRatings} reviews`,
        severity: 'medium',
        impact: 'Affects search ranking and customer trust'
      })
    }

    if (seoScore.score < 70) {
      issues.push({
        title: 'SEO Score Below Target',
        description: 'Multiple optimization opportunities detected',
        severity: 'high',
        impact: 'Missing potential customers from search'
      })
    }

    return issues
  }

  /**
   * Mock audit data for development
   */
  getMockAuditData(placeId) {
    return {
      restaurant: {
        name: "Talkin' Tacos",
        address: '1234 Ocean Drive, Miami Beach, FL 33139',
        rating: 4.2,
        total_ratings: 156,
        website: 'https://www.talkintacos.com',
        phone: '(305) 555-0123'
      },
      overallScore: 72,
      grade: 'B',
      metrics: {
        seo: 68,
        performance: 75,
        reviews: 84,
        responseTime: 62
      },
      competitors: this.getMockCompetitors(),
      seoIssues: [
        {
          title: 'Title Tag Too Short',
          description: 'Your title tag is only 35 characters. Expand to 50-60 characters.',
          severity: 'medium',
          impact: 'Lost clicks from search results'
        },
        {
          title: 'Missing Schema Markup',
          description: 'No Restaurant schema found. This helps Google understand your business.',
          severity: 'high',
          impact: 'Lower rankings in local search'
        }
      ],
      pagespeed: {
        score: 75,
        loadTime: 3.2,
        metrics: {
          firstContentfulPaint: 1.8,
          largestContentfulPaint: 2.5,
          cumulativeLayoutShift: 0.12
        }
      },
      revenueImpact: {
        monthly: 2400,
        annual: 28800,
        breakdown: {
          seo: 800,
          speed: 600,
          reviews: 600,
          response: 400
        }
      },
      actionItems: [
        {
          priority: 'high',
          category: 'SEO',
          title: 'Add Restaurant Schema Markup',
          description: 'Implement structured data to improve search visibility',
          estimatedRevenue: 800,
          timeframe: '1-2 weeks'
        },
        {
          priority: 'high',
          category: 'Website',
          title: 'Optimize Page Load Speed',
          description: 'Reduce load time from 3.2s to under 2.5s',
          estimatedRevenue: 600,
          timeframe: '1 week'
        }
      ],
      messages: {
        primary: 'You could be earning $2,400 more per month',
        secondary: 'Your SEO score of 72 is good, but optimization could increase revenue by 35%'
      }
    }
  }
}

export const googlePlacesService = new GooglePlacesService()
export default googlePlacesService