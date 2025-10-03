<template>
  <div class="card-shadow mb-8" style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div class="flex items-center space-x-4">
        <div class="icon-bg-blue">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p class="text-sm text-blue-600 font-medium uppercase tracking-wide">What Customers Are Saying</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-5xl font-bold text-gray-900 mb-1">{{ averageRating.toFixed(1) }} ⭐</div>
        <div class="text-sm text-gray-600 font-medium">Average Rating</div>
        <div class="text-xs text-gray-500">{{ totalReviews.toLocaleString() }} reviews</div>
      </div>
    </div>

    <!-- Reviews Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        v-for="(review, index) in displayReviews"
        :key="index"
        class="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all"
      >
        <!-- Review Header -->
        <div class="flex items-center space-x-3 mb-3">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            :style="`background: ${getAvatarColor(index)}`"
          >
            {{ review.author.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-900 truncate">{{ review.author }}</div>
            <div class="text-xs text-gray-500">{{ review.relativeTime }}</div>
          </div>
        </div>

        <!-- Star Rating -->
        <div class="flex items-center space-x-1 mb-3">
          <span v-for="i in 5" :key="i" class="text-lg">
            {{ i <= review.rating ? '⭐' : '☆' }}
          </span>
        </div>

        <!-- Review Text -->
        <p class="text-sm text-gray-700 leading-relaxed mb-3">
          {{ review.text }}
        </p>

        <!-- Rating Badge -->
        <div class="flex items-center justify-between">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
            :class="getRatingBadgeClass(review.rating)"
          >
            {{ review.rating }}/5 Rating
          </span>
          <span class="text-xs text-gray-500 font-medium">Verified Review</span>
        </div>
      </div>
    </div>

    <!-- Review Impact -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-xl p-5 text-center border-2 border-yellow-300">
        <div class="text-sm text-yellow-700 font-medium uppercase tracking-wide mb-2">Current Rating</div>
        <div class="text-4xl font-bold text-yellow-700 mb-1">
          <AnimatedCounter :value="averageRating" :decimals="1" :duration="2000" className="text-yellow-700" />⭐
        </div>
        <div class="text-xs text-yellow-600">
          <AnimatedCounter :value="totalReviews" :duration="2000" className="text-yellow-600" /> total reviews
        </div>
      </div>
      <div class="bg-white rounded-xl p-5 text-center border-2 border-red-300">
        <div class="text-sm text-red-700 font-medium uppercase tracking-wide mb-2">Monthly Loss</div>
        <div class="text-4xl font-bold text-red-700 mb-1">
          <AnimatedCounter :value="parseFloat(calculateReviewLoss().replace(/,/g, ''))" prefix="$" :duration="2000" className="text-red-700" />
        </div>
        <div class="text-xs text-red-600">Due to low rating</div>
      </div>
      <div class="bg-white rounded-xl p-5 text-center border-2 border-green-300">
        <div class="text-sm text-green-700 font-medium uppercase tracking-wide mb-2">Potential Gain</div>
        <div class="text-4xl font-bold text-green-700 mb-1">
          +<AnimatedCounter :value="parseFloat(calculatePotentialGain().replace(/,/g, ''))" prefix="$" :duration="2000" className="text-green-700" />
        </div>
        <div class="text-xs text-green-600">If rating hits 4.5★</div>
      </div>
    </div>
  </div>
</template>

<script>
import AnimatedCounter from './AnimatedCounter.vue'

export default {
  name: 'ReviewsSection',
  components: {
    AnimatedCounter
  },
  props: {
    reviews: {
      type: Array,
      default: () => []
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    }
  },
  computed: {
    displayReviews() {
      // Show up to 6 reviews
      return this.reviews.slice(0, 6)
    }
  },
  methods: {
    calculateReviewLoss() {
      // Calculate loss based on rating gap
      // Each 0.1 star below 4.5 costs about $200-300/month for average restaurant
      const targetRating = 4.5
      const gap = Math.max(0, targetRating - this.averageRating)
      const lossPerPoint = 2000 // $2000 per full star difference
      return Math.round(gap * lossPerPoint).toLocaleString()
    },
    calculatePotentialGain() {
      // Calculate potential gain if rating improves to 4.5
      const targetRating = 4.5
      const gap = Math.max(0, targetRating - this.averageRating)
      const gainPerPoint = 2000
      return Math.round(gap * gainPerPoint).toLocaleString()
    },
    getAvatarColor(index) {
      const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // yellow
        '#ef4444', // red
        '#8b5cf6', // purple
        '#06b6d4'  // cyan
      ]
      return colors[index % colors.length]
    },
    getRatingBadgeClass(rating) {
      if (rating >= 4.5) return 'bg-green-100 text-green-800'
      if (rating >= 3.5) return 'bg-blue-100 text-blue-800'
      if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800'
      return 'bg-red-100 text-red-800'
    }
  }
}
</script>

<style scoped>
.card-shadow {
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
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
</style>
