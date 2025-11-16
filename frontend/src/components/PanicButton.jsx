import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const PanicButton = ({ userLocation, onEmergencyCreated }) => {
  const { t } = useTranslation();
  const [isActivated, setIsActivated] = useState(false);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');

  const emergencyTypes = {
    'stampede_risk': {
      label: t('stampede_risk'),
      description: t('stampede_risk_desc')
    },
    'overcrowding': {
      label: t('overcrowding'),
      description: t('overcrowding_desc')
    },
    'blocked_exit': {
      label: t('blocked_exit'),
      description: t('blocked_exit_desc')
    },
    'panic_situation': {
      label: t('panic_situation'),
      description: t('panic_situation_desc')
    },
    'medical_emergency': {
      label: t('medical_emergency'),
      description: t('medical_emergency_desc')
    },
    'fire_hazard': {
      label: t('fire_hazard'),
      description: t('fire_hazard_desc')
    },
    'structural_issue': {
      label: t('structural_issue'),
      description: t('structural_issue_desc')
    }
  };

  const handlePanicActivation = () => {
    if (!userLocation) {
      toast.error(t('locationRequiredEmergency'));
      return;
    }
    setIsActivated(true);
  };

  const handleEmergencySubmit = async () => {
    if (!emergencyType || !description.trim()) {
      toast.error(t('selectTypeAndDescription'));
      return;
    }

    setIsCreatingAlert(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/emergency/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert_type: emergencyType,
          severity: 'high',
          location_name: `Emergency at ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          description: description.trim(),
          reporter_id: `user_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create emergency alert');
      }

      const data = await response.json();
      
      toast.success(`${t('emergencyAlertSent')} ${data.data.notifications_sent} ${t('nearbyUsers')}`);
      
      if (onEmergencyCreated) {
        onEmergencyCreated(data.data);
      }

      // Reset form
      setIsActivated(false);
      setEmergencyType('');
      setDescription('');
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      toast.error(t('failedSendAlert'));
    } finally {
      setIsCreatingAlert(false);
    }
  };

  const handleCancel = () => {
    setIsActivated(false);
    setEmergencyType('');
    setDescription('');
  };

  if (!isActivated) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="text-center">
          <CardTitle className="text-red-800 flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            {t('emergencyAlert')}
          </CardTitle>
          <CardDescription className="text-red-600">
            {t('reportDangerousCrowd')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={handlePanicActivation}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
            disabled={!userLocation}
          >
            🚨 {t('emergencyAlertButton')}
          </Button>
          
          {!userLocation && (
            <p className="text-sm text-red-600">
              {t('enableLocationForEmergency')}
            </p>
          )}

          <div className="text-xs text-gray-600 space-y-1">
            <p>• {t('alertsNearbyUsers')}</p>
            <p>• {t('notifiesEmergencyServices')}</p>
            <p>• {t('onlyRealEmergencies')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t('reportEmergency')}
        </CardTitle>
        <CardDescription className="text-red-600">
          {t('selectEmergencyType')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('emergencyType')} *
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(emergencyTypes).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setEmergencyType(key)}
                className={`p-3 text-left border rounded-lg transition-all ${
                  emergencyType === key
                    ? 'border-red-500 bg-red-100 text-red-800'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{type.icon}</span>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('description')} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('descriptionPlaceholder')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {description.length}/500 {t('charactersCount')}
          </div>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>{t('yourLocationLabel')}:</strong> {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleEmergencySubmit}
            disabled={isCreatingAlert || !emergencyType || !description.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isCreatingAlert ? t('sendingAlert') : t('sendEmergencyAlert')}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isCreatingAlert}
            className="px-6"
          >
            {t('cancel')}
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <strong>⚠️ {t('importantWarning')}:</strong> {t('falseAlarmWarning')}
        </div>
      </CardContent>
    </Card>
  );
};

export default PanicButton;