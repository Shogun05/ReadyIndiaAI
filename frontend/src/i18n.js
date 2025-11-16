import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations from locales directory
import enTranslations from '@/locales/en.json';
import hiTranslations from '@/locales/hi.json';
import arTranslations from '@/locales/ar.json';
import deTranslations from '@/locales/de.json';
import esTranslations from '@/locales/es.json';
import frTranslations from '@/locales/fr.json';
import itTranslations from '@/locales/it.json';
import jaTranslations from '@/locales/ja.json';
import ptTranslations from '@/locales/pt.json';
import ruTranslations from '@/locales/ru.json';
import zhTranslations from '@/locales/zh.json';

const resources = {
  en: {
    translation: enTranslations
  },
  hi: {
    translation: hiTranslations
  },
  ar: {
    translation: arTranslations
  },
  de: {
    translation: deTranslations
  },
  es: {
    translation: esTranslations
  },
  fr: {
    translation: frTranslations
  },
  it: {
    translation: itTranslations
  },
  ja: {
    translation: jaTranslations
  },
  pt: {
    translation: ptTranslations
  },
  ru: {
    translation: ruTranslations
  },
  zh: {
    translation: zhTranslations
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
