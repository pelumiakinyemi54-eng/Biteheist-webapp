<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    <!-- SEO Performance Card -->
    <div class="card-shadow hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
      <div class="flex items-start space-x-4 mb-4">
        <div class="icon-bg-blue flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-2">SEO Performance</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Your SEO could be better - you're missing out on
            <span class="font-bold text-red-600">
              <AnimatedCounter :value="revenueImpact.seo" prefix="$" :duration="2000" />
            </span> monthly
            (<span class="font-bold">
              <AnimatedCounter :value="revenueImpact.seo * 12" prefix="$" :duration="2000" />
            </span> yearly)
            in potential revenue.
          </p>
        </div>
      </div>
      <button class="btn-primary w-full mt-4">
        OPTIMIZATION OPPORTUNITY
      </button>
    </div>

    <!-- Website Performance Card -->
    <div class="card-shadow hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
      <div class="flex items-start space-x-4 mb-4">
        <div class="icon-bg-orange flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Website Performance</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Your website speed is {{ speedStatus }}, but optimizing further could save
            <span class="font-bold text-orange-600">
              <AnimatedCounter :value="revenueImpact.speed" prefix="$" :duration="2000" />
            </span> monthly.
          </p>
        </div>
      </div>
      <button class="btn-primary w-full mt-4" style="background: var(--orange);">
        SPEED ENHANCEMENT
      </button>
    </div>

    <!-- Customer Reviews Card -->
    <div class="card-shadow hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
      <div class="flex items-start space-x-4 mb-4">
        <div class="icon-bg-yellow flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Customer Reviews</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Your {{ rating }}★ rating means
            <span class="font-bold text-yellow-700">
              <AnimatedCounter :value="revenueImpact.reviews" prefix="$" :duration="2000" />
            </span>
            in missed sales each month. Competitors with 4.5★ get 55% more customers.
          </p>
        </div>
      </div>
      <button class="btn-primary w-full mt-4" style="background: var(--yellow);">
        REPUTATION MANAGEMENT
      </button>
    </div>

    <!-- Customer Engagement Card -->
    <div class="card-shadow hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 cursor-pointer group">
      <div class="flex items-start space-x-4 mb-4">
        <div class="icon-bg-green flex-shrink-0 group-hover:scale-110 transition-transform">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Customer Engagement</h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Slow customer response times cost
            <span class="font-bold text-green-700">
              <AnimatedCounter :value="revenueImpact.response" prefix="$" :duration="2000" />
            </span> monthly.
            Quick responses build trust and drive orders.
          </p>
        </div>
      </div>
      <button class="btn-primary w-full mt-4" style="background: var(--green);">
        ENGAGEMENT STRATEGY
      </button>
    </div>
  </div>
</template>

<script>
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'PerformanceCards',
  components: {
    AnimatedCounter
  },
  props: {
    revenueImpact: {
      type: Object,
      default: () => ({
        seo: 577,
        speed: 1114,
        reviews: 2269,
        response: 1650
      })
    },
    rating: {
      type: Number,
      default: 3.4
    },
    speedScore: {
      type: Number,
      default: 75
    }
  },
  computed: {
    speedStatus() {
      if (this.speedScore >= 90) return 'excellent'
      if (this.speedScore >= 75) return 'good'
      if (this.speedScore >= 50) return 'fair'
      return 'poor'
    }
  }
}
</script>

<style scoped>
.card-shadow {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
}

.btn-primary {
  background: var(--primary-blue, #3b82f6);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* Card pulse on hover */
.card-shadow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 197, 253, 0.1) 100%);
}

.card-shadow:hover::before {
  opacity: 1;
}

.card-shadow {
  position: relative;
  overflow: hidden;
}

.icon-bg-blue {
  background: var(--primary-blue, #3b82f6);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-orange {
  background: var(--orange, #f97316);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-yellow {
  background: var(--yellow, #f59e0b);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-green {
  background: var(--green, #10b981);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
