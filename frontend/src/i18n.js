import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: 'ReadyIndia AI',
      tagline: 'Simple disaster alerts in your language',
      viewAlerts: 'View Alerts',
      nearbyAlerts: 'Alerts Near You',
      safetySteps: 'Safety Instructions',
      severity: 'Severity',
      location: 'Location',
      time: 'Time',
      selectLanguage: 'Select Language',
      settings: 'Settings',
      loading: 'Loading...',
      noAlerts: 'No alerts found',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      home: 'Home',
      alerts: 'Alerts',
      explain: 'Explain Alert',
      pasteAlert: 'Paste an alert to simplify',
      simplify: 'Simplify',
      simplified: 'Simplified',
      distance: 'Distance',
      magnitude: 'Magnitude',
      region: 'Region',
      getAlerts: 'Get Started',
      heroTitle: 'Disaster Alerts Made Simple',
      heroSubtitle: 'AI-powered multilingual disaster alerts for everyone in India'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
