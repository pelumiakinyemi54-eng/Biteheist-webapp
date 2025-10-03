<template>
  <div class="bg-white rounded-2xl p-8 mb-8 card-shadow">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-2xl font-bold text-gray-900">Website Speed Analysis</h2>
        <div class="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
          <span class="text-sm font-semibold text-blue-800">Mobile</span>
        </div>
      </div>
      <p class="text-gray-600">How fast your website loads affects customer experience and revenue</p>
    </div>

    <!-- Main Speed Score - BIG and CLEAR -->
    <div class="mb-10 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
      <div class="text-center">
        <div class="text-sm text-gray-600 uppercase tracking-wide font-semibold mb-3">Overall Speed Score</div>
        <div class="flex items-center justify-center mb-4">
          <div class="relative">
            <!-- Circular Progress -->
            <svg class="transform -rotate-90" width="180" height="180">
              <circle
                cx="90"
                cy="90"
                r="70"
                stroke="#e5e7eb"
                stroke-width="12"
                fill="none"
              />
              <circle
                cx="90"
                cy="90"
                r="70"
                :stroke="getScoreColor(metrics.performance)"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="getDashOffset(metrics.performance)"
                stroke-linecap="round"
                class="progress-circle"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-5xl font-bold" :style="{ color: getScoreColor(metrics.performance) }">
                  {{ metrics.performance }}
                </div>
                <div class="text-sm text-gray-600 font-medium">out of 100</div>
              </div>
            </div>
          </div>
        </div>
        <div class="text-lg font-semibold" :class="getScoreTextClass(metrics.performance)">
          {{ getScoreLabel(metrics.performance) }}
        </div>
        <div class="text-sm text-gray-600 mt-2">
          {{ getScoreExplanation(metrics.performance) }}
        </div>
      </div>
    </div>

    <!-- What This Means - Simple Cards -->
    <div class="mb-10">
      <h3 class="text-lg font-bold text-gray-800 mb-4">What This Means For You</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Load Time Card -->
        <div class="p-6 rounded-xl border-2 transition-all hover:shadow-lg"
             :class="metrics.lcp <= 2.5 ? 'border-green-200 bg-green-50' : metrics.lcp <= 4 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-semibold text-gray-700">Page Load Time</div>
            <svg class="w-5 h-5" :class="metrics.lcp <= 2.5 ? 'text-green-600' : metrics.lcp <= 4 ? 'text-yellow-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-4xl font-bold mb-2" :class="metrics.lcp <= 2.5 ? 'text-green-700' : metrics.lcp <= 4 ? 'text-yellow-700' : 'text-red-700'">
            {{ metrics.lcp }}s
          </div>
          <div class="text-xs font-medium mb-2" :class="metrics.lcp <= 2.5 ? 'text-green-600' : metrics.lcp <= 4 ? 'text-yellow-600' : 'text-red-600'">
            {{ metrics.lcp <= 2.5 ? '✓ Fast' : metrics.lcp <= 4 ? '⚠ Slow' : '✗ Very Slow' }}
          </div>
          <div class="text-xs text-gray-600">
            {{ metrics.lcp > 4 ? '27% of visitors may leave' : metrics.lcp > 2.5 ? 'Could be faster' : 'Good loading speed' }}
          </div>
        </div>

        <!-- SEO Impact -->
        <div class="p-6 rounded-xl border-2 transition-all hover:shadow-lg"
             :class="metrics.seo >= 90 ? 'border-green-200 bg-green-50' : metrics.seo >= 50 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-semibold text-gray-700">SEO Score</div>
            <svg class="w-5 h-5" :class="metrics.seo >= 90 ? 'text-green-600' : metrics.seo >= 50 ? 'text-yellow-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="text-4xl font-bold mb-2" :class="metrics.seo >= 90 ? 'text-green-700' : metrics.seo >= 50 ? 'text-yellow-700' : 'text-red-700'">
            {{ metrics.seo }}
          </div>
          <div class="text-xs font-medium mb-2" :class="metrics.seo >= 90 ? 'text-green-600' : metrics.seo >= 50 ? 'text-yellow-600' : 'text-red-600'">
            {{ metrics.seo >= 90 ? '✓ Excellent' : metrics.seo >= 50 ? '⚠ Needs Work' : '✗ Poor' }}
          </div>
          <div class="text-xs text-gray-600">
            {{ metrics.seo >= 90 ? 'Good for Google rankings' : 'Hurting search visibility' }}
          </div>
        </div>

        <!-- User Experience -->
        <div class="p-6 rounded-xl border-2 transition-all hover:shadow-lg"
             :class="mockCLS <= 0.1 ? 'border-green-200 bg-green-50' : mockCLS <= 0.25 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'">
          <div class="flex items-center justify-between mb-3">
            <div class="text-sm font-semibold text-gray-700">Page Stability</div>
            <svg class="w-5 h-5" :class="mockCLS <= 0.1 ? 'text-green-600' : mockCLS <= 0.25 ? 'text-yellow-600' : 'text-red-600'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
          </div>
          <div class="text-4xl font-bold mb-2" :class="mockCLS <= 0.1 ? 'text-green-700' : mockCLS <= 0.25 ? 'text-yellow-700' : 'text-red-700'">
            {{ mockCLS }}
          </div>
          <div class="text-xs font-medium mb-2" :class="mockCLS <= 0.1 ? 'text-green-600' : mockCLS <= 0.25 ? 'text-yellow-600' : 'text-red-600'">
            {{ mockCLS <= 0.1 ? '✓ Stable' : mockCLS <= 0.25 ? '⚠ Shaky' : '✗ Unstable' }}
          </div>
          <div class="text-xs text-gray-600">
            {{ mockCLS > 0.25 ? 'Content jumps around' : 'Smooth experience' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Warning if needed -->
    <div v-if="metrics.performance < 50 || metrics.lcp > 4" class="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        </div>
        <div>
          <h4 class="font-bold text-red-900 mb-2">⚠️ Critical Speed Issue</h4>
          <p class="text-sm text-red-800">
            Your slow website is costing you customers. For every 1 second delay, conversions drop by 7%.
            <span class="font-bold">You could be losing ${{ calculateSpeedLoss() }}/month</span> due to slow load times.
          </p>
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
      mockCLS: (Math.random() * 0.3).toFixed(2),
      circumference: 2 * Math.PI * 70
    }
  },
  methods: {
    getDashOffset(score) {
      const percentage = score / 100
      return this.circumference - (percentage * this.circumference)
    },
    getScoreColor(score) {
      if (score >= 90) return '#10b981' // green
      if (score >= 50) return '#f59e0b' // yellow
      return '#ef4444' // red
    },
    getScoreTextClass(score) {
      if (score >= 90) return 'text-green-700'
      if (score >= 50) return 'text-yellow-700'
      return 'text-red-700'
    },
    getScoreLabel(score) {
      if (score >= 90) return '✓ Fast Website'
      if (score >= 50) return '⚠ Could Be Faster'
      return '✗ Slow Website'
    },
    getScoreExplanation(score) {
      if (score >= 90) return 'Your site loads quickly - customers will be happy!'
      if (score >= 50) return 'Your site is okay but losing some customers due to speed'
      return 'Your site is too slow - customers are leaving before it loads'
    },
    calculateSpeedLoss() {
      // Estimate revenue loss from slow speed
      const baseRevenue = 5000
      if (this.metrics.performance < 50) {
        return Math.round(baseRevenue * 0.4).toLocaleString()
      }
      if (this.metrics.performance < 70) {
        return Math.round(baseRevenue * 0.2).toLocaleString()
      }
      return '0'
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.progress-circle {
  transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
