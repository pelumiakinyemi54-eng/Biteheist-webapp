<template>
  <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
    <h2 class="text-xl font-bold text-gray-800 mb-6">Overall SEO Score</h2>
    
    <div class="flex flex-col lg:flex-row items-center justify-between">
      <!-- Score Chart -->
      <div class="relative mb-6 lg:mb-0">
        <canvas ref="scoreChart" width="280" height="280"></canvas>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="text-center">
            <div 
              class="text-4xl font-bold transition-all duration-1000" 
              :class="getScoreColor(displayScore)"
            >
              {{ displayScore }}
            </div>
            <div 
              class="text-lg font-medium transition-all duration-1000" 
              :class="getGradeColor(grade)"
            >
              Grade {{ grade }}
            </div>
            <div class="text-sm text-gray-500 mt-1">
              {{ getScoreDescription(displayScore) }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Metrics Grid -->
      <div class="flex-1 lg:ml-8">
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="(metric, key) in metrics" 
            :key="key"
            class="text-center p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div 
              class="text-2xl font-bold mb-2 transition-all duration-1000" 
              :class="getMetricColor(metric.value, key)"
            >
              {{ metric.displayValue || metric.value }}
            </div>
            <div class="text-sm text-gray-600 mb-2">{{ metric.label }}</div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="h-2 rounded-full transition-all duration-1500" 
                :class="getMetricBarColor(metric.value, key)"
                :style="`width: ${metric.value}%`"
              ></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ getMetricStatus(metric.value, key) }}
            </div>
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
    
    <!-- Score Breakdown -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <h3 class="font-semibold text-gray-800 mb-4">Score Breakdown</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="(breakdown, key) in scoreBreakdown" 
          :key="key"
          class="p-3 rounded-lg border border-gray-200"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ breakdown.label }}</span>
            <span 
              class="text-sm font-bold"
              :class="breakdown.score >= 80 ? 'text-green-600' : breakdown.score >= 60 ? 'text-yellow-600' : 'text-red-600'"
            >
              {{ breakdown.score }}/100
            </span>
          </div>
          <div class="text-xs text-gray-500">{{ breakdown.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'ScoreGauge',
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
    }
  },
  data() {
    return {
      chart: null,
      displayScore: 0,
      animationRunning: false
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
      this.animateScore(newScore)
      this.updateChart(newScore)
    }
  },
  methods: {
    createChart() {
      const canvas = this.$refs.scoreChart
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [0, 100],
            backgroundColor: [
              '#E5E7EB', // Gray for remaining
              '#E5E7EB'
            ],
            borderWidth: 0,
            cutout: '75%',
            rotation: -90,
            circumference: 180
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          animation: {
            duration: 2000,
            easing: 'easeOutCubic'
          }
        }
      })
    },
    
    updateChart(score) {
      if (!this.chart) return
      
      const color = this.getChartColor(score)
      this.chart.data.datasets[0].data = [score, 100 - score]
      this.chart.data.datasets[0].backgroundColor = [color, '#E5E7EB']
      this.chart.update('active')
    },
    
    animateScore(targetScore) {
      if (this.animationRunning) return
      
      this.animationRunning = true
      const startScore = this.displayScore
      const duration = 2000
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        this.displayScore = Math.round(startScore + (targetScore - startScore) * easeOutCubic)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.animationRunning = false
        }
      }
      
      animate()
    },
    
    getChartColor(score) {
      if (score >= 85) return '#10B981' // Green
      if (score >= 75) return '#F59E0B' // Yellow
      if (score >= 65) return '#F97316' // Orange
      return '#EF4444' // Red
    },
    
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
  },
  
  mounted() {
    this.$nextTick(() => {
      this.createChart()
      if (this.score > 0) {
        setTimeout(() => {
          this.animateScore(this.score)
          this.updateChart(this.score)
        }, 500)
      }
    })
  },
  
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
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