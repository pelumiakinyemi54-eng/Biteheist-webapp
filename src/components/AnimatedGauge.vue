<template>
  <div class="gauge-container">
    <svg :width="size" :height="size" class="gauge-svg">
      <!-- Background Circle -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="radius"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        class="gauge-background"
      />

      <!-- Animated Progress Circle -->
      <circle
        :cx="centerX"
        :cy="centerY"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="animatedOffset"
        stroke-linecap="round"
        class="gauge-progress"
        :style="{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)' }"
      />

      <!-- Glow effect -->
      <circle
        v-if="showGlow"
        :cx="centerX"
        :cy="centerY"
        :r="radius"
        fill="none"
        :stroke="progressColor"
        :stroke-width="strokeWidth + 2"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="animatedOffset"
        stroke-linecap="round"
        class="gauge-glow"
        opacity="0.3"
      />
    </svg>

    <!-- Center Content -->
    <div class="gauge-content">
      <div class="gauge-value">
        <span class="gauge-number" :style="{ color: progressColor }">
          ${{ displayValue.toLocaleString() }}
        </span>
        <span class="gauge-unit" v-if="unit">{{ unit }}</span>
      </div>
      <div class="gauge-label">{{ label }}</div>
      <div class="gauge-sublabel" v-if="sublabel">{{ sublabel }}</div>
    </div>

    <!-- Animated particles around gauge (optional) -->
    <div v-if="showParticles" class="particles">
      <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnimatedGauge',
  props: {
    value: {
      type: Number,
      default: 0
    },
    maxValue: {
      type: Number,
      default: 100
    },
    size: {
      type: Number,
      default: 280
    },
    strokeWidth: {
      type: Number,
      default: 20
    },
    label: {
      type: String,
      default: ''
    },
    sublabel: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    backgroundColor: {
      type: String,
      default: '#e5e7eb'
    },
    showGlow: {
      type: Boolean,
      default: true
    },
    showParticles: {
      type: Boolean,
      default: false
    },
    animateOnMount: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      animatedValue: 0,
      animatedOffset: 0
    }
  },
  computed: {
    centerX() {
      return this.size / 2
    },
    centerY() {
      return this.size / 2
    },
    radius() {
      return (this.size - this.strokeWidth) / 2
    },
    circumference() {
      return 2 * Math.PI * this.radius
    },
    displayValue() {
      return Math.round(this.animatedValue)
    },
    progressColor() {
      const percentage = (this.value / this.maxValue) * 100
      if (percentage >= 85) return '#10b981' // green
      if (percentage >= 70) return '#3b82f6' // blue
      if (percentage >= 50) return '#f59e0b' // yellow
      return '#ef4444' // red
    }
  },
  watch: {
    value(newValue) {
      this.animateValue(newValue)
      this.animateProgress(newValue)
    }
  },
  mounted() {
    if (this.animateOnMount) {
      // Start from 0
      this.animatedOffset = this.circumference
      setTimeout(() => {
        this.animateValue(this.value)
        this.animateProgress(this.value)
      }, 100)
    } else {
      this.animatedValue = this.value
      this.updateProgress(this.value)
    }
  },
  methods: {
    animateValue(targetValue) {
      const duration = 2000 // 2 seconds
      const startValue = this.animatedValue
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        this.animatedValue = startValue + (targetValue - startValue) * easeOutCubic

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.animatedValue = targetValue
        }
      }

      animate()
    },
    animateProgress(value) {
      const percentage = value / this.maxValue
      const offset = this.circumference - (percentage * this.circumference)
      this.animatedOffset = offset
    },
    updateProgress(value) {
      const percentage = value / this.maxValue
      this.animatedOffset = this.circumference - (percentage * this.circumference)
    },
    getParticleStyle(index) {
      const angle = (360 / 8) * index
      const distance = this.radius + 30
      const x = Math.cos((angle * Math.PI) / 180) * distance
      const y = Math.sin((angle * Math.PI) / 180) * distance

      return {
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        animationDelay: `${index * 0.15}s`
      }
    }
  }
}
</script>

<style scoped>
.gauge-container {
  position: relative;
  display: inline-block;
}

.gauge-svg {
  transform: rotate(-90deg);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.gauge-background {
  opacity: 0.2;
}

.gauge-progress {
  transition: stroke 0.3s ease;
}

.gauge-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    stroke-width: 22;
  }
  50% {
    opacity: 0.6;
    stroke-width: 26;
  }
}

.gauge-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.gauge-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 8px;
}

.gauge-number {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  animation: numberPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gauge-unit {
  font-size: 24px;
  font-weight: 600;
  color: #6b7280;
  margin-left: 4px;
}

.gauge-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.gauge-sublabel {
  font-size: 12px;
  color: #6b7280;
}

@keyframes numberPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Particle effects */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  animation: particle-float 3s ease-in-out infinite;
  opacity: 0;
}

@keyframes particle-float {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateY(-20px) scale(1.5);
  }
}

/* Hover effect */
.gauge-container:hover .gauge-progress {
  filter: brightness(1.1);
}

.gauge-container:hover .gauge-number {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
</style>
