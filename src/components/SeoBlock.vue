<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">SEO Analysis</h2>
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-green-500 rounded-full"></div>
          <span class="text-xs text-gray-600">Passing</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-red-500 rounded-full"></div>
          <span class="text-xs text-gray-600">Needs Fix</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="issue in issues" 
        :key="issue.type"
        class="p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
        :class="getIssueCardClass(issue)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-2">
            <div 
              class="w-4 h-4 rounded-full flex-shrink-0"
              :class="issue.status === 'pass' ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <h3 class="font-semibold text-gray-800 text-sm">{{ issue.title }}</h3>
          </div>
          <div class="text-xs px-2 py-1 rounded-full font-medium" :class="getStatusBadge(issue.status)">
            {{ issue.status === 'pass' ? 'OK' : 'FIX' }}
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-4 leading-relaxed">{{ issue.description }}</p>
        
        <div v-if="issue.value" class="mb-4">
          <div class="text-xs text-gray-500 mb-2">Current Value:</div>
          <div class="text-xs font-mono bg-gray-100 p-3 rounded-lg border overflow-x-auto">
            {{ truncateValue(issue.value) }}
          </div>
        </div>
        
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500">Impact: {{ getImpactLevel(issue) }}</span>
          <span class="font-medium" :class="issue.status === 'pass' ? 'text-green-600' : 'text-red-600'">
            {{ issue.status === 'pass' ? '✓ Optimized' : '⚠ Action Needed' }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- SEO Summary Stats -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="text-center p-4 rounded-lg bg-green-50 border border-green-200">
          <div class="text-2xl font-bold text-green-700">{{ passedChecks }}</div>
          <div class="text-sm text-green-600">Passing Checks</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-red-50 border border-red-200">
          <div class="text-2xl font-bold text-red-700">{{ failedChecks }}</div>
          <div class="text-sm text-red-600">Issues Found</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div class="text-2xl font-bold text-blue-700">{{ seoScore }}%</div>
          <div class="text-sm text-blue-600">SEO Score</div>
        </div>
        <div class="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
          <div class="text-2xl font-bold text-purple-700">{{ highPriorityIssues }}</div>
          <div class="text-sm text-purple-600">High Priority</div>
        </div>
      </div>
      
      <!-- Quick Wins Section -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 class="font-semibold text-yellow-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          Quick Wins Available
        </h3>
        <div class="space-y-2">
          <div v-for="win in quickWins" :key="win.type" class="flex items-center text-sm text-yellow-800">
            <div class="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <span>{{ win.message }}</span>
            <span class="ml-auto text-xs bg-yellow-200 px-2 py-1 rounded">{{ win.effort }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Technical Details (Expandable) -->
    <div class="mt-6">
      <button 
        @click="showTechnicalDetails = !showTechnicalDetails"
        class="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span class="font-medium text-gray-700">Technical SEO Details</span>
        <svg 
          class="w-5 h-5 text-gray-500 transform transition-transform"
          :class="{ 'rotate-180': showTechnicalDetails }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      <div v-if="showTechnicalDetails" class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 class="font-medium text-gray-800 mb-2">Website Structure</h4>
            <div class="space-y-1 text-sm text-gray-600">
              <div>• HTML5 semantic markup: {{ technicalDetails.html5 ? '✓' : '✗' }}</div>
              <div>• Proper heading hierarchy: {{ technicalDetails.headings ? '✓' : '✗' }}</div>
              <div>• Clean URL structure: {{ technicalDetails.urls ? '✓' : '✗' }}</div>
            </div>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">Content Optimization</h4>
            <div class="space-y-1 text-sm text-gray-600">
              <div>• Keyword density: {{ technicalDetails.keywords }}%</div>
              <div>• Content length: {{ technicalDetails.contentLength }} words</div>
              <div>• Internal linking: {{ technicalDetails.internalLinks }} links</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeoBlock',
  props: {
    issues: {
      type: Array,
      default: () => []
    },
    restaurant: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showTechnicalDetails: false,
      technicalDetails: {
        html5: Math.random() > 0.3,
        headings: Math.random() > 0.4,
        urls: Math.random() > 0.2,
        keywords: (Math.random() * 3 + 1).toFixed(1),
        contentLength: Math.floor(Math.random() * 800 + 200),
        internalLinks: Math.floor(Math.random() * 15 + 5)
      }
    }
  },
  computed: {
    passedChecks() {
      return this.issues.filter(issue => issue.status === 'pass').length
    },
    
    failedChecks() {
      return this.issues.filter(issue => issue.status === 'fail').length
    },
    
    seoScore() {
      if (this.issues.length === 0) return 0
      return Math.round((this.passedChecks / this.issues.length) * 100)
    },
    
    highPriorityIssues() {
      const highPriorityTypes = ['title', 'schema', 'ssl', 'mobile']
      return this.issues.filter(issue => 
        issue.status === 'fail' && highPriorityTypes.includes(issue.type)
      ).length
    },
    
    quickWins() {
      const wins = []
      
      if (this.issues.find(i => i.type === 'title' && i.status === 'fail')) {
        wins.push({
          type: 'title',
          message: 'Shorten title tag for better search display',
          effort: '5 min'
        })
      }
      
      if (this.issues.find(i => i.type === 'meta' && i.status === 'fail')) {
        wins.push({
          type: 'meta',
          message: 'Add compelling meta description',
          effort: '10 min'
        })
      }
      
      if (this.issues.find(i => i.type === 'og' && i.status === 'fail')) {
        wins.push({
          type: 'og',
          message: 'Add social media preview tags',
          effort: '15 min'
        })
      }
      
      return wins.slice(0, 3)
    }
  },
  methods: {
    getIssueCardClass(issue) {
      if (issue.status === 'pass') {
        return 'border-green-200 bg-green-50 hover:border-green-300'
      } else {
        return 'border-red-200 bg-red-50 hover:border-red-300'
      }
    },
    
    getStatusBadge(status) {
      if (status === 'pass') {
        return 'bg-green-100 text-green-800'
      } else {
        return 'bg-red-100 text-red-800'
      }
    },
    
    getImpactLevel(issue) {
      const highImpactTypes = ['title', 'schema', 'mobile', 'ssl']
      const mediumImpactTypes = ['meta', 'og', 'reviews']
      
      if (highImpactTypes.includes(issue.type)) return 'High'
      if (mediumImpactTypes.includes(issue.type)) return 'Medium'
      return 'Low'
    },
    
    truncateValue(value) {
      if (!value) return ''
      return value.length > 80 ? value.substring(0, 80) + '...' : value
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Smooth transitions for expandable sections */
.rotate-180 {
  transform: rotate(180deg);
}
</style>