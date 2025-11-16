import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AlertCard from '../components/AlertCard';
import MapComponent from '../components/MapComponent';
import { Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Alerts = () => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchAlerts();
    getUserLocation();
  }, [filterType, filterSeverity]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      let url = `${BACKEND_URL}/api/alerts?limit=50`;
      if (filterType !== 'all') url += `&type=${filterType}`;
      if (filterSeverity !== 'all') url += `&severity=${filterSeverity}`;

      const response = await axios.get(url);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error(t('failedFetchAlerts'));
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyAlerts = async () => {
    if (!userLocation) {
      toast.error(t('locationRequired'));
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/alerts/nearby?lat=${userLocation.lat}&lon=${userLocation.lon}&radius_km=500`
      );
      setAlerts(response.data);
      toast.success(`${t('foundNearbyAlerts')} ${response.data.length}`);
    } catch (error) {
      console.error('Error fetching nearby alerts:', error);
      toast.error(t('failedFetchNearby'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="alerts-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('viewAlertsTitle')}
          </h1>
          <p className="text-gray-600">{t('realTimeDisasters')}</p>
        </div>

        {/* Map */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <MapComponent alerts={alerts} />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">{t('disasterType')}</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger data-testid="filter-type" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="earthquake">Earthquake</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="cyclone">Cyclone</SelectItem>
                    <SelectItem value="tsunami">Tsunami</SelectItem>
                    <SelectItem value="storm">Storm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Severity</label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger data-testid="filter-severity" className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={fetchNearbyAlerts}
              data-testid="nearby-alerts-btn"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!userLocation}
            >
              Alerts Near You
            </Button>
          </div>
        </div>

        {/* Alerts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg" data-testid="no-alerts-message">No alerts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="alerts-grid">
            {alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
