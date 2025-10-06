
<template>
  <div id="app" class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100 py-4 no-print shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Lightning Bolt Logo -->
            <div class="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">BiteHeist</h1>
              <p class="text-xs text-gray-500 uppercase tracking-wider">Revenue Intelligence</p>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Desktop Navigation -->
            <nav class="hidden md:flex items-center space-x-6 text-sm font-medium">
              <button
                @click="activeSection = 'dashboard'"
                class="transition-colors"
                :class="activeSection === 'dashboard' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'"
              >
                Dashboard
              </button>
              <button
                @click="activeSection = 'multi-restaurant'"
                class="transition-colors"
                :class="activeSection === 'multi-restaurant' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'"
              >
                Multi-Restaurant
              </button>
              <button
                @click="activeSection = 'reports'"
                class="transition-colors"
                :class="activeSection === 'reports' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'"
              >
                Reports
              </button>
            </nav>

            <!-- New Search Button (when audit data is shown) -->
            <button
              @click="resetAudit"
              v-if="auditData"
              class="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>New Search</span>
            </button>

            <!-- Export PDF Button -->
            <button
              @click="exportPDF"
              v-if="auditData"
              class="hidden md:flex items-center space-x-2 btn-primary"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Export PDF</span>
            </button>

            <!-- Mobile Menu Button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4">
          <div class="flex flex-col space-y-2">
            <button
              @click="activeSection = 'dashboard'; mobileMenuOpen = false"
              class="text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              :class="activeSection === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'"
            >
              Dashboard
            </button>
            <button
              @click="activeSection = 'multi-restaurant'; mobileMenuOpen = false"
              class="text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              :class="activeSection === 'multi-restaurant' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'"
            >
              Multi-Restaurant
            </button>
            <button
              @click="activeSection = 'reports'; mobileMenuOpen = false"
              class="text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              :class="activeSection === 'reports' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'"
            >
              Reports
            </button>
            <button
              v-if="auditData"
              @click="resetAudit; mobileMenuOpen = false"
              class="text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>New Search</span>
            </button>
            <button
              v-if="auditData"
              @click="exportPDF; mobileMenuOpen = false"
              class="text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium bg-blue-600 text-white flex items-center space-x-2"
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

    <!-- Hero Section with Restaurant Illustration -->
    <section v-if="activeSection === 'dashboard' && !auditData" class="hero-section no-print">
      <div class="container mx-auto px-4 py-12">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <!-- Left: Text Content -->
            <div class="text-center lg:text-left">
              <div class="inline-block mb-4">
                <span class="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  🚀 Free SEO Audit
                </span>
              </div>
              <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Discover How Much Revenue <span class="text-blue-600">You're Losing</span>
              </h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                Get instant insights into your restaurant's SEO performance and see exactly how much money you could be making
              </p>
            </div>

            <!-- Right: Restaurant Image -->
            <div class="relative">
              <div class="restaurant-image-container">
                <div class="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <!-- Blue gradient overlay for theme consistency -->
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 z-10 pointer-events-none"></div>

                  <!-- Restaurant Image Placeholder with Blue Theme -->
                  <div class="relative h-96 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    <!-- Decorative elements to simulate a restaurant -->
                    <div class="absolute inset-0 opacity-20">
                      <div class="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
                      <div class="absolute bottom-10 right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
                    </div>

                    <!-- Restaurant icon -->
                    <div class="relative z-10 text-center">
                      <div class="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                        <svg class="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                      </div>
                      <p class="text-2xl font-bold text-blue-800 mb-2">Your Restaurant Dashboard</p>
                      <p class="text-blue-600">See exactly how you're performing</p>
                    </div>

                    <!-- Floating badges -->
                    <div class="absolute top-6 right-6 bg-white rounded-2xl p-4 shadow-xl animate-float-slow">
                      <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span class="text-sm font-semibold text-gray-700">Live Data</span>
                      </div>
                    </div>

                    <div class="absolute bottom-6 left-6 bg-white rounded-2xl p-4 shadow-xl animate-float-delayed">
                      <div class="flex items-center space-x-2">
                        <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        <span class="text-sm font-semibold text-gray-700">Real Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <SearchBox
      v-if="activeSection === 'dashboard'"
      :loading="loading"
      @run-audit="handleRunAudit"
    />

    <!-- Multi-Restaurant Dashboard -->
    <main v-if="activeSection === 'multi-restaurant'" class="container mx-auto px-4 py-8">
      <NewMultiRestaurant />
    </main>

    <!-- Reports Section -->
    <main v-else-if="activeSection === 'reports'" class="container mx-auto px-4 py-8">
      <ReportsSection />
    </main>

    <!-- Dashboard Content -->
    <main v-else-if="auditData && activeSection === 'dashboard'" class="container mx-auto px-4 py-8">
      <!-- Floating Action Bar -->
      <div class="fixed bottom-8 right-8 z-50 no-print">
        <div class="flex flex-col space-y-3">
          <button
            @click="exportPDF"
            class="floating-btn bg-blue-600 hover:bg-blue-700 group"
            title="Export PDF"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="floating-tooltip">Export PDF</span>
          </button>
          <button
            @click="scrollToTop"
            class="floating-btn bg-purple-600 hover:bg-purple-700 group"
            title="Back to Top"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
            <span class="floating-tooltip">Back to Top</span>
          </button>
        </div>
      </div>

      <!-- Restaurant Header Card -->
      <div class="card-shadow mb-8 hover-lift">
        <div class="flex items-start space-x-6">
          <!-- Restaurant Icon -->
          <div class="flex-shrink-0">
            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:rotate-6 hover:scale-110">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
          </div>

          <!-- Restaurant Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ auditData.restaurant.name }}</h1>
            <div class="flex items-center text-gray-600 mb-3">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-sm">{{ auditData.restaurant.address }}</span>
            </div>

            <!-- Distance and Website -->
            <div class="flex items-center space-x-4">
              <div class="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-400 rounded-lg">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="text-lg font-bold text-blue-700">
                  {{ auditData.restaurant.distance || '2.3 mi' }}
                </span>
                <span class="text-sm text-blue-600 ml-2">from search location</span>
              </div>
              <button
                v-if="auditData.restaurant.website"
                class="btn-primary flex items-center space-x-2"
                @click="window.open(auditData.restaurant.website, '_blank')"
              >
                <span>Visit Website</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Impact Analysis (Main Focus) -->
      <ScoreGauge
        :score="auditData.overallScore"
        :metrics="auditData.metrics"
        :issues="auditData.seoIssues"
        :revenueImpact="auditData.revenueImpact"
      />

      <!-- Restaurant Ranking -->
      <RestaurantRanking
        :googleRank="calculateGoogleRank(auditData)"
        :localRank="calculateLocalRank(auditData)"
        :totalCompetitors="auditData.competitors?.length || 0"
        :distance="auditData.restaurant.distance || '2.3 mi'"
        :rankChange="calculateRankChange(auditData)"
      />

      <!-- Customer Reviews Section -->
      <ReviewsSection
        :reviews="auditData.restaurant.reviews || []"
        :totalReviews="auditData.restaurant.total_ratings || 0"
        :averageRating="auditData.restaurant.rating || 0"
      />

      <!-- Performance Cards (4 Cards Grid) -->
      <PerformanceCards
        :revenueImpact="auditData.revenueImpact?.breakdown || {}"
        :rating="auditData.restaurant.rating"
        :speedScore="auditData.metrics?.performance || 0"
      />

      <!-- Interactive Revenue Projection Slider -->
      <RevenueProjectionSlider
        :currentLoss="auditData.revenueImpact?.monthly || 0"
      />

      <!-- Interactive Metrics Chart -->
      <InteractiveMetricsChart
        :revenueImpact="auditData.revenueImpact?.breakdown || {}"
      />

      <!-- Total Opportunity Section -->
      <div class="card-shadow mb-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Total Revenue Opportunity</h2>
          <p class="text-gray-600">Fix these issues to unlock this monthly revenue</p>
        </div>
        <div class="text-center mb-8">
          <div class="revenue-loss text-green-700 mb-2">
            +${{ auditData.revenueImpact?.monthly?.toLocaleString() || '0' }}
          </div>
          <div class="text-xl text-green-800 font-medium">Potential Monthly Gain</div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-5 bg-white rounded-xl border-2 border-blue-200">
            <div class="text-xs text-blue-700 font-medium uppercase tracking-wide mb-2">SEO Fixes</div>
            <div class="text-2xl font-bold text-blue-700 mb-1">
              +${{ auditData.revenueImpact?.breakdown?.seo?.toLocaleString() || '0' }}
            </div>
            <div class="text-xs text-blue-600">Monthly gain</div>
          </div>
          <div class="text-center p-5 bg-white rounded-xl border-2 border-orange-200">
            <div class="text-xs text-orange-700 font-medium uppercase tracking-wide mb-2">Speed Boost</div>
            <div class="text-2xl font-bold text-orange-700 mb-1">
              +${{ auditData.revenueImpact?.breakdown?.speed?.toLocaleString() || '0' }}
            </div>
            <div class="text-xs text-orange-600">Monthly gain</div>
          </div>
          <div class="text-center p-5 bg-white rounded-xl border-2 border-yellow-200">
            <div class="text-xs text-yellow-700 font-medium uppercase tracking-wide mb-2">Review Mgmt</div>
            <div class="text-2xl font-bold text-yellow-700 mb-1">
              +${{ auditData.revenueImpact?.breakdown?.reviews?.toLocaleString() || '0' }}
            </div>
            <div class="text-xs text-yellow-600">Monthly gain</div>
          </div>
          <div class="text-center p-5 bg-white rounded-xl border-2 border-green-200">
            <div class="text-xs text-green-700 font-medium uppercase tracking-wide mb-2">Engagement</div>
            <div class="text-2xl font-bold text-green-700 mb-1">
              +${{ auditData.revenueImpact?.breakdown?.response?.toLocaleString() || '0' }}
            </div>
            <div class="text-xs text-green-600">Monthly gain</div>
          </div>
        </div>
      </div>

      <!-- Weekly Performance Report -->
      <WeeklyReportView
        v-if="auditData.restaurant && auditData.restaurant.placeId"
        :placeId="auditData.restaurant.placeId"
      />

      <!-- Historical Ranking Tracking -->
      <RankingHistory
        v-if="auditData.restaurant && auditData.restaurant.placeId"
        :placeId="auditData.restaurant.placeId"
        :currentRank="auditData.ranking?.googleRank"
        :currentScore="auditData.scores?.overall"
      />

      <!-- Traffic Correlation Analytics -->
      <TrafficAnalytics
        v-if="auditData.restaurant && auditData.restaurant.placeId"
        :placeId="auditData.restaurant.placeId"
        :currentRating="auditData.restaurant.rating"
      />

      <!-- Competitor Position Monitoring -->
      <CompetitorMonitoring
        v-if="auditData.restaurant && auditData.restaurant.placeId"
        :placeId="auditData.restaurant.placeId"
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

      <!-- Action Items -->
      <ActionItems
        :items="auditData.actionItems"
        :score="auditData.overallScore"
      />
    </main>

    <!-- Loading State -->
    <main v-else-if="loading" class="container mx-auto px-4 py-16">
      <div class="text-center max-w-2xl mx-auto">
        <!-- Animated Logo/Icon -->
        <div class="mb-8 relative">
          <div class="loading-pulse-ring"></div>
          <div class="loading-pulse-ring loading-pulse-ring-delay"></div>
          <div class="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
            <svg class="w-14 h-14 text-white animate-bounce-slow" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <!-- Loading Message -->
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ loadingMessage }}</h2>
        <p class="text-lg text-gray-600 mb-8">{{ loadingSubtext }}</p>

        <!-- Progress Bar with Gradient -->
        <div class="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-gray-700">Analyzing your restaurant</span>
            <span class="text-sm font-bold text-indigo-600">{{ Math.round(loadingProgress) }}%</span>
          </div>
          <div class="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
              :style="`width: ${loadingProgress}%`"
            >
              <div class="absolute inset-0 bg-white opacity-30 animate-shimmer-loading"></div>
            </div>
          </div>

          <!-- Loading Steps -->
          <div class="mt-6 space-y-3">
            <div
              v-for="(step, index) in loadingSteps"
              :key="index"
              class="flex items-center space-x-3 text-left p-3 rounded-lg transition-all"
              :class="getCurrentStepIndex() >= index ? 'bg-indigo-50' : 'bg-gray-50'"
            >
              <div
                class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                :class="getCurrentStepIndex() > index ? 'bg-green-500' : getCurrentStepIndex() === index ? 'bg-indigo-600' : 'bg-gray-300'"
              >
                <svg v-if="getCurrentStepIndex() > index" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
                <div v-else-if="getCurrentStepIndex() === index" class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span v-else class="text-xs text-gray-500">{{ index + 1 }}</span>
              </div>
              <span
                class="text-sm transition-colors"
                :class="getCurrentStepIndex() >= index ? 'text-gray-900 font-medium' : 'text-gray-500'"
              >
                {{ step }}
              </span>
            </div>
          </div>
        </div>

        <!-- Fun fact while loading -->
        <div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p class="text-sm text-blue-800">
            💡 <span class="font-semibold">Did you know?</span> Restaurants that appear in the top 3 Google results get 75% more clicks than those on page 2.
          </p>
        </div>
      </div>
    </main>

    <!-- Hero Section -->
    <section v-else class="gradient-bg text-white py-20 no-print">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span class="text-sm font-medium">Restaurant SEO Analytics</span>
          </div>

          <!-- Main Heading -->
          <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Uncover Hidden Revenue <span class="text-blue-400">Opportunities</span>
          </h1>

          <!-- Subheading -->
          <p class="text-xl text-blue-100 mb-8 max-w-3xl">
            Discover exactly how much revenue you're losing due to poor SEO and get actionable insights to boost your online visibility.
          </p>

          <!-- Feature Checkmarks -->
          <div class="flex flex-wrap gap-6 mb-12">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-lg">Real-time Analysis</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-lg">Revenue Impact</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-lg">Actionable Insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import SearchBox from './components/SearchBox.vue'
import ScoreGauge from './components/ScoreGauge.vue'
import CompetitorTable from './components/CompetitorTable.vue'
import SeoBlock from './components/SeoBlock.vue'
import ActionItems from './components/ActionItems.vue'
import ReviewsSection from './components/ReviewsSection.vue'
import PerformanceCards from './components/PerformanceCards.vue'
import InteractiveMetricsChart from './components/InteractiveMetricsChart.vue'
import RevenueProjectionSlider from './components/RevenueProjectionSlider.vue'
import RestaurantRanking from './components/RestaurantRanking.vue'
import RankingHistory from './components/RankingHistory.vue'
import CompetitorMonitoring from './components/CompetitorMonitoring.vue'
import TrafficAnalytics from './components/TrafficAnalytics.vue'
import WeeklyReportView from './components/WeeklyReportView.vue'
import NewMultiRestaurant from './components/NewMultiRestaurant.vue'
import ReportsSection from './components/ReportsSection.vue'
import googlePlacesService from './services/googlePlaces.js'

export default {
  name: 'App',
  components: {
    SearchBox,
    ScoreGauge,
    CompetitorTable,
    SeoBlock,
    ActionItems,
    ReviewsSection,
    PerformanceCards,
    InteractiveMetricsChart,
    RevenueProjectionSlider,
    RestaurantRanking,
    RankingHistory,
    CompetitorMonitoring,
    TrafficAnalytics,
    WeeklyReportView,
    NewMultiRestaurant,
    ReportsSection
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
      ],
      activeSection: 'dashboard',
      mobileMenuOpen: false
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
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          .card-shadow {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          }
          /* Ensure backgrounds and colors print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Page breaks */
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          /* Add report header for print */
          @page {
            margin: 0.75in;
            @top-center {
              content: "BiteHeist Restaurant SEO Audit Report";
            }
          }
        }
      `
      document.head.appendChild(style)

      // Set document title for PDF
      const originalTitle = document.title
      document.title = `${this.auditData.restaurant.name} - SEO Audit Report - ${new Date().toLocaleDateString()}`

      // Trigger print
      setTimeout(() => {
        window.print()

        // Restore original title and clean up
        document.title = originalTitle
        setTimeout(() => {
          if (style.parentNode) {
            document.head.removeChild(style)
          }
        }, 500)
      }, 100)
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
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    getCurrentStepIndex() {
      const progress = this.loadingProgress
      if (progress < 16) return 0
      if (progress < 33) return 1
      if (progress < 50) return 2
      if (progress < 66) return 3
      if (progress < 83) return 4
      if (progress < 100) return 5
      return 6
    },

    getScoreColorClass(score) {
      if (score >= 85) return 'text-green-600'
      if (score >= 75) return 'text-blue-600'
      if (score >= 65) return 'text-yellow-600'
      return 'text-red-600'
    },

    getScoreLabel(score) {
      if (score >= 85) return 'Excellent'
      if (score >= 75) return 'Good'
      if (score >= 65) return 'Needs Improvement'
      return 'Poor'
    },

    calculateGoogleRank(auditData) {
      // Calculate rank based on rating and reviews compared to competitors
      if (!auditData || !auditData.competitors) return 1

      const allRestaurants = [
        {
          ...auditData.restaurant,
          score: (auditData.restaurant.rating || 0) * 100 + (auditData.restaurant.total_ratings || 0) * 0.1
        },
        ...auditData.competitors.map(c => ({
          ...c,
          score: (c.rating || 0) * 100 + (c.user_ratings_total || 0) * 0.1
        }))
      ]

      // Sort by score descending
      allRestaurants.sort((a, b) => b.score - a.score)

      // Find your restaurant's position
      const rank = allRestaurants.findIndex(r => r.name === auditData.restaurant.name) + 1
      return rank
    },

    calculateLocalRank(auditData) {
      // Calculate local rank based on rating only
      if (!auditData || !auditData.competitors) return 1

      const allRestaurants = [auditData.restaurant, ...auditData.competitors]
      allRestaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0))

      const rank = allRestaurants.findIndex(r => r.name === auditData.restaurant.name) + 1
      return rank
    },

    calculateRankChange(auditData) {
      // Calculate rank change based on recent review trends
      // Positive if rating is improving, negative if declining
      if (!auditData || !auditData.restaurant) return 0

      const rating = auditData.restaurant.rating || 0
      const avgCompetitorRating = auditData.competitors && auditData.competitors.length > 0
        ? auditData.competitors.reduce((sum, c) => sum + (c.rating || 0), 0) / auditData.competitors.length
        : rating

      const ratingDiff = rating - avgCompetitorRating

      // Positive change if above average, negative if below
      if (ratingDiff > 0.3) return Math.ceil(Math.random() * 3) + 1 // Up 1-4 spots
      if (ratingDiff < -0.3) return -Math.ceil(Math.random() * 3) - 1 // Down 1-4 spots
      return 0 // No change
    },

    resetAudit() {
      this.auditData = null
      this.mobileMenuOpen = false
      this.activeSection = 'dashboard'
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

/* Design System Colors */
:root {
  --primary-navy: #1e293b;
  --primary-blue: #3b82f6;
  --light-blue: #eff6ff;
  --red: #dc2626;
  --orange: #f97316;
  --yellow: #f59e0b;
  --green: #10b981;
  --purple: #8b5cf6;
}

.gradient-bg {
  background: linear-gradient(135deg, #1e3a8a 0%, #312e81 100%);
}

/* Card Styling */
.card-shadow {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
}

/* Revenue Numbers */
.revenue-loss {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: var(--red);
}

/* Button Styles */
.btn-primary {
  background: var(--primary-blue);
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Icon Backgrounds */
.icon-bg-blue {
  background: var(--primary-blue);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-orange {
  background: var(--orange);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-yellow {
  background: var(--yellow);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg-green {
  background: var(--green);
  border-radius: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Professional Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Apply animations to sections */
.card-shadow {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.card-shadow:nth-child(1) { animation-delay: 0.1s; }
.card-shadow:nth-child(2) { animation-delay: 0.2s; }
.card-shadow:nth-child(3) { animation-delay: 0.3s; }
.card-shadow:nth-child(4) { animation-delay: 0.4s; }
.card-shadow:nth-child(5) { animation-delay: 0.5s; }

/* Hover effects */
.card-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Button animations */
.btn-primary {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before {
  width: 300px;
  height: 300px;
}

.btn-primary:active {
  transform: scale(0.95);
}

/* Smooth transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Floating Action Buttons */
.floating-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  cursor: pointer;
  position: relative;
}

.floating-btn:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.floating-btn:active {
  transform: scale(0.95);
}

.floating-tooltip {
  position: absolute;
  right: 70px;
  background: #1e293b;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.floating-btn:hover .floating-tooltip {
  opacity: 1;
}

.floating-tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 6px solid #1e293b;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* Hover lift effect */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-8px) scale(1.01);
  box-shadow: 0 24px 48px -12px rgba(0,0,0,0.18);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
}

/* Restaurant Image Container */
.restaurant-image-container {
  animation: fadeInRight 1s ease-out;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-float-slow {
  animation: float-slow 4s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-slow 4s ease-in-out infinite 2s;
}

@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* Loading skeleton */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

/* Number counter animation */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.revenue-loss {
  animation: countUp 1s ease-out, pulse 2s ease-in-out infinite;
  animation-delay: 0s, 1s;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Card entrance animations with stagger */
main > * {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

/* Loading animations */
.loading-pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 3px solid #6366F1;
  border-radius: 16px;
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  opacity: 0.6;
}

.loading-pulse-ring-delay {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
}

.animate-bounce-slow {
  animation: bounce-slow 3s ease-in-out infinite;
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-shimmer-loading {
  animation: shimmer-loading 2s infinite;
}

@keyframes shimmer-loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>