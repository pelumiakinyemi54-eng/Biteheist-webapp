const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  placeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  priceLevel: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  },
  types: [{
    type: String
  }],
  hours: {
    type: mongoose.Schema.Types.Mixed
  },
  photos: [{
    photoReference: String,
    width: Number,
    height: Number
  }],
  reviews: [{
    author: String,
    rating: Number,
    text: String,
    time: Date
  }],
  // Cached data from Google Places API
  googleData: {
    type: mongoose.Schema.Types.Mixed
  },
  // Last time data was fetched from Google Places
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  // SEO and performance metrics cache
  metrics: {
    seoScore: Number,
    pageSpeedScore: Number,
    mobileScore: Number,
    lastCalculated: Date
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
restaurantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });

// Index for text search
restaurantSchema.index({
  name: 'text',
  address: 'text'
});

module.exports = mongoose.model('Restaurant', restaurantSchema);