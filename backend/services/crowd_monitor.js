const { CrowdDensity, DENSITY_LEVELS, LOCATION_TYPES } = require('../models/crowd_density');
const logger = require('./logger');

class CrowdMonitor {
  constructor() {
    this.activeLocations = new Map(); // In-memory tracking for real-time updates
  }

  // Simulate crowd density detection (in real app, this would integrate with:
  // - Mobile app location data
  // - Traffic APIs
  // - Social media check-ins
  // - Event management systems
  // - Public transport APIs
  async simulateCrowdDetection(latitude, longitude, radiusKm = 1) {
    try {
      // Find existing locations in the area
      const nearbyLocations = await CrowdDensity.findNearby(latitude, longitude, radiusKm);
      
      // Simulate crowd count updates based on various factors
      const updates = [];
      
      for (const location of nearbyLocations) {
        // Simulate realistic crowd fluctuations
        const currentHour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        
        let multiplier = this.getCrowdMultiplier(location.location_type, currentHour, isWeekend);
        
        // Add some randomness to simulate real-world variations
        multiplier *= (0.8 + Math.random() * 0.4); // ±20% variation
        
        const newCount = Math.floor(location.max_capacity * multiplier);
        
        // Update the location
        location.updateDensity(newCount);
        await location.save();
        
        updates.push({
          id: location.id,
          location_name: location.location_name,
          old_density: location.current_density,
          new_count: newCount,
          new_density: location.current_density,
          alert_active: location.alert_active
        });
        
        logger.info(`Updated crowd density for ${location.location_name}: ${newCount} people (${location.density_percentage.toFixed(1)}%)`);
      }
      
      return updates;
    } catch (error) {
      logger.error('Error in crowd detection simulation:', error);
      throw error;
    }
  }

  // Get crowd multiplier based on location type and time
  getCrowdMultiplier(locationType, hour, isWeekend) {
    const patterns = {
      [LOCATION_TYPES.TRANSPORT]: {
        weekday: hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 0.8 : 0.3,
        weekend: hour >= 10 && hour <= 18 ? 0.6 : 0.2
      },
      [LOCATION_TYPES.SHOPPING]: {
        weekday: hour >= 18 && hour <= 21 ? 0.7 : 0.4,
        weekend: hour >= 11 && hour <= 20 ? 0.9 : 0.3
      },
      [LOCATION_TYPES.RELIGIOUS]: {
        weekday: hour >= 6 && hour <= 8 || hour >= 18 && hour <= 20 ? 0.6 : 0.2,
        weekend: hour >= 6 && hour <= 12 ? 0.8 : 0.3
      },
      [LOCATION_TYPES.EVENT]: {
        weekday: 0.3,
        weekend: hour >= 15 && hour <= 22 ? 0.9 : 0.4
      },
      [LOCATION_TYPES.STADIUM]: {
        weekday: 0.1,
        weekend: hour >= 16 && hour <= 20 ? 0.95 : 0.1
      },
      [LOCATION_TYPES.FESTIVAL]: {
        weekday: hour >= 18 && hour <= 23 ? 0.8 : 0.3,
        weekend: hour >= 10 && hour <= 23 ? 0.9 : 0.4
      }
    };

    const pattern = patterns[locationType] || { weekday: 0.3, weekend: 0.4 };
    return isWeekend ? pattern.weekend : pattern.weekday;
  }

  // Report user location and get nearby crowd alerts
  async checkUserLocation(latitude, longitude, radiusKm = 5) {
    try {
      // Find nearby locations with crowd data
      const nearbyLocations = await CrowdDensity.findNearby(latitude, longitude, radiusKm);
      
      // Filter for locations with alerts or high density
      const alerts = nearbyLocations.filter(location => 
        location.alert_active || 
        location.current_density === DENSITY_LEVELS.HIGH ||
        location.current_density === DENSITY_LEVELS.CRITICAL
      );

      // Calculate distance for each alert (rough calculation)
      const alertsWithDistance = alerts.map(location => {
        const distance = this.calculateDistance(latitude, longitude, location.latitude, location.longitude);
        return {
          id: location.id,
          location_name: location.location_name,
          location_type: location.location_type,
          current_density: location.current_density,
          density_percentage: location.density_percentage,
          estimated_count: location.estimated_count,
          alert_message: location.alert_message,
          distance_km: Math.round(distance * 10) / 10,
          latitude: location.latitude,
          longitude: location.longitude
        };
      });

      // Sort by distance
      alertsWithDistance.sort((a, b) => a.distance_km - b.distance_km);

      return {
        user_location: { latitude, longitude },
        nearby_alerts: alertsWithDistance,
        total_alerts: alertsWithDistance.length,
        critical_alerts: alertsWithDistance.filter(a => a.current_density === DENSITY_LEVELS.CRITICAL).length
      };
    } catch (error) {
      logger.error('Error checking user location:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Add a new location to monitor
  async addLocation(locationData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      
      const crowdLocation = new CrowdDensity({
        id: uuidv4(),
        location_name: locationData.location_name,
        location_type: locationData.location_type || LOCATION_TYPES.OTHER,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        max_capacity: locationData.max_capacity || 1000,
        estimated_count: locationData.initial_count || 0
      });

      // Calculate initial density
      crowdLocation.updateDensity(crowdLocation.estimated_count);
      
      await crowdLocation.save();
      logger.info(`Added new crowd monitoring location: ${locationData.location_name}`);
      
      return crowdLocation;
    } catch (error) {
      logger.error('Error adding location:', error);
      throw error;
    }
  }

  // Get all active alerts
  async getActiveAlerts() {
    try {
      const alerts = await CrowdDensity.findActiveAlerts();
      return alerts.map(location => ({
        id: location.id,
        location_name: location.location_name,
        location_type: location.location_type,
        current_density: location.current_density,
        density_percentage: location.density_percentage,
        estimated_count: location.estimated_count,
        alert_message: location.alert_message,
        latitude: location.latitude,
        longitude: location.longitude,
        last_updated: location.last_updated
      }));
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      throw error;
    }
  }

  // Initialize with some sample locations (for demo purposes)
  async initializeSampleLocations() {
    try {
      const sampleLocations = [
        {
          location_name: "Bengaluru City Railway Station",
          location_type: LOCATION_TYPES.TRANSPORT,
          latitude: 12.9762,
          longitude: 77.6033,
          max_capacity: 5000,
          initial_count: 1200
        },
        {
          location_name: "Commercial Street",
          location_type: LOCATION_TYPES.SHOPPING,
          latitude: 12.9716,
          longitude: 77.6412,
          max_capacity: 3000,
          initial_count: 800
        },
        {
          location_name: "Chinnaswamy Stadium",
          location_type: LOCATION_TYPES.STADIUM,
          latitude: 12.9784,
          longitude: 77.5996,
          max_capacity: 40000,
          initial_count: 2000
        },
        {
          location_name: "ISKCON Temple",
          location_type: LOCATION_TYPES.RELIGIOUS,
          latitude: 12.9434,
          longitude: 77.6009,
          max_capacity: 2000,
          initial_count: 600
        },
        {
          location_name: "Brigade Road",
          location_type: LOCATION_TYPES.SHOPPING,
          latitude: 12.9716,
          longitude: 77.6412,
          max_capacity: 4000,
          initial_count: 1500
        }
      ];

      for (const locationData of sampleLocations) {
        // Check if location already exists
        const existing = await CrowdDensity.findOne({
          location_name: locationData.location_name
        });
        
        if (!existing) {
          await this.addLocation(locationData);
        }
      }

      logger.info('Sample crowd monitoring locations initialized');
    } catch (error) {
      logger.error('Error initializing sample locations:', error);
    }
  }
}

module.exports = CrowdMonitor;