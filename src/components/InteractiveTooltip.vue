<template>
  <div class="tooltip-wrapper" @mouseenter="show" @mouseleave="hide">
    <slot></slot>
    <transition name="tooltip-fade">
      <div
        v-if="isVisible"
        class="tooltip-content"
        :class="positionClass"
        :style="tooltipStyle"
      >
        <div class="tooltip-inner">
          <div v-if="title" class="tooltip-title">{{ title }}</div>
          <div class="tooltip-text">{{ text }}</div>
          <div v-if="value" class="tooltip-value">
            <AnimatedCounter :value="value" prefix="$" :duration="1000" />
          </div>
        </div>
        <div class="tooltip-arrow" :class="`arrow-${position}`"></div>
      </div>
    </transition>
  </div>
</template>

<script>
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'InteractiveTooltip',
  components: {
    AnimatedCounter
  },
  props: {
    text: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    },
    position: {
      type: String,
      default: 'top', // top, bottom, left, right
      validator: (value) => ['top', 'bottom', 'left', 'right'].includes(value)
    },
    color: {
      type: String,
      default: '#1e293b'
    }
  },
  data() {
    return {
      isVisible: false
    }
  },
  computed: {
    positionClass() {
      return `tooltip-${this.position}`
    },
    tooltipStyle() {
      return {
        '--tooltip-color': this.color
      }
    }
  },
  methods: {
    show() {
      this.isVisible = true
    },
    hide() {
      this.isVisible = false
    }
  }
}
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip-content {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
}

.tooltip-inner {
  background: var(--tooltip-color, #1e293b);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  max-width: 250px;
  white-space: normal;
}

.tooltip-title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 14px;
}

.tooltip-text {
  font-weight: 400;
  opacity: 0.95;
}

.tooltip-value {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #fbbf24;
}

/* Position variations */
.tooltip-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.tooltip-left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.tooltip-right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

/* Arrows */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.arrow-top {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--tooltip-color, #1e293b);
}

.arrow-bottom {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--tooltip-color, #1e293b);
}

.arrow-left {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid var(--tooltip-color, #1e293b);
}

.arrow-right {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--tooltip-color, #1e293b);
}

/* Animations */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.tooltip-top.tooltip-fade-enter-from,
.tooltip-top.tooltip-fade-leave-to {
  transform: translateX(-50%) translateY(4px);
}

.tooltip-bottom.tooltip-fade-enter-from,
.tooltip-bottom.tooltip-fade-leave-to {
  transform: translateX(-50%) translateY(-4px);
}

.tooltip-left.tooltip-fade-enter-from,
.tooltip-left.tooltip-fade-leave-to {
  transform: translateY(-50%) translateX(4px);
}

.tooltip-right.tooltip-fade-enter-from,
.tooltip-right.tooltip-fade-leave-to {
  transform: translateY(-50%) translateX(-4px);
}
</style>
