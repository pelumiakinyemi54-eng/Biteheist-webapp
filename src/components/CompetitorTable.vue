<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">Competitor Analysis</h2>
      <div class="text-sm text-gray-500">
        Within {{ radius }}mi radius
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-left py-4 px-4 font-semibold text-gray-700">Restaurant</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Rating</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Reviews</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Distance</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Performance</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Website</th>
          </tr>
        </thead>
        <tbody>
          <!-- Your Restaurant Row -->
          <tr class="bg-indigo-50 border-b border-indigo-200">
            <td class="py-4 px-4">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white font-semibold text-sm">YOU</span>
                </div>
                <div>
                  <div class="font-semibold text-indigo-800">{{ restaurant.name }}</div>
                  <div class="text-sm text-indigo-600">Your Restaurant</div>
                </div>
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getRatingBadgeClass(restaurant.rating)">
                ★ {{ restaurant.rating || 'N/A' }}
              </span>
            </td>
            <td class="text-center py-4 px-4">
              <span class="font-medium text-gray-800">{{ restaurant.total_ratings || 0 }}</span>
            </td>
            <td class="text-center py-4 px-4">
              <span class="text-indigo-600 font-medium">Base</span>
            </td>
            <td class="text-center py-4 px-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Analyzing
              </span>
            </td>
            <td class="text-center py-4 px-4">
              <a
                v-if="restaurant.website"
                :href="restaurant.website"
                target="_blank"
                class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Visit
              </a>
              <span v-else class="text-xs text-gray-400">N/A</span>
            </td>
          </tr>
          
          <!-- Competitor Rows -->
          <tr 
            v-for="(competitor, index) in competitors" 
            :key="competitor.place_id"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-red-50': isOutperforming(competitor) }"
          >
            <td class="py-4 px-4">
              <div class="flex items-center">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-white font-semibold text-sm"
                  :style="`background-color: ${getCompetitorColor(index)}`"
                >
                  {{ competitor.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-gray-800 truncate">{{ competitor.name }}</div>
                  <div class="text-sm text-gray-500 truncate">{{ competitor.vicinity || 'Nearby' }}</div>
                  <div v-if="competitor.types" class="text-xs text-gray-400 mt-1">
                    {{ formatTypes(competitor.types) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
                :class="getRatingBadgeClass(competitor.rating)"
              >
                ★ {{ competitor.rating ? competitor.rating.toFixed(1) : 'N/A' }}
              </span>
            </td>
            <td class="text-center py-4 px-4">
              <span class="font-medium text-gray-800">{{ competitor.user_ratings_total || 0 }}</span>
              <div class="text-xs text-gray-500 mt-1">
                {{ getReviewVelocity(competitor.user_ratings_total) }}
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <span class="text-gray-600">{{ getDistance(index) }}mi</span>
              <div class="text-xs text-gray-500 mt-1">
                {{ getWalkTime(index) }} walk
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getPerformanceClass(competitor)"
              >
                {{ getPerformanceStatus(competitor) }}
              </span>
              <div v-if="isOutperforming(competitor)" class="text-xs text-red-600 mt-1 font-medium">
                ⚠️ Threat
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <a
                v-if="competitor.website"
                :href="competitor.website"
                target="_blank"
                class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Visit
              </a>
              <span v-else class="text-xs text-gray-400">N/A</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Revenue Gap Analysis -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h3 class="font-semibold text-gray-800 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
        Revenue Gap Analysis
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
          <div class="text-3xl font-bold text-green-700">${{ estimatedRevenueGap.toLocaleString() }}</div>
          <div class="text-sm text-green-800 font-medium">Monthly Revenue Gap</div>
          <div class="text-xs text-green-600 mt-1">If you matched top competitor</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-50">
          <div class="text-2xl font-bold text-gray-800">{{ competitorStats.avgRating }}</div>
          <div class="text-sm text-gray-600">Avg Competitor Rating</div>
          <div class="text-xs" :class="restaurant.rating > competitorStats.avgRating ? 'text-green-600' : 'text-red-600'">
            {{ restaurant.rating > competitorStats.avgRating ? '↑' : '↓' }}
            {{ Math.abs(restaurant.rating - competitorStats.avgRating).toFixed(1) }}
          </div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-50">
          <div class="text-2xl font-bold text-orange-600">{{ threatsCount }}</div>
          <div class="text-sm text-gray-600">Active Threats</div>
          <div class="text-xs text-gray-500">Higher rated nearby</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-gray-50">
          <div class="text-2xl font-bold text-indigo-600">#{{ marketPosition }}</div>
          <div class="text-sm text-gray-600">Market Position</div>
          <div class="text-xs text-gray-500">Out of {{ competitors.length + 1 }}</div>
        </div>
      </div>
    </div>
    
    <!-- Key Insights -->
    <div class="mt-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
      <h3 class="font-semibold text-yellow-800 mb-3 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Key Competitive Insights
      </h3>
      <div class="space-y-2 text-sm">
        <div v-for="insight in competitiveInsights" :key="insight.type" class="flex items-start">
          <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span class="text-yellow-800">{{ insight.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompetitorTable',
  props: {
    competitors: {
      type: Array,
      default: () => []
    },
    restaurant: {
      type: Object,
      required: true
    },
    radius: {
      type: Number,
      default: 1.0
    }
  },
  computed: {
    competitorStats() {
      const validRatings = this.competitors.filter(c => c.rating).map(c => c.rating)
      const validReviews = this.competitors.filter(c => c.user_ratings_total).map(c => c.user_ratings_total)

      return {
        avgRating: validRatings.length ? (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1) : 0,
        avgReviews: validReviews.length ? Math.round(validReviews.reduce((a, b) => a + b, 0) / validReviews.length) : 0
      }
    },

    estimatedRevenueGap() {
      // Find top competitor rating
      const topRating = Math.max(...this.competitors.map(c => c.rating || 0))
      const ratingGap = Math.max(0, topRating - (this.restaurant.rating || 0))

      // Estimate revenue impact: each 0.1 star difference = ~2% revenue
      // Assuming average restaurant revenue of $50k/month
      const baseRevenue = 50000
      const revenuePercentGap = ratingGap * 20 // 20% per full star
      const revenueGap = Math.round(baseRevenue * (revenuePercentGap / 100))

      return Math.min(revenueGap, 20000) // Cap at $20k for realism
    },
    
    threatsCount() {
      return this.competitors.filter(c => c.rating > this.restaurant.rating).length
    },
    
    marketPosition() {
      const allRestaurants = [...this.competitors, this.restaurant]
      const sorted = allRestaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      return sorted.findIndex(r => r.name === this.restaurant.name) + 1
    },
    
    competitiveInsights() {
      const insights = []
      
      // Rating analysis
      if (this.restaurant.rating < this.competitorStats.avgRating) {
        insights.push({
          type: 'rating',
          message: `Your rating is ${(this.competitorStats.avgRating - this.restaurant.rating).toFixed(1)} points below the local average`
        })
      }
      
      // Review volume analysis
      if (this.restaurant.total_ratings < this.competitorStats.avgReviews) {
        insights.push({
          type: 'reviews',
          message: `You have ${this.competitorStats.avgReviews - this.restaurant.total_ratings} fewer reviews than competitors on average`
        })
      }
      
      // Threat analysis
      if (this.threatsCount > 0) {
        insights.push({
          type: 'threats',
          message: `${this.threatsCount} nearby restaurants are outperforming you in ratings`
        })
      }
      
      // Opportunity analysis
      const weakCompetitors = this.competitors.filter(c => c.rating < this.restaurant.rating).length
      if (weakCompetitors > 0) {
        insights.push({
          type: 'opportunity',
          message: `You're outperforming ${weakCompetitors} competitors - opportunity to capture more market share`
        })
      }
      
      return insights.slice(0, 3) // Show top 3 insights
    }
  },
  methods: {
    getRatingBadgeClass(rating) {
      if (!rating) return 'bg-gray-100 text-gray-700'
      if (rating >= 4.5) return 'bg-green-100 text-green-800'
      if (rating >= 4.0) return 'bg-blue-100 text-blue-800'
      if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    },
    
    getCompetitorColor(index) {
      const colors = [
        '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981',
        '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
      ]
      return colors[index % colors.length]
    },
    
    getDistance(index) {
      // Mock distance calculation - in production, use actual coordinates
      return (0.1 + index * 0.2 + Math.random() * 0.1).toFixed(1)
    },
    
    getWalkTime(index) {
      const distance = parseFloat(this.getDistance(index))
      const minutes = Math.round(distance * 12) // ~12 min per mile walking
      return `${minutes}min`
    },
    
    getReviewVelocity(reviewCount) {
      if (reviewCount > 200) return 'High activity'
      if (reviewCount > 50) return 'Moderate'
      return 'Low activity'
    },
    
    isOutperforming(competitor) {
      return competitor.rating > this.restaurant.rating
    },
    
    getPerformanceStatus(competitor) {
      if (competitor.rating > this.restaurant.rating + 0.5) return 'Leading'
      if (competitor.rating > this.restaurant.rating) return 'Ahead'
      if (competitor.rating < this.restaurant.rating - 0.5) return 'Behind'
      return 'Similar'
    },
    
    getPerformanceClass(competitor) {
      const status = this.getPerformanceStatus(competitor)
      switch (status) {
        case 'Leading': return 'bg-red-100 text-red-800'
        case 'Ahead': return 'bg-orange-100 text-orange-800'
        case 'Behind': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    },
    
    formatTypes(types) {
      if (!types || types.length === 0) return ''
      const formatted = types
        .filter(type => !['establishment', 'point_of_interest'].includes(type))
        .map(type => type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))
        .slice(0, 2)
      return formatted.join(', ')
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Smooth hover effects */
tr {
  transition: background-color 0.2s ease;
}

/* Table scroll styling */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>