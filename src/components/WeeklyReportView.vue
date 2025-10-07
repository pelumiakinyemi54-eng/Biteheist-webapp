<template>
  <div class="card-shadow mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">📊 Weekly Performance Report</h2>
        <p class="text-gray-600">
          Week {{ report?.weekNumber || '-' }}, {{ report?.year || new Date().getFullYear() }}
          <span v-if="report?.startDate" class="text-gray-500 ml-2">
            ({{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }})
          </span>
        </p>
      </div>
      <button
        @click="downloadReport"
        class="btn-primary flex items-center space-x-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>Download PDF</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">Loading weekly report...</p>
      </div>
    </div>

    <div v-else-if="report">
      <!-- Executive Summary -->
      <div class="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <h3 class="text-xl font-bold mb-4">📈 Executive Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm opacity-90 mb-1">Current Rank</div>
            <div class="text-3xl font-bold">#{{ report.performance?.currentRank || '-' }}</div>
            <div class="text-sm mt-1">
              <span v-if="report.performance?.rankChange > 0" class="text-green-300">
                ↑ {{ report.performance.rankChange }} positions
              </span>
              <span v-else-if="report.performance?.rankChange < 0" class="text-red-300">
                ↓ {{ Math.abs(report.performance.rankChange) }} positions
              </span>
              <span v-else class="opacity-75">No change</span>
            </div>
          </div>
          <div>
            <div class="text-sm opacity-90 mb-1">SEO Score</div>
            <div class="text-3xl font-bold">{{ report.performance?.currentScore || '-' }}</div>
            <div class="text-sm mt-1">
              <span v-if="report.performance?.scoreChange > 0" class="text-green-300">
                ↑ +{{ report.performance.scoreChange }}
              </span>
              <span v-else-if="report.performance?.scoreChange < 0" class="text-red-300">
                ↓ {{ report.performance.scoreChange }}
              </span>
              <span v-else class="opacity-75">No change</span>
            </div>
          </div>
          <div>
            <div class="text-sm opacity-90 mb-1">New Reviews</div>
            <div class="text-3xl font-bold">{{ report.performance?.newReviews || 0 }}</div>
            <div class="text-sm mt-1 opacity-75">
              Total: {{ report.performance?.totalReviews || 0 }}
            </div>
          </div>
          <div>
            <div class="text-sm opacity-90 mb-1">Est. Visitors</div>
            <div class="text-3xl font-bold">{{ formatNumber(report.traffic?.estimatedVisitors) }}</div>
            <div class="text-sm mt-1">
              <span v-if="report.traffic?.visitorChange > 0" class="text-green-300">
                ↑ {{ report.traffic.visitorChange }}%
              </span>
              <span v-else-if="report.traffic?.visitorChange < 0" class="text-red-300">
                ↓ {{ Math.abs(report.traffic.visitorChange) }}%
              </span>
              <span v-else class="opacity-75">No change</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Key Insights -->
      <div v-if="report.insights && report.insights.length > 0" class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">💡 Key Insights</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(insight, index) in report.insights"
            :key="index"
            class="p-4 rounded-xl border-2"
            :class="getInsightClass(insight.type)"
          >
            <div class="flex items-start">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center mr-3 flex-shrink-0"
                :class="getInsightIconBg(insight.type)"
              >
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getInsightIconPath(insight.type)"></path>
                </svg>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h4 class="font-semibold" :class="getInsightTextClass(insight.type)">
                    {{ insight.title }}
                  </h4>
                  <span
                    v-if="insight.priority"
                    class="text-xs px-2 py-1 rounded-full font-medium"
                    :class="getPriorityClass(insight.priority)"
                  >
                    {{ insight.priority }}
                  </span>
                </div>
                <p class="text-sm" :class="getInsightTextClass(insight.type)">
                  {{ insight.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Impact -->
      <div class="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <h3 class="text-xl font-bold text-green-900 mb-4">💰 Revenue Impact</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-white rounded-xl">
            <div class="text-sm text-green-700 font-medium mb-2">Estimated Loss</div>
            <div class="text-3xl font-bold text-green-900 mb-1">
              ${{ formatNumber(report.revenueImpact?.estimatedLoss) }}
            </div>
            <div class="text-xs text-green-600">
              <span v-if="report.revenueImpact?.lossChange < 0" class="text-green-700">
                ↓ ${{ Math.abs(report.revenueImpact.lossChange) }} improvement
              </span>
              <span v-else-if="report.revenueImpact?.lossChange > 0" class="text-red-600">
                ↑ ${{ report.revenueImpact.lossChange }} increase
              </span>
              <span v-else>No change</span>
            </div>
          </div>
          <div class="text-center p-4 bg-white rounded-xl">
            <div class="text-sm text-green-700 font-medium mb-2">Annual Potential</div>
            <div class="text-3xl font-bold text-green-900">
              ${{ formatNumber(report.revenueImpact?.potentialGain) }}
            </div>
            <div class="text-xs text-green-600">If all issues fixed</div>
          </div>
          <div class="text-center p-4 bg-white rounded-xl">
            <div class="text-sm text-green-700 font-medium mb-2">Opportunity Score</div>
            <div class="text-3xl font-bold text-green-900">
              {{ report.revenueImpact?.opportunityScore || 'N/A' }}
            </div>
            <div class="text-xs text-green-600">Out of 100</div>
          </div>
        </div>
      </div>

      <!-- Competitor Overview -->
      <div v-if="report.competitors" class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🏆 Competitive Position</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-xl bg-purple-50 border border-purple-200">
            <div class="text-sm text-purple-700 mb-1">Your Position</div>
            <div class="text-2xl font-bold text-purple-900">
              #{{ report.competitors.yourPosition || '-' }}
            </div>
            <div class="text-xs text-purple-600 mt-1">
              <span v-if="report.competitors.positionChange > 0" class="text-green-600">
                ↑ {{ report.competitors.positionChange }}
              </span>
              <span v-else-if="report.competitors.positionChange < 0" class="text-red-600">
                ↓ {{ Math.abs(report.competitors.positionChange) }}
              </span>
              <span v-else>No change</span>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div class="text-sm text-blue-700 mb-1">Total Tracked</div>
            <div class="text-2xl font-bold text-blue-900">
              {{ report.competitors.totalTracked || 0 }}
            </div>
            <div class="text-xs text-blue-600">Competitors</div>
          </div>
          <div class="p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div class="text-sm text-orange-700 mb-1">New</div>
            <div class="text-2xl font-bold text-orange-900">
              {{ report.competitors.newCompetitors || 0 }}
            </div>
            <div class="text-xs text-orange-600">This week</div>
          </div>
          <div class="p-4 rounded-xl bg-green-50 border border-green-200">
            <div class="text-sm text-green-700 mb-1">Departed</div>
            <div class="text-2xl font-bold text-green-900">
              {{ report.competitors.departedCompetitors || 0 }}
            </div>
            <div class="text-xs text-green-600">This week</div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="report.recommendations && report.recommendations.length > 0" class="mb-8">
        <h3 class="text-xl font-bold text-gray-900 mb-4">🎯 Action Recommendations</h3>
        <div class="space-y-3">
          <div
            v-for="(rec, index) in report.recommendations"
            :key="index"
            class="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center space-x-3">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ rec.category }}
                </span>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getEffortClass(rec.effort)"
                >
                  {{ rec.effort }} effort
                </span>
              </div>
              <div v-if="rec.estimatedImpact" class="text-right">
                <div class="text-xs text-gray-500">Estimated Impact</div>
                <div class="text-lg font-bold text-green-600">
                  +${{ formatNumber(rec.estimatedImpact) }}
                </div>
              </div>
            </div>
            <h4 class="font-semibold text-gray-900 mb-1">{{ rec.title }}</h4>
            <p class="text-sm text-gray-600 mb-2">{{ rec.description }}</p>
            <div class="text-xs text-gray-500">
              ⏱️ Timeframe: {{ rec.timeframe }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Report State -->
    <div v-else class="text-center py-20 bg-gray-50 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Weekly Report Available</h3>
      <p class="text-gray-600">Weekly reports will be generated automatically</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WeeklyReportView',
  props: {
    placeId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      report: null,
      loading: false
    }
  },
  mounted() {
    this.loadWeeklyReport()
  },
  methods: {
    async loadWeeklyReport() {
      this.loading = true
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(
          `${API_BASE_URL}/api/analytics/weekly-report/${this.placeId}`
        )
        const data = await response.json()

        if (data.success) {
          this.report = data.report
        }
      } catch (error) {
        console.error('Failed to load weekly report:', error)
      } finally {
        this.loading = false
      }
    },
    downloadReport() {
      window.print()
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    formatNumber(num) {
      return num?.toLocaleString() || '0'
    },
    getInsightClass(type) {
      const classes = {
        positive: 'bg-green-50 border-green-200',
        warning: 'bg-orange-50 border-orange-200',
        opportunity: 'bg-blue-50 border-blue-200',
        action: 'bg-purple-50 border-purple-200'
      }
      return classes[type] || 'bg-gray-50 border-gray-200'
    },
    getInsightIconBg(type) {
      const classes = {
        positive: 'bg-green-500',
        warning: 'bg-orange-500',
        opportunity: 'bg-blue-500',
        action: 'bg-purple-500'
      }
      return classes[type] || 'bg-gray-500'
    },
    getInsightTextClass(type) {
      const classes = {
        positive: 'text-green-900',
        warning: 'text-orange-900',
        opportunity: 'text-blue-900',
        action: 'text-purple-900'
      }
      return classes[type] || 'text-gray-900'
    },
    getInsightIconPath(type) {
      const paths = {
        positive: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        opportunity: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        action: 'M13 10V3L4 14h7v7l9-11h-7z'
      }
      return paths[type] || 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    getPriorityClass(priority) {
      const classes = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-gray-100 text-gray-700'
      }
      return classes[priority] || 'bg-gray-100 text-gray-700'
    },
    getEffortClass(effort) {
      const classes = {
        low: 'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-red-100 text-red-700'
      }
      return classes[effort] || 'bg-gray-100 text-gray-700'
    }
  }
}
</script>

<style scoped>
.card-shadow {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
}

.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}
</style>
