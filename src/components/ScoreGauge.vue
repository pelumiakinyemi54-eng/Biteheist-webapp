<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <!-- Revenue Loss Alert - PROMINENT -->
    <div class="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-8 mb-6 rounded-lg">
      <div class="text-center">
        <div class="flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-2xl font-bold text-gray-900">Your SEO Problems Are Costing You</h3>
        </div>
        <div class="mb-4">
          <div class="revenue-loss mb-2">
            <AnimatedCounter
              :value="revenueImpact?.monthly || 0"
              prefix="$"
              :duration="2000"
            />
          </div>
          <div class="text-xl text-gray-700 font-medium">Every Month</div>
        </div>
        <div class="text-base text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
          That's <span class="font-bold text-red-600">
            <AnimatedCounter
              :value="revenueImpact?.annual || 0"
              prefix="$"
              :duration="2000"
            />
          </span> lost annually in potential revenue
        </div>
      </div>
    </div>

    <h2 class="text-xl font-bold text-gray-800 mb-6">Revenue Impact Breakdown</h2>

    <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
      <!-- Animated Revenue Loss Gauge -->
      <div class="flex-shrink-0">
        <AnimatedGauge
          :value="revenueImpact?.monthly || 0"
          :maxValue="10000"
          :size="300"
          :stroke-width="24"
          label="Revenue Lost"
          sublabel="per month"
          unit="/mo"
          :show-glow="true"
          :show-particles="false"
          :animate-on-mount="true"
        />
      </div>
      
      <!-- Revenue Breakdown Grid -->
      <div class="flex-1 lg:ml-8">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-5 rounded-xl bg-blue-50 border-2 border-blue-200 hover:shadow-lg transition-all">
            <div class="text-sm text-blue-700 font-medium uppercase tracking-wide mb-2">SEO Issues</div>
            <div class="text-3xl font-bold text-blue-700 mb-1">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.seo || 0"
                prefix="$"
                :duration="2000"
                className="text-blue-700"
              />
            </div>
            <div class="text-xs text-blue-600">Search visibility loss</div>
          </div>

          <div class="text-center p-5 rounded-xl bg-orange-50 border-2 border-orange-200 hover:shadow-lg transition-all">
            <div class="text-sm text-orange-700 font-medium uppercase tracking-wide mb-2">Page Speed</div>
            <div class="text-3xl font-bold text-orange-700 mb-1">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.speed || 0"
                prefix="$"
                :duration="2000"
                className="text-orange-700"
              />
            </div>
            <div class="text-xs text-orange-600">Load time impact</div>
          </div>

          <div class="text-center p-5 rounded-xl bg-yellow-50 border-2 border-yellow-200 hover:shadow-lg transition-all">
            <div class="text-sm text-yellow-700 font-medium uppercase tracking-wide mb-2">Reviews</div>
            <div class="text-3xl font-bold text-yellow-700 mb-1">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.reviews || 0"
                prefix="$"
                :duration="2000"
                className="text-yellow-700"
              />
            </div>
            <div class="text-xs text-yellow-600">Rating impact</div>
          </div>

          <div class="text-center p-5 rounded-xl bg-green-50 border-2 border-green-200 hover:shadow-lg transition-all">
            <div class="text-sm text-green-700 font-medium uppercase tracking-wide mb-2">Engagement</div>
            <div class="text-3xl font-bold text-green-700 mb-1">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.response || 0"
                prefix="$"
                :duration="2000"
                className="text-green-700"
              />
            </div>
            <div class="text-xs text-green-600">Response time</div>
          </div>
        </div>
        
        <!-- Key Issues Summary -->
        <div class="mt-6 p-4 rounded-xl bg-gray-50">
          <h3 class="font-semibold text-gray-800 mb-3">Key Findings</h3>
          <div class="space-y-2">
            <div 
              v-for="issue in keyIssues" 
              :key="issue.type"
              class="flex items-center text-sm"
            >
              <div 
                class="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                :class="issue.priority === 'high' ? 'bg-red-500' : issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'"
              ></div>
              <span class="text-gray-700">{{ issue.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Detailed Revenue Impact -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <h3 class="font-semibold text-gray-800 mb-4">How These Issues Cost You Money</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-blue-900">Technical SEO</span>
            <span class="text-lg font-bold text-blue-700">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.seo || 0"
                prefix="$"
                suffix="/mo"
                :duration="2000"
              />
            </span>
          </div>
          <div class="text-xs text-blue-700">Schema, meta tags, structure issues preventing customer discovery</div>
        </div>

        <div class="p-4 rounded-lg bg-orange-50 border border-orange-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-orange-900">Site Speed</span>
            <span class="text-lg font-bold text-orange-700">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.speed || 0"
                prefix="$"
                suffix="/mo"
                :duration="2000"
              />
            </span>
          </div>
          <div class="text-xs text-orange-700">Slow loading times causing visitors to leave before ordering</div>
        </div>

        <div class="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-yellow-900">Low Reviews</span>
            <span class="text-lg font-bold text-yellow-700">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.reviews || 0"
                prefix="$"
                suffix="/mo"
                :duration="2000"
              />
            </span>
          </div>
          <div class="text-xs text-yellow-700">Poor ratings driving customers to competitors with better reviews</div>
        </div>

        <div class="p-4 rounded-lg bg-green-50 border border-green-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-green-900">Slow Responses</span>
            <span class="text-lg font-bold text-green-700">
              <AnimatedCounter
                :value="revenueImpact?.breakdown?.response || 0"
                prefix="$"
                suffix="/mo"
                :duration="2000"
              />
            </span>
          </div>
          <div class="text-xs text-green-700">Delayed responses to reviews and inquiries losing customer trust</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedGauge from './AnimatedGauge.vue'
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'ScoreGauge',
  components: {
    AnimatedGauge,
    AnimatedCounter
  },
  props: {
    score: {
      type: Number,
      default: 0
    },
    metrics: {
      type: Object,
      default: () => ({
        seoScore: { value: 0, label: 'SEO Score' },
        performance: { value: 0, label: 'Performance' },
        accessibility: { value: 0, label: 'Accessibility' },
        bestPractices: { value: 0, label: 'Best Practices' }
      })
    },
    issues: {
      type: Array,
      default: () => []
    },
    revenueImpact: {
      type: Object,
      default: () => ({
        monthly: 0,
        annual: 0,
        breakdown: {}
      })
    }
  },
  data() {
    return {
      displayScore: 0
    }
  },
  computed: {
    grade() {
      if (this.displayScore >= 85) return 'A'
      if (this.displayScore >= 75) return 'B'
      if (this.displayScore >= 65) return 'C'
      return 'D'
    },
    
    keyIssues() {
      return this.issues
        .filter(issue => issue.status === 'fail')
        .slice(0, 3)
        .map(issue => ({
          type: issue.type,
          message: issue.title,
          priority: this.getIssuePriority(issue)
        }))
    },
    
    scoreBreakdown() {
      return {
        technical: {
          label: 'Technical SEO',
          score: this.metrics.seoScore?.value || 0,
          description: 'Schema, meta tags, structure'
        },
        performance: {
          label: 'Site Speed',
          score: this.metrics.performance?.value || 0,
          description: 'Loading time, Core Web Vitals'
        },
        accessibility: {
          label: 'Accessibility',
          score: this.metrics.accessibility?.value || 0,
          description: 'WCAG compliance, usability'
        },
        practices: {
          label: 'Best Practices',
          score: this.metrics.bestPractices?.value || 0,
          description: 'Security, modern standards'
        }
      }
    }
  },
  watch: {
    score(newScore) {
      this.displayScore = newScore
    }
  },
  mounted() {
    this.displayScore = this.score
  },
  methods: {
    
    getScoreColor(score) {
      if (score >= 85) return 'text-green-600'
      if (score >= 75) return 'text-yellow-600'
      if (score >= 65) return 'text-orange-600'
      return 'text-red-600'
    },
    
    getGradeColor(grade) {
      const colors = {
        A: 'text-green-600',
        B: 'text-yellow-600', 
        C: 'text-orange-600',
        D: 'text-red-600'
      }
      return colors[grade] || 'text-gray-600'
    },
    
    getScoreDescription(score) {
      if (score >= 85) return 'Excellent'
      if (score >= 75) return 'Good'
      if (score >= 65) return 'Needs Work'
      return 'Poor'
    },
    
    getMetricColor(value, key) {
      if (value >= 80) return 'text-green-600'
      if (value >= 60) return 'text-yellow-600'
      return 'text-red-600'
    },
    
    getMetricBarColor(value, key) {
      if (value >= 80) return 'bg-green-500'
      if (value >= 60) return 'bg-yellow-500'
      return 'bg-red-500'
    },
    
    getMetricStatus(value, key) {
      if (value >= 80) return 'Good'
      if (value >= 60) return 'Fair'
      return 'Poor'
    },
    
    getIssuePriority(issue) {
      const highPriorityTypes = ['title', 'schema', 'lcp']
      const mediumPriorityTypes = ['meta', 'reviews', 'og']
      
      if (highPriorityTypes.includes(issue.type)) return 'high'
      if (mediumPriorityTypes.includes(issue.type)) return 'medium'
      return 'low'
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Animation for metric bars */
@keyframes fillBar {
  from { width: 0%; }
  to { width: var(--target-width); }
}

.metric-bar {
  animation: fillBar 1.5s ease-out forwards;
}
</style>