const express = require('express');
const { CrowdDensity, DENSITY_LEVELS, LOCATION_TYPES } = require('../models/crowd_density');
const CrowdMonitor = require('../services/crowd_monitor');
const logger = require('../services/logger');

const router = express.Router();
let crowdMonitor;

// Initialize crowd monitor
function setCrowdMonitor(monitor) {
  crowdMonitor = monitor;
}

// Get nearby crowd alerts based on user location
router.get('/crowd/nearby', async (req, res) => {
  try {
    const { lat, lon, radius } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude and longitude are required',
        message: 'Please provide lat and lon query parameters'
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const radiusKm = parseFloat(radius) || 5;

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const result = await crowdMonitor.checkUserLocation(latitude, longitude, radiusKm);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting nearby crowd alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch nearby crowd alerts'
    });
  }
});

// Get all active crowd alerts
router.get('/crowd/alerts', async (req, res) => {
  try {
    const alerts = await crowdMonitor.getActiveAlerts();
    
    res.json({
      success: true,
      data: {
        alerts,
        total_count: alerts.length,
        critical_count: alerts.filter(a => a.current_density === DENSITY_LEVELS.CRITICAL).length,
        high_count: alerts.filter(a => a.current_density === DENSITY_LEVELS.HIGH).length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting crowd alerts:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch crowd alerts'
    });
  }
});

// Get all crowd monitoring locations
router.get('/crowd/locations', async (req, res) => {
  try {
    const { type, density } = req.query;
    
    let query = {};
    if (type && Object.values(LOCATION_TYPES).includes(type)) {
      query.location_type = type;
    }
    if (density && Object.values(DENSITY_LEVELS).includes(density)) {
      query.current_density = density;
    }

    const locations = await CrowdDensity.find(query).sort({ density_percentage: -1 });
    
    const formattedLocations = locations.map(location => ({
      id: location.id,
      location_name: location.location_name,
      location_type: location.location_type,
      latitude: location.latitude,
      longitude: location.longitude,
      current_density: location.current_density,
      density_percentage: location.density_percentage,
      estimated_count: location.estimated_count,
      max_capacity: location.max_capacity,
      alert_active: location.alert_active,
      alert_message: location.alert_message,
      last_updated: location.last_updated
    }));

    res.json({
      success: true,
      data: {
        locations: formattedLocations,
        total_count: formattedLocations.length,
        filters_applied: { type, density }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting crowd locations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch crowd locations'
    });
  }
});

// Get specific location details
router.get('/crowd/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await CrowdDensity.findOne({ id });
    
    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        message: `No crowd monitoring location found with ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: {
        id: location.id,
        location_name: location.location_name,
        location_type: location.location_type,
        latitude: location.latitude,
        longitude: location.longitude,
        current_density: location.current_density,
        density_percentage: location.density_percentage,
        estimated_count: location.estimated_count,
        max_capacity: location.max_capacity,
        alert_active: location.alert_active,
        alert_message: location.alert_message,
        last_updated: location.last_updated,
        created_at: location.created_at,
        density_history: location.density_history.slice(-12) // Last 12 readings
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting location details:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch location details'
    });
  }
});

// Add new crowd monitoring location
router.post('/crowd/locations', async (req, res) => {
  try {
    const { location_name, location_type, latitude, longitude, max_capacity, initial_count } = req.body;
    
    // Validation
    if (!location_name || !latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'location_name, latitude, and longitude are required'
      });
    }

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    if (location_type && !Object.values(LOCATION_TYPES).includes(location_type)) {
      return res.status(400).json({
        error: 'Invalid location type',
        message: `Location type must be one of: ${Object.values(LOCATION_TYPES).join(', ')}`
      });
    }

    const locationData = {
      location_name,
      location_type: location_type || LOCATION_TYPES.OTHER,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      max_capacity: parseInt(max_capacity) || 1000,
      initial_count: parseInt(initial_count) || 0
    };

    const newLocation = await crowdMonitor.addLocation(locationData);
    
    res.status(201).json({
      success: true,
      data: {
        id: newLocation.id,
        location_name: newLocation.location_name,
        location_type: newLocation.location_type,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        current_density: newLocation.current_density,
        density_percentage: newLocation.density_percentage,
        estimated_count: newLocation.estimated_count,
        max_capacity: newLocation.max_capacity,
        alert_active: newLocation.alert_active
      },
      message: 'Crowd monitoring location added successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding crowd location:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add crowd monitoring location'
    });
  }
});

// Update crowd count for a location (simulate crowd detection)
router.post('/crowd/locations/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const { estimated_count } = req.body;
    
    if (!estimated_count || isNaN(estimated_count) || estimated_count < 0) {
      return res.status(400).json({
        error: 'Invalid crowd count',
        message: 'estimated_count must be a non-negative number'
      });
    }

    const location = await CrowdDensity.findOne({ id });
    
    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        message: `No crowd monitoring location found with ID: ${id}`
      });
    }

    const oldDensity = location.current_density;
    location.updateDensity(parseInt(estimated_count));
    await location.save();

    res.json({
      success: true,
      data: {
        id: location.id,
        location_name: location.location_name,
        old_density: oldDensity,
        new_density: location.current_density,
        density_percentage: location.density_percentage,
        estimated_count: location.estimated_count,
        alert_active: location.alert_active,
        alert_message: location.alert_message
      },
      message: 'Crowd density updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating crowd density:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update crowd density'
    });
  }
});

// Simulate crowd detection in an area
router.post('/crowd/simulate', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'latitude and longitude are required'
      });
    }

    if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }

    const radiusKm = parseFloat(radius) || 5;
    const updates = await crowdMonitor.simulateCrowdDetection(parseFloat(latitude), parseFloat(longitude), radiusKm);
    
    res.json({
      success: true,
      data: {
        simulation_area: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius_km: radiusKm
        },
        updates,
        locations_updated: updates.length,
        new_alerts: updates.filter(u => u.alert_active).length
      },
      message: 'Crowd detection simulation completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in crowd simulation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to simulate crowd detection'
    });
  }
});

// Get crowd density constants
router.get('/crowd/constants', (req, res) => {
  res.json({
    success: true,
    data: {
      density_levels: DENSITY_LEVELS,
      location_types: LOCATION_TYPES
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  router,
  setCrowdMonitor
};