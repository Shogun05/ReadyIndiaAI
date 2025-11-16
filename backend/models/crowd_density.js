const mongoose = require('mongoose');

// Crowd density levels
const DENSITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Location types where crowds gather
const LOCATION_TYPES = {
  EVENT: 'event',
  TRANSPORT: 'transport',
  SHOPPING: 'shopping',
  RELIGIOUS: 'religious',
  STADIUM: 'stadium',
  FESTIVAL: 'festival',
  OTHER: 'other'
};

const crowdDensitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  location_name: {
    type: String,
    required: true
  },
  location_type: {
    type: String,
    enum: Object.values(LOCATION_TYPES),
    default: LOCATION_TYPES.OTHER
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  current_density: {
    type: String,
    enum: Object.values(DENSITY_LEVELS),
    default: DENSITY_LEVELS.LOW
  },
  estimated_count: {
    type: Number,
    default: 0,
    min: 0
  },
  max_capacity: {
    type: Number,
    default: 1000,
    min: 1
  },
  density_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  alert_active: {
    type: Boolean,
    default: false
  },
  alert_message: {
    type: String,
    default: ''
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  // Store recent density history for trend analysis
  density_history: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    count: {
      type: Number,
      required: true
    },
    density_level: {
      type: String,
      enum: Object.values(DENSITY_LEVELS),
      required: true
    }
  }]
});

// Index for geospatial queries
crowdDensitySchema.index({ latitude: 1, longitude: 1 });
crowdDensitySchema.index({ location_type: 1 });
crowdDensitySchema.index({ current_density: 1 });
crowdDensitySchema.index({ alert_active: 1 });

// Method to calculate density level based on percentage
crowdDensitySchema.methods.calculateDensityLevel = function() {
  const percentage = this.density_percentage;
  
  if (percentage >= 90) return DENSITY_LEVELS.CRITICAL;
  if (percentage >= 70) return DENSITY_LEVELS.HIGH;
  if (percentage >= 40) return DENSITY_LEVELS.MEDIUM;
  return DENSITY_LEVELS.LOW;
};

// Method to update density and check for alerts
crowdDensitySchema.methods.updateDensity = function(newCount) {
  this.estimated_count = newCount;
  this.density_percentage = Math.min((newCount / this.max_capacity) * 100, 100);
  this.current_density = this.calculateDensityLevel();
  this.last_updated = new Date();
  
  // Add to history (keep last 24 entries)
  this.density_history.push({
    timestamp: new Date(),
    count: newCount,
    density_level: this.current_density
  });
  
  if (this.density_history.length > 24) {
    this.density_history = this.density_history.slice(-24);
  }
  
  // Check if alert should be activated
  if (this.current_density === DENSITY_LEVELS.CRITICAL || this.current_density === DENSITY_LEVELS.HIGH) {
    this.alert_active = true;
    this.alert_message = this.generateAlertMessage();
  } else {
    this.alert_active = false;
    this.alert_message = '';
  }
};

// Method to generate appropriate alert message
crowdDensitySchema.methods.generateAlertMessage = function() {
  const messages = {
    [DENSITY_LEVELS.CRITICAL]: `CRITICAL: Extremely high crowd density at ${this.location_name}. Avoid this area immediately for your safety. Consider alternative routes.`,
    [DENSITY_LEVELS.HIGH]: `WARNING: High crowd density detected at ${this.location_name}. Exercise caution and consider alternative locations or routes.`
  };
  
  return messages[this.current_density] || '';
};

// Static method to find nearby crowd hotspots
crowdDensitySchema.statics.findNearby = function(latitude, longitude, radiusKm = 5) {
  const radiusInDegrees = radiusKm / 111; // Rough conversion
  
  return this.find({
    latitude: {
      $gte: latitude - radiusInDegrees,
      $lte: latitude + radiusInDegrees
    },
    longitude: {
      $gte: longitude - radiusInDegrees,
      $lte: longitude + radiusInDegrees
    }
  }).sort({ density_percentage: -1 });
};

// Static method to find active alerts
crowdDensitySchema.statics.findActiveAlerts = function() {
  return this.find({ alert_active: true }).sort({ density_percentage: -1 });
};

const CrowdDensity = mongoose.model('CrowdDensity', crowdDensitySchema);

module.exports = {
  CrowdDensity,
  DENSITY_LEVELS,
  LOCATION_TYPES
};