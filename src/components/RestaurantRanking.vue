<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <h2 class="text-xl font-bold text-gray-800 mb-6">Restaurant Rankings</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Google Search Ranking -->
      <div class="ranking-card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Google Search</h3>
              <p class="text-xs text-gray-500">Local search ranking</p>
            </div>
          </div>
        </div>

        <div class="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div class="text-5xl font-bold text-blue-700 mb-2">
            #{{ googleRank }}
          </div>
          <div class="text-sm text-blue-600 font-medium">
            {{ getRankingDescription(googleRank) }}
          </div>
          <div class="mt-3 text-xs text-gray-500">
            Distance from user: {{ distance }}
          </div>
        </div>
      </div>

      <!-- Local Competitor Ranking -->
      <div class="ranking-card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Local Area</h3>
              <p class="text-xs text-gray-500">Among nearby competitors</p>
            </div>
          </div>
        </div>

        <div class="text-center py-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div class="text-5xl font-bold text-purple-700 mb-2">
            #{{ localRank }}
          </div>
          <div class="text-sm text-purple-600 font-medium">
            of {{ totalCompetitors }} restaurants
          </div>
          <div class="mt-3 flex items-center justify-center space-x-2">
            <span
              v-if="rankChange > 0"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path>
              </svg>
              Up {{ rankChange }} spots
            </span>
            <span
              v-else-if="rankChange < 0"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"></path>
              </svg>
              Down {{ Math.abs(rankChange) }} spots
            </span>
            <span
              v-else
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              No change
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ranking Insight -->
    <div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
        </svg>
        <div class="flex-1">
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ getRankingInsight() }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RestaurantRanking',
  props: {
    googleRank: {
      type: Number,
      default: 12
    },
    localRank: {
      type: Number,
      default: 8
    },
    totalCompetitors: {
      type: Number,
      default: 47
    },
    distance: {
      type: String,
      default: '2.3 mi'
    },
    rankChange: {
      type: Number,
      default: 0
    }
  },
  methods: {
    getRankingDescription(rank) {
      if (rank <= 3) return 'Top ranking - Excellent visibility'
      if (rank <= 10) return 'Good visibility - First page'
      if (rank <= 20) return 'Moderate visibility - Second page'
      return 'Low visibility - Needs improvement'
    },

    getRankingInsight() {
      const google = this.googleRank
      const local = this.localRank
      const total = this.totalCompetitors

      if (google <= 3) {
        return `Your restaurant is in the top 3 Google results! You're highly visible to potential customers searching for restaurants in your area.`
      } else if (google <= 10) {
        return `You're on the first page of Google, which is great. Improving your SEO could help you break into the top 3 spots and increase visibility by up to 40%.`
      } else if (google <= 20) {
        return `You're on the second page of Google. Most customers don't look beyond page 1. Improving your ranking could significantly increase customer discovery.`
      } else {
        return `Your ranking needs improvement. With ${total} competitors in your area, better SEO optimization could move you up ${google - 10} positions and dramatically increase visibility.`
      }
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.ranking-card {
  transition: all 0.3s ease;
}

.ranking-card:hover {
  transform: translateY(-4px);
}
</style>
