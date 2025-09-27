<template>
  <section class="bg-white py-8 no-print">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">
          Find Your Restaurant
        </h2>
        <div class="relative">
          <div class="flex">
            <input 
              v-model="searchQuery" 
              @input="debounceSearch"
              @focus="showDropdown = true"
              @keydown.down="navigateDropdown(1)"
              @keydown.up="navigateDropdown(-1)"
              @keydown.enter="selectHighlighted"
              type="text" 
              placeholder="e.g. Talkin Tacos, Miami"
              class="w-full px-6 py-4 text-lg border border-gray-300 rounded-l-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
            <button 
              @click="$emit('run-audit', selectedPlace)"
              :disabled="!selectedPlace || loading"
              class="bg-indigo-600 text-white px-8 py-4 rounded-r-2xl hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-medium flex items-center space-x-2"
            >
              <div v-if="loading" class="loading-spinner"></div>
              <span>{{ loading ? 'Auditing...' : 'Run Audit' }}</span>
            </button>
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
        <div v-if="selectedPlace" class="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-semibold text-indigo-800">{{ selectedPlace.name }}</div>
              <div class="text-sm text-indigo-600">{{ selectedPlace.formatted_address }}</div>
            </div>
            <button 
              @click="clearSelection"
              class="text-indigo-400 hover:text-indigo-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// Mock Google Places service since actual API has CORS restrictions
const mockGooglePlacesService = {
  async searchRestaurants(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockResults = [
      {
        place_id: 'ChIJgUbEo8cfqokR5lP9_Wh_DaM',
        name: "Talkin' Tacos",
        formatted_address: '1234 Ocean Drive, Miami Beach, FL 33139, USA',
        rating: 4.2,
        user_ratings_total: 156
      },
      {
        place_id: 'ChIJXYZ123456789',
        name: 'Taco Bell',
        formatted_address: '5678 Collins Avenue, Miami Beach, FL 33140, USA',
        rating: 3.8,
        user_ratings_total: 89
      },
      {
        place_id: 'ChIJABC987654321',
        name: 'El Taco Loco',
        formatted_address: '9012 Washington Avenue, Miami Beach, FL 33141, USA',
        rating: 4.5,
        user_ratings_total: 234
      }
    ]
    
    // Filter results based on query
    return mockResults.filter(place => 
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes('taco') ||
      query.toLowerCase().includes('miami')
    )
  }
}

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
        const results = await mockGooglePlacesService.searchRestaurants(this.searchQuery)
        this.searchResults = results.slice(0, 5)
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
.search-dropdown {
  max-height: 300px;
  overflow-y: auto;
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>