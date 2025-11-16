import React, { useState } from 'react';
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const PanicButton = ({ userLocation, onEmergencyCreated }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [isCreatingAlert, setIsCreatingAlert] = useState(false);
  const [emergencyType, setEmergencyType] = useState('');
  const [description, setDescription] = useState('');

  const emergencyTypes = {
    'stampede_risk': {
      label: 'Stampede Risk',
      icon: '🏃‍♂️',
      description: 'Dangerous crowd movement or panic'
    },
    'overcrowding': {
      label: 'Severe Overcrowding',
      icon: '👥',
      description: 'Too many people in small space'
    },
    'blocked_exit': {
      label: 'Blocked Exit',
      icon: '🚪',
      description: 'Emergency exits are blocked'
    },
    'panic_situation': {
      label: 'Panic Situation',
      icon: '😰',
      description: 'People are panicking or scared'
    },
    'medical_emergency': {
      label: 'Medical Emergency',
      icon: '🏥',
      description: 'Someone needs medical help'
    },
    'fire_hazard': {
      label: 'Fire Hazard',
      icon: '🔥',
      description: 'Fire or smoke detected'
    },
    'structural_issue': {
      label: 'Structural Problem',
      icon: '🏗️',
      description: 'Building or structure unsafe'
    }
  };

  const handlePanicActivation = () => {
    if (!userLocation) {
      toast.error('Location access required for emergency alerts');
      return;
    }
    setIsActivated(true);
  };

  const handleEmergencySubmit = async () => {
    if (!emergencyType || !description.trim()) {
      toast.error('Please select emergency type and provide description');
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
      
      toast.success(`Emergency alert sent to ${data.data.notifications_sent} nearby users`);
      
      if (onEmergencyCreated) {
        onEmergencyCreated(data.data);
      }

      // Reset form
      setIsActivated(false);
      setEmergencyType('');
      setDescription('');
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      toast.error('Failed to send emergency alert. Please try again.');
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
            Emergency Alert
          </CardTitle>
          <CardDescription className="text-red-600">
            Report dangerous crowd situations immediately
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button
            onClick={handlePanicActivation}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
            disabled={!userLocation}
          >
            🚨 EMERGENCY ALERT
          </Button>
          
          {!userLocation && (
            <p className="text-sm text-red-600">
              Enable location access to use emergency alerts
            </p>
          )}

          <div className="text-xs text-gray-600 space-y-1">
            <p>• Alerts nearby users instantly</p>
            <p>• Notifies emergency services</p>
            <p>• Only use for real emergencies</p>
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
          Report Emergency
        </CardTitle>
        <CardDescription className="text-red-600">
          Select the type of emergency and provide details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Emergency Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Type *
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
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what's happening... (e.g., 'Too many people pushing near main entrance, people falling')"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {description.length}/500 characters
          </div>
        </div>

        {/* Location Info */}
        {userLocation && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>Your location:</strong> {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
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
            {isCreatingAlert ? 'Sending Alert...' : 'Send Emergency Alert'}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isCreatingAlert}
            className="px-6"
          >
            Cancel
          </Button>
        </div>

        <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg">
          <strong>⚠️ Important:</strong> This will immediately alert nearby users and emergency services. 
          Only use for real emergencies. False alarms can be dangerous and may result in penalties.
        </div>
      </CardContent>
    </Card>
  );
};

export default PanicButton;