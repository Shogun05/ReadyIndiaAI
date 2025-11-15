import React from 'react';
import { Globe, Bell, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings = () => {
  return (
    <div data-testid="settings-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Settings
          </h1>
          <p className="text-gray-600">Customize your ReadyIndia AI experience</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Language Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Choose your preferred language for viewing disaster alerts
                </p>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Location Services</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Allow location access to receive alerts near you. Your location is never stored or shared.
              </p>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      () => alert('Location access granted'),
                      () => alert('Location access denied')
                    );
                  }
                }}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Enable Location Access
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Receive push notifications for critical disaster alerts in your region
              </p>
              <p className="text-xs text-gray-500 mt-2">
                (Feature coming soon with PWA installation)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Data Sources:</strong> USGS, GDACS, INCOIS</p>
              <p><strong>AI Provider:</strong> Google Gemini</p>
              <p><strong>Supported Languages:</strong> English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
