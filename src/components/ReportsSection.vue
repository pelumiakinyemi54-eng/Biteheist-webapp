<template>
  <div class="reports-section">
    <!-- Header -->
    <div class="section-header">
      <h1>Reports & Exports</h1>
      <p>Export your restaurant audit data</p>
    </div>

    <!-- Info Notice -->
    <div class="info-notice">
      <div class="info-icon">💡</div>
      <div class="info-content">
        <h3>How to Generate Reports</h3>
        <p>To export reports, first audit a restaurant from the Dashboard or Multi-Restaurant section. Then use the "Export PDF" button on the audit results page.</p>
      </div>
    </div>

    <!-- Quick Guide -->
    <div class="guide-section">
      <h2>Available Export Options</h2>
      <div class="options-grid">
        <div class="option-card">
          <div class="option-icon">📄</div>
          <h3>PDF Export</h3>
          <p>Available on Dashboard after running audit</p>
        </div>

        <div class="option-card">
          <div class="option-icon">🖨️</div>
          <h3>Print Report</h3>
          <p>Use browser's print function (Ctrl/Cmd + P)</p>
        </div>
      </div>
    </div>

    <!-- Getting Started Steps -->
    <div class="steps-section">
      <h2>How It Works</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Run an Audit</h3>
            <p>Go to the Dashboard and search for a restaurant to audit</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Review Results</h3>
            <p>View comprehensive SEO analysis and revenue impact</p>
          </div>
        </div>
        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Export Report</h3>
            <p>Click "Export PDF" button to download the report</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Overview -->
    <div class="features-section">
      <h2>Report Features</h2>
      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">✅</div>
          <div class="feature-text">
            <strong>Complete SEO Analysis</strong>
            <p>Comprehensive audit of all SEO factors</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">💰</div>
          <div class="feature-text">
            <strong>Revenue Impact</strong>
            <p>Calculate exact monthly revenue loss</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-text">
            <strong>Competitor Analysis</strong>
            <p>Compare with nearby restaurants</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🎯</div>
          <div class="feature-text">
            <strong>Action Items</strong>
            <p>Prioritized recommendations to improve</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⚡</div>
          <div class="feature-text">
            <strong>Performance Metrics</strong>
            <p>Page speed and technical analysis</p>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📈</div>
          <div class="feature-text">
            <strong>Ranking Data</strong>
            <p>Google search position tracking</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportsSection'
};
</script>

<style scoped>
.reports-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.section-header {
  margin-bottom: 40px;
}

.section-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.section-header p {
  font-size: 16px;
  color: #6B7280;
}

/* Info Notice */
.info-notice {
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border-left: 4px solid #3B82F6;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.info-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.info-content p {
  font-size: 16px;
  color: #4B5563;
  line-height: 1.6;
}

/* Guide Section */
.guide-section,
.steps-section,
.features-section {
  margin-bottom: 48px;
}

.guide-section h2,
.steps-section h2,
.features-section h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 24px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.option-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.option-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.option-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.option-card p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
}

/* Steps Section */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.step-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 20px;
  align-items: start;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8px;
}

.step-content p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.6;
}

/* Features Section */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 16px;
  align-items: start;
}

.feature-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-text strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 4px;
}

.feature-text p {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
}
</style>
