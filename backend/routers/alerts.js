const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../services/logger');

const router = express.Router();

let db = null;

function setDatabase(database) {
  db = database;
}

// GET /api/alerts
router.get('/alerts', async (req, res) => {
  try {
    const { type, severity, limit = 50 } = req.query;
    const parsedLimit = Math.min(parseInt(limit) || 50, 100);

    const query = {};
    if (type) {
      query.type = type;
    }
    if (severity) {
      query.severity = severity;
    }

    const Alert = db.model('Alert');
    const alerts = await Alert.find(query)
      .sort({ created_at: -1 })
      .limit(parsedLimit)
      .lean();

    // Convert datetime to ISO string if needed
    for (const alert of alerts) {
      if (alert.created_at && typeof alert.created_at === 'object') {
        alert.created_at = alert.created_at.toISOString();
      }
    }

    res.json(alerts);
  } catch (error) {
    logger.error(`Error fetching alerts: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/nearby
router.get('/alerts/nearby', async (req, res) => {
  try {
    const { lat, lon, radius_km = 100 } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius_km) || 100;

    const Alert = db.model('Alert');
    const alerts = await Alert.find({}).lean();

    const nearbyAlerts = [];
    for (const alert of alerts) {
      if (alert.latitude !== undefined && alert.longitude !== undefined) {
        // Calculate rough distance
        const latDiff = Math.abs(alert.latitude - latitude);
        const lonDiff = Math.abs(alert.longitude - longitude);
        const distanceApprox = Math.sqrt(latDiff ** 2 + lonDiff ** 2) * 111; // Rough km

        if (distanceApprox <= radiusKm) {
          alert.distance_km = Math.round(distanceApprox * 100) / 100;
          nearbyAlerts.push(alert);
        }
      }
    }

    // Sort by distance
    nearbyAlerts.sort((a, b) => a.distance_km - b.distance_km);

    // Convert datetime
    for (const alert of nearbyAlerts) {
      if (alert.created_at && typeof alert.created_at === 'object') {
        alert.created_at = alert.created_at.toISOString();
      }
    }

    res.json(nearbyAlerts.slice(0, 20)); // Limit to 20
  } catch (error) {
    logger.error(`Error fetching nearby alerts: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch nearby alerts' });
  }
});

// GET /api/alerts/:alertId
router.get('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    const Alert = db.model('Alert');
    const alert = await Alert.findOne({ id: alertId }).lean();

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    // Convert datetime
    if (alert.created_at && typeof alert.created_at === 'object') {
      alert.created_at = alert.created_at.toISOString();
    }

    res.json(alert);
  } catch (error) {
    logger.error(`Error fetching alert ${req.params.alertId}: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// POST /api/alerts
router.post('/alerts', async (req, res) => {
  try {
    const alertData = req.body;

    if (!alertData.id) {
      alertData.id = uuidv4();
    }

    if (!alertData.created_at) {
      alertData.created_at = new Date().toISOString();
    }

    const Alert = db.model('Alert');
    const result = await Alert.create(alertData);

    res.status(201).json({
      id: result.id,
      message: 'Alert created successfully'
    });
  } catch (error) {
    logger.error(`Error creating alert: ${error.message}`);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = { router, setDatabase };
