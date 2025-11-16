const express = require('express');
const EmergencyService = require('../services/emergency_service');
const RouteOptimizer = require('../services/route_optimizer');
const { EMERGENCY_TYPES, EMERGENCY_SEVERITY } = require('../models/emergency_alert');
const logger = require('../services/logger');

const router = express.Router();
let emergencyService;
let routeOptimizer;

// Initialize services
function setEmergencyServices(services) {
  emergencyService = services.emergencyService;
  routeOptimizer = services.routeOptimizer;
}

// Create emergency alert (panic button)
router.post('/emergency/alert', async (req, res) => {
  try {
    const {
      alert_type,
      severity,
      location_name,
      latitude,
      longitude,
      description,
      reporter_id
    } = req.body;

    // Validation
    if (!alert_type || !location_name || !latitude || !longitude || !description) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'alert_type, location_name, latitude, longitude, and description are required'
      });
    }

    if (!Object.values(EMERGENCY_TYPES).includes(alert_type)) {
      return res.status(400).json({
        error: 'Invalid alert type',
        message: `Alert type must be one of: ${Object.values(EMERGENCY_TYPES).join(', ')}`
      });
    }

    if (severity && !Object.values(EMERGENCY_SEVERITY).includes(severity)) {
      return res.status(400).json({
        error: 'Invalid severity',
        message: `Severity must be one of: ${Object.values(EMERGENCY_SEVERITY).join(', ')}`
      });
    }

    const alertData = {
      alert_type,
      severity: severity || EMERGENCY_SEVERITY.MEDIUM,
      location_name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description,
      reporter_id: reporter_id || 'anonymous'
    };

    const alert = await emergencyService.createEmergencyAlert(alertData);

    res.status(201).json({
      success: true,
      data: {
        alert_id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        location_name: alert.location_name,
        verified: alert.verified,
        notifications_sent: alert.notifications_sent,
        broadcast_radius: alert.broadcast_radius
      },
      message: 'Emergency alert created and broadcasted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating emergency alert:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create emergency alert'
    });
  }
});

// Get nearby emergency alerts
router.get('/emergency/nearby', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'lat and lon query parameters are required'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius) || 5;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'lat and lon must be valid numbers'
      });
    }

    const alerts = await emergencyService.getNearbyEmergencyAlerts(
      latitude, longitude, radiusKm
    );

    res.json({
      success: true,
      data: {
        alerts,
        total_count: alerts.length,
        critical_count: alerts.filter(a => a.severity === 'critical').length,
        search_area: {
          latitude,
          longitude,
          radius_km: radiusKm
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting nearby emergency alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch nearby emergency alerts'
    });
  }
});

// Confirm or deny emergency alert
router.post('/emergency/confirm/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { user_id, confirmed } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: 'Missing user ID',
        message: 'user_id is required in request body'
      });
    }

    const result = await emergencyService.confirmAlert(
      alertId, 
      user_id, 
      confirmed !== false // Default to true if not specified
    );

    res.json({
      success: true,
      data: result,
      message: confirmed !== false ? 'Alert confirmed' : 'Alert denied',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error confirming emergency alert:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to confirm emergency alert'
    });
  }
});

// Get safe routes avoiding crowds and emergencies
router.post('/emergency/safe-routes', async (req, res) => {
  try {
    const {
      origin,
      destination,
      avoid_crowds = true,
      avoid_emergencies = true,
      transport_mode = 'walking',
      max_detour_percent = 50
    } = req.body;

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'origin and destination must have lat and lng properties'
      });
    }

    const routes = await routeOptimizer.getSafeRoutes(origin, destination, {
      avoidCrowds: avoid_crowds,
      avoidEmergencies: avoid_emergencies,
      transportMode: transport_mode,
      maxDetourPercent: max_detour_percent
    });

    res.json({
      success: true,
      data: routes,
      message: 'Safe routes calculated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error calculating safe routes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate safe routes'
    });
  }
});

// Get evacuation routes for emergency
router.post('/emergency/evacuation-routes', async (req, res) => {
  try {
    const {
      current_location,
      emergency_location,
      evacuation_radius = 2,
      max_routes = 3
    } = req.body;

    if (!current_location || !emergency_location) {
      return res.status(400).json({
        error: 'Missing locations',
        message: 'current_location and emergency_location are required'
      });
    }

    if (!current_location.lat || !current_location.lng || !emergency_location.lat || !emergency_location.lng) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Locations must have lat and lng properties'
      });
    }

    const evacuationData = await routeOptimizer.getEvacuationRoutes(
      current_location,
      emergency_location,
      {
        evacuationRadius: evacuation_radius,
        maxRoutes: max_routes
      }
    );

    res.json({
      success: true,
      data: evacuationData,
      message: 'Evacuation routes calculated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error calculating evacuation routes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to calculate evacuation routes'
    });
  }
});

// Get emergency statistics
router.get('/emergency/stats', async (req, res) => {
  try {
    const stats = await emergencyService.getEmergencyStats();

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting emergency stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch emergency statistics'
    });
  }
});

// Get emergency constants
router.get('/emergency/constants', (req, res) => {
  res.json({
    success: true,
    data: {
      emergency_types: EMERGENCY_TYPES,
      emergency_severity: EMERGENCY_SEVERITY
    },
    timestamp: new Date().toISOString()
  });
});

// Manual trigger for emergency detection (admin only)
router.post('/emergency/detect', async (req, res) => {
  try {
    await emergencyService.detectEmergencySituations();
    
    res.json({
      success: true,
      message: 'Emergency detection completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in manual emergency detection:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to run emergency detection'
    });
  }
});

module.exports = {
  router,
  setEmergencyServices
};