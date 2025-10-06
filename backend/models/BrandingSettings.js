const mongoose = require('mongoose');

const brandingSettingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Company Information
  companyName: {
    type: String,
    default: 'BiteHeist',
    required: true
  },

  companyLogo: {
    type: String, // URL or base64
    default: null
  },

  companyWebsite: {
    type: String,
    default: 'www.biteheist.com'
  },

  companyEmail: {
    type: String,
    required: true
  },

  companyPhone: {
    type: String,
    default: null
  },

  // Branding Colors
  primaryColor: {
    type: String,
    default: '#FF6B35',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Primary color must be a valid hex color'
    }
  },

  secondaryColor: {
    type: String,
    default: '#004E89',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Secondary color must be a valid hex color'
    }
  },

  accentColor: {
    type: String,
    default: '#F77F00',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Accent color must be a valid hex color'
    }
  },

  // UI Customization
  dashboardTitle: {
    type: String,
    default: 'Restaurant SEO Dashboard'
  },

  footerText: {
    type: String,
    default: 'Powered by BiteHeist'
  },

  welcomeMessage: {
    type: String,
    default: 'Welcome to your restaurant SEO dashboard'
  },

  // Report Customization
  reportHeaderText: {
    type: String,
    default: 'Restaurant SEO Audit Report'
  },

  reportFooterText: {
    type: String,
    default: 'Powered by BiteHeist'
  },

  includeWatermark: {
    type: Boolean,
    default: true
  },

  // Email Customization
  emailSignature: {
    type: String,
    default: null
  },

  emailFromName: {
    type: String,
    default: 'BiteHeist'
  },

  // Feature Flags
  showBrandingInReports: {
    type: Boolean,
    default: true
  },

  showPoweredBy: {
    type: Boolean,
    default: true
  },

  customCSS: {
    type: String,
    default: null
  },

  // Subscription Tier
  tier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },

  // White Label Status
  whiteLabelEnabled: {
    type: Boolean,
    default: false
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
brandingSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to get branding object for reports
brandingSettingsSchema.methods.getBrandingForReports = function() {
  return {
    companyName: this.companyName,
    logo: this.companyLogo,
    primaryColor: this.primaryColor,
    secondaryColor: this.secondaryColor,
    website: this.companyWebsite,
    email: this.companyEmail,
    phone: this.companyPhone,
    footerText: this.whiteLabelEnabled ? this.footerText : 'Powered by BiteHeist',
    showPoweredBy: !this.whiteLabelEnabled || this.showPoweredBy
  };
};

// Method to get branding object for emails
brandingSettingsSchema.methods.getBrandingForEmails = function() {
  return {
    companyName: this.companyName,
    email: this.companyEmail,
    emailFromName: this.emailFromName,
    primaryColor: this.primaryColor,
    secondaryColor: this.secondaryColor,
    signature: this.emailSignature,
    footerText: this.footerText
  };
};

// Static method to get default branding
brandingSettingsSchema.statics.getDefaultBranding = function() {
  return {
    companyName: 'BiteHeist',
    logo: null,
    primaryColor: '#FF6B35',
    secondaryColor: '#004E89',
    accentColor: '#F77F00',
    website: 'www.biteheist.com',
    email: 'support@biteheist.com',
    phone: null,
    footerText: 'Powered by BiteHeist',
    showPoweredBy: true
  };
};

// Check if user has white-label permissions
brandingSettingsSchema.methods.canUseWhiteLabel = function() {
  return ['pro', 'enterprise'].includes(this.tier) && this.whiteLabelEnabled;
};

const BrandingSettings = mongoose.model('BrandingSettings', brandingSettingsSchema);

module.exports = BrandingSettings;
