const mongoose = require('mongoose');

const EMERGENCY_TYPES = {
  STAMPEDE_RISK: 'stampede_risk',
  OVERCROWDING: 'overcrowding',
  BLOCKED_EXIT: 'blocked_exit',
  PANIC_SITUATION: 'panic_situation',
  MEDICAL_EMERGENCY: 'medical_emergency',
  FIRE_HAZARD: 'fire_hazard',
  STRUCTURAL_ISSUE: 'structural_issue'
};

const EMERGENCY_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const emergencyAlertSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  alert_type: {
    type: String,
    enum: Object.values(EMERGENCY_TYPES),
    required: true
  },
  severity: {
    type: String,
    enum: Object.values(EMERGENCY_SEVERITY),
    required: true
  },
  location_name: {
    type: String,
    required: true
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
  description: {
    type: String,
    required: true
  },
  reporter_id: {
    type: String,
    default: 'anonymous'
  },
  verified: {
    type: Boolean,
    default: false
  },
  verified_by: {
    type: String,
    default: null
  },
  broadcast_radius: {
    type: Number,
    default: 1000,
    min: 100,
    max: 10000
  },
  active: {
    type: Boolean,
    default: true
  },
  resolved_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
  },
  notifications_sent: {
    type: Number,
    default: 0
  },
  user_confirmations: [{
    user_id: String,
    confirmed: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  response_actions: [{
    action_type: {
      type: String,
      enum: ['police_notified', 'medical_dispatched', 'evacuation_started', 'area_cordoned']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String
  }]
});

emergencyAlertSchema.index({ latitude: 1, longitude: 1 });
emergencyAlertSchema.index({ alert_type: 1 });
emergencyAlertSchema.index({ severity: 1 });
emergencyAlertSchema.index({ active: 1 });
emergencyAlertSchema.index({ expires_at: 1 });
emergencyAlertSchema.methods.isValid = function() {
  return this.active && new Date() < this.expires_at;
};

emergencyAlertSchema.methods.resolve = function(resolvedBy = 'system') {
  this.active = false;
  this.resolved_at = new Date();
  this.verified_by = resolvedBy;
};

emergencyAlertSchema.methods.addUserConfirmation = function(userId, confirmed = true) {
  this.user_confirmations = this.user_confirmations.filter(
    conf => conf.user_id !== userId
  );
  this.user_confirmations.push({
    user_id: userId,
    confirmed: confirmed,
    timestamp: new Date()
  });
};

emergencyAlertSchema.methods.getConfirmationRatio = function() {
  if (this.user_confirmations.length === 0) return 0;
  
  const confirmed = this.user_confirmations.filter(conf => conf.confirmed).length;
  return confirmed / this.user_confirmations.length;
};

emergencyAlertSchema.statics.findNearbyActive = function(latitude, longitude, radiusKm = 5) {
  const radiusInDegrees = radiusKm / 111;
  
  return this.find({
    active: true,
    expires_at: { $gt: new Date() },
    latitude: {
      $gte: latitude - radiusInDegrees,
      $lte: latitude + radiusInDegrees
    },
    longitude: {
      $gte: longitude - radiusInDegrees,
      $lte: longitude + radiusInDegrees
    }
  }).sort({ severity: -1, created_at: -1 });
};

emergencyAlertSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { 
      active: true,
      expires_at: { $lt: new Date() }
    },
    { 
      active: false,
      resolved_at: new Date()
    }
  );
};

const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);

module.exports = {
  EmergencyAlert,
  EMERGENCY_TYPES,
  EMERGENCY_SEVERITY
};