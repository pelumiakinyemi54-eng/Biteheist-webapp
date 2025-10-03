<template>
  <div class="projection-container">
    <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Revenue Projection Calculator</h3>
          <p class="text-gray-600">See how much you could earn by fixing SEO issues</p>
        </div>
        <div class="text-center">
          <div class="text-sm text-gray-600 mb-1">Improvement Level</div>
          <div class="text-4xl font-bold text-green-600">{{ improvementLevel }}%</div>
        </div>
      </div>

      <!-- Interactive Slider -->
      <div class="mb-8">
        <div class="relative">
          <!-- Slider Track -->
          <div class="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300 ease-out"
              :style="{ width: `${improvementLevel}%` }"
            >
              <div class="h-full shimmer-bar"></div>
            </div>
          </div>

          <!-- Slider Input -->
          <input
            type="range"
            v-model="improvementLevel"
            min="0"
            max="100"
            step="5"
            class="slider-input"
            @input="updateProjection"
          />

          <!-- Milestone Markers -->
          <div class="flex justify-between mt-2 text-xs text-gray-500">
            <span>Current</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>Fixed</span>
          </div>
        </div>
      </div>

      <!-- Projection Results -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl p-5 text-center border-2 border-green-300 transform transition-all hover:scale-105">
          <div class="text-sm text-green-700 font-medium uppercase tracking-wide mb-2">
            Monthly Gain
          </div>
          <div class="text-3xl font-bold text-green-700 mb-1">
            <AnimatedCounter
              :value="projectedMonthlyGain"
              prefix="$"
              :duration="800"
              :key="improvementLevel"
            />
          </div>
          <div class="text-xs text-green-600">Potential increase</div>
        </div>

        <div class="bg-white rounded-xl p-5 text-center border-2 border-blue-300 transform transition-all hover:scale-105">
          <div class="text-sm text-blue-700 font-medium uppercase tracking-wide mb-2">
            Yearly Gain
          </div>
          <div class="text-3xl font-bold text-blue-700 mb-1">
            <AnimatedCounter
              :value="projectedYearlyGain"
              prefix="$"
              :duration="800"
              :key="improvementLevel"
            />
          </div>
          <div class="text-xs text-blue-600">Annual projection</div>
        </div>

        <div class="bg-white rounded-xl p-5 text-center border-2 border-purple-300 transform transition-all hover:scale-105">
          <div class="text-sm text-purple-700 font-medium uppercase tracking-wide mb-2">
            ROI Multiplier
          </div>
          <div class="text-3xl font-bold text-purple-700 mb-1">
            {{ roiMultiplier }}x
          </div>
          <div class="text-xs text-purple-600">Return on investment</div>
        </div>
      </div>

      <!-- Quick Action Scenarios -->
      <div class="grid grid-cols-3 gap-3">
        <button
          @click="setImprovement(25)"
          class="scenario-btn"
          :class="{ active: improvementLevel === 25 }"
        >
          <div class="text-xs font-semibold mb-1">Quick Wins</div>
          <div class="text-lg font-bold">25%</div>
        </button>
        <button
          @click="setImprovement(50)"
          class="scenario-btn"
          :class="{ active: improvementLevel === 50 }"
        >
          <div class="text-xs font-semibold mb-1">Significant</div>
          <div class="text-lg font-bold">50%</div>
        </button>
        <button
          @click="setImprovement(100)"
          class="scenario-btn"
          :class="{ active: improvementLevel === 100 }"
        >
          <div class="text-xs font-semibold mb-1">Complete Fix</div>
          <div class="text-lg font-bold">100%</div>
        </button>
      </div>

      <!-- Comparison -->
      <div class="mt-6 p-5 bg-white rounded-xl">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-600 mb-1">Current Monthly Loss</div>
            <div class="text-2xl font-bold text-red-600">
              ${{ currentLoss.toLocaleString() }}
            </div>
          </div>
          <div class="text-3xl text-gray-400">→</div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Projected Monthly Revenue</div>
            <div class="text-2xl font-bold text-green-600">
              +${{ projectedMonthlyGain.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'RevenueProjectionSlider',
  components: {
    AnimatedCounter
  },
  props: {
    currentLoss: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      improvementLevel: 50
    }
  },
  computed: {
    projectedMonthlyGain() {
      return Math.round((this.currentLoss * this.improvementLevel) / 100)
    },
    projectedYearlyGain() {
      return this.projectedMonthlyGain * 12
    },
    roiMultiplier() {
      // Assume average cost to fix is $2000
      const fixCost = 2000
      const yearlyGain = this.projectedYearlyGain
      return (yearlyGain / fixCost).toFixed(1)
    }
  },
  methods: {
    updateProjection() {
      // Trigger reactivity
      this.$forceUpdate()
    },
    setImprovement(level) {
      this.improvementLevel = level
    }
  }
}
</script>

<style scoped>
.projection-container {
  margin-bottom: 32px;
}

/* Custom Slider Styling */
.slider-input {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 20px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  z-index: 10;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border: 4px solid #10b981;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.slider-input::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.slider-input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: white;
  border: 4px solid #10b981;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider-input::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.shimmer-bar {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer-slide 2s infinite;
}

@keyframes shimmer-slide {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.scenario-btn {
  padding: 12px;
  border-radius: 8px;
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
  transition: all 0.2s ease;
  cursor: pointer;
}

.scenario-btn:hover {
  border-color: #10b981;
  color: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
}

.scenario-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: scale(1.05);
}
</style>
