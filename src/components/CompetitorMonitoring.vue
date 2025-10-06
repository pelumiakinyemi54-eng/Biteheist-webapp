<template>
  <div class="card-shadow mb-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Competitor Position Monitoring</h2>
      <p class="text-gray-600">Track how your competitors are performing over time</p>
    </div>

    <!-- Alert for New/Departed Competitors -->
    <div v-if="newCompetitors.length > 0 || departedCompetitors.length > 0" class="mb-6 space-y-3">
      <div v-if="newCompetitors.length > 0" class="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-orange-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-orange-900 mb-1">⚠️ New Competitors Detected</h3>
            <p class="text-sm text-orange-800">
              {{ newCompetitors.length }} new {{ newCompetitors.length === 1 ? 'competitor has' : 'competitors have' }} entered your area
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="comp in newCompetitors"
                :key="comp.placeId"
                class="px-3 py-1 bg-white text-orange-800 rounded-full text-sm font-medium"
              >
                {{ comp.name }} - {{ comp.rating }}★
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="departedCompetitors.length > 0" class="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div class="flex items-start">
          <svg class="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 class="font-semibold text-blue-900 mb-1">📊 Competitors No Longer Tracked</h3>
            <p class="text-sm text-blue-800">
              {{ departedCompetitors.length }} {{ departedCompetitors.length === 1 ? 'competitor is' : 'competitors are' }} no longer in the top rankings
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-purple-700">Your Position</span>
          <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-purple-900 mb-1">
          #{{ latestSnapshot?.yourPosition?.rank || '-' }}
        </div>
        <div class="text-xs text-purple-600">
          Out of {{ latestSnapshot?.competitorStats?.totalCompetitors || 0 }} competitors
        </div>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-red-700">Stronger</span>
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-red-900 mb-1">
          {{ latestSnapshot?.competitorStats?.strongerCompetitors || 0 }}
        </div>
        <div class="text-xs text-red-600">
          Higher rated competitors
        </div>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-green-700">Weaker</span>
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-green-900 mb-1">
          {{ latestSnapshot?.competitorStats?.weakerCompetitors || 0 }}
        </div>
        <div class="text-xs text-green-600">
          Lower rated competitors
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">Loading competitor data...</p>
      </div>
    </div>

    <!-- Competitor Comparison Table -->
    <div v-else-if="latestSnapshot && latestSnapshot.competitors" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-200">
            <th class="text-left py-4 px-4 font-semibold text-gray-700">Rank</th>
            <th class="text-left py-4 px-4 font-semibold text-gray-700">Competitor</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Rating</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Reviews</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Distance</th>
            <th class="text-center py-4 px-4 font-semibold text-gray-700">Changes</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(competitor, index) in sortedCompetitors"
            :key="competitor.placeId"
            class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <td class="py-4 px-4">
              <div class="flex items-center">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  :style="`background-color: ${getRankColor(competitor.rank)}`"
                >
                  {{ competitor.rank }}
                </div>
              </div>
            </td>
            <td class="py-4 px-4">
              <div class="font-medium text-gray-800">{{ competitor.name }}</div>
              <div v-if="competitor.types && competitor.types.length > 0" class="text-xs text-gray-500 mt-1">
                {{ formatTypes(competitor.types) }}
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <div class="flex items-center justify-center space-x-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getRatingBadgeClass(competitor.rating)">
                  ★ {{ competitor.rating.toFixed(1) }}
                </span>
                <span v-if="competitor.ratingChange !== 0" class="text-xs font-medium" :class="competitor.ratingChange > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ competitor.ratingChange > 0 ? '+' : '' }}{{ competitor.ratingChange.toFixed(1) }}
                </span>
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <div class="flex items-center justify-center space-x-2">
                <span class="font-medium text-gray-800">{{ competitor.totalRatings }}</span>
                <span v-if="competitor.reviewsChange !== 0" class="text-xs font-medium px-2 py-1 rounded-full" :class="competitor.reviewsChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ competitor.reviewsChange > 0 ? '+' : '' }}{{ competitor.reviewsChange }}
                </span>
              </div>
            </td>
            <td class="text-center py-4 px-4">
              <span class="text-gray-600">{{ competitor.distance.toFixed(1) }} km</span>
            </td>
            <td class="text-center py-4 px-4">
              <div v-if="competitor.rankChange !== 0" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="getRankChangeClass(competitor.rankChange)">
                {{ competitor.rankChange > 0 ? '↑' : '↓' }} {{ Math.abs(competitor.rankChange) }}
              </div>
              <span v-else class="text-gray-400 text-sm">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-20 bg-gray-50 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Competitor Data</h3>
      <p class="text-gray-600">Competitor tracking data will appear here</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompetitorMonitoring',
  props: {
    placeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      snapshots: [],
      latestSnapshot: null,
      newCompetitors: [],
      departedCompetitors: [],
      loading: false
    }
  },
  computed: {
    sortedCompetitors() {
      if (!this.latestSnapshot || !this.latestSnapshot.competitors) return []
      return [...this.latestSnapshot.competitors].sort((a, b) => a.rank - b.rank)
    }
  },
  mounted() {
    this.loadCompetitorTracking()
  },
  methods: {
    async loadCompetitorTracking() {
      this.loading = true
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
        const response = await fetch(
          `${API_BASE_URL}/api/analytics/competitor-tracking/${this.placeId}?days=30`
        )
        const data = await response.json()

        if (data.success) {
          this.snapshots = data.snapshots || []
          this.newCompetitors = data.newCompetitors || []
          this.departedCompetitors = data.departedCompetitors || []

          if (this.snapshots.length > 0) {
            this.latestSnapshot = this.snapshots[this.snapshots.length - 1]
          }
        }
      } catch (error) {
        console.error('Failed to load competitor tracking:', error)
      } finally {
        this.loading = false
      }
    },
    getRankColor(rank) {
      if (rank === 1) return '#10b981' // Green for 1st
      if (rank === 2) return '#3b82f6' // Blue for 2nd
      if (rank === 3) return '#f59e0b' // Orange for 3rd
      return '#6b7280' // Gray for others
    },
    getRatingBadgeClass(rating) {
      if (rating >= 4.5) return 'bg-green-100 text-green-800'
      if (rating >= 4.0) return 'bg-blue-100 text-blue-800'
      if (rating >= 3.5) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    },
    getRankChangeClass(change) {
      if (change > 0) return 'bg-green-100 text-green-700'
      return 'bg-red-100 text-red-700'
    },
    formatTypes(types) {
      if (!types || types.length === 0) return ''
      return types
        .filter(type => type.includes('restaurant') || type.includes('food'))
        .map(type => type.replace(/_restaurant$/g, '').replace(/_/g, ' '))
        .slice(0, 2)
        .join(', ')
    }
  }
}
</script>

<style scoped>
.card-shadow {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
}
</style>
