import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { MapPin, Users, AlertTriangle, Clock, Navigation, Route } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import MapComponent from '../components/MapComponent';
import PanicButton from '../components/PanicButton';

const CrowdMonitor = () => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');

  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    
    if (!navigator.geolocation) {
      toast.error(t('geolocationNotSupported'));
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);
        setLocationPermission('granted');
        checkNearbyAlerts(location.latitude, location.longitude);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        toast.error(t('unableToGetLocation'));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Check for nearby crowd alerts
  const checkNearbyAlerts = async (lat, lon, radius = 5) => {
    try {
      const [crowdResponse, emergencyResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/crowd/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/emergency/nearby?lat=${lat}&lon=${lon}&radius=${radius}`)
      ]);
      
      if (crowdResponse.ok) {
        const crowdData = await crowdResponse.json();
        setNearbyAlerts(crowdData.data.nearby_alerts);
        
        // Show toast for critical alerts
        const criticalAlerts = crowdData.data.nearby_alerts.filter(alert => 
          alert.current_density === 'critical'
        );
        
        if (criticalAlerts.length > 0) {
          toast.error(`${criticalAlerts.length} ${t('criticalAlertsNear')}`);
        }
      }

      if (emergencyResponse.ok) {
        const emergencyData = await emergencyResponse.json();
        setEmergencyAlerts(emergencyData.data.alerts);
        
        // Show toast for emergency alerts
        const criticalEmergencies = emergencyData.data.alerts.filter(alert => 
          alert.severity === 'critical'
        );
        
        if (criticalEmergencies.length > 0) {
          toast.error(`${criticalEmergencies.length} ${t('emergencyAlertsNear')}`, {
            duration: 10000
          });
        }
      }
    } catch (error) {
      console.error('Error fetching nearby alerts:', error);
      toast.error(t('failedCheckAlerts'));
    }
  };

  // Get all crowd monitoring locations
  const getAllLocations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/crowd/locations`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      setAllLocations(data.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error(t('failedLoadLocations'));
    }
  };

  // Get density level color
  const getDensityColor = (density) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[density] || colors.low;
  };

  // Get density level icon
  const getDensityIcon = (density) => {
    if (density === 'critical' || density === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  // Format distance
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Handle emergency alert creation
  const handleEmergencyCreated = (emergencyData) => {
    // Refresh nearby alerts to include the new emergency
    if (userLocation) {
      checkNearbyAlerts(userLocation.latitude, userLocation.longitude);
    }
  };

  useEffect(() => {
    getAllLocations();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      getAllLocations();
      if (userLocation) {
        checkNearbyAlerts(userLocation.latitude, userLocation.longitude);
      }
    }, 120000);

    return () => clearInterval(interval);
  }, [userLocation]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('crowdSafetyMonitor')}
        </h1>
        <p className="text-gray-600">
          {t('crowdMonitorDesc')}
        </p>
      </div>

      {/* Location Access Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            {t('yourLocation')}
          </CardTitle>
          <CardDescription>
            {t('enableLocationDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locationPermission === 'prompt' && (
            <Button 
              onClick={getUserLocation} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? t('gettingLocation') : t('enableLocationAccess')}
            </Button>
          )}
          
          {locationPermission === 'granted' && userLocation && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <MapPin className="h-4 w-4" />
                <span>{t('locationEnabled')}</span>
              </div>
              
              {/* Emergency Alerts */}
              {emergencyAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-800">🚨 {t('emergencyAlerts')}</h3>
                  {emergencyAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-red-500 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-600 text-white text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-red-800">{alert.location_name}</span>
                          </div>
                          <div className="text-sm text-red-700">
                            {alert.type.replace('_', ' ').toUpperCase()} • {formatDistance(alert.distance_km || 0)} {t('away')}
                          </div>
                          <div className="text-sm text-red-600">{alert.description}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Crowd Alerts */}
              {nearbyAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">{t('nearbyCrowdAlerts')}</h3>
                  {nearbyAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">{alert.location_name}</div>
                          <div className="text-sm text-gray-600">
                            {formatDistance(alert.distance_km)} {t('away')} • {alert.density_percentage.toFixed(1)}% {t('capacity').toLowerCase()}
                          </div>
                          <div className="text-sm">{alert.alert_message}</div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              
              {nearbyAlerts.length === 0 && emergencyAlerts.length === 0 && (
                <div className="text-green-600 text-sm">
                  ✓ {t('noAlertsInArea')}
                </div>
              )}
            </div>
          )}
          
          {locationPermission === 'denied' && (
            <div className="space-y-3">
              <div className="text-amber-600 text-sm">
                {t('locationDenied')}
              </div>
              <Button 
                variant="outline" 
                onClick={getUserLocation}
                className="w-full sm:w-auto"
              >
                {t('tryAgain')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Alert Section */}
      <div className="mb-6">
        <PanicButton 
          userLocation={userLocation} 
          onEmergencyCreated={handleEmergencyCreated}
        />
      </div>

      {/* Map Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('crowdDensityMap')}</CardTitle>
          <CardDescription>
            {t('liveViewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapComponent 
              alerts={[
                // Crowd density locations
                ...allLocations.map(location => ({
                  id: location.id,
                  latitude: location.latitude,
                  longitude: location.longitude,
                  type: 'crowd',
                  severity: location.current_density,
                  location: location.location_name,
                  ai_summary: `${t('crowdDensity')}: ${location.density_percentage.toFixed(1)}% (${location.estimated_count} ${t('people')})`
                })),
                // Emergency alerts
                ...emergencyAlerts.map(alert => ({
                  id: `emergency_${alert.id}`,
                  latitude: alert.latitude,
                  longitude: alert.longitude,
                  type: 'emergency',
                  severity: alert.severity,
                  location: alert.location_name,
                  ai_summary: `${alert.type.replace('_', ' ').toUpperCase()}: ${alert.description}`
                }))
              ]}
              userLocation={userLocation}
            />
          </div>
        </CardContent>
      </Card>

      {/* All Locations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('monitoredLocations')}
          </h2>
          <Button 
            variant="outline" 
            onClick={getAllLocations}
            size="sm"
          >
            {t('refresh')}
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allLocations.map((location) => (
            <Card key={location.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{location.location_name}</CardTitle>
                    <CardDescription className="capitalize">
                      {location.location_type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getDensityColor(location.current_density)} flex items-center gap-1`}
                  >
                    {getDensityIcon(location.current_density)}
                    {location.current_density}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">{t('currentCount')}</div>
                    <div className="font-semibold">{location.estimated_count.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">{t('capacity')}</div>
                    <div className="font-semibold">{location.density_percentage.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      location.current_density === 'critical' ? 'bg-red-500' :
                      location.current_density === 'high' ? 'bg-orange-500' :
                      location.current_density === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(location.density_percentage, 100)}%` }}
                  />
                </div>
                
                {location.alert_active && (
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {location.alert_message}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t('updated')} {formatTime(location.last_updated)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {allLocations.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('noLocationsAvailable')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CrowdMonitor;