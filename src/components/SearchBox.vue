<template>
  <section class="search-section no-print">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-3xl mx-auto">
        <!-- Section Header -->
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Find Your Restaurant
          </h2>
          <p class="text-gray-600 text-lg">
            Enter your restaurant name and location to get started
          </p>
        </div>

        <!-- Enhanced Search Box -->
        <div class="search-box-wrapper">
          <div class="relative">
            <div class="flex items-stretch shadow-xl rounded-2xl overflow-hidden border-2 border-blue-100 hover:border-blue-300 transition-all">
              <!-- Search Icon -->
              <div class="flex items-center justify-center px-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              <!-- Input Field -->
              <input
                v-model="searchQuery"
                @input="debounceSearch"
                @focus="showDropdown = true"
                @keydown.down="navigateDropdown(1)"
                @keydown.up="navigateDropdown(-1)"
                @keydown.enter="selectHighlighted"
                type="text"
                placeholder="Search for your restaurant (e.g., Pizza Place, New York)"
                class="flex-1 px-6 py-5 text-lg border-0 focus:ring-0 outline-none bg-white"
              >

              <!-- Run Audit Button -->
              <button
                @click="$emit('run-audit', selectedPlace)"
                :disabled="!selectedPlace || loading"
                class="audit-button group"
                :class="{ 'opacity-50 cursor-not-allowed': !selectedPlace || loading }"
              >
                <div v-if="loading" class="flex items-center space-x-2">
                  <div class="loading-spinner-white"></div>
                  <span class="font-semibold">Analyzing...</span>
                </div>
                <div v-else class="flex items-center space-x-2">
                  <span class="font-semibold">Run Audit</span>
                  <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Search Results Dropdown -->
          <div 
            v-if="showDropdown && searchResults.length > 0" 
            class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl mt-2 shadow-lg z-50 search-dropdown"
          >
            <div 
              v-for="(place, index) in searchResults" 
              :key="place.place_id"
              @click="selectPlace(place)"
              :class="[
                'px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors',
                { 'bg-indigo-50': index === highlightedIndex }
              ]"
            >
              <div class="font-medium text-gray-800">{{ place.name }}</div>
              <div class="text-sm text-gray-500">{{ place.formatted_address }}</div>
              <div class="flex items-center mt-1">
                <div class="flex text-yellow-400 text-sm">
                  <span v-for="i in 5" :key="i">
                    {{ i <= Math.floor(place.rating || 0) ? '★' : '☆' }}
                  </span>
                </div>
                <span class="ml-2 text-sm text-gray-600">
                  {{ place.rating ? place.rating.toFixed(1) : 'No rating' }}
                </span>
                <span class="ml-2 text-xs text-gray-400">
                  ({{ place.user_ratings_total || 0 }} reviews)
                </span>
              </div>
            </div>
          </div>
          
          <!-- No Results Message -->
          <div 
            v-if="showDropdown && searchQuery.length > 2 && searchResults.length === 0 && !searchLoading"
            class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl mt-2 shadow-lg z-50 px-6 py-4"
          >
            <div class="text-gray-500 text-center">
              No restaurants found. Try a different search term.
            </div>
          </div>
          
          <!-- Search Loading -->
          <div 
            v-if="showDropdown && searchLoading"
            class="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-2xl mt-2 shadow-lg z-50 px-6 py-4"
          >
            <div class="flex items-center justify-center text-gray-500">
              <div class="loading-spinner mr-2"></div>
              Searching restaurants...
            </div>
          </div>
        </div>
        
        <!-- Selected Restaurant Display -->
        <div v-if="selectedPlace" class="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg animate-fadeIn">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div>
                <div class="text-sm text-green-700 font-medium uppercase tracking-wide mb-1">Selected Restaurant</div>
                <div class="font-bold text-gray-900 text-lg mb-1">{{ selectedPlace.name }}</div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {{ selectedPlace.formatted_address }}
                </div>
              </div>
            </div>
            <button
              @click="clearSelection"
              class="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Clear selection"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || ''

export default {
  name: 'SearchBox',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['run-audit'],
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      selectedPlace: null,
      showDropdown: false,
      searchLoading: false,
      highlightedIndex: -1,
      debounceTimeout: null
    }
  },
  methods: {
    debounceSearch() {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(() => {
        this.searchRestaurants()
      }, 300)
    },

    async searchRestaurants() {
      if (this.searchQuery.length < 3) {
        this.searchResults = []
        return
      }

      this.searchLoading = true
      this.highlightedIndex = -1

      try {
        const response = await axios.get(`${BACKEND_URL}/api/restaurants/search`, {
          params: {
            query: this.searchQuery,
            limit: 5
          }
        })

        if (response.data && response.data.success) {
          this.searchResults = response.data.results.map(place => ({
            place_id: place.placeId || place.place_id,
            name: place.name,
            formatted_address: place.address || place.formatted_address,
            rating: place.rating,
            user_ratings_total: place.totalRatings || place.user_ratings_total
          }))
        } else {
          this.searchResults = []
        }
      } catch (error) {
        console.error('Search error:', error)
        this.searchResults = []
      } finally {
        this.searchLoading = false
      }
    },
    
    selectPlace(place) {
      this.selectedPlace = place
      this.searchQuery = `${place.name}, ${place.formatted_address.split(',')[1]?.trim() || ''}`
      this.showDropdown = false
      this.highlightedIndex = -1
    },
    
    clearSelection() {
      this.selectedPlace = null
      this.searchQuery = ''
      this.searchResults = []
    },
    
    navigateDropdown(direction) {
      if (this.searchResults.length === 0) return
      
      this.highlightedIndex += direction
      
      if (this.highlightedIndex < 0) {
        this.highlightedIndex = this.searchResults.length - 1
      } else if (this.highlightedIndex >= this.searchResults.length) {
        this.highlightedIndex = 0
      }
    },
    
    selectHighlighted() {
      if (this.highlightedIndex >= 0 && this.searchResults[this.highlightedIndex]) {
        this.selectPlace(this.searchResults[this.highlightedIndex])
      } else if (this.selectedPlace) {
        this.$emit('run-audit', this.selectedPlace)
      }
    }
  },
  
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showDropdown = false
      }
    })
    
    // Pre-populate for demo purposes
    this.selectedPlace = {
      place_id: 'ChIJgUbEo8cfqokR5lP9_Wh_DaM',
      name: "Talkin' Tacos",
      formatted_address: '1234 Ocean Drive, Miami Beach, FL 33139, USA',
      rating: 4.2,
      user_ratings_total: 156
    }
    this.searchQuery = "Talkin' Tacos, Miami Beach"
  },
  
  beforeUnmount() {
    clearTimeout(this.debounceTimeout)
  }
}
</script>

<style scoped>
.search-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.search-box-wrapper {
  position: relative;
}

.audit-button {
  padding: 0 32px;
  background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
  color: white;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
}

.audit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
  box-shadow: 0 8px 24px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.audit-button:active:not(:disabled) {
  transform: translateY(0);
}

.search-dropdown {
  max-height: 400px;
  overflow-y: auto;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.loading-spinner-white {
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for dropdown */
.search-dropdown::-webkit-scrollbar {
  width: 6px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: #c7d2fe;
  border-radius: 10px;
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: #a5b4fc;
}
</style>