<template>
  <div class="card-shadow mb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Historical SEO Ranking</h2>
        <p class="text-gray-600">Track your position over time</p>
      </div>
      <div class="flex items-center space-x-3">
        <select
          v-model="selectedPeriod"
          @change="loadHistory"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <!-- Trend Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-700">Current Rank</span>
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-blue-900 mb-1">
          #{{ trendAnalysis.currentRank || '-' }}
        </div>
        <div class="flex items-center text-sm">
          <span
            class="font-medium"
            :class="rankChangeClass"
          >
            {{ rankChangeText }}
          </span>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-green-700">Best Rank</span>
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-green-900 mb-1">
          #{{ trendAnalysis.bestRank || '-' }}
        </div>
        <div class="text-xs text-green-600">
          Peak position in period
        </div>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-orange-700">Avg Score</span>
          <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <div class="text-3xl font-bold text-orange-900 mb-1">
          {{ trendAnalysis.avgScore || '-' }}
        </div>
        <div class="text-xs text-orange-600">
          SEO performance
        </div>
      </div>

      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-purple-700">Trend</span>
          <svg
            class="w-5 h-5"
            :class="trendIconClass"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="trendIconPath"></path>
          </svg>
        </div>
        <div class="text-2xl font-bold mb-1" :class="trendTextClass">
          {{ trendLabel }}
        </div>
        <div class="text-xs text-purple-600">
          {{ selectedPeriod }}-day movement
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">Loading ranking history...</p>
      </div>
    </div>

    <!-- Chart -->
    <div v-else-if="history.length > 0" class="bg-white rounded-xl p-6 border border-gray-200">
      <canvas ref="rankingChart"></canvas>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center py-20 bg-gray-50 rounded-xl">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">No Historical Data Yet</h3>
      <p class="text-gray-600 mb-4">Start tracking your rankings to see trends over time</p>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'RankingHistory',
  props: {
    placeId: {
      type: String,
      required: true
    },
    currentRank: {
      type: Number,
      default: null
    },
    currentScore: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      history: [],
      trendAnalysis: {},
      loading: false,
      selectedPeriod: 30,
      chart: null
    }
  },
  computed: {
    rankChangeText() {
      if (!this.trendAnalysis.rankChange) return 'No change'
      const change = this.trendAnalysis.rankChange
      if (change > 0) return `↑ Up ${change} positions`
      if (change < 0) return `↓ Down ${Math.abs(change)} positions`
      return 'No change'
    },
    rankChangeClass() {
      if (!this.trendAnalysis.rankChange) return 'text-gray-600'
      return this.trendAnalysis.rankChange > 0 ? 'text-green-600' : 'text-red-600'
    },
    trendLabel() {
      const trend = this.trendAnalysis.trend
      if (trend === 'improving') return 'Improving ↗'
      if (trend === 'declining') return 'Declining ↘'
      if (trend === 'stable') return 'Stable →'
      return 'N/A'
    },
    trendTextClass() {
      const trend = this.trendAnalysis.trend
      if (trend === 'improving') return 'text-green-600'
      if (trend === 'declining') return 'text-red-600'
      return 'text-gray-600'
    },
    trendIconClass() {
      const trend = this.trendAnalysis.trend
      if (trend === 'improving') return 'text-green-600'
      if (trend === 'declining') return 'text-red-600'
      return 'text-gray-600'
    },
    trendIconPath() {
      const trend = this.trendAnalysis.trend
      if (trend === 'improving') return 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      if (trend === 'declining') return 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
      return 'M5 12h14'
    }
  },
  mounted() {
    this.loadHistory()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    async loadHistory() {
      this.loading = true
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'

        // Build query params
        let queryParams = `days=${this.selectedPeriod}`
        if (this.currentRank) {
          queryParams += `&currentRank=${this.currentRank}`
        }
        if (this.currentScore) {
          queryParams += `&currentScore=${this.currentScore}`
        }

        const response = await fetch(
          `${API_BASE_URL}/api/analytics/ranking-history/${this.placeId}?${queryParams}`
        )
        const data = await response.json()

        if (data.success) {
          this.history = data.data
          this.trendAnalysis = data.analysis || {}

          // Calculate current rank from most recent data
          if (this.history.length > 0) {
            const latest = this.history[this.history.length - 1]
            this.trendAnalysis.currentRank = latest.googleRank
            this.trendAnalysis.avgScore = Math.round(
              this.history.reduce((sum, h) => sum + h.overallScore, 0) / this.history.length
            )

            // Calculate rank change
            if (this.history.length > 1) {
              const oldest = this.history[0]
              this.trendAnalysis.rankChange = oldest.googleRank - latest.googleRank
            }
          }

          this.$nextTick(() => {
            this.renderChart()
          })
        }
      } catch (error) {
        console.error('Failed to load ranking history:', error)
      } finally {
        this.loading = false
      }
    },
    renderChart() {
      if (!this.$refs.rankingChart || this.history.length === 0) return

      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.rankingChart.getContext('2d')

      const labels = this.history.map(h => {
        const date = new Date(h.recordDate)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

      const rankData = this.history.map(h => h.googleRank)
      const scoreData = this.history.map(h => h.overallScore)

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Google Rank',
              data: rankData,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              yAxisID: 'y',
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Overall Score',
              data: scoreData,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2.5,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 13,
                  weight: '600'
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              },
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || ''
                  if (label) {
                    label += ': '
                  }
                  if (context.parsed.y !== null) {
                    if (context.datasetIndex === 0) {
                      label += '#' + context.parsed.y
                    } else {
                      label += context.parsed.y
                    }
                  }
                  return label
                }
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              reverse: true, // Lower rank number is better
              title: {
                display: true,
                text: 'Rank Position',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return '#' + value
                }
              },
              grid: {
                drawOnChartArea: true
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'SEO Score',
                font: {
                  size: 12,
                  weight: 'bold'
                }
              },
              min: 0,
              max: 100,
              grid: {
                drawOnChartArea: false
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          }
        }
      })
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
</style>
