const { CrowdDensity, DENSITY_LEVELS } = require('../models/crowd_density');
const { EmergencyAlert } = require('../models/emergency_alert');
const logger = require('./logger');

class RouteOptimizer {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  // Get safe routes avoiding crowded areas
  async getSafeRoutes(origin, destination, options = {}) {
    try {
      const {
        avoidCrowds = true,
        avoidEmergencies = true,
        maxDetourPercent = 50,
        transportMode = 'walking'
      } = options;

      // Get multiple route options from Google Maps
      const routes = await this.getGoogleMapsRoutes(origin, destination, transportMode);
      
      if (!routes || routes.length === 0) {
        throw new Error('No routes found');
      }

      // Analyze each route for safety
      const analyzedRoutes = await Promise.all(
        routes.map(route => this.analyzeRouteSafety(route, {
          avoidCrowds,
          avoidEmergencies
        }))
      );

      // Sort by safety score
      analyzedRoutes.sort((a, b) => b.safetyScore - a.safetyScore);

      // Filter out routes with excessive detours
      const acceptableRoutes = analyzedRoutes.filter(route => {
        const detourPercent = ((route.duration - analyzedRoutes[0].duration) / analyzedRoutes[0].duration) * 100;
        return detourPercent <= maxDetourPercent;
      });

      return {
        recommended_route: acceptableRoutes[0],
        alternative_routes: acceptableRoutes.slice(1, 3),
        safety_analysis: {
          crowded_areas_avoided: this.countAvoidedAreas(acceptableRoutes[0], 'crowd'),
          emergency_areas_avoided: this.countAvoidedAreas(acceptableRoutes[0], 'emergency')
        }
      };
    } catch (error) {
      logger.error('Error getting safe routes:', error);
      throw error;
    }
  }

  // Get routes from Google Maps API
  async getGoogleMapsRoutes(origin, destination, mode = 'walking') {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.lat},${origin.lng}&` +
        `destination=${destination.lat},${destination.lng}&` +
        `mode=${mode}&` +
        `alternatives=true&` +
        `key=${this.googleMapsApiKey}`
      );

      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`);
      }

      return data.routes.map(route => ({
        summary: route.summary,
        duration: route.legs[0].duration.value, // seconds
        distance: route.legs[0].distance.value, // meters
        steps: route.legs[0].steps,
        polyline: route.overview_polyline.points,
        bounds: route.bounds
      }));
    } catch (error) {
      logger.error('Error fetching Google Maps routes:', error);
      // Fallback to simple direct route
      return [{
        summary: 'Direct route',
        duration: this.estimateWalkingTime(origin, destination),
        distance: this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng) * 1000,
        steps: [],
        polyline: '',
        bounds: null
      }];
    }
  }

  // Analyze route safety based on crowd and emergency data
  async analyzeRouteSafety(route, options) {
    try {
      let safetyScore = 100; // Start with perfect score
      const warnings = [];
      const crowdedAreas = [];
      const emergencyAreas = [];

      // Sample points along the route for analysis
      const samplePoints = this.sampleRoutePoints(route, 500); // Every 500 meters

      for (const point of samplePoints) {
        // Check for crowded areas
        if (options.avoidCrowds) {
          const nearbyLocations = await CrowdDensity.findNearby(
            point.lat, point.lng, 0.5 // 500m radius
          );

          for (const location of nearbyLocations) {
            if (location.current_density === DENSITY_LEVELS.CRITICAL) {
              safetyScore -= 30;
              crowdedAreas.push({
                name: location.location_name,
                density: location.current_density,
                percentage: location.density_percentage,
                lat: location.latitude,
                lng: location.longitude
              });
              warnings.push(`Critical crowd density at ${location.location_name}`);
            } else if (location.current_density === DENSITY_LEVELS.HIGH) {
              safetyScore -= 15;
              crowdedAreas.push({
                name: location.location_name,
                density: location.current_density,
                percentage: location.density_percentage,
                lat: location.latitude,
                lng: location.longitude
              });
              warnings.push(`High crowd density at ${location.location_name}`);
            }
          }
        }

        // Check for emergency alerts
        if (options.avoidEmergencies) {
          const nearbyEmergencies = await EmergencyAlert.findNearbyActive(
            point.lat, point.lng, 1 // 1km radius
          );

          for (const emergency of nearbyEmergencies) {
            const severityPenalty = {
              'critical': 50,
              'high': 30,
              'medium': 15,
              'low': 5
            };

            safetyScore -= severityPenalty[emergency.severity] || 10;
            emergencyAreas.push({
              type: emergency.alert_type,
              severity: emergency.severity,
              location: emergency.location_name,
              lat: emergency.latitude,
              lng: emergency.longitude
            });
            warnings.push(`${emergency.severity.toUpperCase()} ${emergency.alert_type} at ${emergency.location_name}`);
          }
        }
      }

      // Ensure safety score doesn't go below 0
      safetyScore = Math.max(0, safetyScore);

      return {
        ...route,
        safetyScore,
        warnings,
        crowdedAreas,
        emergencyAreas,
        recommendation: this.getRouteRecommendation(safetyScore)
      };
    } catch (error) {
      logger.error('Error analyzing route safety:', error);
      return {
        ...route,
        safetyScore: 50, // Default moderate safety
        warnings: ['Unable to analyze route safety'],
        crowdedAreas: [],
        emergencyAreas: [],
        recommendation: 'Use caution'
      };
    }
  }

  // Sample points along route for analysis
  sampleRoutePoints(route, intervalMeters = 500) {
    // For simplicity, create sample points based on route bounds
    // In real implementation, would decode polyline and sample actual route
    const points = [];
    const bounds = route.bounds;
    
    if (!bounds) {
      // Fallback: create points between start and end
      return [
        { lat: bounds?.northeast?.lat || 0, lng: bounds?.northeast?.lng || 0 },
        { lat: bounds?.southwest?.lat || 0, lng: bounds?.southwest?.lng || 0 }
      ];
    }

    // Create grid of sample points within route bounds
    const latStep = (bounds.northeast.lat - bounds.southwest.lat) / 5;
    const lngStep = (bounds.northeast.lng - bounds.southwest.lng) / 5;

    for (let i = 0; i <= 5; i++) {
      points.push({
        lat: bounds.southwest.lat + (latStep * i),
        lng: bounds.southwest.lng + (lngStep * i)
      });
    }

    return points;
  }

  // Get route recommendation based on safety score
  getRouteRecommendation(safetyScore) {
    if (safetyScore >= 80) return 'Safe route - recommended';
    if (safetyScore >= 60) return 'Generally safe - minor caution advised';
    if (safetyScore >= 40) return 'Use caution - some safety concerns';
    if (safetyScore >= 20) return 'Not recommended - significant safety risks';
    return 'Avoid this route - high safety risks';
  }

  // Count avoided areas for statistics
  countAvoidedAreas(route, type) {
    if (type === 'crowd') {
      return route.crowdedAreas?.length || 0;
    }
    if (type === 'emergency') {
      return route.emergencyAreas?.length || 0;
    }
    return 0;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // Estimate walking time based on distance
  estimateWalkingTime(origin, destination) {
    const distance = this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const walkingSpeedKmh = 5; // Average walking speed
    return Math.round((distance / walkingSpeedKmh) * 3600); // Convert to seconds
  }

  // Get evacuation routes for emergency situations
  async getEvacuationRoutes(currentLocation, emergencyLocation, options = {}) {
    try {
      const {
        evacuationRadius = 2, // km
        maxRoutes = 3
      } = options;

      // Find safe destinations outside evacuation radius
      const safeDestinations = await this.findSafeDestinations(
        currentLocation, 
        emergencyLocation, 
        evacuationRadius
      );

      // Get routes to each safe destination
      const evacuationRoutes = [];
      
      for (const destination of safeDestinations.slice(0, maxRoutes)) {
        const routes = await this.getSafeRoutes(currentLocation, destination, {
          avoidCrowds: true,
          avoidEmergencies: true,
          transportMode: 'walking',
          maxDetourPercent: 100 // Allow longer detours for safety
        });

        if (routes.recommended_route) {
          evacuationRoutes.push({
            destination: destination.name,
            route: routes.recommended_route,
            estimated_safety: destination.safety_level
          });
        }
      }

      return {
        evacuation_routes: evacuationRoutes,
        emergency_location: emergencyLocation,
        evacuation_radius: evacuationRadius,
        instructions: this.generateEvacuationInstructions(evacuationRoutes)
      };
    } catch (error) {
      logger.error('Error getting evacuation routes:', error);
      throw error;
    }
  }

  // Find safe destinations for evacuation
  async findSafeDestinations(currentLocation, emergencyLocation, radiusKm) {
    // Predefined safe locations in Bengaluru
    const safeLocations = [
      { name: 'Cubbon Park', lat: 12.9762, lng: 77.5993, type: 'park' },
      { name: 'Lalbagh Botanical Garden', lat: 12.9507, lng: 77.5848, type: 'park' },
      { name: 'Bangalore Palace Grounds', lat: 12.9988, lng: 77.5916, type: 'open_space' },
      { name: 'Kanteerava Stadium', lat: 12.9698, lng: 77.5986, type: 'stadium' },
      { name: 'Freedom Park', lat: 12.9716, lng: 77.5946, type: 'park' }
    ];

    // Filter locations outside emergency radius and sort by distance
    const safeDestinations = safeLocations
      .filter(location => {
        const distanceFromEmergency = this.calculateDistance(
          emergencyLocation.lat, emergencyLocation.lng,
          location.lat, location.lng
        );
        return distanceFromEmergency > radiusKm;
      })
      .map(location => ({
        ...location,
        distance_from_current: this.calculateDistance(
          currentLocation.lat, currentLocation.lng,
          location.lat, location.lng
        ),
        safety_level: this.calculateLocationSafety(location)
      }))
      .sort((a, b) => a.distance_from_current - b.distance_from_current);

    return safeDestinations;
  }

  // Calculate safety level of a location
  calculateLocationSafety(location) {
    const safetyScores = {
      'park': 90,
      'open_space': 85,
      'stadium': 80,
      'hospital': 75,
      'school': 70
    };

    return safetyScores[location.type] || 60;
  }

  // Generate evacuation instructions
  generateEvacuationInstructions(evacuationRoutes) {
    if (evacuationRoutes.length === 0) {
      return ['Move away from the emergency area', 'Seek open spaces', 'Follow local authorities\' instructions'];
    }

    const primaryRoute = evacuationRoutes[0];
    return [
      `Head towards ${primaryRoute.destination}`,
      `Estimated travel time: ${Math.round(primaryRoute.route.duration / 60)} minutes`,
      'Stay calm and move steadily',
      'Avoid running to prevent panic',
      'Help others if safe to do so',
      'Follow instructions from emergency personnel'
    ];
  }
}

module.exports = RouteOptimizer;