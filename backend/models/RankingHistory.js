const mongoose = require('mongoose');

/**
 * RankingHistory Model
 * Tracks historical ranking data for restaurants over time
 */
const rankingHistorySchema = new mongoose.Schema({
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
  // Ranking metrics
  googleRank: {
    type: Number,
    min: 1,
    required: true
  },
  localRank: {
    type: Number,
    min: 1,
    required: true
  },
  totalCompetitors: {
    type: Number,
    default: 0
  },
  // SEO scores
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  seoScore: {
    type: Number,
    min: 0,
    max: 100
  },
  performanceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  // Rating metrics
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Traffic estimation
  estimatedMonthlyVisitors: {
    type: Number,
    default: 0
  },
  estimatedTrafficChange: {
    type: Number,
    default: 0 // Percentage change from last record
  },
  // Revenue impact
  revenueImpact: {
    monthly: { type: Number, default: 0 },
    annual: { type: Number, default: 0 }
  },
  // Snapshot metadata
  recordDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  weekNumber: {
    type: Number,
    index: true
  },
  year: {
    type: Number,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
rankingHistorySchema.index({ placeId: 1, recordDate: -1 });
rankingHistorySchema.index({ restaurantId: 1, recordDate: -1 });
rankingHistorySchema.index({ year: 1, weekNumber: 1 });

// Static method to get ranking trend
rankingHistorySchema.statics.getRankingTrend = async function(placeId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    placeId,
    recordDate: { $gte: startDate }
  })
  .sort({ recordDate: 1 })
  .lean();
};

// Static method to get weekly summary
rankingHistorySchema.statics.getWeeklySummary = async function(placeId, weekNumber, year) {
  return this.findOne({
    placeId,
    weekNumber,
    year
  })
  .sort({ recordDate: -1 })
  .lean();
};

// Instance method to calculate rank change
rankingHistorySchema.methods.calculateRankChange = async function() {
  const previousRecord = await this.constructor.findOne({
    placeId: this.placeId,
    recordDate: { $lt: this.recordDate }
  })
  .sort({ recordDate: -1 })
  .lean();

  if (!previousRecord) {
    return {
      googleRankChange: 0,
      localRankChange: 0,
      scoreChange: 0
    };
  }

  return {
    googleRankChange: previousRecord.googleRank - this.googleRank, // Positive = improved
    localRankChange: previousRecord.localRank - this.localRank,
    scoreChange: this.overallScore - previousRecord.overallScore
  };
};

module.exports = mongoose.model('RankingHistory', rankingHistorySchema);
