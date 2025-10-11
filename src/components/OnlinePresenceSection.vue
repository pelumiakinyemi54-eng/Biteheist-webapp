<template>
  <div class="card-shadow mb-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">How You're Doing Online</h2>
        <p class="text-gray-600">Search visibility across regions for generic keywords</p>
      </div>
      <button
        @click="refreshRankings"
        class="btn-secondary flex items-center space-x-2"
        :disabled="loading"
      >
        <svg
          class="w-4 h-4"
          :class="{ 'animate-spin': loading }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span>Refresh</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p class="mt-4 text-gray-600">Analyzing your online presence...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-start space-x-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <div>
          <h3 class="text-sm font-medium text-red-800">Error loading rankings</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="rankingData">
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div class="text-sm text-green-600 font-semibold mb-1">Average Position</div>
          <div class="text-3xl font-bold text-green-900">
            {{ rankingData.summary.avgPosition ? `#${rankingData.summary.avgPosition}` : 'N/A' }}
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div class="text-sm text-blue-600 font-semibold mb-1">Top 10 Rankings</div>
          <div class="text-3xl font-bold text-blue-900">{{ rankingData.summary.inTopTen }}</div>
          <div class="text-xs text-blue-700 mt-1">out of {{ rankingData.summary.totalSearches }}</div>
        </div>

        <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <div class="text-sm text-indigo-600 font-semibold mb-1">Top 20 Rankings</div>
          <div class="text-3xl font-bold text-indigo-900">{{ rankingData.summary.inTopTwenty }}</div>
          <div class="text-xs text-indigo-700 mt-1">out of {{ rankingData.summary.totalSearches }}</div>
        </div>

        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
          <div class="text-sm text-gray-600 font-semibold mb-1">Not Ranked</div>
          <div class="text-3xl font-bold text-gray-900">{{ rankingData.summary.notRanked }}</div>
          <div class="text-xs text-gray-700 mt-1">needs improvement</div>
        </div>
      </div>

      <!-- Rankings Table -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Search Visibility Across Regions</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Search Term
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Your Position
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(rank, index) in rankingData.rankings" :key="index" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ rank.keyword }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {{ rank.city }}
                  <span v-if="rank.distance > 0" class="text-xs text-gray-500">({{ rank.distance }}mi)</span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="rank.position" class="text-sm font-semibold text-gray-900">
                    #{{ rank.position }}
                  </span>
                  <span v-else class="text-sm text-gray-400">Not in top 20</span>
                </td>
                <td class="px-4 py-3">
                  <span
                    v-if="rank.position && rank.position <= 3"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    Excellent
                  </span>
                  <span
                    v-else-if="rank.position && rank.position <= 10"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    Good
                  </span>
                  <span
                    v-else-if="rank.position && rank.position <= 20"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    Fair
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    Needs Work
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Problems Detected -->
      <div v-if="rankingData.problems && rankingData.problems.length > 0" class="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-red-900">
            {{ rankingData.problems.length }} problem{{ rankingData.problems.length !== 1 ? 's' : '' }} costing you ${{ totalMonthlyCost }}/month
          </h3>
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <div class="space-y-3">
          <div
            v-for="(problem, index) in rankingData.problems"
            :key="index"
            class="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-100"
          >
            <div class="flex-shrink-0 mt-1">
              <div class="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-xs">{{ index + 1 }}</span>
              </div>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ problem.issue }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No problems detected -->
      <div v-else class="text-center py-8 bg-green-50 rounded-lg border border-green-200">
        <svg class="mx-auto h-12 w-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-green-800 font-medium">No major issues detected</p>
        <p class="text-sm text-green-600 mt-1">Your online presence looks good!</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">No ranking data available</h3>
      <p class="mt-2 text-sm text-gray-500">Click refresh to analyze your online presence</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnlinePresenceSection',
  props: {
    restaurantData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      rankingData: null,
      loading: false,
      error: null
    }
  },
  computed: {
    totalMonthlyCost() {
      if (!this.rankingData || !this.rankingData.problems) return 0;
      return this.rankingData.problems.reduce((sum, problem) => sum + (problem.monthlyCost || 0), 0);
    }
  },
  methods: {
    async refreshRankings() {
      this.loading = true;
      this.error = null;

      try {
        // Extract cuisine from restaurant types
        const cuisine = this.extractCuisine(this.restaurantData.types);
        const city = this.extractCity(this.restaurantData.address);

        if (!cuisine || !city) {
          throw new Error('Unable to determine cuisine type or city from restaurant data');
        }

        // Get API URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';

        const response = await fetch(`${apiUrl}/api/restaurants/keyword-ranking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            placeId: this.restaurantData.placeId,
            restaurantName: this.restaurantData.name,
            cuisine: cuisine,
            city: city,
            lat: this.restaurantData.location?.lat,
            lng: this.restaurantData.location?.lng
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch ranking data');
        }

        this.rankingData = data;
      } catch (error) {
        console.error('Error fetching rankings:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    extractCuisine(types) {
      if (!types || types.length === 0) return 'food';

      // Map of common restaurant types to cuisine keywords
      const cuisineMap = {
        'mexican_restaurant': 'Mexican food',
        'italian_restaurant': 'Italian food',
        'chinese_restaurant': 'Chinese food',
        'japanese_restaurant': 'Japanese food',
        'thai_restaurant': 'Thai food',
        'indian_restaurant': 'Indian food',
        'french_restaurant': 'French food',
        'american_restaurant': 'American food',
        'pizza_restaurant': 'Pizza',
        'sushi_restaurant': 'Sushi',
        'seafood_restaurant': 'Seafood',
        'steak_house': 'Steakhouse',
        'fast_food_restaurant': 'Fast food',
        'cafe': 'Cafe',
        'bar': 'Bar & Grill'
      };

      for (const type of types) {
        if (cuisineMap[type]) {
          return cuisineMap[type];
        }
      }

      // Default to 'restaurant' if no specific cuisine found
      return 'restaurant';
    },

    extractCity(address) {
      if (!address) return null;

      // Extract city from formatted address
      // Format is usually: "Street, City, State ZIP, Country"
      const parts = address.split(',');
      if (parts.length >= 2) {
        return parts[1].trim();
      }

      return null;
    }
  },
  mounted() {
    // Auto-load rankings on mount
    this.refreshRankings();
  }
}
</script>

<style scoped>
.btn-secondary {
  @apply px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors;
}

.btn-secondary:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
