<template>
  <div class="multi-restaurant-dashboard">
    <!-- Header -->
    <div class="section-header">
      <h1 class="text-3xl font-bold text-gray-800">Multi-Restaurant Dashboard</h1>
      <p class="text-gray-600 mt-2">Choose your restaurants and manage multiple locations</p>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-input-wrapper">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for restaurants..."
          class="search-input"
          @input="onSearchInput"
        />
        <div class="search-icon">🔍</div>
      </div>

      <!-- Live Search Suggestions -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
        <div
          v-for="suggestion in suggestions"
          :key="suggestion.placeId"
          class="suggestion-item"
          @click="addRestaurant(suggestion)"
        >
          <div class="suggestion-info">
            <div class="suggestion-name">{{ suggestion.name }}</div>
            <div class="suggestion-address">{{ suggestion.address }}</div>
            <div class="suggestion-rating">⭐ {{ suggestion.rating }} ({{ suggestion.totalRatings }} reviews)</div>
          </div>
          <button class="btn-add">Add</button>
        </div>
      </div>

      <div v-if="searching" class="searching-indicator">
        <div class="spinner-small"></div>
        <span>Searching...</span>
      </div>
    </div>

    <!-- Selected Restaurants -->
    <div v-if="selectedRestaurants.length > 0" class="selected-restaurants">
      <h2 class="section-title">Your Restaurants ({{ selectedRestaurants.length }})</h2>

      <!-- Performance Summary -->
      <div v-if="selectedRestaurants.length >= 2" class="performance-summary">
        <div class="summary-card">
          <div class="summary-header">
            <h3>📊 Performance Overview</h3>
          </div>
          <div class="summary-stats">
            <div class="summary-stat">
              <label>Average SEO Score</label>
              <div class="stat-value" :class="getScoreClass(stats.avgSeoScore)">{{ stats.avgSeoScore }}/100</div>
            </div>
            <div class="summary-stat">
              <label>Average Page Speed</label>
              <div class="stat-value" :class="getScoreClass(stats.avgPageSpeed)">{{ stats.avgPageSpeed }}/100</div>
            </div>
            <div class="summary-stat">
              <label>Total Monthly Loss</label>
              <div class="stat-value loss">${{ stats.totalMonthlyLoss?.toLocaleString() || '0' }}</div>
            </div>
            <div class="summary-stat">
              <label>Total Visitors</label>
              <div class="stat-value">{{ stats.totalVisitors?.toLocaleString() || '0' }}</div>
            </div>
          </div>
        </div>

        <div class="performance-badges">
          <div class="badge-card best">
            <div class="badge-icon">🏆</div>
            <div class="badge-content">
              <div class="badge-label">Best Performing</div>
              <div class="badge-name">{{ stats.bestPerforming.name }}</div>
              <div class="badge-detail">{{ stats.bestPerforming.overallScore }}/100 Overall Score</div>
            </div>
          </div>

          <div class="badge-card worst">
            <div class="badge-icon">⚠️</div>
            <div class="badge-content">
              <div class="badge-label">Needs Improvement</div>
              <div class="badge-name">{{ stats.worstPerforming.name }}</div>
              <div class="badge-detail">Losing ${{ stats.worstPerforming.monthlyLoss.toLocaleString() }}/month</div>
            </div>
          </div>
        </div>
      </div>

      <div class="restaurant-grid">
        <div
          v-for="(restaurant, index) in selectedRestaurants"
          :key="restaurant.placeId"
          class="restaurant-card"
        >
          <button class="remove-btn" @click="removeRestaurant(index)">✕</button>

          <div class="restaurant-header">
            <div class="restaurant-name">{{ restaurant.name }}</div>
            <div class="restaurant-address">{{ restaurant.address }}</div>
            <div class="restaurant-rating">⭐ {{ restaurant.rating }} ({{ restaurant.totalRatings }} reviews)</div>
          </div>

          <div class="restaurant-stats">
            <div class="stat-box">
              <div class="stat-label">SEO Score</div>
              <div class="stat-value" :class="getScoreClass(restaurant.overallScore)">
                {{ restaurant.overallScore }}/100
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Page Speed</div>
              <div class="stat-value" :class="getScoreClass(restaurant.performanceScore)">
                {{ restaurant.performanceScore }}/100
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Monthly Loss</div>
              <div class="stat-value loss">${{ restaurant.monthlyLoss?.toLocaleString() || '0' }}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Visitors</div>
              <div class="stat-value">{{ restaurant.estimatedVisitors?.toLocaleString() || '0' }}</div>
            </div>
          </div>

          <div class="restaurant-actions">
            <button class="btn-view" @click="viewDetails(restaurant)">View Details</button>
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
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'MultiRestaurantDashboard',

  setup() {
    // Load saved restaurants from localStorage
    const savedRestaurants = localStorage.getItem('multiRestaurants');
    const selectedRestaurants = ref(savedRestaurants ? JSON.parse(savedRestaurants) : []);

    const searchQuery = ref('');
    const suggestions = ref([]);
    const showSuggestions = ref(false);
    const searching = ref(false);
    let searchTimeout = null;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

    // Save to localStorage whenever restaurants change
    const saveToLocalStorage = () => {
      localStorage.setItem('multiRestaurants', JSON.stringify(selectedRestaurants.value));
    };

    // Computed statistics
    const stats = computed(() => {
      if (selectedRestaurants.value.length === 0) {
        return null;
      }

      const restaurants = selectedRestaurants.value;

      // Calculate averages
      const avgSeoScore = Math.round(
        restaurants.reduce((sum, r) => sum + r.overallScore, 0) / restaurants.length
      );

      const avgPageSpeed = Math.round(
        restaurants.reduce((sum, r) => sum + r.performanceScore, 0) / restaurants.length
      );

      const totalMonthlyLoss = restaurants.reduce((sum, r) => sum + r.monthlyLoss, 0);

      const totalVisitors = restaurants.reduce((sum, r) => sum + r.estimatedVisitors, 0);

      // Find best and worst performing
      const sortedByScore = [...restaurants].sort((a, b) => b.overallScore - a.overallScore);
      const bestPerforming = sortedByScore[0];
      const worstPerforming = sortedByScore[sortedByScore.length - 1];

      return {
        avgSeoScore,
        avgPageSpeed,
        totalMonthlyLoss,
        totalVisitors,
        bestPerforming,
        worstPerforming
      };
    });

    const onSearchInput = () => {
      clearTimeout(searchTimeout);

      if (searchQuery.value.length < 2) {
        suggestions.value = [];
        showSuggestions.value = false;
        return;
      }

      searching.value = true;
      searchTimeout = setTimeout(async () => {
        await searchRestaurants();
      }, 500); // Debounce for 500ms
    };

    const searchRestaurants = async () => {
      try {
        const response = await axios.get(`${API_URL}/restaurants/search`, {
          params: { query: searchQuery.value, limit: 5 }
        });
        suggestions.value = response.data.results || [];
        showSuggestions.value = true;
      } catch (error) {
        console.error('Search failed:', error);
        suggestions.value = [];
      } finally {
        searching.value = false;
      }
    };

    const addRestaurant = async (restaurant) => {
      try {
        // Check if already added
        const alreadyAdded = selectedRestaurants.value.find(
          r => r.placeId === restaurant.placeId
        );

        if (alreadyAdded) {
          alert('This restaurant is already added');
          return;
        }

        searching.value = true;
        showSuggestions.value = false;

        // Run audit
        const response = await axios.post(`${API_URL}/restaurants/${restaurant.placeId}/audit`, {
          searchQuery: searchQuery.value
        });

        const auditData = response.data.audit;

        const restaurantData = {
          placeId: restaurant.placeId,
          name: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
          totalRatings: restaurant.totalRatings || 0,
          overallScore: auditData.scores?.overall || 0,
          seoScore: auditData.scores?.seo?.score || 0,
          performanceScore: auditData.scores?.pageSpeed?.score || 0,
          estimatedVisitors: auditData.parameters?.monthlyVisitors || 0,
          monthlyLoss: auditData.revenueImpact?.monthly || 0,
          auditData: auditData
        };

        selectedRestaurants.value.push(restaurantData);
        saveToLocalStorage();
        searchQuery.value = '';
        suggestions.value = [];
      } catch (error) {
        console.error('Failed to add restaurant:', error);
        alert(`Failed to add restaurant: ${error.response?.data?.message || error.message}`);
      } finally {
        searching.value = false;
      }
    };

    const removeRestaurant = (index) => {
      selectedRestaurants.value.splice(index, 1);
      saveToLocalStorage();
    };

    const viewDetails = (restaurant) => {
      // Store restaurant data and emit event to switch to main dashboard
      localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
      window.location.reload();
    };

    const getScoreClass = (score) => {
      if (score >= 80) return 'excellent';
      if (score >= 60) return 'good';
      return 'poor';
    };

    // Close suggestions when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-section')) {
        showSuggestions.value = false;
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('click', handleClickOutside);
    }

    return {
      selectedRestaurants,
      searchQuery,
      suggestions,
      showSuggestions,
      searching,
      stats,
      onSearchInput,
      addRestaurant,
      removeRestaurant,
      viewDetails,
      getScoreClass
    };
  }
};
</script>

<style scoped>
.multi-restaurant-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #F9FAFB;
}

.section-header {
  margin-bottom: 40px;
}

/* Search Section */
.search-section {
  position: relative;
  margin-bottom: 40px;
}

.search-input-wrapper {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 16px 50px 16px 20px;
  font-size: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3B82F6;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #6B7280;
}

.searching-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
  color: #6B7280;
  font-size: 14px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 600px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
}

.suggestion-item {
  padding: 16px;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s;
}

.suggestion-item:hover {
  background: #F9FAFB;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.suggestion-address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.suggestion-rating {
  font-size: 14px;
  color: #F59E0B;
}

.btn-add {
  padding: 8px 20px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #2563EB;
}

/* Selected Restaurants */
.selected-restaurants {
  margin-top: 40px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

/* Performance Summary */
.performance-summary {
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
  margin-bottom: 20px;
}

.summary-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-stat {
  text-align: center;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 8px;
}

.summary-stat label {
  display: block;
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.summary-stat .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
}

.summary-stat .stat-value.excellent {
  color: #10B981;
}

.summary-stat .stat-value.good {
  color: #F59E0B;
}

.summary-stat .stat-value.poor {
  color: #EF4444;
}

.summary-stat .stat-value.loss {
  color: #EF4444;
}

.performance-badges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.badge-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.badge-card.best {
  border-left: 4px solid #10B981;
}

.badge-card.worst {
  border-left: 4px solid #EF4444;
}

.badge-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.badge-content {
  flex: 1;
}

.badge-label {
  font-size: 12px;
  color: #6B7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.badge-name {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.badge-detail {
  font-size: 14px;
  color: #6B7280;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.restaurant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 24px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
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
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #EF4444;
  color: white;
}

.restaurant-header {
  margin-bottom: 20px;
}

.restaurant-name {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.restaurant-address {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 6px;
}

.restaurant-rating {
  font-size: 14px;
  color: #F59E0B;
  font-weight: 500;
}

.restaurant-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-box {
  background: #F9FAFB;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
}

.stat-value.excellent {
  color: #10B981;
}

.stat-value.good {
  color: #F59E0B;
}

.stat-value.poor {
  color: #EF4444;
}

.stat-value.loss {
  color: #EF4444;
}

.restaurant-actions {
  display: flex;
  gap: 12px;
}

.btn-view {
  flex: 1;
  padding: 10px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-view:hover {
  background: #2563EB;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
