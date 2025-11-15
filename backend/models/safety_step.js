const mongoose = require('mongoose');

const safetyStepSchema = new mongoose.Schema(
  {
    disaster_type: {
      type: String,
      required: true
    },
    steps: {
      type: [String],
      required: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  { collection: 'safety_steps' }
);

// Index for common queries
safetyStepSchema.index({ disaster_type: 1, language: 1 });

const SafetyStep = mongoose.model('SafetyStep', safetyStepSchema);

module.exports = { SafetyStep };
