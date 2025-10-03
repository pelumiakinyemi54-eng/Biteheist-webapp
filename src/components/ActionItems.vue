<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">Priority Action Items</h2>
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2 text-sm">
          <span class="text-gray-600">Sort by:</span>
          <select 
            v-model="sortBy" 
            class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="priority">Priority</option>
            <option value="impact">Impact</option>
            <option value="effort">Effort</option>
          </select>
        </div>
        <div class="text-sm text-gray-500">
          {{ filteredItems.length }} actions
        </div>
      </div>
    </div>
    
    <!-- Filter Tabs -->
    <div class="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      <button 
        v-for="filter in filterTabs" 
        :key="filter.key"
        @click="activeFilter = filter.key"
        class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200"
        :class="activeFilter === filter.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'"
      >
        {{ filter.label }}
        <span class="ml-2 text-xs px-2 py-1 rounded-full" :class="activeFilter === filter.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-600'">
          {{ getFilterCount(filter.key) }}
        </span>
      </button>
    </div>
    
    <!-- Action Items List -->
    <div class="space-y-4">
      <div 
        v-for="(action, index) in filteredItems" 
        :key="`${action.title}-${index}`"
        class="group border border-gray-200 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
        :class="{ 'bg-red-50 border-red-200': action.priority === 'High' && activeFilter === 'high' }"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start space-x-4 flex-1">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
              :class="getPriorityBadgeClass(action.priority)"
            >
              {{ getSortedIndex(action) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {{ action.title }}
                </h3>
                <div class="ml-4 text-right flex-shrink-0">
                  <div class="text-xl font-bold text-green-600">
                    +${{ action.estimatedRevenue?.toLocaleString() || getRevenueEstimate(action).toLocaleString() }}
                  </div>
                  <div class="text-xs text-gray-500">monthly gain</div>
                </div>
              </div>
              <p class="text-gray-600 text-sm mb-3 leading-relaxed">
                {{ action.description }}
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <span 
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="getPriorityClass(action.priority)"
                >
                  <div 
                    class="w-2 h-2 rounded-full mr-2"
                    :class="getPriorityDotClass(action.priority)"
                  ></div>
                  {{ action.priority }} Priority
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  {{ action.impact }}
                </span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ action.timeframe || getEstimatedTime(action) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center ml-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-800">{{ getEffortLevel(action) }}</div>
              <div class="text-xs text-gray-500">effort</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats with Revenue Focus -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-5 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <div class="text-3xl font-extrabold text-green-700">+${{ totalRevenueGain.toLocaleString() }}</div>
          <div class="text-sm font-medium text-green-800 mt-1">Total Monthly Gain</div>
          <div class="text-xs text-green-600 mt-1">If all fixes completed</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-red-50 border border-red-200">
          <div class="text-2xl font-bold text-red-700">{{ highPriorityCount }}</div>
          <div class="text-sm text-red-600 mt-1">High Priority</div>
          <div class="text-xs text-red-500">${{ highPriorityRevenue.toLocaleString() }}/mo gain</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div class="text-2xl font-bold text-blue-700">{{ quickWinsCount }}</div>
          <div class="text-sm text-blue-600 mt-1">Quick Wins</div>
          <div class="text-xs text-blue-500">${{ quickWinRevenue.toLocaleString() }}/mo gain</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div class="text-2xl font-bold text-purple-700">{{ autoFixableCount }}</div>
          <div class="text-sm text-purple-600 mt-1">Auto-Fixable</div>
          <div class="text-xs text-purple-500">Save {{ estimatedHours }}+ hours</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionItems',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    score: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      sortBy: 'priority',
      activeFilter: 'all',
      filterTabs: [
        { key: 'all', label: 'All Items' },
        { key: 'high', label: 'High Priority' },
        { key: 'quick', label: 'Quick Wins' },
        { key: 'technical', label: 'Technical' }
      ]
    }
  },
  computed: {
    sortedItems() {
      const sorted = [...this.items].sort((a, b) => {
        switch (this.sortBy) {
          case 'priority':
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 }
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
          case 'impact':
            return this.getImpactScore(b) - this.getImpactScore(a)
          case 'effort':
            const effortOrder = { 'Low': 1, 'Medium': 2, 'High': 3 }
            return (effortOrder[a.effort] || 2) - (effortOrder[b.effort] || 2)
          default:
            return 0
        }
      })
      return sorted
    },
    
    filteredItems() {
      switch (this.activeFilter) {
        case 'high':
          return this.sortedItems.filter(item => item.priority === 'High')
        case 'quick':
          return this.sortedItems.filter(item => this.isQuickWin(item))
        case 'technical':
          return this.sortedItems.filter(item => this.isTechnical(item))
        default:
          return this.sortedItems
      }
    },
    
    highPriorityCount() {
      return this.items.filter(item => item.priority === 'High').length
    },
    
    mediumPriorityCount() {
      return this.items.filter(item => item.priority === 'Medium').length
    },
    
    quickWinsCount() {
      return this.items.filter(item => this.isQuickWin(item)).length
    },
    
    autoFixableCount() {
      return this.items.filter(item => this.isAutoFixable(item)).length
    },
    
    potentialScoreIncrease() {
      return Math.min(25, this.items.length * 3 + Math.floor(Math.random() * 10))
    },

    totalRevenueGain() {
      return this.items.reduce((sum, item) => {
        return sum + (item.estimatedRevenue || this.getRevenueEstimate(item))
      }, 0)
    },

    highPriorityRevenue() {
      return this.items
        .filter(item => item.priority === 'High')
        .reduce((sum, item) => sum + (item.estimatedRevenue || this.getRevenueEstimate(item)), 0)
    },

    quickWinRevenue() {
      return this.items
        .filter(item => this.isQuickWin(item))
        .reduce((sum, item) => sum + (item.estimatedRevenue || this.getRevenueEstimate(item)), 0)
    },

    estimatedHours() {
      return this.autoFixableCount * 2 // Assume 2 hours saved per auto-fixable item
    }
  },
  methods: {
    getRevenueEstimate(action) {
      // Return existing estimate or calculate based on priority
      if (action.estimatedRevenue) return action.estimatedRevenue

      switch (action.priority) {
        case 'high':
        case 'High':
          return 800 + Math.floor(Math.random() * 400) // $800-1200
        case 'medium':
        case 'Medium':
          return 400 + Math.floor(Math.random() * 200) // $400-600
        default:
          return 200 + Math.floor(Math.random() * 100) // $200-300
      }
    },

    getFilterCount(filterKey) {
      switch (filterKey) {
        case 'high':
          return this.items.filter(item => item.priority === 'High').length
        case 'quick':
          return this.items.filter(item => this.isQuickWin(item)).length
        case 'technical':
          return this.items.filter(item => this.isTechnical(item)).length
        default:
          return this.items.length
      }
    },
    
    isQuickWin(item) {
      const quickWinTitles = ['title', 'meta', 'og', 'alt']
      return quickWinTitles.some(keyword => 
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    },
    
    isTechnical(item) {
      const technicalKeywords = ['schema', 'ssl', 'core web vitals', 'pagespeed', 'mobile']
      return technicalKeywords.some(keyword => 
        item.title.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      )
    },
    
    isAutoFixable(item) {
      const autoFixable = ['title', 'meta', 'og', 'schema', 'image']
      return autoFixable.some(keyword => 
        item.title.toLowerCase().includes(keyword)
      )
    },
    
    getPriorityBadgeClass(priority) {
      switch (priority) {
        case 'High':
          return 'bg-red-100 text-red-700'
        case 'Medium':
          return 'bg-yellow-100 text-yellow-700'
        default:
          return 'bg-green-100 text-green-700'
      }
    },
    
    getPriorityClass(priority) {
      switch (priority) {
        case 'High':
          return 'bg-red-100 text-red-800'
        case 'Medium':
          return 'bg-yellow-100 text-yellow-800'
        default:
          return 'bg-green-100 text-green-800'
      }
    },
    
    getPriorityDotClass(priority) {
      switch (priority) {
        case 'High':
          return 'bg-red-500'
        case 'Medium':
          return 'bg-yellow-500'
        default:
          return 'bg-green-500'
      }
    },
    
    getEffortLevel(action) {
      if (action.effort) return action.effort
      
      // Determine effort based on action type
      if (this.isQuickWin(action)) return 'Low'
      if (this.isTechnical(action)) return 'High'
      return 'Medium'
    },
    
    getEstimatedTime(action) {
      if (action.timeframe) return action.timeframe
      
      const effort = this.getEffortLevel(action)
      switch (effort) {
        case 'Low': return '1-2 days'
        case 'High': return '1-2 weeks'
        default: return '3-5 days'
      }
    },
    
    getImpactScore(item) {
      if (item.impact.includes('+')) {
        const match = item.impact.match(/(\d+)/)
        return match ? parseInt(match[1]) : 0
      }
      return 5 // default impact score
    },
    
    getSortedIndex(action) {
      return this.filteredItems.indexOf(action) + 1
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
.group {
  transition: all 0.2s ease;
}
</style>