<template>
  <div class="analytics-section">
    <!-- Header -->
    <div class="section-header">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p class="text-gray-600 mt-2">Comprehensive analytics and insights for your restaurant</p>
      </div>
      <div class="flex gap-3">
        <select v-model="selectedRestaurant" class="filter-select">
          <option value="">All Restaurants</option>
          <option v-for="rest in restaurants" :key="rest.placeId" :value="rest.placeId">
            {{ rest.name }}
          </option>
        </select>
        <select v-model="timeRange" class="filter-select">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics Overview -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-icon" style="background: #3B82F6;">📊</span>
          <span class="metric-trend positive">↑ 12%</span>
        </div>
        <div class="metric-value">{{ totalVisitors.toLocaleString() }}</div>
        <div class="metric-label">Total Visitors</div>
        <div class="metric-footer">
          <span class="text-sm text-gray-500">vs last period</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-icon" style="background: #10B981;">💰</span>
          <span class="metric-trend positive">↑ 8%</span>
        </div>
        <div class="metric-value">${{ estimatedRevenue.toLocaleString() }}</div>
        <div class="metric-label">Est. Monthly Revenue</div>
        <div class="metric-footer">
          <span class="text-sm text-gray-500">from organic traffic</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-icon" style="background: #F59E0B;">⭐</span>
          <span class="metric-trend neutral">→ 0%</span>
        </div>
        <div class="metric-value">{{ averageRating.toFixed(1) }}</div>
        <div class="metric-label">Average Rating</div>
        <div class="metric-footer">
          <span class="text-sm text-gray-500">{{ totalReviews }} total reviews</span>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-header">
          <span class="metric-icon" style="background: #8B5CF6;">🏆</span>
          <span class="metric-trend positive">↑ 3</span>
        </div>
        <div class="metric-value">#{{ averageRank }}</div>
        <div class="metric-label">Average Ranking</div>
        <div class="metric-footer">
          <span class="text-sm text-gray-500">in local searches</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-container">
      <!-- Traffic Trends -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="text-lg font-semibold text-gray-800">Traffic Trends</h3>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot" style="background: #3B82F6;"></span> Visitors</span>
            <span class="legend-item"><span class="dot" style="background: #10B981;"></span> Conversions</span>
          </div>
        </div>
        <div class="chart-body">
          <canvas ref="trafficChart" height="300"></canvas>
        </div>
      </div>

      <!-- Ranking Performance -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="text-lg font-semibold text-gray-800">Ranking Performance</h3>
          <span class="text-sm text-gray-500">Lower is better</span>
        </div>
        <div class="chart-body">
          <canvas ref="rankingChart" height="300"></canvas>
        </div>
      </div>
    </div>

    <!-- Performance Breakdown -->
    <div class="performance-section">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Performance Breakdown</h2>

      <div class="performance-grid">
        <div class="performance-card">
          <div class="performance-header">
            <h4 class="text-lg font-semibold text-gray-800">SEO Performance</h4>
            <span class="performance-score excellent">{{ seoScore }}/100</span>
          </div>
          <div class="performance-bars">
            <div class="bar-item">
              <label>On-Page SEO</label>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '85%', background: '#10B981' }"></div>
              </div>
              <span>85%</span>
            </div>
            <div class="bar-item">
              <label>Technical SEO</label>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '72%', background: '#3B82F6' }"></div>
              </div>
              <span>72%</span>
            </div>
            <div class="bar-item">
              <label>Local SEO</label>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '90%', background: '#8B5CF6' }"></div>
              </div>
              <span>90%</span>
            </div>
          </div>
        </div>

        <div class="performance-card">
          <div class="performance-header">
            <h4 class="text-lg font-semibold text-gray-800">User Engagement</h4>
            <span class="performance-score good">{{ engagementScore }}/100</span>
          </div>
          <div class="engagement-metrics">
            <div class="engagement-item">
              <div class="engagement-icon" style="background: #EFF6FF;">📱</div>
              <div>
                <div class="text-2xl font-bold text-gray-800">3,245</div>
                <div class="text-sm text-gray-500">Profile Views</div>
              </div>
            </div>
            <div class="engagement-item">
              <div class="engagement-icon" style="background: #F0FDF4;">📞</div>
              <div>
                <div class="text-2xl font-bold text-gray-800">124</div>
                <div class="text-sm text-gray-500">Phone Clicks</div>
              </div>
            </div>
            <div class="engagement-item">
              <div class="engagement-icon" style="background: #FEF3C7;">🌐</div>
              <div>
                <div class="text-2xl font-bold text-gray-800">89</div>
                <div class="text-sm text-gray-500">Website Clicks</div>
              </div>
            </div>
          </div>
        </div>

        <div class="performance-card">
          <div class="performance-header">
            <h4 class="text-lg font-semibold text-gray-800">Page Speed</h4>
            <span class="performance-score warning">{{ speedScore }}/100</span>
          </div>
          <div class="speed-metrics">
            <div class="speed-item">
              <label>First Contentful Paint</label>
              <div class="speed-value good">1.2s</div>
            </div>
            <div class="speed-item">
              <label>Largest Contentful Paint</label>
              <div class="speed-value warning">2.8s</div>
            </div>
            <div class="speed-item">
              <label>Time to Interactive</label>
              <div class="speed-value good">3.1s</div>
            </div>
            <div class="speed-item">
              <label>Cumulative Layout Shift</label>
              <div class="speed-value excellent">0.05</div>
            </div>
          </div>
        </div>

        <div class="performance-card">
          <div class="performance-header">
            <h4 class="text-lg font-semibold text-gray-800">Competitor Comparison</h4>
            <span class="text-sm text-gray-500">Your position</span>
          </div>
          <div class="competitor-chart">
            <div class="competitor-bar-chart">
              <div class="competitor-bar" v-for="(comp, idx) in competitorData" :key="idx">
                <div class="bar-label">{{ comp.name }}</div>
                <div class="bar-wrapper">
                  <div
                    class="bar-fill"
                    :class="comp.isYou ? 'your-bar' : ''"
                    :style="{ width: comp.score + '%' }"
                  ></div>
                </div>
                <div class="bar-value">{{ comp.score }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Keywords -->
    <div class="keywords-section">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Top Performing Keywords</h2>
      <div class="keywords-grid">
        <div v-for="keyword in topKeywords" :key="keyword.term" class="keyword-card">
          <div class="keyword-header">
            <span class="keyword-term">{{ keyword.term }}</span>
            <span class="keyword-rank" :class="getRankClass(keyword.rank)">
              #{{ keyword.rank }}
            </span>
          </div>
          <div class="keyword-stats">
            <div class="stat">
              <label>Impressions</label>
              <value>{{ keyword.impressions.toLocaleString() }}</value>
            </div>
            <div class="stat">
              <label>Clicks</label>
              <value>{{ keyword.clicks }}</value>
            </div>
            <div class="stat">
              <label>CTR</label>
              <value>{{ keyword.ctr }}%</value>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
      <div class="activity-timeline">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :style="{ background: activity.color }">
            {{ activity.icon }}
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'AnalyticsSection',

  setup() {
    const selectedRestaurant = ref('');
    const timeRange = ref('30');
    const restaurants = ref([]);

    // Load restaurants from localStorage
    const loadRestaurants = () => {
      const saved = localStorage.getItem('multiRestaurants');
      if (saved) {
        restaurants.value = JSON.parse(saved);
      }
    };

    // Computed metrics
    const totalVisitors = computed(() => {
      return restaurants.value.reduce((sum, r) => sum + (r.estimatedVisitors || 0), 0);
    });

    const estimatedRevenue = computed(() => {
      return Math.round(totalVisitors.value * 0.03 * 28); // 3% conversion, $28 AOV
    });

    const averageRating = computed(() => {
      if (restaurants.value.length === 0) return 0;
      const sum = restaurants.value.reduce((acc, r) => acc + (r.rating || 0), 0);
      return sum / restaurants.value.length;
    });

    const totalReviews = computed(() => {
      return restaurants.value.reduce((sum, r) => sum + (r.totalRatings || 0), 0);
    });

    const averageRank = computed(() => {
      if (restaurants.value.length === 0) return 0;
      const sum = restaurants.value.reduce((acc, r) => acc + (r.rank || 0), 0);
      return Math.round(sum / restaurants.value.length);
    });

    const seoScore = ref(78);
    const engagementScore = ref(72);
    const speedScore = ref(65);

    const competitorData = ref([
      { name: 'You', score: 85, isYou: true },
      { name: 'Competitor A', score: 78, isYou: false },
      { name: 'Competitor B', score: 72, isYou: false },
      { name: 'Competitor C', score: 68, isYou: false },
      { name: 'Competitor D', score: 62, isYou: false }
    ]);

    const topKeywords = ref([
      { term: 'pizza near me', rank: 3, impressions: 12500, clicks: 450, ctr: 3.6 },
      { term: 'best italian restaurant', rank: 5, impressions: 8900, clicks: 320, ctr: 3.6 },
      { term: 'pizza delivery', rank: 7, impressions: 15200, clicks: 380, ctr: 2.5 },
      { term: 'italian food', rank: 12, impressions: 6700, clicks: 180, ctr: 2.7 },
      { term: 'pasta restaurant', rank: 8, impressions: 5400, clicks: 210, ctr: 3.9 },
      { term: 'lunch specials', rank: 4, impressions: 4200, clicks: 190, ctr: 4.5 }
    ]);

    const recentActivity = ref([
      { id: 1, icon: '⭐', title: 'New 5-star review', description: 'John D. left a glowing review', time: '2 hours ago', color: '#FEF3C7' },
      { id: 2, icon: '📈', title: 'Ranking improved', description: 'Moved up 2 positions for "pizza near me"', time: '5 hours ago', color: '#D1FAE5' },
      { id: 3, icon: '🔍', title: 'SEO audit completed', description: 'Found 3 new optimization opportunities', time: '1 day ago', color: '#DBEAFE' },
      { id: 4, icon: '💬', title: 'Review responded', description: 'You replied to 3 customer reviews', time: '2 days ago', color: '#E0E7FF' },
      { id: 5, icon: '📊', title: 'Traffic spike', description: '25% increase in profile views', time: '3 days ago', color: '#FCE7F3' }
    ]);

    const getRankClass = (rank) => {
      if (rank <= 3) return 'rank-excellent';
      if (rank <= 10) return 'rank-good';
      return 'rank-average';
    };

    onMounted(() => {
      loadRestaurants();
    });

    return {
      selectedRestaurant,
      timeRange,
      restaurants,
      totalVisitors,
      estimatedRevenue,
      averageRating,
      totalReviews,
      averageRank,
      seoScore,
      engagementScore,
      speedScore,
      competitorData,
      topKeywords,
      recentActivity,
      getRankClass
    };
  }
};
</script>

<style scoped>
.analytics-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.metric-trend {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

.metric-trend.positive {
  color: #10B981;
  background: #D1FAE5;
}

.metric-trend.negative {
  color: #EF4444;
  background: #FEE2E2;
}

.metric-trend.neutral {
  color: #6B7280;
  background: #F3F4F6;
}

.metric-value {
  font-size: 36px;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
  margin-bottom: 8px;
}

.metric-footer {
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6B7280;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-body {
  min-height: 300px;
}

.performance-section,
.keywords-section,
.activity-section {
  margin-bottom: 30px;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.performance-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.performance-score {
  font-size: 24px;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
}

.performance-score.excellent {
  color: #10B981;
  background: #D1FAE5;
}

.performance-score.good {
  color: #3B82F6;
  background: #DBEAFE;
}

.performance-score.warning {
  color: #F59E0B;
  background: #FEF3C7;
}

.performance-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: grid;
  grid-template-columns: 120px 1fr 50px;
  gap: 12px;
  align-items: center;
}

.bar-item label {
  font-size: 14px;
  color: #6B7280;
}

.progress-bar {
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.bar-item span {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  text-align: right;
}

.engagement-metrics,
.speed-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.engagement-item {
  display: flex;
  gap: 16px;
  align-items: center;
}

.engagement-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.speed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
}

.speed-item label {
  font-size: 14px;
  color: #6B7280;
}

.speed-value {
  font-size: 16px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
}

.speed-value.excellent {
  color: #10B981;
  background: #D1FAE5;
}

.speed-value.good {
  color: #3B82F6;
  background: #DBEAFE;
}

.speed-value.warning {
  color: #F59E0B;
  background: #FEF3C7;
}

.competitor-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.competitor-bar {
  display: grid;
  grid-template-columns: 100px 1fr 50px;
  gap: 12px;
  align-items: center;
}

.bar-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.bar-wrapper {
  height: 32px;
  background: #F3F4F6;
  border-radius: 6px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #3B82F6;
  transition: width 0.3s;
}

.bar-fill.your-bar {
  background: #10B981;
}

.bar-value {
  font-size: 14px;
  font-weight: 700;
  color: #1F2937;
  text-align: right;
}

.keywords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.keyword-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.keyword-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.keyword-term {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
}

.keyword-rank {
  font-size: 14px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
}

.rank-excellent {
  color: #10B981;
  background: #D1FAE5;
}

.rank-good {
  color: #3B82F6;
  background: #DBEAFE;
}

.rank-average {
  color: #F59E0B;
  background: #FEF3C7;
}

.keyword-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.keyword-stats .stat {
  text-align: center;
}

.keyword-stats label {
  display: block;
  font-size: 12px;
  color: #9CA3AF;
  margin-bottom: 4px;
}

.keyword-stats value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1F2937;
}

.activity-timeline {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #F3F4F6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.activity-description {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #9CA3AF;
}
</style>
