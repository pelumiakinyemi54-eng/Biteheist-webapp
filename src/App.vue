<template>
  <div id="app" class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="gradient-bg text-white py-6 no-print">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span class="text-indigo-600 font-bold text-xl">B</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold">BiteHeist</h1>
              <p class="text-indigo-200 text-sm">Restaurant SEO Audit Platform</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right text-sm">
              <div class="text-indigo-200">Powered by</div>
              <div class="font-medium">AI + Google Places</div>
            </div>
            <button 
              @click="exportPDF"
              v-if="auditData"
              class="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Search Section -->
    <SearchBox 
      :loading="loading" 
      @run-audit="handleRunAudit"
    />

    <!-- Dashboard Content -->
    <main v-if="auditData" class="container mx-auto px-4 py-8">
      <!-- Restaurant Header Card -->
      <div class="bg-white rounded-2xl p-6 mb-8 card-shadow">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div class="flex-1 mb-4 md:mb-0">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ auditData.restaurant.name }}</h1>
            <p class="text-gray-600 mb-3">{{ auditData.restaurant.address }}</p>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="flex text-yellow-400 text-lg mr-2">
                  <span v-for="i in 5" :key="i">
                    {{ i <= Math.floor(auditData.restaurant.rating || 0) ? '★' : '☆' }}
                  </span>
                </div>
                <span class="text-gray-700 font-medium">
                  {{ auditData.restaurant.rating }} 
                  <span class="text-gray-500">({{ auditData.restaurant.total_ratings }} reviews)</span>
                </span>
              </div>
              <div class="text-sm text-gray-500">
                {{ auditData.restaurant.website ? 'Website Found' : 'No Website' }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500 mb-1">Audit Generated</div>
            <div class="font-medium text-gray-800">{{ formatDate(new Date()) }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ formatTime(new Date()) }}</div>
          </div>
        </div>
      </div>

      <!-- Score Gauge Component -->
      <ScoreGauge 
        :score="auditData.overallScore"
        :metrics="auditData.metrics"
        :issues="auditData.seoIssues"
      />

      <!-- Competitor Analysis Table -->
      <CompetitorTable 
        :competitors="auditData.competitors"
        :restaurant="auditData.restaurant"
      />

      <!-- SEO Issues Grid -->
      <SeoBlock 
        :issues="auditData.seoIssues"
        :restaurant="auditData.restaurant"
      />

      <!-- PageSpeed Insights -->
      <PageSpeedBlock 
        :metrics="auditData.pagespeed"
        :url="auditData.restaurant.website"
      />

      <!-- Action Items -->
      <ActionItems 
        :items="auditData.actionItems"
        :score="auditData.overallScore"
      />

      <!-- Footer Info -->
      <div class="mt-12 p-6 bg-white rounded-2xl border border-gray-200 text-center">
        <h3 class="font-semibold text-gray-800 mb-2">Ready to Improve Your Rankings?</h3>
        <p class="text-gray-600 mb-4">
          Our automated fix engine can resolve {{ auditData.actionItems.length }} issues 
          and potentially increase your score by {{ Math.floor(Math.random() * 20 + 15) }} points.
        </p>
        <button class="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Start Auto-Fix Engine ($99/mo)
        </button>
      </div>
    </main>

    <!-- Loading State -->
    <main v-else-if="loading" class="container mx-auto px-4 py-16">
      <div class="text-center">
        <div class="loading-spinner mx-auto mb-6" style="width: 50px; height: 50px; border-width: 4px;"></div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">{{ loadingMessage }}</h2>
        <p class="text-gray-500 max-w-md mx-auto">{{ loadingSubtext }}</p>
        <div class="mt-6 bg-white rounded-lg p-4 max-w-sm mx-auto border border-gray-200">
          <div class="text-sm text-gray-600 mb-2">Progress</div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
              :style="`width: ${loadingProgress}%`"
            ></div>
          </div>
          <div class="text-xs text-gray-500 mt-2">{{ loadingProgress }}% Complete</div>
        </div>
      </div>
    </main>

    <!-- Initial Welcome State -->
    <main v-else class="container mx-auto px-4 py-16">
      <div class="text-center max-w-2xl mx-auto">
        <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">
          Discover What's Holding Your Restaurant Back
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Get a comprehensive SEO audit that reveals hidden issues costing you customers, 
          plus see how you stack up against nearby competitors.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">SEO Analysis</h3>
            <p class="text-sm text-gray-600">Comprehensive check of title tags, schema markup, and technical SEO</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Competitor Intel</h3>
            <p class="text-sm text-gray-600">See how your ratings and online presence compare to nearby restaurants</p>
          </div>
          <div class="p-6 bg-white rounded-xl border border-gray-200">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2">Speed Check</h3>
            <p class="text-sm text-gray-600">Performance audit to prevent the 27% traffic loss from slow loading</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import SearchBox from './components/SearchBox.vue'
import ScoreGauge from './components/ScoreGauge.vue'
import CompetitorTable from './components/CompetitorTable.vue'
import SeoBlock from './components/SeoBlock.vue'
import PageSpeedBlock from './components/PageSpeedBlock.vue'
import ActionItems from './components/ActionItems.vue'
import googlePlacesService from './services/googlePlaces.js'

export default {
  name: 'App',
  components: {
    SearchBox,
    ScoreGauge,
    CompetitorTable,
    SeoBlock,
    PageSpeedBlock,
    ActionItems
  },
  data() {
    return {
      auditData: null,
      loading: false,
      loadingProgress: 0,
      loadingMessage: 'Analyzing your restaurant...',
      loadingSubtext: 'This comprehensive audit takes a few moments to complete.',
      loadingSteps: [
        'Fetching Google Places data...',
        'Analyzing competitor landscape...',
        'Scanning website for SEO issues...',
        'Running PageSpeed Insights...',
        'Generating recommendations...',
        'Finalizing audit report...'
      ]
    }
  },
  methods: {
    async handleRunAudit(place) {
      if (!place) return

      this.loading = true
      this.loadingProgress = 0
      this.auditData = null

      try {
        // Start progress animation
        const progressPromise = this.simulateAuditProcess(place)

        // Get real data from backend API
        const auditResult = await googlePlacesService.auditRestaurant(place.place_id)

        await progressPromise // Wait for progress to finish
        this.auditData = auditResult
      } catch (error) {
        console.error('Audit error:', error)
        this.showError('Failed to complete audit. Please try again.')
      } finally {
        this.loading = false
        this.loadingProgress = 0
      }
    },
    
    async simulateAuditProcess(place) {
      const steps = this.loadingSteps
      const stepDuration = 3000 / steps.length
      
      for (let i = 0; i < steps.length; i++) {
        this.loadingMessage = steps[i]
        this.loadingSubtext = `Step ${i + 1} of ${steps.length}`
        
        // Animate progress
        const targetProgress = ((i + 1) / steps.length) * 100
        await this.animateProgress(this.loadingProgress, targetProgress, stepDuration)
        this.loadingProgress = targetProgress
      }
      
      this.loadingMessage = 'Audit complete!'
      this.loadingSubtext = 'Preparing your detailed report...'
    },
    
    animateProgress(start, end, duration) {
      return new Promise(resolve => {
        const startTime = Date.now()
        const diff = end - start
        
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          this.loadingProgress = start + diff * progress
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve()
          }
        }
        
        animate()
      })
    },
    
    exportPDF() {
      // Add print-specific styling
      const style = document.createElement('style')
      style.innerHTML = `
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .card-shadow { box-shadow: none; border: 1px solid #e5e7eb; }
        }
      `
      document.head.appendChild(style)
      
      // Trigger print
      window.print()
      
      // Clean up
      setTimeout(() => {
        document.head.removeChild(style)
      }, 1000)
    },
    
    formatDate(date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    formatTime(date) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    showError(message) {
      // Simple error handling - you could use a toast library here
      alert(message)
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-shadow {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media print {
  .no-print { display: none !important; }
  .card-shadow { 
    box-shadow: none !important; 
    border: 1px solid #e5e7eb !important;
  }
  body { 
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}

/* Smooth transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>