const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  placeId: {
    type: String,
    required: true
  },
  // Basic restaurant info at time of audit
  restaurantSnapshot: {
    name: String,
    address: String,
    rating: Number,
    totalRatings: Number,
    website: String,
    phone: String
  },
  // SEO Analysis
  seoAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    factors: {
      googleMyBusiness: {
        score: Number,
        hasProfile: Boolean,
        isVerified: Boolean,
        completeness: Number
      },
      onlineReviews: {
        score: Number,
        averageRating: Number,
        totalReviews: Number,
        responseRate: Number
      },
      websitePresence: {
        score: Number,
        hasWebsite: Boolean,
        isOptimized: Boolean,
        mobileResponsive: Boolean
      }
    },
    monthlyRevenueLoss: {
      type: Number,
      required: true
    },
    annualRevenueLoss: {
      type: Number,
      required: true
    }
  },
  // Page Speed Analysis
  pageSpeedAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    metrics: {
      loadTime: Number,
      firstContentfulPaint: Number,
      largestContentfulPaint: Number,
      cumulativeLayoutShift: Number
    },
    monthlyRevenueLoss: {
      type: Number,
      required: true
    },
    annualRevenueLoss: {
      type: Number,
      required: true
    }
  },
  // Review Analysis
  reviewAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    metrics: {
      averageRating: Number,
      totalReviews: Number,
      recentReviews: Number,
      responseRate: Number,
      sentimentScore: Number
    },
    competitors: [{
      name: String,
      rating: Number,
      totalReviews: Number,
      distance: Number
    }],
    monthlyRevenueLoss: {
      type: Number,
      required: true
    },
    annualRevenueLoss: {
      type: Number,
      required: true
    }
  },
  // Response Time Analysis (Social Media, Reviews)
  responseTimeAnalysis: {
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    metrics: {
      averageResponseTime: Number,
      responseRate: Number,
      recentResponses: Number
    },
    monthlyRevenueLoss: {
      type: Number,
      required: true
    },
    annualRevenueLoss: {
      type: Number,
      required: true
    }
  },
  // Overall Summary
  summary: {
    totalScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    totalMonthlyLoss: {
      type: Number,
      required: true
    },
    totalAnnualLoss: {
      type: Number,
      required: true
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F'],
      required: true
    },
    priorityFixes: [{
      category: String,
      issue: String,
      impact: String,
      solution: String,
      estimatedRevenue: Number
    }]
  },
  // Revenue calculation parameters used
  revenueParams: {
    averageOrderValue: {
      type: Number,
      default: 28
    },
    conversionRate: {
      type: Number,
      default: 0.03
    },
    monthlyVisitors: Number,
    industryBenchmarks: {
      averageRating: Number,
      averageLoadTime: Number,
      averageResponseTime: Number
    }
  },
  // Audit metadata
  auditDate: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
auditSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for user queries
auditSchema.index({ userId: 1, createdAt: -1 });

// Index for restaurant queries
auditSchema.index({ restaurantId: 1, createdAt: -1 });

// Index for public audits
auditSchema.index({ isPublic: 1, createdAt: -1 });

module.exports = mongoose.model('Audit', auditSchema);