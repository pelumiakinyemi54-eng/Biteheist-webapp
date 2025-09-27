<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">PageSpeed Insights</h2>
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        <span>Mobile Analysis</span>
      </div>
    </div>
    
    <!-- Core Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="text-center p-6 rounded-xl border-2 border-gray-200 hover:shadow-md transition-all duration-200">
        <div class="mb-4">
          <div 
            class="text-4xl font-bold mb-2 transition-all duration-1000" 
            :class="getScoreColor(metrics.performance)"
          >
            {{ metrics.performance }}
          </div>
          <div class="text-sm font-medium text-gray-700">Performance</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            class="h-3 rounded-full transition-all duration-1500" 
            :class="getScoreBarColor(metrics.performance)"
            :style="`width: ${metrics.performance}%`"
          ></div>
        </div>
        <div class="text-xs text-gray-500">{{ getScoreDescription(metrics.performance) }}</div>
      </div>
      
      <div class="text-center p-6 rounded-xl border-2 border-gray-200 hover:shadow-md transition-all duration-200">
        <div class="mb-4">
          <div 
            class="text-4xl font-bold mb-2 transition-all duration-1000" 
            :class="getScoreColor(metrics.seo)"
          >
            {{ metrics.seo }}
          </div>
          <div class="text-sm font-medium text-gray-700">SEO</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            class="h-3 rounded-full transition-all duration-1500" 
            :class="getScoreBarColor(metrics.seo)"
            :style="`width: ${metrics.seo}%`"
          ></div>
        </div>
        <div class="text-xs text-gray-500">{{ getScoreDescription(metrics.seo) }}</div>
      </div>
      
      <div class="text-center p-6 rounded-xl border-2 border-gray-200 hover:shadow-md transition-all duration-200">
        <div class="mb-4">
          <div 
            class="text-4xl font-bold mb-2 transition-all duration-1000" 
            :class="getLCPColor(metrics.lcp)"
          >
            {{ metrics.lcp }}s
          </div>
          <div class="text-sm font-medium text-gray-700">LCP</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            class="h-3 rounded-full transition-all duration-1500" 
            :class="getLCPBarColor(metrics.lcp)"
            :style="`width: ${getLCPPercentage(metrics.lcp)}%`"
          ></div>
        </div>
        <div class="text-xs" :class="metrics.lcp > 4 ? 'text-red-500' : 'text-green-500'">
          {{ metrics.lcp > 4 ? '27% traffic loss risk' : 'Good loading speed' }}
        </div>
      </div>
      
      <div class="text-center p-6 rounded-xl border-2 border-gray-200 hover:shadow-md transition-all duration-200">
        <div class="mb-4">
          <div 
            class="text-4xl font-bold mb-2 transition-all duration-1000" 
            :class="getScoreColor(metrics.accessibility)"
          >
            {{ metrics.accessibility }}
          </div>
          <div class="text-sm font-medium text-gray-700">Accessibility</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div 
            class="h-3 rounded-full transition-all duration-1500" 
            :class="getScoreBarColor(metrics.accessibility)"
            :style="`width: ${metrics.accessibility}%`"
          ></div>
        </div>
        <div class="text-xs text-gray-500">{{ getScoreDescription(metrics.accessibility) }}</div>
      </div>
    </div>
    
    <!-- Core Web Vitals Section -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Core Web Vitals
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Largest Contentful Paint</span>
            <span class="text-xs px-2 py-1 rounded-full" :class="getLCPBadge(metrics.lcp)">
              {{ metrics.lcp > 4 ? 'Poor' : metrics.lcp > 2.5 ? 'Needs Improvement' : 'Good' }}
            </span>
          </div>
          <div class="text-2xl font-bold" :class="getLCPColor(metrics.lcp)">{{ metrics.lcp }}s</div>
          <div class="text-xs text-gray-500 mt-1">Target: &lt; 2.5s</div>
        </div>
        
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">First Input Delay</span>
            <span class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Good</span>
          </div>
          <div class="text-2xl font-bold text-green-600">{{ mockFID }}ms</div>
          <div class="text-xs text-gray-500 mt-1">Target: &lt; 100ms</div>
        </div>
        
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Cumulative Layout Shift</span>
            <span class="text-xs px-2 py-1 rounded-full" :class="getCLSBadge(mockCLS)">
              {{ mockCLS > 0.25 ? 'Poor' : mockCLS > 0.1 ? 'Needs Improvement' : 'Good' }}
            </span>
          </div>
          <div class="text-2xl font-bold" :class="getCLSColor(mockCLS)">{{ mockCLS }}</div>
          <div class="text-xs text-gray-500 mt-1">Target: &lt; 0.1</div>
        </div>
      </div>
    </div>
    
    <!-- Performance Opportunities -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        Performance Opportunities
      </h3>
      
      <div class="space-y-3">
        <div v-for="opportunity in performanceOpportunities" :key="opportunity.type" 
             class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex-1">
            <div class="font-medium text-gray-800 mb-1">{{ opportunity.title }}</div>
            <div class="text-sm text-gray-600">{{ opportunity.description }}</div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="text-right">
              <div class="text-sm font-semibold text-indigo-600">{{ opportunity.savings }}</div>
              <div class="text-xs text-gray-500">potential savings</div>
            </div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="opportunity.priority === 'high' ? 'bg-red-100 text-red-600' : opportunity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Technical Recommendations -->
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="font-semibold text-blue-800 mb-3 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Critical Speed Issues
      </h3>
      <div class="space-y-2 text-sm text-blue-800">
        <div v-for="issue in criticalIssues" :key="issue.type" class="flex items-start">
          <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
          <span>{{ issue.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageSpeedBlock',
  props: {
    metrics: {
      type: Object,
      default: () => ({
        performance: 0,
        seo: 0,
        lcp: 0,
        accessibility: 0,
        bestPractices: 0
      })
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      mockFID: Math.floor(Math.random() * 150 + 50),
      mockCLS: (Math.random() * 0.3).toFixed(3),
      performanceOpportunities: [
        {
          type: 'images',
          title: 'Properly size images',
          description: 'Serve images that are appropriately-sized to save cellular data and improve load time',
          savings: '0.8s',
          priority: 'high'
        },
        {
          type: 'render-blocking',
          title: 'Eliminate render-blocking resources',
          description: 'Remove or defer JavaScript and CSS that delay first contentful paint',
          savings: '0.6s',
          priority: 'high'
        },
        {
          type: 'unused-css',
          title: 'Remove unused CSS',
          description: 'Remove dead rules from stylesheets to reduce unnecessary bytes',
          savings: '0.3s',
          priority: 'medium'
        },
        {
          type: 'caching',
          title: 'Serve static assets with efficient cache policy',
          description: 'A long cache lifetime can speed up repeat visits',
          savings: '0.4s',
          priority: 'medium'
        }
      ],
      criticalIssues: []
    }
  },
  computed: {
    criticalIssuesComputed() {
      const issues = []
      
      if (this.metrics.lcp > 4) {
        issues.push({
          type: 'lcp',
          message: `LCP of ${this.metrics.lcp}s may cause 27% of visitors to abandon your site`
        })
      }
      
      if (this.metrics.performance < 50) {
        issues.push({
          type: 'performance',
          message: 'Poor performance score affects search engine rankings'
        })
      }
      
      if (this.mockCLS > 0.25) {
        issues.push({
          type: 'cls',
          message: 'High layout shifts create poor user experience'
        })
      }
      
      return issues
    }
  },
  methods: {
    getScoreColor(score) {
      if (score >= 90) return 'text-green-600'
      if (score >= 50) return 'text-yellow-600'
      return 'text-red-600'
    },
    
    getScoreBarColor(score) {
      if (score >= 90) return 'bg-green-500'
      if (score >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    },
    
    getScoreDescription(score) {
      if (score >= 90) return 'Good'
      if (score >= 50) return 'Needs Improvement'
      return 'Poor'
    },
    
    getLCPColor(lcp) {
      if (lcp <= 2.5) return 'text-green-600'
      if (lcp <= 4) return 'text-yellow-600'
      return 'text-red-600'
    },
    
    getLCPBarColor(lcp) {
      if (lcp <= 2.5) return 'bg-green-500'
      if (lcp <= 4) return 'bg-yellow-500'
      return 'bg-red-500'
    },
    
    getLCPPercentage(lcp) {
      // Convert LCP seconds to percentage (inverse relationship)
      return Math.max(10, 100 - (lcp * 15))
    },
    
    getLCPBadge(lcp) {
      if (lcp <= 2.5) return 'bg-green-100 text-green-800'
      if (lcp <= 4) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    },
    
    getCLSColor(cls) {
      if (cls <= 0.1) return 'text-green-600'
      if (cls <= 0.25) return 'text-yellow-600'
      return 'text-red-600'
    },
    
    getCLSBadge(cls) {
      if (cls <= 0.1) return 'bg-green-100 text-green-800'
      if (cls <= 0.25) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
  },
  
  mounted() {
    this.criticalIssues = this.criticalIssuesComputed
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Progress bar animation */
.progress-bar {
  transition: width 1.5s ease-out;
}
</style>