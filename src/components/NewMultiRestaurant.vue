<template>
  <div class="new-multi-restaurant">
    <!-- Header -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1>Multi-Restaurant Dashboard</h1>
          <p>Choose your restaurants and manage multiple locations</p>
        </div>
        <button v-if="restaurants.length > 0" @click="clearAllRestaurants" class="clear-all-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for restaurants..."
          @input="handleSearch"
        />
        <span class="search-icon">🔍</span>
      </div>

      <!-- Suggestions Dropdown -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.placeId"
          class="suggestion-item"
          @click="selectRestaurant(suggestion)"
        >
          <div class="suggestion-details">
            <div class="name">{{ suggestion.name }}</div>
            <div class="address">{{ suggestion.address }}</div>
            <div class="rating">⭐ {{ suggestion.rating }} ({{ suggestion.totalRatings }} reviews)</div>
          </div>
          <button class="add-btn">Add</button>
        </div>
      </div>

      <!-- No Results State -->
      <div v-if="showNoResults" class="no-results">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-600">No restaurants found</p>
        <p class="text-sm text-gray-500">Try a different search term</p>
      </div>

      <div v-if="isSearching" class="searching">
        <div class="spinner"></div>
        <span>Searching...</span>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <div class="error-content">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span>{{ errorMessage }}</span>
          <button @click="errorMessage = ''" class="error-close">✕</button>
        </div>
      </div>
    </div>

    <!-- Performance Summary (shows when 2+ restaurants) -->
    <div v-if="restaurants.length >= 2" class="performance-summary">
      <div class="summary-card">
        <h2>📊 Performance Overview</h2>
        <div class="stats-grid">
          <div class="stat">
            <label>Average SEO Score</label>
            <div class="value" :class="getScoreColor(averageStats.seoScore)">
              {{ averageStats.seoScore }}/100
            </div>
          </div>
          <div class="stat">
            <label>Average Page Speed</label>
            <div class="value" :class="getScoreColor(averageStats.pageSpeed)">
              {{ averageStats.pageSpeed }}/100
            </div>
          </div>
          <div class="stat">
            <label>Total Monthly Loss</label>
            <div class="value loss">${{ averageStats.totalLoss.toLocaleString() }}</div>
          </div>
          <div class="stat">
            <label>Total Monthly Visitors</label>
            <div class="value">{{ averageStats.totalVisitors.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <div class="performance-cards">
        <div class="perf-card best">
          <div class="icon">🏆</div>
          <div class="content">
            <div class="label">Best Performing</div>
            <div class="restaurant-name">{{ bestRestaurant.name }}</div>
            <div class="detail">{{ bestRestaurant.overallScore }}/100 Overall Score</div>
          </div>
        </div>

        <div class="perf-card worst">
          <div class="icon">⚠️</div>
          <div class="content">
            <div class="label">Needs Improvement</div>
            <div class="restaurant-name">{{ worstRestaurant.name }}</div>
            <div class="detail">Losing ${{ worstRestaurant.monthlyLoss.toLocaleString() }}/month</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Restaurant List -->
    <div v-if="restaurants.length > 0" class="restaurants-section">
      <h2>Your Restaurants ({{ restaurants.length }})</h2>

      <div class="restaurant-grid">
        <div v-for="(restaurant, index) in restaurants" :key="restaurant.placeId" class="restaurant-card">
          <button class="remove-btn" @click="removeRestaurant(index)">✕</button>

          <div class="restaurant-info">
            <h3>{{ restaurant.name }}</h3>
            <p class="address">{{ restaurant.address }}</p>
            <p class="rating">⭐ {{ restaurant.rating }} ({{ restaurant.totalRatings }} reviews)</p>
          </div>

          <div class="restaurant-stats">
            <div class="stat-item">
              <span class="label">SEO Score</span>
              <span class="value" :class="getScoreColor(restaurant.overallScore)">
                {{ restaurant.overallScore }}/100
              </span>
            </div>
            <div class="stat-item">
              <span class="label">Page Speed</span>
              <span class="value" :class="getScoreColor(restaurant.performanceScore)">
                {{ restaurant.performanceScore }}/100
              </span>
            </div>
            <div class="stat-item">
              <span class="label">Monthly Loss</span>
              <span class="value loss">${{ restaurant.monthlyLoss.toLocaleString() }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Monthly Visitors</span>
              <span class="value">{{ restaurant.estimatedVisitors.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🍽️</div>
      <h3>No Restaurants Selected</h3>
      <p>Start typing in the search box above to find and add your restaurants</p>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner-modern"></div>
        <div class="loading-content">
          <h3>{{ loadingMessage }}</h3>
          <p>{{ loadingSubtext }}</p>
          <div class="loading-steps">
            <div v-for="(step, index) in loadingSteps" :key="index" class="step-item" :class="{ active: currentStep >= index, completed: currentStep > index }">
              <div class="step-dot">
                <span v-if="currentStep > index">✓</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <span class="step-label">{{ step }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'NewMultiRestaurant',

  setup() {
    const searchQuery = ref('');
    const suggestions = ref([]);
    const showSuggestions = ref(false);
    const showNoResults = ref(false);
    const isSearching = ref(false);
    const isLoading = ref(false);
    const restaurants = ref([]);
    const errorMessage = ref('');
    const loadingMessage = ref('Analyzing Restaurant...');
    const loadingSubtext = ref('Please wait while we fetch the data');
    const currentStep = ref(0);
    const loadingSteps = ref([
      'Fetching restaurant details',
      'Analyzing competitors',
      'Scanning SEO metrics',
      'Calculating revenue impact'
    ]);
    let searchTimeout = null;

    const API_URL = import.meta.env.VITE_API_BASE_URL || '';

    // Load saved restaurants from localStorage
    onMounted(() => {
      const saved = localStorage.getItem('multiRestaurants');
      if (saved) {
        try {
          restaurants.value = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading saved restaurants:', e);
        }
      }
    });

    // Save to localStorage
    const saveRestaurants = () => {
      localStorage.setItem('multiRestaurants', JSON.stringify(restaurants.value));
    };

    // Handle search input
    const handleSearch = () => {
      clearTimeout(searchTimeout);
      showNoResults.value = false;
      errorMessage.value = '';

      if (searchQuery.value.length < 2) {
        suggestions.value = [];
        showSuggestions.value = false;
        showNoResults.value = false;
        return;
      }

      isSearching.value = true;
      searchTimeout = setTimeout(async () => {
        try {
          const response = await axios.get(`${API_URL}/api/restaurants/search`, {
            params: { query: searchQuery.value, limit: 5 }
          });

          if (response.data && response.data.success) {
            // Map the backend response to match our format
            suggestions.value = (response.data.results || []).map(r => ({
              placeId: r.placeId,
              name: r.name,
              address: r.address,
              rating: r.rating || 0,
              totalRatings: r.totalRatings || 0
            }));
            showSuggestions.value = suggestions.value.length > 0;
            showNoResults.value = suggestions.value.length === 0 && searchQuery.value.length >= 2;
          } else {
            suggestions.value = [];
            showSuggestions.value = false;
            showNoResults.value = true;
          }
        } catch (error) {
          console.error('Search failed:', error);
          errorMessage.value = 'Failed to search restaurants. Please try again.';
          suggestions.value = [];
          showSuggestions.value = false;
        } finally {
          isSearching.value = false;
        }
      }, 500);
    };

    // Simulate loading steps
    const simulateLoadingSteps = () => {
      return new Promise((resolve) => {
        currentStep.value = 0;
        const stepDuration = 500; // 500ms per step

        const interval = setInterval(() => {
          currentStep.value++;
          if (currentStep.value >= loadingSteps.value.length) {
            clearInterval(interval);
            resolve();
          }
        }, stepDuration);
      });
    };

    // Select restaurant from suggestions
    const selectRestaurant = async (restaurant) => {
      // Check if already added
      if (restaurants.value.find(r => r.placeId === restaurant.placeId)) {
        errorMessage.value = 'This restaurant is already added to your dashboard';
        return;
      }

      isLoading.value = true;
      showSuggestions.value = false;
      currentStep.value = 0;
      errorMessage.value = '';
      loadingMessage.value = `Analyzing ${restaurant.name}...`;
      loadingSubtext.value = 'This may take a few moments';

      try {
        // Start loading animation
        const loadingPromise = simulateLoadingSteps();

        // Run audit
        const response = await axios.post(`${API_URL}/api/restaurants/${restaurant.placeId}/audit`);

        // Wait for animation to complete
        await loadingPromise;

        const audit = response.data.audit;

        restaurants.value.push({
          placeId: restaurant.placeId,
          name: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
          totalRatings: restaurant.totalRatings,
          overallScore: audit.scores?.overall || 0,
          seoScore: audit.scores?.seo?.score || 0,
          performanceScore: audit.scores?.pageSpeed?.score || 0,
          estimatedVisitors: audit.parameters?.monthlyVisitors || 0,
          monthlyLoss: audit.revenueImpact?.monthly || 0
        });

        saveRestaurants();
        searchQuery.value = '';
        suggestions.value = [];
      } catch (error) {
        console.error('Failed to add restaurant:', error);
        errorMessage.value = `Failed to add restaurant: ${error.response?.data?.message || error.message}`;
      } finally {
        isLoading.value = false;
        currentStep.value = 0;
      }
    };

    // Remove restaurant
    const removeRestaurant = (index) => {
      restaurants.value.splice(index, 1);
      saveRestaurants();
    };

    // Clear all restaurants
    const clearAllRestaurants = () => {
      if (confirm('Are you sure you want to remove all restaurants?')) {
        restaurants.value = [];
        saveRestaurants();
      }
    };

    // Computed stats
    const averageStats = computed(() => {
      if (restaurants.value.length === 0) return { seoScore: 0, pageSpeed: 0, totalLoss: 0, totalVisitors: 0 };

      const total = restaurants.value.reduce((acc, r) => {
        acc.seoScore += r.overallScore;
        acc.pageSpeed += r.performanceScore;
        acc.totalLoss += r.monthlyLoss;
        acc.totalVisitors += r.estimatedVisitors;
        return acc;
      }, { seoScore: 0, pageSpeed: 0, totalLoss: 0, totalVisitors: 0 });

      return {
        seoScore: Math.round(total.seoScore / restaurants.value.length),
        pageSpeed: Math.round(total.pageSpeed / restaurants.value.length),
        totalLoss: Math.round(total.totalLoss),
        totalVisitors: Math.round(total.totalVisitors)
      };
    });

    const bestRestaurant = computed(() => {
      if (restaurants.value.length === 0) return null;
      return [...restaurants.value].sort((a, b) => b.overallScore - a.overallScore)[0];
    });

    const worstRestaurant = computed(() => {
      if (restaurants.value.length === 0) return null;
      return [...restaurants.value].sort((a, b) => b.monthlyLoss - a.monthlyLoss)[0];
    });

    const getScoreColor = (score) => {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      return 'poor';
    };

    return {
      searchQuery,
      suggestions,
      showSuggestions,
      showNoResults,
      isSearching,
      isLoading,
      restaurants,
      errorMessage,
      loadingMessage,
      loadingSubtext,
      currentStep,
      loadingSteps,
      averageStats,
      bestRestaurant,
      worstRestaurant,
      handleSearch,
      selectRestaurant,
      removeRestaurant,
      clearAllRestaurants,
      getScoreColor
    };
  }
};
</script>

<style scoped>
.new-multi-restaurant {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  background: #F3F4F6;
  min-height: 100vh;
}

.header-section {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-section h1 {
  font-size: 36px;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 10px;
}

.header-section p {
  font-size: 18px;
  color: #6B7280;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #EF4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.clear-all-btn .w-5 {
  width: 20px;
  height: 20px;
}

/* Search */
.search-container {
  max-width: 600px;
  margin: 0 auto 40px;
  position: relative;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  font-size: 16px;
  border: 2px solid #D1D5DB;
  border-radius: 12px;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #3B82F6;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 8px;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
}

.suggestion-item {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.suggestion-item:hover {
  background: #F9FAFB;
}

.suggestion-details .name {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.suggestion-details .address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.suggestion-details .rating {
  font-size: 14px;
  color: #F59E0B;
}

.add-btn {
  padding: 8px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.add-btn:hover {
  background: #2563EB;
}

.searching {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  color: #6B7280;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* No Results */
.no-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 8px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 100;
}

.no-results .w-12 {
  width: 48px;
  height: 48px;
}

.no-results .text-gray-400 {
  color: #9CA3AF;
}

.no-results .text-gray-600 {
  color: #4B5563;
  font-weight: 600;
  margin-bottom: 4px;
}

.no-results .text-sm {
  font-size: 14px;
}

.no-results .text-gray-500 {
  color: #6B7280;
}

.no-results .mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.no-results .mb-3 {
  margin-bottom: 12px;
}

/* Error Message */
.error-message {
  margin-top: 12px;
  background: #FEE2E2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  padding: 12px 16px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #991B1B;
  font-size: 14px;
}

.error-content .w-5 {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.error-content span {
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #991B1B;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.error-close:hover {
  background: #FCA5A5;
}

/* Performance Summary */
.performance-summary {
  margin-bottom: 40px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat {
  text-align: center;
  padding: 20px;
  background: #F9FAFB;
  border-radius: 12px;
}

.stat label {
  display: block;
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat .value {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
}

.stat .value.excellent {
  color: #10B981;
}

.stat .value.good {
  color: #F59E0B;
}

.stat .value.poor {
  color: #EF4444;
}

.stat .value.loss {
  color: #EF4444;
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.perf-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.perf-card.best {
  border-left: 6px solid #10B981;
}

.perf-card.worst {
  border-left: 6px solid #EF4444;
}

.perf-card .icon {
  font-size: 48px;
}

.perf-card .label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.perf-card .restaurant-name {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.perf-card .detail {
  font-size: 14px;
  color: #6B7280;
}

/* Restaurant List */
.restaurants-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.restaurant-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.restaurant-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #FEE2E2;
  color: #EF4444;
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #EF4444;
  color: white;
}

.restaurant-info {
  margin-bottom: 20px;
}

.restaurant-info h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.restaurant-info .address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 6px;
}

.restaurant-info .rating {
  font-size: 14px;
  color: #F59E0B;
  font-weight: 500;
}

.restaurant-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  background: #F9FAFB;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-item .label {
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 6px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
}

.stat-item .value.excellent {
  color: #10B981;
}

.stat-item .value.good {
  color: #F59E0B;
}

.stat-item .value.poor {
  color: #EF4444;
}

.stat-item .value.loss {
  color: #EF4444;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  color: #6B7280;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-container {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.loading-spinner-modern {
  width: 80px;
  height: 80px;
  margin: 0 auto 32px;
  border: 6px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-right-color: #8B5CF6;
  border-bottom-color: #EC4899;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
}

.loading-content {
  text-align: center;
}

.loading-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.loading-content p {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 32px;
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #F9FAFB;
  transition: all 0.3s ease;
}

.step-item.active {
  background: #EFF6FF;
  border-left: 4px solid #3B82F6;
}

.step-item.completed {
  background: #ECFDF5;
  border-left: 4px solid #10B981;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #E5E7EB;
  color: #6B7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-item.active .step-dot {
  background: #3B82F6;
  color: white;
  animation: pulse-dot 1.5s ease infinite;
}

.step-item.completed .step-dot {
  background: #10B981;
  color: white;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
  transition: all 0.3s ease;
}

.step-item.active .step-label {
  color: #1F2937;
  font-weight: 600;
}

.step-item.completed .step-label {
  color: #059669;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
}
</style>
