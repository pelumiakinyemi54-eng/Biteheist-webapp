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
              <h3 class="font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {{ action.title }}
              </h3>
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
          <div class="flex items-center space-x-2 ml-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-800">{{ getEffortLevel(action) }}</div>
              <div class="text-xs text-gray-500">effort</div>
            </div>
            <button 
              @click="toggleExpanded(index)"
              class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg 
                class="w-5 h-5 transform transition-transform" 
                :class="{ 'rotate-180': expandedItems.includes(index) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Expanded Details -->
        <div 
          v-if="expandedItems.includes(index)"
          class="pt-4 border-t border-gray-200 animate-slide-up"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h4 class="font-medium text-gray-800 mb-2">Implementation Steps</h4>
              <div class="space-y-2">
                <div v-for="step in getImplementationSteps(action)" :key="step" class="flex items-start text-sm text-gray-600">
                  <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>{{ step }}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">Expected Results</h4>
              <div class="space-y-2">
                <div v-for="result in getExpectedResults(action)" :key="result" class="flex items-start text-sm text-gray-600">
                  <div class="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>{{ result }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Button -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="text-sm text-gray-500">
              Estimated completion: {{ action.timeframe || getEstimatedTime(action) }}
            </div>
            <button 
              @click="startAction(action)"
              class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              <span>Start Fix (Phase 3)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Stats -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-4 rounded-lg bg-red-50 border border-red-200">
          <div class="text-2xl font-bold text-red-700">{{ highPriorityCount }}</div>
          <div class="text-sm text-red-600">High Priority</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div class="text-2xl font-bold text-yellow-700">{{ mediumPriorityCount }}</div>
          <div class="text-sm text-yellow-600">Medium Priority</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div class="text-2xl font-bold text-blue-700">{{ quickWinsCount }}</div>
          <div class="text-sm text-blue-600">Quick Wins</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-green-50 border border-green-200">
          <div class="text-2xl font-bold text-green-700">+{{ potentialScoreIncrease }}</div>
          <div class="text-sm text-green-600">Score Boost Potential</div>
        </div>
      </div>
      
      <!-- Call to Action -->
      <div class="text-center p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Ready to Fix These Issues?</h3>
        <p class="text-gray-600 mb-4 max-w-2xl mx-auto">
          Our automated fix engine can implement {{ autoFixableCount }} of these improvements 
          and boost your SEO score by an estimated {{ potentialScoreIncrease }} points.
        </p>
        <button class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <span>Start Auto-Fix Engine ($99/mo)</span>
        </button>
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
      expandedItems: [],
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
    }
  },
  methods: {
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
    },
    
    toggleExpanded(index) {
      const expandedIndex = this.expandedItems.indexOf(index)
      if (expandedIndex > -1) {
        this.expandedItems.splice(expandedIndex, 1)
      } else {
        this.expandedItems.push(index)
      }
    },
    
    getImplementationSteps(action) {
      const steps = {
        'title': [
          'Audit current title tags across all pages',
          'Optimize length to under 60 characters',
          'Include primary keywords naturally',
          'Test and deploy changes'
        ],
        'schema': [
          'Research relevant schema types for restaurant',
          'Implement Restaurant schema markup',
          'Add menu, hours, and location data',
          'Validate markup with Google tools'
        ],
        'reviews': [
          'Identify all unanswered reviews',
          'Craft personalized responses',
          'Set up review monitoring system',
          'Create response templates for future use'
        ]
      }
      
      const key = Object.keys(steps).find(k => 
        action.title.toLowerCase().includes(k)
      )
      
      return key ? steps[key] : [
        'Analyze current implementation',
        'Plan optimization strategy',
        'Execute changes carefully',
        'Monitor results and adjust'
      ]
    },
    
    getExpectedResults(action) {
      const results = {
        'title': [
          'Improved click-through rates from search',
          'Better search result appearance',
          'Enhanced keyword relevance'
        ],
        'schema': [
          'Rich snippets in search results',
          'Increased visibility and clicks',
          'Better local search performance'
        ],
        'reviews': [
          'Improved customer relationships',
          'Higher overall rating average',
          'Better local SEO signals'
        ]
      }
      
      const key = Object.keys(results).find(k => 
        action.title.toLowerCase().includes(k)
      )
      
      return key ? results[key] : [
        'Improved SEO performance',
        'Better user experience',
        'Higher search rankings'
      ]
    },
    
    startAction(action) {
      // This would integrate with Phase 3 auto-fix engine
      alert(`Starting auto-fix for: ${action.title}\n\nThis feature will be available in Phase 3 of the BiteHeist platform.`)
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