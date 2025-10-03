<template>
  <div class="metrics-chart-container">
    <h3 class="text-xl font-bold text-gray-800 mb-6">Revenue Impact by Category</h3>

    <!-- Interactive Bar Chart -->
    <div class="space-y-4">
      <div
        v-for="(metric, key) in metrics"
        :key="key"
        class="metric-row"
        @mouseenter="hoveredMetric = key"
        @mouseleave="hoveredMetric = null"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-3">
            <div
              class="w-4 h-4 rounded-full"
              :style="{ background: metric.color }"
            ></div>
            <span class="font-semibold text-gray-800">{{ metric.label }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-lg font-bold" :style="{ color: metric.color }">
              ${{ metric.value.toLocaleString() }}
            </span>
            <span class="text-xs text-gray-500">/month</span>
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div class="relative h-12 bg-gray-100 rounded-xl overflow-hidden group">
          <div
            class="absolute inset-0 transition-all duration-700 ease-out rounded-xl"
            :class="hoveredMetric === key ? 'scale-y-110' : 'scale-y-100'"
            :style="{
              width: `${getBarWidth(metric.value)}%`,
              background: `linear-gradient(90deg, ${metric.color} 0%, ${metric.lightColor} 100%)`,
              transformOrigin: 'left center'
            }"
          >
            <!-- Shimmer effect -->
            <div class="shimmer-overlay"></div>
          </div>

          <!-- Percentage Label -->
          <div class="absolute inset-0 flex items-center px-4">
            <span
              class="text-sm font-bold transition-all duration-300"
              :class="getBarWidth(metric.value) > 20 ? 'text-white' : 'text-gray-700'"
              :style="{ marginLeft: getBarWidth(metric.value) > 20 ? '0' : `${getBarWidth(metric.value) + 2}%` }"
            >
              {{ getPercentage(metric.value) }}% of total loss
            </span>
          </div>
        </div>

        <!-- Expandable Details -->
        <transition name="slide-down">
          <div v-if="hoveredMetric === key" class="mt-3 p-4 bg-gray-50 rounded-lg">
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div class="text-gray-500 mb-1">Weekly Loss</div>
                <div class="font-bold" :style="{ color: metric.color }">
                  ${{ Math.round(metric.value / 4).toLocaleString() }}
                </div>
              </div>
              <div>
                <div class="text-gray-500 mb-1">Yearly Impact</div>
                <div class="font-bold" :style="{ color: metric.color }">
                  ${{ (metric.value * 12).toLocaleString() }}
                </div>
              </div>
              <div>
                <div class="text-gray-500 mb-1">Priority</div>
                <div class="font-bold" :class="getPriorityClass(metric.value)">
                  {{ getPriority(metric.value) }}
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- Total Summary -->
    <div class="mt-6 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-gray-600 mb-1">Total Monthly Revenue Loss</div>
          <div class="text-4xl font-bold text-red-600">
            <AnimatedCounter :value="totalLoss" prefix="$" :duration="2500" />
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600 mb-1">Annual Impact</div>
          <div class="text-2xl font-bold text-red-700">
            <AnimatedCounter :value="totalLoss * 12" prefix="$" :duration="2500" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'InteractiveMetricsChart',
  components: {
    AnimatedCounter
  },
  props: {
    revenueImpact: {
      type: Object,
      default: () => ({
        seo: 1200,
        speed: 900,
        reviews: 2500,
        response: 800
      })
    }
  },
  data() {
    return {
      hoveredMetric: null
    }
  },
  computed: {
    metrics() {
      return {
        reviews: {
          label: 'Low Reviews',
          value: this.revenueImpact.reviews || 0,
          color: '#f59e0b',
          lightColor: '#fcd34d'
        },
        seo: {
          label: 'SEO Issues',
          value: this.revenueImpact.seo || 0,
          color: '#3b82f6',
          lightColor: '#93c5fd'
        },
        speed: {
          label: 'Page Speed',
          value: this.revenueImpact.speed || 0,
          color: '#f97316',
          lightColor: '#fdba74'
        },
        response: {
          label: 'Slow Responses',
          value: this.revenueImpact.response || 0,
          color: '#10b981',
          lightColor: '#6ee7b7'
        }
      }
    },
    totalLoss() {
      return Object.values(this.metrics).reduce((sum, m) => sum + m.value, 0)
    }
  },
  methods: {
    getBarWidth(value) {
      const max = Math.max(...Object.values(this.metrics).map(m => m.value))
      return (value / max) * 100
    },
    getPercentage(value) {
      return Math.round((value / this.totalLoss) * 100)
    },
    getPriority(value) {
      const percentage = this.getPercentage(value)
      if (percentage >= 40) return 'CRITICAL'
      if (percentage >= 25) return 'HIGH'
      if (percentage >= 15) return 'MEDIUM'
      return 'LOW'
    },
    getPriorityClass(value) {
      const priority = this.getPriority(value)
      if (priority === 'CRITICAL') return 'text-red-600'
      if (priority === 'HIGH') return 'text-orange-600'
      if (priority === 'MEDIUM') return 'text-yellow-600'
      return 'text-green-600'
    }
  }
}
</script>

<style scoped>
.metrics-chart-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.metric-row {
  transition: all 0.3s ease;
  cursor: pointer;
}

.metric-row:hover {
  transform: translateX(4px);
}

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
