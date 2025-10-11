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

      <!-- Rankings List (Owner.com style) -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Where you are showing up when customers search you, next to your competitors</h3>
        <div class="space-y-4 mt-6">
          <div
            v-for="(rank, index) in rankingData.rankings"
            :key="index"
            class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <!-- Search keyword header with Google icon -->
            <div class="flex items-start space-x-3 mb-3">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900 capitalize">{{ rank.keyword }}</div>
                <div class="text-xs text-gray-500 mt-0.5">{{ rank.city }}<span v-if="rank.distance > 0"> ({{ rank.distance }}mi)</span></div>
              </div>
            </div>

            <!-- Winner (if someone is #1) -->
            <div v-if="rank.topCompetitors && rank.topCompetitors.length > 0" class="mb-3 pl-8">
              <div class="text-sm text-gray-700">
                🏆 <span class="font-semibold">#1:</span> {{ rank.topCompetitors[0].name }}
              </div>
            </div>

            <!-- Your position -->
            <div class="pl-8 flex items-center space-x-4">
              <div class="text-sm">
                <span v-if="rank.position" class="font-semibold text-gray-900">
                  #{{ rank.position }} map pack
                </span>
                <span v-else class="text-gray-500">
                  Unranked map pack
                </span>
              </div>
              <div class="text-sm text-gray-500">
                Unranked organic
              </div>
            </div>
          </div>
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
