const mongoose = require('mongoose');

/**
 * WeeklyReport Model
 * Stores automated weekly performance reports
 */
const weeklyReportSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
    index: true
  },
  placeId: {
    type: String,
    required: true,
    index: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  // Report period
  weekNumber: {
    type: Number,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Performance summary
  performance: {
    currentRank: Number,
    rankChange: Number, // Positive = improvement
    currentScore: Number,
    scoreChange: Number,
    currentRating: Number,
    ratingChange: Number,
    totalReviews: Number,
    newReviews: Number
  },
  // Traffic metrics
  traffic: {
    estimatedVisitors: Number,
    visitorChange: Number, // Percentage
    trafficTrend: {
      type: String,
      enum: ['up', 'down', 'stable']
    },
    searchImpressions: Number,
    clickThroughRate: Number
  },
  // Competitor intelligence
  competitors: {
    totalTracked: Number,
    newCompetitors: Number,
    departedCompetitors: Number,
    yourPosition: Number,
    positionChange: Number,
    averageCompetitorRating: Number,
    topCompetitor: {
      name: String,
      rating: Number,
      rank: Number
    }
  },
  // Revenue impact
  revenueImpact: {
    estimatedLoss: Number,
    lossChange: Number, // From last week
    potentialGain: Number,
    opportunityScore: Number
  },
  // Key insights (AI-generated or rule-based)
  insights: [{
    type: {
      type: String,
      enum: ['positive', 'warning', 'opportunity', 'action']
    },
    title: String,
    description: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    }
  }],
  // Action items
  recommendations: [{
    category: String,
    title: String,
    description: String,
    estimatedImpact: Number, // Revenue impact in $
    effort: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    timeframe: String
  }],
  // Charts data (stored for quick retrieval)
  charts: {
    rankingTrend: [{
      date: Date,
      rank: Number,
      score: Number
    }],
    competitorComparison: [{
      name: String,
      rating: Number,
      reviews: Number,
      rank: Number
    }],
    trafficEstimate: [{
      date: Date,
      visitors: Number
    }]
  },
  // Report metadata
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reportStatus: {
    type: String,
    enum: ['generated', 'sent', 'viewed'],
    default: 'generated'
  },
  viewedAt: Date,
  sentTo: [{
    type: String // Email addresses
  }]
}, {
  timestamps: true
});

// Compound indexes
weeklyReportSchema.index({ placeId: 1, year: -1, weekNumber: -1 });
weeklyReportSchema.index({ restaurantId: 1, year: -1, weekNumber: -1 });
weeklyReportSchema.index({ year: 1, weekNumber: 1 });

// Static method to get latest report
weeklyReportSchema.statics.getLatestReport = async function(placeId) {
  return this.findOne({ placeId })
    .sort({ year: -1, weekNumber: -1 })
    .lean();
};

// Static method to get report history
weeklyReportSchema.statics.getReportHistory = async function(placeId, limit = 12) {
  return this.find({ placeId })
    .sort({ year: -1, weekNumber: -1 })
    .limit(limit)
    .lean();
};

// Static method to get current week number
weeklyReportSchema.statics.getCurrentWeekInfo = function() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);

  return {
    year: now.getFullYear(),
    weekNumber,
    startDate: new Date(now.setDate(now.getDate() - now.getDay())),
    endDate: new Date(now.setDate(now.getDate() - now.getDay() + 6))
  };
};

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
