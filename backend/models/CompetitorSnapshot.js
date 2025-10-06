const mongoose = require('mongoose');

/**
 * CompetitorSnapshot Model
 * Tracks competitor positions and metrics over time
 */
const competitorSnapshotSchema = new mongoose.Schema({
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
  // Competitor data
  competitors: [{
    placeId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    distance: {
      type: Number, // in km
      default: 0
    },
    rank: {
      type: Number,
      min: 1
    },
    types: [{
      type: String
    }],
    // Changes from last snapshot
    ratingChange: {
      type: Number,
      default: 0
    },
    reviewsChange: {
      type: Number,
      default: 0
    },
    rankChange: {
      type: Number,
      default: 0
    }
  }],
  // Summary statistics
  competitorStats: {
    averageRating: Number,
    averageReviews: Number,
    totalCompetitors: Number,
    strongerCompetitors: Number, // Count of competitors with higher rating
    weakerCompetitors: Number
  },
  // Your restaurant's position
  yourPosition: {
    rank: Number,
    percentile: Number // Where you stand (0-100)
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

// Compound indexes
competitorSnapshotSchema.index({ placeId: 1, recordDate: -1 });
competitorSnapshotSchema.index({ restaurantId: 1, recordDate: -1 });

// Static method to get competitor trends
competitorSnapshotSchema.statics.getCompetitorTrends = async function(placeId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.find({
    placeId,
    recordDate: { $gte: startDate }
  })
  .sort({ recordDate: 1 })
  .lean();
};

// Static method to identify new competitors
competitorSnapshotSchema.statics.findNewCompetitors = async function(placeId) {
  const snapshots = await this.find({ placeId })
    .sort({ recordDate: -1 })
    .limit(2)
    .lean();

  if (snapshots.length < 2) return [];

  const [latest, previous] = snapshots;
  const previousIds = new Set(previous.competitors.map(c => c.placeId));

  return latest.competitors.filter(c => !previousIds.has(c.placeId));
};

// Static method to identify departed competitors
competitorSnapshotSchema.statics.findDepartedCompetitors = async function(placeId) {
  const snapshots = await this.find({ placeId })
    .sort({ recordDate: -1 })
    .limit(2)
    .lean();

  if (snapshots.length < 2) return [];

  const [latest, previous] = snapshots;
  const latestIds = new Set(latest.competitors.map(c => c.placeId));

  return previous.competitors.filter(c => !latestIds.has(c.placeId));
};

module.exports = mongoose.model('CompetitorSnapshot', competitorSnapshotSchema);
