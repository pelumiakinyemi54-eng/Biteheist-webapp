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
        return []
      }
    } catch (error) {
      console.error('Google Places search error:', error)
      return []
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
        return null
      }
    } catch (error) {
      console.error('Google Places details error:', error)
      return null
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
        return []
      }
    } catch (error) {
      console.error('Nearby search error:', error)
      return []
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
   * Run audit for a restaurant using backend API
   */
  async auditRestaurant(placeId) {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || ''
      const response = await axios.post(`${BACKEND_URL}/api/restaurants/${placeId}/audit`)

      if (response.data && response.data.success) {
        return this.transformAuditData(response.data.audit)
      } else {
        console.warn('Backend audit failed')
        throw new Error('Audit failed: ' + (response.data?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Audit API error:', error)
      throw error
    }
  }

  /**
   * Transform backend audit data to frontend format
   */
  transformAuditData(audit) {
    return {
      restaurant: {
        placeId: audit.restaurant.placeId,
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
}

export const googlePlacesService = new GooglePlacesService()
export default googlePlacesService