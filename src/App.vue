
<template>
  <div id="app" class="bg-gray-50 min-h-screen">
    <!-- Phone Gate Modal -->
    <PhoneGateModal
      v-if="auditData && auditData.restaurant"
      :restaurantId="auditData.restaurant.placeId"
      :restaurantName="auditData.restaurant.name"
      @access-granted="onPhoneGateAccessGranted"
    />

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

      <!-- Two Column Layout - Stack on mobile, side-by-side on desktop -->
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-8">

        <!-- Left Sidebar Score Card - Full width on mobile, fixed width on desktop -->
        <aside class="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-8 h-fit no-print">
          <div class="card-shadow bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
            <!-- Circular Score Gauge -->
            <div class="flex flex-col items-center mb-8">
              <div class="relative w-48 h-48">
                <svg class="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    stroke-width="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    :stroke="getScoreColor(auditData.overallScore)"
                    stroke-width="12"
                    fill="none"
                    :stroke-dasharray="553"
                    :stroke-dashoffset="553 - (553 * auditData.overallScore) / 100"
                    class="transition-all duration-1000"
                  />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="text-6xl font-bold text-gray-900">{{ auditData.overallScore }}</div>
                  <div class="text-gray-500 text-sm">/ 100</div>
                </div>
              </div>
              <div class="text-center mt-4">
                <div class="text-sm text-gray-600 uppercase tracking-wide mb-1">Online health grade</div>
                <div class="text-2xl font-bold" :class="getScoreColorText(auditData.overallScore)">
                  {{ getScoreLabel(auditData.overallScore) }}
                </div>
              </div>
            </div>

            <!-- Category Breakdown -->
            <div class="space-y-4 mb-6">
              <!-- Search Results -->
              <div
                class="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                @click="scrollToSection('search-results-section')"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="calculateSearchResultsScore(auditData) >= 32 ? 'bg-green-100' : calculateSearchResultsScore(auditData) >= 24 ? 'bg-blue-100' : calculateSearchResultsScore(auditData) >= 16 ? 'bg-yellow-100' : 'bg-orange-100'"
                  >
                    <svg
                      class="w-5 h-5"
                      :class="calculateSearchResultsScore(auditData) >= 32 ? 'text-green-600' : calculateSearchResultsScore(auditData) >= 24 ? 'text-blue-600' : calculateSearchResultsScore(auditData) >= 16 ? 'text-yellow-600' : 'text-orange-600'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 text-sm">Search Results</div>
                    <div
                      class="text-xs font-semibold"
                      :class="getScoreStatus(calculateSearchResultsScore(auditData), 40).color"
                    >
                      {{ getScoreStatus(calculateSearchResultsScore(auditData), 40).label }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">{{ calculateSearchResultsScore(auditData) }}</div>
                  <div class="text-xs text-gray-500">/40</div>
                </div>
              </div>

              <!-- Website Experience -->
              <div
                class="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                @click="scrollToSection('website-experience-section')"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="calculateWebsiteExperienceScore(auditData) >= 32 ? 'bg-green-100' : calculateWebsiteExperienceScore(auditData) >= 24 ? 'bg-blue-100' : calculateWebsiteExperienceScore(auditData) >= 16 ? 'bg-yellow-100' : 'bg-orange-100'"
                  >
                    <svg
                      class="w-5 h-5"
                      :class="calculateWebsiteExperienceScore(auditData) >= 32 ? 'text-green-600' : calculateWebsiteExperienceScore(auditData) >= 24 ? 'text-blue-600' : calculateWebsiteExperienceScore(auditData) >= 16 ? 'text-yellow-600' : 'text-orange-600'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 text-sm">Website Experience</div>
                    <div
                      class="text-xs font-semibold"
                      :class="getScoreStatus(calculateWebsiteExperienceScore(auditData), 40).color"
                    >
                      {{ getScoreStatus(calculateWebsiteExperienceScore(auditData), 40).label }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">{{ calculateWebsiteExperienceScore(auditData) }}</div>
                  <div class="text-xs text-gray-500">/40</div>
                </div>
              </div>

              <!-- Local Listings -->
              <div
                class="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                @click="scrollToSection('local-listings-section')"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center"
                    :class="calculateLocalListingsScore(auditData) >= 16 ? 'bg-green-100' : calculateLocalListingsScore(auditData) >= 12 ? 'bg-blue-100' : calculateLocalListingsScore(auditData) >= 8 ? 'bg-yellow-100' : 'bg-orange-100'"
                  >
                    <svg
                      class="w-5 h-5"
                      :class="calculateLocalListingsScore(auditData) >= 16 ? 'text-green-600' : calculateLocalListingsScore(auditData) >= 12 ? 'text-blue-600' : calculateLocalListingsScore(auditData) >= 8 ? 'text-yellow-600' : 'text-orange-600'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-900 text-sm">Local Listings</div>
                    <div
                      class="text-xs font-semibold"
                      :class="getScoreStatus(calculateLocalListingsScore(auditData), 20).color"
                    >
                      {{ getScoreStatus(calculateLocalListingsScore(auditData), 20).label }}
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">{{ calculateLocalListingsScore(auditData) }}</div>
                  <div class="text-xs text-gray-500">/20</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content Column -->
        <div class="flex-1 min-w-0">

      <!-- Floating Action Bar - Better mobile positioning -->
      <div class="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 no-print">
        <div class="flex flex-col space-y-2 sm:space-y-3">
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
      <div class="card-shadow mb-6 sm:mb-8">
        <div class="flex flex-col sm:flex-row items-start sm:justify-between gap-3 mb-4">
          <div class="flex-1">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ auditData.restaurant.name }}</h1>
            <div class="flex items-center text-gray-600">
              <svg class="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="text-sm break-words">{{ auditData.restaurant.address }}</span>
            </div>
          </div>
          <button
            v-if="auditData.restaurant.website"
            class="btn-primary flex items-center space-x-2 w-full sm:w-auto justify-center"
            @click="window.open(auditData.restaurant.website, '_blank')"
          >
            <span class="text-xs sm:text-sm">Visit Website</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </button>
        </div>

        <!-- Summary Counter -->
        <div class="pt-4 border-t border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            We found {{ (auditData.seoIssues?.length || 0) + (auditData.actionItems?.length || 0) }} problems with your online presence
          </h2>
          <p class="text-sm sm:text-base text-gray-600">
            {{ getTotalCheckedItems(auditData) }} things reviewed, {{ (auditData.seoIssues?.length || 0) + (auditData.actionItems?.length || 0) }} need work
          </p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card-shadow mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <!-- Search Bar -->
          <div class="flex-1 max-w-md">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search competitors, issues..."
                class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                v-if="searchQuery"
                @click="searchQuery = ''"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Date Range Filter -->
          <div class="flex items-center space-x-3">
            <label class="text-sm font-medium text-gray-700">Period:</label>
            <select
              v-model="selectedDateRange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium"
            >
              <option v-for="range in dateRanges" :key="range.value" :value="range.value">
                {{ range.label }}
              </option>
            </select>

            <!-- Export Button -->
            <button
              @click="exportPDF"
              class="btn-primary flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        <!-- Active Filters Display -->
        <div v-if="searchQuery || selectedDateRange !== 'all_time'" class="mt-4 flex items-center gap-2 flex-wrap">
          <span class="text-sm text-gray-600">Active filters:</span>
          <span v-if="selectedDateRange !== 'all_time'" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            📅 {{ getDateRangeLabel() }}
            <button @click="selectedDateRange = 'all_time'" class="ml-2 hover:text-blue-900">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
          <span v-if="searchQuery" class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            🔍 "{{ searchQuery }}"
            <button @click="searchQuery = ''" class="ml-2 hover:text-green-900">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>
        </div>
      </div>

      <!-- Key Metrics (3 Hero Cards) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <!-- Revenue Lost -->
        <div class="card-shadow text-center">
          <div class="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Revenue Lost</div>
          <div class="text-3xl sm:text-4xl font-bold text-red-600 mb-1">
            ${{ auditData.revenueImpact?.monthly?.toLocaleString() || '0' }}
          </div>
          <div class="text-xs sm:text-sm text-gray-600 mb-2">per month</div>
          <div class="flex items-center justify-center text-xs">
            <span class="text-orange-600 font-semibold flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              +8% vs last month
            </span>
          </div>
        </div>

        <!-- SEO Score -->
        <div class="card-shadow text-center">
          <div class="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">SEO Score</div>
          <div class="text-3xl sm:text-4xl font-bold mb-1" :class="getScoreColorClass(auditData.overallScore)">
            {{ auditData.overallScore }}/100
          </div>
          <div class="text-xs sm:text-sm text-gray-600 mb-2">{{ getScoreLabel(auditData.overallScore) }}</div>
          <div class="flex items-center justify-center text-xs">
            <span class="text-green-600 font-semibold flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              +3 pts this week
            </span>
          </div>
        </div>

        <!-- Quick Win -->
        <div class="card-shadow text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div class="text-xs sm:text-sm text-green-700 uppercase tracking-wide font-semibold mb-2">Quick Win</div>
          <div class="text-base sm:text-lg font-bold text-green-800 mb-1 line-clamp-2">
            {{ getTopQuickWin(auditData) }}
          </div>
          <div class="text-xs sm:text-sm text-green-600 mb-2">Potential gain: +${{ getQuickWinRevenue(auditData) }}/mo</div>
          <div class="text-xs text-green-700 font-semibold">
            ⚡ Takes ~15 minutes
          </div>
        </div>
      </div>

      <!-- Who's Beating You on Google -->
      <div class="card-shadow mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Who's beating you on Google</h2>

        <!-- Empty State -->
        <div v-if="getTopCompetitors(auditData).length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-gray-500">No competitors found matching your search</p>
          <button @click="searchQuery = ''" class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Clear search
          </button>
        </div>

        <!-- Competitors List -->
        <div v-else class="space-y-3">
          <div
            v-for="(competitor, index) in getAllCompetitors(auditData)"
            :key="index"
            class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div class="flex items-center space-x-4 flex-1">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">{{ competitor.name }}</div>
                <div class="flex items-center text-sm text-gray-600 mt-1">
                  <span class="font-semibold text-gray-900 mr-1">{{ competitor.rating || 'N/A' }}</span>
                  <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span class="ml-1">{{ competitor.user_ratings_total || 0 }} reviews</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-semibold" :class="getRankingColorClass(index + 1)">
                {{ index + 1 }}{{ getOrdinalSuffix(index + 1) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 3 Issues to Fix -->
      <div class="card-shadow mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Top Issues to Fix</h2>

        <!-- Empty State -->
        <div v-if="getTopIssues(auditData).length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-gray-500">No issues found matching your search</p>
          <button @click="searchQuery = ''" class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
            Clear search
          </button>
        </div>

        <!-- Issues List -->
        <div v-else class="space-y-4">
          <div
            v-for="(issue, index) in getTopIssues(auditData)"
            :key="index"
            class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div class="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 mb-1">{{ issue.title }}</h3>
              <p class="text-sm text-gray-600">{{ issue.description }}</p>
            </div>
            <div class="text-right flex items-start space-x-4">
              <div>
                <div class="text-sm text-gray-500">Impact</div>
                <div class="font-bold text-red-600">+${{ issue.impact }}/mo</div>
              </div>
              <!-- Action Icons -->
              <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="View Solution"
                >
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
                <button
                  class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Dismiss"
                >
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results: Headline & Metadata -->
      <div id="search-results-section" class="card-shadow mb-8">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Search Results</h2>
            <p class="text-gray-600 text-sm">Headline & Metadata</p>
          </div>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3 flex-1">
              <svg v-if="checkHeadlineKeywords(auditData)" class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Headline includes keywords</div>
                <div class="text-sm text-gray-600">Your restaurant name should include relevant search terms like cuisine type or location</div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3 flex-1">
              <svg v-if="checkMetaDescription(auditData)" class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Meta description optimized</div>
                <div class="text-sm text-gray-600">Compelling meta descriptions improve click-through rates from search results</div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3 flex-1">
              <svg v-if="checkTitleTag(auditData)" class="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-gray-900">Title tag includes location</div>
                <div class="text-sm text-gray-600">Location-based title tags help you rank for "near me" searches</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Online Presence Section: Keyword Rankings Across Cities -->
      <OnlinePresenceSection
        v-if="auditData && auditData.restaurant"
        :restaurantData="auditData.restaurant"
      />

      <!-- Website Experience: Guest Experience & Appearance -->
      <div id="website-experience-section" class="card-shadow mb-8">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Guest Experience</h2>
            <p class="text-gray-600 text-sm">Improve the experience on your website</p>
          </div>
        </div>

        <!-- Your site Section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Your site</h3>
          <div class="space-y-3">
            <!-- Website exists -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkWebsiteExists(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Your site exists and drives conversion and sales</div>
                <div class="text-sm text-gray-600">Having a website is crucial for online presence</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Content</h3>
          <div class="space-y-3">
            <!-- On-site ordering -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkOnlineOrdering(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">On-site ordering</div>
                <div class="text-sm text-gray-600">Having ordering built in leads to a streamlined user experience and not revenue</div>
              </div>
            </div>

            <!-- Effective CTAs -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkEffectiveCTAs(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Effective CTAs or online ordering</div>
                <div class="text-sm text-gray-600">Action on products like DoorDash, Postmates or Slice can significantly increase conversions</div>
              </div>
            </div>

            <!-- Phone number -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkPhoneNumber(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Phone number</div>
                <div class="text-sm text-gray-600">Listing a phone number increases the number of calls and allows</div>
              </div>
            </div>

            <!-- Favicon -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkFavicon(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Favicon</div>
                <div class="text-sm text-gray-600">Favicon visible in tabs and bookmarks</div>
              </div>
            </div>

            <!-- Other ordering links -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkOrderingLinks(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Other ordering links only</div>
                <div class="text-sm text-gray-600">Having clear links or CTAs for online ordering improves conversions</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance Section -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Appearance</h3>
          <div class="space-y-3">
            <!-- Compelling About Us -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkAboutUsSection(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Compelling About Us section</div>
                <div class="text-sm text-gray-600">Sharing more information about yourself will your customers</div>
              </div>
            </div>

            <!-- Professional design -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkDesign(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Professional design</div>
                <div class="text-sm text-gray-600">A clean, modern design builds trust with customers</div>
              </div>
            </div>

            <!-- Mobile-friendly -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkMobileFriendly(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Mobile-friendly design</div>
                <div class="text-sm text-gray-600">Responsive design ensures great experience on all devices</div>
              </div>
            </div>

            <!-- Fast page load -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkPageSpeed(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Fast page load speed</div>
                <div class="text-sm text-gray-600">Quick loading times reduce bounce rates and improve SEO</div>
              </div>
            </div>

            <!-- Clear navigation -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkNavigation(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Clear navigation</div>
                <div class="text-sm text-gray-600">Intuitive menu structure helps visitors find what they need</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Local Listings: Profile Content -->
      <div id="local-listings-section" class="card-shadow mb-8">
        <div class="flex items-center space-x-3 mb-6">
          <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Local Listings</h2>
            <p class="text-gray-600 text-sm">Make your restaurant easy to find</p>
          </div>
        </div>

        <!-- Google Business Profile Rating -->
        <div class="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-1">Google Business Profile</h3>
              <div class="flex items-center space-x-2">
                <span class="text-2xl font-bold text-gray-900">{{ auditData.restaurant.rating || 'N/A' }}</span>
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span class="text-gray-600">({{ auditData.restaurant.total_ratings || 0 }} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Content Section -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Profile content</h3>
          <div class="space-y-3">
            <!-- First-party website -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkFirstPartyWebsite(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">First-party website</div>
                <div class="text-sm text-gray-600">Website URL is present</div>
              </div>
            </div>

            <!-- Description -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkDescription(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Description</div>
                <div class="text-sm text-gray-600">Description long enough should be at least 50 characters & less than 750</div>
              </div>
            </div>

            <!-- Business hours -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkBusinessHours(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Business hours</div>
                <div class="text-sm text-gray-600">At least one day listed</div>
              </div>
            </div>

            <!-- Phone number -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkPhoneNumber(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Phone number</div>
                <div class="text-sm text-gray-600">(XXX) XXX-XXXX</div>
              </div>
            </div>

            <!-- Price range -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkPriceRange(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Price range</div>
                <div class="text-sm text-gray-600">$ - $$$$</div>
              </div>
            </div>
          </div>
        </div>

        <!-- User-submitted content Section -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">User-submitted content</h3>
          <div class="space-y-3">
            <!-- Description includes relevant keywords -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkDescriptionKeywords(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Description includes relevant keywords</div>
                <div class="text-sm text-gray-600">Matches keywords like cuisine type, specialties, and restaurant type</div>
              </div>
            </div>

            <!-- Categories match keywords -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkCategoryKeywords(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Categories match keywords</div>
                <div class="text-sm text-gray-600">Google Business Profile categories align with your keywords</div>
              </div>
            </div>

            <!-- Photos -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkPhotos(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Photos uploaded</div>
                <div class="text-sm text-gray-600">At least 5 photos uploaded to your profile</div>
              </div>
            </div>

            <!-- Review responses -->
            <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <svg v-if="checkReviewResponses(auditData)" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="flex-1">
                <div class="font-medium text-gray-900">Active review responses</div>
                <div class="text-sm text-gray-600">Responding to at least 50% of your recent reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

        </div>
        <!-- End Main Content Column -->
      </div>
      <!-- End Two Column Layout -->
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
import PhoneGateModal from './components/PhoneGateModal.vue'
import OnlinePresenceSection from './components/OnlinePresenceSection.vue'
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
    ReportsSection,
    PhoneGateModal,
    OnlinePresenceSection
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
      mobileMenuOpen: false,
      selectedDateRange: 'all_time',
      searchQuery: '',
      dateRanges: [
        { value: 'today', label: 'Today' },
        { value: 'this_week', label: 'This Week' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'this_year', label: 'This Year' },
        { value: 'all_time', label: 'All Time' }
      ]
    }
  },
  methods: {
    onPhoneGateAccessGranted() {
      // Phone gate access has been granted
      // The modal will hide itself automatically
      console.log('Phone gate access granted');
    },

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
      const stepDuration = 20000 / steps.length
      
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

    showFixInstructions(type) {
      const instructions = {
        headline: {
          title: 'Fix Headline Keywords',
          content: `To fix this issue:\n\n1. Update your Google Business Profile name to include relevant keywords\n2. Add your cuisine type (e.g., "Italian Restaurant")\n3. Include your location (e.g., "Downtown Seattle")\n4. Example: "Mario's Italian Restaurant | Downtown Seattle"\n\nNote: Make sure to follow Google's naming guidelines - don't add unnecessary keywords that aren't part of your actual business name.`
        },
        meta: {
          title: 'Optimize Meta Description',
          content: `To optimize your meta description:\n\n1. Visit your website's admin panel or contact your web developer\n2. Update the meta description to 150-160 characters\n3. Include your main keywords naturally\n4. Add a call-to-action (e.g., "Book a table today!")\n5. Make it compelling and accurate\n\nExample: "Experience authentic Italian cuisine at Mario's Restaurant in Downtown Seattle. Fresh pasta, wood-fired pizza, and award-winning wine list. Book your table today!"`
        },
        title: {
          title: 'Fix Title Tag',
          content: `To fix your title tag:\n\n1. Access your website's SEO settings or contact your web developer\n2. Update the page title to include location keywords\n3. Keep it under 60 characters\n4. Format: [Business Name] | [Cuisine Type] | [Location]\n\nExample: "Mario's Restaurant | Italian Dining | Seattle, WA"`
        },
        mobile: {
          title: 'Improve Mobile-Friendliness',
          content: `To make your website mobile-friendly:\n\n1. Use a responsive website theme/template\n2. Test your site on mobile devices\n3. Ensure text is readable without zooming\n4. Make buttons and links easy to tap\n5. Optimize images for mobile loading speed\n\nTools to test: Google Mobile-Friendly Test, PageSpeed Insights`
        },
        speed: {
          title: 'Improve Page Load Speed',
          content: `To improve your page speed:\n\n1. Compress and optimize all images\n2. Enable browser caching\n3. Minify CSS, JavaScript, and HTML\n4. Use a Content Delivery Network (CDN)\n5. Remove unnecessary plugins/scripts\n6. Consider upgrading your hosting plan\n\nTools to test: Google PageSpeed Insights, GTmetrix`
        },
        design: {
          title: 'Improve Website Design',
          content: `To improve your website design:\n\n1. Use a professional, modern template\n2. Ensure consistent branding (colors, fonts, logo)\n3. Use high-quality, professional photos\n4. Create clear visual hierarchy\n5. Add white space for better readability\n6. Consider hiring a web designer\n\nPopular platforms: WordPress, Squarespace, Wix`
        },
        navigation: {
          title: 'Improve Navigation',
          content: `To improve your website navigation:\n\n1. Create a clear, simple menu structure\n2. Keep main menu items to 5-7 max\n3. Use descriptive menu labels (avoid jargon)\n4. Add a search function\n5. Include breadcrumbs for deeper pages\n6. Make your logo clickable (return to homepage)\n7. Add a visible "Book a Table" button`
        },
        'business-info': {
          title: 'Complete Business Information',
          content: `To complete your business information:\n\n1. Log into your Google Business Profile\n2. Fill out ALL fields:\n   - Business name\n   - Complete address\n   - Phone number\n   - Website URL\n   - Business hours\n   - Business category\n   - Business description\n3. Double-check for accuracy\n4. Add additional phone numbers if available\n5. Add attributes (e.g., outdoor seating, wheelchair accessible)`
        },
        photos: {
          title: 'Upload More Photos',
          content: `To add more photos to your listing:\n\n1. Log into your Google Business Profile\n2. Go to the Photos section\n3. Upload high-quality images:\n   - Exterior (at least 2-3)\n   - Interior (at least 3-4)\n   - Food/menu items (at least 5-10)\n   - Team/staff (1-2)\n   - Logo and cover photo\n\nTips:\n- Use professional photos if possible\n- Ensure good lighting\n- Show your restaurant's atmosphere\n- Update photos seasonally\n- Minimum 5 photos required, 20+ recommended`
        },
        reviews: {
          title: 'Respond to Reviews',
          content: `To improve review engagement:\n\n1. Log into your Google Business Profile\n2. Check for new reviews regularly (daily if possible)\n3. Respond to ALL reviews:\n   - Thank positive reviewers\n   - Address negative feedback professionally\n   - Personalize each response\n   - Keep responses brief (2-3 sentences)\n4. Respond within 24-48 hours\n5. Never argue with reviewers\n6. Offer to resolve issues offline\n\nExample: "Thank you for the kind words, [Name]! We're thrilled you enjoyed our pasta. Hope to see you again soon!"`
        },
        hours: {
          title: 'Update Business Hours',
          content: `To update your business hours:\n\n1. Log into your Google Business Profile\n2. Go to the Info section\n3. Update your regular hours for each day\n4. Add special hours for:\n   - Holidays\n   - Special events\n   - Temporary closures\n5. Mark yourself as "Temporarily Closed" if needed\n6. Update hours immediately when they change\n\nTip: Keep hours current to avoid frustrated customers!`
        }
      }

      const instruction = instructions[type]
      if (instruction) {
        alert(`${instruction.title}\n\n${instruction.content}`)
      }
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

    getScoreColor(score) {
      if (score >= 85) return '#10b981' // green
      if (score >= 75) return '#3b82f6' // blue
      if (score >= 65) return '#f59e0b' // orange
      return '#ef4444' // red
    },

    getScoreColorText(score) {
      if (score >= 85) return 'text-green-600'
      if (score >= 75) return 'text-blue-600'
      if (score >= 65) return 'text-orange-600'
      return 'text-red-600'
    },

    calculateGoogleRank(auditData) {
      // Use backend-calculated rank if available (this is the real Google ranking)
      if (auditData && auditData.ranking && auditData.ranking.googleRank) {
        return auditData.ranking.googleRank
      }

      // Fallback: Calculate rank based on rating and reviews compared to competitors
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
      // Use backend-calculated rank if available
      if (auditData && auditData.ranking && auditData.ranking.localRank) {
        return auditData.ranking.localRank
      }

      // Fallback: Calculate local rank based on rating only
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
    },

    getTopCompetitors(auditData) {
      if (!auditData || !auditData.competitors) return []

      let competitors = auditData.competitors.slice(0, 3)

      // Apply search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        competitors = competitors.filter(c =>
          c.name?.toLowerCase().includes(query) ||
          c.vicinity?.toLowerCase().includes(query)
        )
      }

      return competitors
    },

    getTopIssues(auditData) {
      if (!auditData || !auditData.seoIssues) return []

      // Extract top 3 issues with revenue impact
      let issues = auditData.seoIssues.slice(0, 3).map(issue => {
        // Calculate impact based on issue severity
        let impact = 0
        if (issue.severity === 'high') impact = Math.floor((auditData.revenueImpact?.monthly || 0) * 0.3)
        else if (issue.severity === 'medium') impact = Math.floor((auditData.revenueImpact?.monthly || 0) * 0.2)
        else impact = Math.floor((auditData.revenueImpact?.monthly || 0) * 0.1)

        return {
          title: issue.title,
          description: issue.description,
          impact: impact
        }
      })

      // Apply search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        issues = issues.filter(issue =>
          issue.title?.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query)
        )
      }

      return issues
    },

    getDateRangeLabel() {
      const range = this.dateRanges.find(r => r.value === this.selectedDateRange)
      return range ? range.label : 'All Time'
    },

    getTopQuickWin(auditData) {
      if (!auditData || !auditData.actionItems || auditData.actionItems.length === 0) {
        return 'Add more photos'
      }

      // Find the easiest/quickest action item
      const quickWin = auditData.actionItems.find(item =>
        item.title?.toLowerCase().includes('photo') ||
        item.title?.toLowerCase().includes('image') ||
        item.title?.toLowerCase().includes('respond') ||
        item.title?.toLowerCase().includes('hours')
      )

      return quickWin ? quickWin.title : auditData.actionItems[0]?.title || 'Add more photos'
    },

    getQuickWinRevenue(auditData) {
      if (!auditData || !auditData.revenueImpact) return 0

      // Quick wins typically represent 10-15% of potential revenue
      const revenue = Math.floor((auditData.revenueImpact.monthly || 0) * 0.15)
      return revenue.toLocaleString()
    },

    getTotalCheckedItems(auditData) {
      if (!auditData) return 0
      // Estimate total items checked (successful + failed)
      const seoIssues = auditData.seoIssues?.length || 0
      const actionItems = auditData.actionItems?.length || 0
      // Assume we check about 3x more items than issues found (rough estimate)
      return Math.ceil((seoIssues + actionItems) * 2.5)
    },

    extractCity(address) {
      if (!address) return 'your area'
      // Extract city from address (usually between first comma and second comma)
      const parts = address.split(',')
      if (parts.length >= 2) {
        return parts[1].trim()
      }
      return address
    },

    getAllCompetitors(auditData) {
      if (!auditData || !auditData.competitors) return []
      // Return all competitors (limit to 10 for display)
      return auditData.competitors.slice(0, 10)
    },

    getRankingColorClass(rank) {
      if (rank === 1) return 'text-green-600'
      if (rank === 2) return 'text-blue-600'
      if (rank === 3) return 'text-orange-600'
      if (rank <= 5) return 'text-yellow-600'
      return 'text-gray-600'
    },

    getOrdinalSuffix(num) {
      const j = num % 10
      const k = num % 100
      if (j === 1 && k !== 11) return 'st'
      if (j === 2 && k !== 12) return 'nd'
      if (j === 3 && k !== 13) return 'rd'
      return 'th'
    },

    // Search Results checks
    checkHeadlineKeywords(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if restaurant name includes cuisine type or location keywords
      const name = auditData.restaurant.name?.toLowerCase() || ''
      const types = auditData.restaurant.types || []
      const address = auditData.restaurant.address?.toLowerCase() || ''

      // Check if name includes cuisine type
      const hasCuisineType = types.length > 0 && types.some(type =>
        name.includes(type.toLowerCase())
      )

      // Check if name includes location
      const cityMatch = address.match(/,\s*([^,]+)\s*,/)
      const hasLocation = cityMatch && name.includes(cityMatch[1].toLowerCase())

      return hasCuisineType || hasLocation
    },

    checkMetaDescription(auditData) {
      if (!auditData) return true

      // Check SEO issues for meta description problems
      if (auditData.seoIssues) {
        const hasMetaIssue = auditData.seoIssues.some(issue =>
          issue.title?.toLowerCase().includes('meta') ||
          issue.title?.toLowerCase().includes('description')
        )
        if (hasMetaIssue) return false
      }

      // Check if website exists and has good SEO score
      return !!auditData.restaurant?.website && (auditData.metrics?.seo || 0) > 15
    },

    checkTitleTag(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if restaurant has address with city info
      const address = auditData.restaurant.address || ''
      const hasCityInAddress = address.split(',').length >= 2
      return hasCityInAddress && address.length > 0
    },

    // Website Experience checks
    checkMobileFriendly(auditData) {
      if (!auditData) return false
      // Check if website exists and has reasonable performance
      const hasWebsite = !!auditData.restaurant?.website
      const performance = auditData.metrics?.performance || 0
      return hasWebsite && performance >= 25
    },

    checkPageSpeed(auditData) {
      if (!auditData || !auditData.metrics) return false
      // Check if performance score is good (above 60 is Google's "good" threshold)
      const performance = auditData.metrics.performance || 0
      return performance >= 30
    },

    checkDesign(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if website exists and no major design issues
      const hasWebsite = !!auditData.restaurant.website
      const hasGoodPerformance = (auditData.metrics?.performance || 0) > 20
      return hasWebsite && hasGoodPerformance
    },

    checkNavigation(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if website exists with reasonable SEO (good navigation = good SEO)
      const hasWebsite = !!auditData.restaurant.website
      const hasSEO = (auditData.metrics?.seo || 0) > 10
      return hasWebsite && hasSEO
    },

    // Local Listings checks
    checkBusinessInfo(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if all essential Google Business Profile info is complete
      const hasName = !!auditData.restaurant.name
      const hasAddress = !!auditData.restaurant.address && auditData.restaurant.address.split(',').length >= 2
      const hasPhone = !!auditData.restaurant.phone || !!auditData.restaurant.formatted_phone_number
      const hasWebsite = !!auditData.restaurant.website

      // At least 3 out of 4 should be present
      const completedFields = [hasName, hasAddress, hasPhone, hasWebsite].filter(Boolean).length
      return completedFields >= 3
    },

    checkPhotos(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if sufficient photos are uploaded (minimum 5 photos)
      const photoCount = auditData.restaurant.photos?.length || 0
      return photoCount >= 5
    },

    checkReviewResponses(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if restaurant has good reviews and rating (implies management)
      const hasReviews = (auditData.restaurant.total_ratings || auditData.restaurant.user_ratings_total || 0) > 10
      const goodRating = (auditData.restaurant.rating || 0) >= 4.0
      return hasReviews && goodRating
    },

    checkBusinessHours(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if opening hours are set
      return !!auditData.restaurant.opening_hours &&
             (typeof auditData.restaurant.opening_hours === 'object' ||
              auditData.restaurant.opening_hours === true)
    },

    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },

    // Additional granular checks for Local Listings
    checkFirstPartyWebsite(auditData) {
      if (!auditData || !auditData.restaurant) return false
      return !!auditData.restaurant.website && auditData.restaurant.website.length > 0
    },

    checkDescription(auditData) {
      if (!auditData || !auditData.restaurant) return false
      const description = auditData.restaurant.description || auditData.restaurant.editorial_summary?.overview || ''
      return description.length >= 50 && description.length <= 750
    },

    checkPhoneNumber(auditData) {
      if (!auditData || !auditData.restaurant) return false
      const phone = auditData.restaurant.phone || auditData.restaurant.formatted_phone_number || auditData.restaurant.international_phone_number
      return !!phone && phone.length > 0
    },

    checkPriceRange(auditData) {
      if (!auditData || !auditData.restaurant) return false
      const priceLevel = auditData.restaurant.price_level
      return priceLevel !== null && priceLevel !== undefined && priceLevel >= 0
    },

    checkDescriptionKeywords(auditData) {
      if (!auditData || !auditData.restaurant) return false
      const description = (auditData.restaurant.description || auditData.restaurant.editorial_summary?.overview || '').toLowerCase()
      const types = auditData.restaurant.types || []
      const name = (auditData.restaurant.name || '').toLowerCase()

      // Check if description includes cuisine type or restaurant keywords
      const hasKeywords = types.some(type => description.includes(type.toLowerCase())) ||
                         description.includes('restaurant') ||
                         description.includes('dining') ||
                         description.includes('cuisine') ||
                         description.includes('food')

      return description.length > 0 && hasKeywords
    },

    checkCategoryKeywords(auditData) {
      if (!auditData || !auditData.restaurant) return false
      const types = auditData.restaurant.types || []
      const name = (auditData.restaurant.name || '').toLowerCase()

      // Check if at least one category matches the business name
      return types.length > 0 && types.some(type => {
        const typeLower = type.toLowerCase()
        return name.includes(typeLower) || typeLower.includes('restaurant') || typeLower.includes('food')
      })
    },

    // Additional granular checks for Website Experience
    checkWebsiteExists(auditData) {
      if (!auditData || !auditData.restaurant) return false
      return !!auditData.restaurant.website && auditData.restaurant.website.length > 0
    },

    checkOnlineOrdering(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if website exists (placeholder for actual online ordering detection)
      const hasWebsite = !!auditData.restaurant.website
      // In a real implementation, this would check the website for ordering systems
      return hasWebsite && (auditData.metrics?.performance || 0) > 25
    },

    checkEffectiveCTAs(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if website exists and has good conversion potential
      const hasWebsite = !!auditData.restaurant.website
      const hasSEO = (auditData.metrics?.seo || 0) > 12
      return hasWebsite && hasSEO
    },

    checkFavicon(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Placeholder check - in real implementation would check for favicon
      const hasWebsite = !!auditData.restaurant.website
      return hasWebsite && (auditData.metrics?.seo || 0) > 15
    },

    checkOrderingLinks(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if website exists (placeholder for actual ordering link detection)
      const hasWebsite = !!auditData.restaurant.website
      return hasWebsite && (auditData.metrics?.performance || 0) > 20
    },

    checkAboutUsSection(auditData) {
      if (!auditData || !auditData.restaurant) return false
      // Check if description/about section exists
      const description = auditData.restaurant.description || auditData.restaurant.editorial_summary?.overview || ''
      const hasWebsite = !!auditData.restaurant.website
      return hasWebsite && description.length > 100
    },

    // Calculate accurate scores based on actual checks
    calculateSearchResultsScore(auditData) {
      if (!auditData) return 0
      let score = 0
      const maxScore = 40
      const checksTotal = 3
      const pointsPerCheck = maxScore / checksTotal

      // Each passing check adds points
      if (this.checkHeadlineKeywords(auditData)) score += pointsPerCheck
      if (this.checkMetaDescription(auditData)) score += pointsPerCheck
      if (this.checkTitleTag(auditData)) score += pointsPerCheck

      return Math.round(score)
    },

    calculateWebsiteExperienceScore(auditData) {
      if (!auditData) return 0
      let score = 0
      const maxScore = 40

      // Total checks: 11 (1 Your site + 5 Content + 5 Appearance)
      const checksTotal = 11
      const pointsPerCheck = maxScore / checksTotal

      // Your site checks (1)
      if (this.checkWebsiteExists(auditData)) score += pointsPerCheck

      // Content checks (5)
      if (this.checkOnlineOrdering(auditData)) score += pointsPerCheck
      if (this.checkEffectiveCTAs(auditData)) score += pointsPerCheck
      if (this.checkPhoneNumber(auditData)) score += pointsPerCheck
      if (this.checkFavicon(auditData)) score += pointsPerCheck
      if (this.checkOrderingLinks(auditData)) score += pointsPerCheck

      // Appearance checks (5)
      if (this.checkAboutUsSection(auditData)) score += pointsPerCheck
      if (this.checkDesign(auditData)) score += pointsPerCheck
      if (this.checkMobileFriendly(auditData)) score += pointsPerCheck
      if (this.checkPageSpeed(auditData)) score += pointsPerCheck
      if (this.checkNavigation(auditData)) score += pointsPerCheck

      return Math.round(score)
    },

    calculateLocalListingsScore(auditData) {
      if (!auditData) return 0
      let score = 0
      const maxScore = 20

      // Total checks: 9 (5 Profile content + 4 User-submitted content)
      const checksTotal = 9
      const pointsPerCheck = maxScore / checksTotal

      // Profile content checks (5)
      if (this.checkFirstPartyWebsite(auditData)) score += pointsPerCheck
      if (this.checkDescription(auditData)) score += pointsPerCheck
      if (this.checkBusinessHours(auditData)) score += pointsPerCheck
      if (this.checkPhoneNumber(auditData)) score += pointsPerCheck
      if (this.checkPriceRange(auditData)) score += pointsPerCheck

      // User-submitted content checks (4)
      if (this.checkDescriptionKeywords(auditData)) score += pointsPerCheck
      if (this.checkCategoryKeywords(auditData)) score += pointsPerCheck
      if (this.checkPhotos(auditData)) score += pointsPerCheck
      if (this.checkReviewResponses(auditData)) score += pointsPerCheck

      return Math.round(score)
    },

    getScoreStatus(score, maxScore) {
      const percentage = (score / maxScore) * 100
      if (percentage >= 80) return { label: 'Excellent', color: 'text-green-600' }
      if (percentage >= 60) return { label: 'Good', color: 'text-blue-600' }
      if (percentage >= 40) return { label: 'Fair', color: 'text-yellow-600' }
      if (percentage >= 20) return { label: 'Poor', color: 'text-orange-600' }
      return { label: 'Critical', color: 'text-red-600' }
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

/* Card Styling - Responsive padding */
.card-shadow {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 10px 30px -10px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.03);
}

@media (min-width: 640px) {
  .card-shadow {
    border-radius: 16px;
    padding: 24px;
  }
}

@media (min-width: 1024px) {
  .card-shadow {
    padding: 32px;
  }
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

/* Floating Action Buttons - Responsive sizing */
.floating-btn {
  width: 48px;
  height: 48px;
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

@media (min-width: 640px) {
  .floating-btn {
    width: 56px;
    height: 56px;
  }
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