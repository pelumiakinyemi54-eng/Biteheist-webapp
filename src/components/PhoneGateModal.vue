<template>
  <Transition name="modal-fade">
    <div v-if="!hasAccess" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-scale-up">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Get Your Free SEO Report</h2>
          <p class="text-gray-600">Enter your phone number to view your complete restaurant audit with revenue projections</p>
        </div>

        <!-- Features List -->
        <div class="mb-6 space-y-3">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-gray-700">Complete SEO audit with actionable insights</span>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-gray-700">Revenue impact analysis</span>
          </div>
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-gray-700">Competitor comparison</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitPhone" class="space-y-4">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
                :disabled="loading"
              />
            </div>
            <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            :disabled="loading"
          >
            <span v-if="!loading">View My Free Report</span>
            <span v-else class="flex items-center space-x-2">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </span>
          </button>
        </form>

        <!-- Privacy Notice -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <p class="text-xs text-gray-500">
              Your information is secure. We'll only use this to send you insights about your restaurant's online presence. No spam, ever.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'PhoneGateModal',
  props: {
    restaurantId: {
      type: String,
      required: true
    },
    restaurantName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      phone: '',
      hasAccess: false,
      loading: false,
      error: ''
    }
  },
  methods: {
    async submitPhone() {
      // Reset error
      this.error = '';

      // Validate phone number
      if (!this.phone || this.phone.trim().length < 10) {
        this.error = 'Please enter a valid phone number';
        return;
      }

      this.loading = true;

      try {
        // Get API URL from environment
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';

        // Save to backend
        const response = await fetch(`${apiUrl}/api/leads/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phone: this.phone.trim(),
            placeId: this.restaurantId,
            restaurantName: this.restaurantName,
            source: 'audit-report',
            timestamp: new Date().toISOString()
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to submit');
        }

        // Store in localStorage to avoid repeat asks
        localStorage.setItem('reportAccess', 'granted');
        localStorage.setItem('reportAccessTime', new Date().toISOString());

        this.hasAccess = true;
        this.$emit('access-granted');
      } catch (error) {
        console.error('Error submitting phone:', error);
        this.error = 'Failed to submit. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Check if already provided phone
    const accessGranted = localStorage.getItem('reportAccess') === 'granted';
    const accessTime = localStorage.getItem('reportAccessTime');

    // Access expires after 7 days
    if (accessGranted && accessTime) {
      const accessDate = new Date(accessTime);
      const daysSinceAccess = (new Date() - accessDate) / (1000 * 60 * 60 * 24);

      if (daysSinceAccess < 7) {
        this.hasAccess = true;
        this.$emit('access-granted');
      } else {
        // Clear expired access
        localStorage.removeItem('reportAccess');
        localStorage.removeItem('reportAccessTime');
      }
    }
  }
}
</script>

<style scoped>
/* Modal fade animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Scale up animation */
@keyframes scale-up {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-up {
  animation: scale-up 0.3s ease-out;
}
</style>
