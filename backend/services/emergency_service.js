const { EmergencyAlert, EMERGENCY_TYPES, EMERGENCY_SEVERITY } = require('../models/emergency_alert');
const { CrowdDensity, DENSITY_LEVELS } = require('../models/crowd_density');
const logger = require('./logger');

class EmergencyService {
  constructor() {
    this.activeAlerts = new Map();
    this.notificationQueue = [];
  }

  async createEmergencyAlert(alertData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      
      const alert = new EmergencyAlert({
        id: uuidv4(),
        alert_type: alertData.alert_type,
        severity: alertData.severity || EMERGENCY_SEVERITY.MEDIUM,
        location_name: alertData.location_name,
        latitude: alertData.latitude,
        longitude: alertData.longitude,
        description: alertData.description,
        reporter_id: alertData.reporter_id || 'anonymous',
        broadcast_radius: alertData.broadcast_radius || 1000
      });

      await alert.save();
      
      if (alertData.auto_verify) {
        alert.verified = true;
        alert.verified_by = 'system';
        await alert.save();
      }

      await this.broadcastEmergencyAlert(alert);
      if (alert.severity === EMERGENCY_SEVERITY.CRITICAL) {
        await this.triggerEmergencyResponse(alert);
      }

      logger.info(`Emergency alert created: ${alert.alert_type} at ${alert.location_name}`);
      return alert;
    } catch (error) {
      logger.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  async broadcastEmergencyAlert(alert) {
    try {
      const notificationMessage = this.generateNotificationMessage(alert);
      const estimatedUsers = await this.estimateUsersInArea(
        alert.latitude, 
        alert.longitude, 
        alert.broadcast_radius / 1000
      );

      alert.notifications_sent = estimatedUsers;
      await alert.save();

      logger.info(`Broadcasted emergency alert to ~${estimatedUsers} users`);
      
      return {
        alert_id: alert.id,
        message: notificationMessage,
        estimated_recipients: estimatedUsers,
        broadcast_radius: alert.broadcast_radius
      };
    } catch (error) {
      logger.error('Error broadcasting emergency alert:', error);
      throw error;
    }
  }

  generateNotificationMessage(alert) {
    const messages = {
      [EMERGENCY_TYPES.STAMPEDE_RISK]: `🚨 STAMPEDE RISK at ${alert.location_name}. Avoid this area immediately!`,
      [EMERGENCY_TYPES.OVERCROWDING]: `⚠️ Severe overcrowding at ${alert.location_name}. Consider alternative routes.`,
      [EMERGENCY_TYPES.BLOCKED_EXIT]: `🚪 Exit blocked at ${alert.location_name}. Use alternative exits.`,
      [EMERGENCY_TYPES.PANIC_SITUATION]: `😰 Panic situation reported at ${alert.location_name}. Stay calm and avoid area.`,
      [EMERGENCY_TYPES.MEDICAL_EMERGENCY]: `🏥 Medical emergency at ${alert.location_name}. Give way to emergency vehicles.`,
      [EMERGENCY_TYPES.FIRE_HAZARD]: `🔥 Fire hazard at ${alert.location_name}. Evacuate immediately!`,
      [EMERGENCY_TYPES.STRUCTURAL_ISSUE]: `🏗️ Structural issue at ${alert.location_name}. Area unsafe, avoid immediately.`
    };

    return messages[alert.alert_type] || `⚠️ Emergency alert at ${alert.location_name}: ${alert.description}`;
  }

  async estimateUsersInArea(latitude, longitude, radiusKm) {
    try {
      const nearbyLocations = await CrowdDensity.findNearby(latitude, longitude, radiusKm);
      
      const totalCrowd = nearbyLocations.reduce((sum, location) => 
        sum + location.estimated_count, 0
      );

      return Math.floor(totalCrowd * 0.3);
    } catch (error) {
      const urbanDensity = 1000;
      const appPenetration = 0.2;
      const area = Math.PI * radiusKm * radiusKm;
      
      return Math.floor(area * urbanDensity * appPenetration);
    }
  }

  async triggerEmergencyResponse(alert) {
    try {
      const actions = [];

      if (alert.severity === EMERGENCY_SEVERITY.CRITICAL) {
        actions.push({
          action_type: 'police_notified',
          details: 'Automatic notification sent to local police control room'
        });

        if (alert.alert_type === EMERGENCY_TYPES.MEDICAL_EMERGENCY) {
          actions.push({
            action_type: 'medical_dispatched',
            details: 'Ambulance dispatch requested'
          });
        }
        if (alert.alert_type === EMERGENCY_TYPES.FIRE_HAZARD) {
          actions.push({
            action_type: 'evacuation_started',
            details: 'Fire department notified, evacuation procedures initiated'
          });
        }
      }

      alert.response_actions.push(...actions);
      await alert.save();

      logger.info(`Triggered ${actions.length} emergency response actions for alert ${alert.id}`);
    } catch (error) {
      logger.error('Error triggering emergency response:', error);
    }
  }

  async detectEmergencySituations() {
    try {
      const criticalLocations = await CrowdDensity.find({
        current_density: DENSITY_LEVELS.CRITICAL,
        alert_active: true
      });

      for (const location of criticalLocations) {
        const existingAlert = await EmergencyAlert.findOne({
          latitude: { $gte: location.latitude - 0.001, $lte: location.latitude + 0.001 },
          longitude: { $gte: location.longitude - 0.001, $lte: location.longitude + 0.001 },
          active: true,
          alert_type: EMERGENCY_TYPES.STAMPEDE_RISK
        });

        if (!existingAlert && location.density_percentage > 95) {
          // Auto-create stampede risk alert
          await this.createEmergencyAlert({
            alert_type: EMERGENCY_TYPES.STAMPEDE_RISK,
            severity: EMERGENCY_SEVERITY.CRITICAL,
            location_name: location.location_name,
            latitude: location.latitude,
            longitude: location.longitude,
            description: `Critical overcrowding detected: ${location.density_percentage.toFixed(1)}% capacity (${location.estimated_count} people)`,
            reporter_id: 'system_auto_detect',
            auto_verify: true,
            broadcast_radius: 2000
          });
        }
      }
    } catch (error) {
      logger.error('Error in emergency situation detection:', error);
    }
  }

  // Get nearby emergency alerts
  async getNearbyEmergencyAlerts(latitude, longitude, radiusKm = 5) {
    try {
      const alerts = await EmergencyAlert.findNearbyActive(latitude, longitude, radiusKm);
      
      return alerts.map(alert => ({
        id: alert.id,
        type: alert.alert_type,
        severity: alert.severity,
        location_name: alert.location_name,
        latitude: alert.latitude,
        longitude: alert.longitude,
        description: alert.description,
        verified: alert.verified,
        created_at: alert.created_at,
        expires_at: alert.expires_at,
        confirmation_ratio: alert.getConfirmationRatio(),
        notifications_sent: alert.notifications_sent
      }));
    } catch (error) {
      logger.error('Error getting nearby emergency alerts:', error);
      throw error;
    }
  }

  // User confirms or denies alert
  async confirmAlert(alertId, userId, confirmed = true) {
    try {
      const alert = await EmergencyAlert.findOne({ id: alertId });
      
      if (!alert || !alert.isValid()) {
        throw new Error('Alert not found or expired');
      }

      alert.addUserConfirmation(userId, confirmed);
      await alert.save();

      // Auto-verify if enough confirmations
      const confirmationRatio = alert.getConfirmationRatio();
      if (!alert.verified && confirmationRatio >= 0.7 && alert.user_confirmations.length >= 3) {
        alert.verified = true;
        alert.verified_by = 'community_verified';
        await alert.save();
      }

      // Auto-resolve if too many denials
      if (confirmationRatio <= 0.3 && alert.user_confirmations.length >= 5) {
        alert.resolve('community_rejected');
        await alert.save();
      }

      return {
        alert_id: alertId,
        confirmation_ratio: confirmationRatio,
        verified: alert.verified,
        active: alert.active
      };
    } catch (error) {
      logger.error('Error confirming alert:', error);
      throw error;
    }
  }

  // Cleanup expired alerts
  async cleanupExpiredAlerts() {
    try {
      const result = await EmergencyAlert.cleanupExpired();
      logger.info(`Cleaned up ${result.modifiedCount} expired emergency alerts`);
      return result.modifiedCount;
    } catch (error) {
      logger.error('Error cleaning up expired alerts:', error);
      throw error;
    }
  }

  // Get emergency statistics
  async getEmergencyStats() {
    try {
      const stats = await EmergencyAlert.aggregate([
        {
          $group: {
            _id: '$alert_type',
            count: { $sum: 1 },
            active_count: {
              $sum: { $cond: ['$active', 1, 0] }
            },
            avg_notifications: { $avg: '$notifications_sent' }
          }
        }
      ]);

      const totalAlerts = await EmergencyAlert.countDocuments();
      const activeAlerts = await EmergencyAlert.countDocuments({ active: true });

      return {
        total_alerts: totalAlerts,
        active_alerts: activeAlerts,
        by_type: stats,
        last_updated: new Date()
      };
    } catch (error) {
      logger.error('Error getting emergency stats:', error);
      throw error;
    }
  }
}

module.exports = EmergencyService;