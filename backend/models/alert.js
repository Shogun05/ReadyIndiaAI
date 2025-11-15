const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const DISASTER_TYPES = {
  EARTHQUAKE: 'earthquake',
  FLOOD: 'flood',
  CYCLONE: 'cyclone',
  HEATWAVE: 'heatwave',
  TSUNAMI: 'tsunami',
  LANDSLIDE: 'landslide',
  STORM: 'storm',
  DROUGHT: 'drought'
};

const alertSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(DISASTER_TYPES),
      required: true
    },
    severity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      required: true
    },
    raw_text: {
      type: String,
      required: true
    },
    ai_summary: {
      type: String,
      default: null
    },
    ai_steps: {
      type: [String],
      default: []
    },
    languages: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    location: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      default: null
    },
    longitude: {
      type: Number,
      default: null
    },
    magnitude: {
      type: Number,
      default: null
    },
    source: {
      type: String,
      default: 'manual'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'alerts' }
);

// Index for common queries
alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ created_at: -1 });
alertSchema.index({ raw_text: 1, source: 1 }, { unique: true });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = {
  Alert,
  SEVERITY_LEVELS,
  DISASTER_TYPES
};
