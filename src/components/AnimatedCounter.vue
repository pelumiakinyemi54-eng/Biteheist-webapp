<template>
  <span :class="className">{{ displayValue }}</span>
</template>

<script>
export default {
  name: 'AnimatedCounter',
  props: {
    value: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 2000
    },
    prefix: {
      type: String,
      default: ''
    },
    suffix: {
      type: String,
      default: ''
    },
    decimals: {
      type: Number,
      default: 0
    },
    className: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      animatedValue: 0
    }
  },
  computed: {
    displayValue() {
      const formatted = this.animatedValue.toLocaleString('en-US', {
        minimumFractionDigits: this.decimals,
        maximumFractionDigits: this.decimals
      })
      return `${this.prefix}${formatted}${this.suffix}`
    }
  },
  watch: {
    value(newValue) {
      this.animate(newValue)
    }
  },
  mounted() {
    setTimeout(() => {
      this.animate(this.value)
    }, 100)
  },
  methods: {
    animate(targetValue) {
      const startValue = this.animatedValue
      const startTime = Date.now()

      const step = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / this.duration, 1)

        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        this.animatedValue = startValue + (targetValue - startValue) * easeOutCubic

        if (progress < 1) {
          requestAnimationFrame(step)
        } else {
          this.animatedValue = targetValue
        }
      }

      requestAnimationFrame(step)
    }
  }
}
</script>
