const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  restaurantSearched: {
    type: String,
    trim: true
  },
  placeId: {
    type: String,
    trim: true
  },
  restaurantName: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    default: 'audit-report',
    enum: ['audit-report', 'multi-restaurant', 'ranking-report']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  contacted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
leadSchema.index({ phone: 1 });
leadSchema.index({ placeId: 1 });
leadSchema.index({ timestamp: -1 });

// Method to check if lead already exists for this phone
leadSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone }).sort({ timestamp: -1 });
};

// Method to get leads for a specific restaurant
leadSchema.statics.findByRestaurant = function(placeId) {
  return this.find({ placeId }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('Lead', leadSchema);
