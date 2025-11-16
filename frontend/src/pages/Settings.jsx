import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Bell, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings = () => {
  const { t } = useTranslation();

  return (
    <div data-testid="settings-page" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t('settingsTitle')}
          </h1>
          <p className="text-gray-600">{t('customizeExperience')}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>{t('languagePreferences')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  {t('chooseLanguage')}
                </p>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{t('locationServices')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('locationAccess')}
              </p>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      () => alert(t('locationRequired')),
                      () => alert(t('locationRequired'))
                    );
                  }
                }}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('enableLocation')}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>{t('notificationPrefs')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {t('pushNotifications')}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {t('featureComingSoon')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('about')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p><strong>{t('version')}:</strong> 1.0.0</p>
              <p><strong>{t('dataSources')}:</strong> USGS, GDACS, INCOIS</p>
              <p><strong>{t('aiProvider')}:</strong> Google Gemini</p>
              <p><strong>{t('supportedLanguages')}:</strong> English, Hindi, Marathi, Tamil, Telugu, Kannada, Bengali, Gujarati</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
