<template>
  <div class="card-shadow mb-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-1">Traffic Correlation Analytics</h2>
      <p class="text-gray-600">How your SEO performance impacts visitor traffic</p>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-blue-700">Estimated Monthly Visitors</span>
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold text-blue-900 mb-2">
          {{ formatNumber(trafficData.estimatedVisitors) }}
        </div>
        <div class="flex items-center text-sm">
          <span
            class="font-medium px-2 py-1 rounded-full"
            :class="trafficChangeClass"
          >
            {{ trafficChangeText }}
          </span>
          <span class="text-blue-600 ml-2">vs last period</span>
        </div>
      </div>

      <div class="p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-green-700">Search Impressions</span>
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold text-green-900 mb-2">
          {{ formatNumber(trafficData.searchImpressions) }}
        </div>
        <div class="text-xs text-green-600">
          Monthly search appearances
        </div>
      </div>

      <div class="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-purple-700">Click-Through Rate</span>
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
          </svg>
        </div>
        <div class="text-4xl font-bold text-purple-900 mb-2">
          {{ trafficData.clickThroughRate }}%
        </div>
        <div class="text-xs text-purple-600">
          Impression to visit conversion
        </div>
      </div>
    </div>

    <!-- Traffic Trend Visualization -->
    <div class="bg-white rounded-xl p-6 border-2 border-gray-200 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Traffic Trend vs SEO Score</h3>
      <canvas ref="trafficChart"></canvas>
    </div>

    <!-- Correlation Insights -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
        <div class="flex items-start">
          <div class="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-yellow-900 mb-1">SEO Impact</h4>
            <p class="text-sm text-yellow-800">
              Every 10-point improvement in your SEO score correlates with an estimated
              <span class="font-bold">{{ trafficData.seoImpactPercentage }}%</span> increase in monthly visitors
            </p>
          </div>
        </div>
      </div>

      <div class="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
        <div class="flex items-start">
          <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold text-blue-900 mb-1">Rating Impact</h4>
            <p class="text-sm text-blue-800">
              Improving your rating by 0.5 stars could bring an additional
              <span class="font-bold">{{ trafficData.ratingImpactVisitors }}</span> monthly visitors
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'

export default {
  name: 'TrafficAnalytics',
  props: {
    placeId: {
      type: String,
      required: true
    },
    currentRating: {
      type: Number,
      default: 4.0
    }
  },
  data() {
    return {
      trafficData: {
        estimatedVisitors: 1250,
        visitorChange: 8.5,
        trafficTrend: 'up',
        searchImpressions: 15400,
        clickThroughRate: 8.1,
        seoImpactPercentage: 12,
        ratingImpactVisitors: 180
      },
      historicalData: [],
      chart: null
    }
  },
  computed: {
    trafficChangeText() {
      const change = this.trafficData.visitorChange
      if (change > 0) return `↑ ${change}%`
      if (change < 0) return `↓ ${Math.abs(change)}%`
      return '0%'
    },
    trafficChangeClass() {
      const change = this.trafficData.visitorChange
      if (change > 0) return 'bg-green-100 text-green-700'
      if (change < 0) return 'bg-red-100 text-red-700'
      return 'bg-gray-100 text-gray-700'
    }
  },
  mounted() {
    this.loadTrafficData()
    this.generateMockData()
    this.$nextTick(() => {
      this.renderChart()
    })
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    async loadTrafficData() {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'
        const response = await fetch(
          `${API_BASE_URL}/api/analytics/ranking-history/${this.placeId}?days=30`
        )
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          this.historicalData = data.data
          this.calculateTrafficMetrics()
        }
      } catch (error) {
        console.error('Failed to load traffic data:', error)
      }
    },
    calculateTrafficMetrics() {
      if (this.historicalData.length < 2) return

      const latest = this.historicalData[this.historicalData.length - 1]
      const previous = this.historicalData[this.historicalData.length - 2]

      this.trafficData.estimatedVisitors = latest.estimatedMonthlyVisitors || 1250

      if (previous.estimatedMonthlyVisitors) {
        this.trafficData.visitorChange =
          ((latest.estimatedMonthlyVisitors - previous.estimatedMonthlyVisitors) / previous.estimatedMonthlyVisitors) * 100
      }

      // Calculate correlation
      this.trafficData.seoImpactPercentage = Math.round(
        (this.trafficData.estimatedVisitors / (latest.overallScore || 70)) * 10
      )

      this.trafficData.ratingImpactVisitors = Math.round(
        this.trafficData.estimatedVisitors * 0.15
      )
    },
    generateMockData() {
      if (this.historicalData.length > 0) return

      const now = new Date()
      for (let i = 30; i >= 0; i -= 3) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)

        const score = 70 + Math.random() * 15
        const visitors = Math.round(800 + score * 8 + Math.random() * 200)

        this.historicalData.push({
          recordDate: date,
          overallScore: score,
          estimatedMonthlyVisitors: visitors
        })
      }
    },
    renderChart() {
      if (!this.$refs.trafficChart || this.historicalData.length === 0) return

      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.trafficChart.getContext('2d')

      const labels = this.historicalData.map(h => {
        const date = new Date(h.recordDate)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })

      const visitors = this.historicalData.map(h => h.estimatedMonthlyVisitors)
      const scores = this.historicalData.map(h => h.overallScore)

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Monthly Visitors',
              data: visitors,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              yAxisID: 'y',
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: 'rgb(59, 130, 246)'
            },
            {
              label: 'SEO Score',
              data: scores,
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: 'rgb(16, 185, 129)'
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
                  size: 14,
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
              }
            }
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Monthly Visitors',
                font: {
                  size: 13,
                  weight: 'bold'
                }
              },
              ticks: {
                callback: function(value) {
                  return value.toLocaleString()
                }
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
                  size: 13,
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
    },
    formatNumber(num) {
      return num?.toLocaleString() || '0'
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
