const express = require('express');
const logger = require('../services/logger');

const router = express.Router();

const LANGUAGES = {
  en: {
    name: 'English',
    native_name: 'English',
    translations: {
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
      low: 'Low'
    }
  },
  hi: {
    name: 'Hindi',
    native_name: 'हिंदी',
    translations: {
      appTitle: 'रेडीइंडिया AI',
      tagline: 'आपकी भाषा में सरल आपदा अलर्ट',
      viewAlerts: 'अलर्ट देखें',
      nearbyAlerts: 'आपके पास के अलर्ट',
      safetySteps: 'सुरक्षा निर्देश',
      severity: 'गंभीरता',
      location: 'स्थान',
      time: 'समय',
      selectLanguage: 'भाषा चुनें',
      settings: 'सेटिंग्स',
      loading: 'लोड हो रहा है...',
      noAlerts: 'कोई अलर्ट नहीं मिला',
      critical: 'गंभीर',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'निम्न'
    }
  },
  mr: {
    name: 'Marathi',
    native_name: 'मराठी',
    translations: {
      appTitle: 'रेडीइंडिया AI',
      tagline: 'तुमच्या भाषेत सोपे आपत्ती चेतावणी',
      viewAlerts: 'सूचना पहा',
      nearbyAlerts: 'जवळच्या सूचना',
      safetySteps: 'सुरक्षा सूचना',
      severity: 'तीव्रता',
      location: 'स्थान',
      time: 'वेळ',
      selectLanguage: 'भाषा निवडा',
      settings: 'सेटिंग्ज',
      loading: 'लोड होत आहे...',
      noAlerts: 'कोणतीही सूचना आढळली नाही',
      critical: 'गंभीर',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'कमी'
    }
  },
  ta: {
    name: 'Tamil',
    native_name: 'தமிழ்',
    translations: {
      appTitle: 'ரெடிஇந்தியா AI',
      tagline: 'உங்கள் மொழியில் எளிய பேரிடர் எச்சரிக்கைகள்',
      viewAlerts: 'எச்சரிக்கைகளைக் காண்க',
      nearbyAlerts: 'அருகிலுள்ள எச்சரிக்கைகள்',
      safetySteps: 'பாதுகாப்பு வழிமுறைகள்',
      severity: 'தீவிரம்',
      location: 'இடம்',
      time: 'நேரம்',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      settings: 'அமைப்புகள்',
      loading: 'ஏற்றுகிறது...',
      noAlerts: 'எச்சரிக்கைகள் எதுவும் இல்லை',
      critical: 'மிக முக்கியமானது',
      high: 'அதிகம்',
      medium: 'நடுத்தரம்',
      low: 'குறைவு'
    }
  },
  te: {
    name: 'Telugu',
    native_name: 'తెలుగు',
    translations: {
      appTitle: 'రెడీఇండియా AI',
      tagline: 'మీ భాషలో సులభమైన విపత్తు హెచ్చరికలు',
      viewAlerts: 'హెచ్చరికలను వీక్షించండి',
      nearbyAlerts: 'సమీపంలోని హెచ్చరికలు',
      safetySteps: 'భద్రతా సూచనలు',
      severity: 'తీవ్రత',
      location: 'స్థానం',
      time: 'సమయం',
      selectLanguage: 'భాషను ఎంచుకోండి',
      settings: 'సెట్టింగ్‌లు',
      loading: 'లోడ్ అవుతోంది...',
      noAlerts: 'హెచ్చరికలు కనిపించలేదు',
      critical: 'క్లిష్టమైన',
      high: 'అధిక',
      medium: 'మధ్యస్థ',
      low: 'తక్కువ'
    }
  },
  // ...existing languages (kn, bn, gu)...
  kn: {
    name: 'Kannada',
    native_name: 'ಕನ್ನಡ',
    translations: {
      appTitle: 'ReadyIndia AI',
      tagline: 'ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸರಳ ವಿಪರ್ಯಾಸ ಎಚ್ಚರಿಕೆಗಳು',
      viewAlerts: 'ಎಚ್ಚರಿಕೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      nearbyAlerts: 'ಸಮೀಪದ ಎಚ್ಚರಿಕೆಗಳು',
      safetySteps: 'ಸುರಕ್ಷತೆ ಸೂಚನೆಗಳು',
      severity: 'ಗಂಭೀರತೆ',
      location: 'ಸ್ಥಳ',
      time: 'ಸಮಯ',
      selectLanguage: 'ಭಾಷೆ ಆರಿಸಿ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      noAlerts: 'ಯಾವುದೇ ಎಚ್ಚರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
      critical: 'ಘೋರ',
      high: 'ಹೆಚ್ಚು',
      medium: 'ಮಧ್ಯ',
      low: 'ಕಡಿಮೆ'
    }
  },
  bn: {
    name: 'Bengali',
    native_name: 'বাংলা',
    translations: {
      appTitle: 'রেডিইন্ডিয়া AI',
      tagline: 'আপনার ভাষায় সহজ দুর্যোগ সতর্কতা',
      viewAlerts: 'সতর্কতা দেখুন',
      nearbyAlerts: 'কাছাকাছি সতর্কতা',
      safetySteps: 'নিরাপত্তা নির্দেশনা',
      severity: 'গুরুত্ব',
      location: 'অবস্থান',
      time: 'সময়',
      selectLanguage: 'ভাষা নির্বাচন করুন',
      settings: 'সেটিংস',
      loading: 'লোড হচ্ছে...',
      noAlerts: 'কোন সতর্কতা পাওয়া যায়নি',
      critical: 'সংকটপূর্ণ',
      high: 'উচ্চ',
      medium: 'মাঝারি',
      low: 'কম'
    }
  },
  gu: {
    name: 'Gujarati',
    native_name: 'ગુજરાતી',
    translations: {
      appTitle: 'તૈયાર ભારત AI',
      tagline: 'તમારી ભાષામાં સરળ આપત્તિ સતર્કતા',
      viewAlerts: 'એલર્ટ્સ જોવો',
      nearbyAlerts: 'નજીકના એલર્ટ્સ',
      safetySteps: 'સલામતી સૂચનો',
      severity: 'ગંભીરતા',
      location: 'સ્થાન',
      time: 'સમય',
      selectLanguage: 'ભાષા પસંદ કરો',
      settings: 'સેટિંગ્સ',
      loading: 'લોડ થઈ રહ્યું છે...',
      noAlerts: 'કોઈ એલર્ટ્સ મળ્યા નથી',
      critical: 'આલોચનાત્મક',
      high: 'ઉચ્ચ',
      medium: 'મધ્યમ',
      low: 'ઓછો'
    }
  }
};

// GET /api/languages/:lang
router.get('/languages/:lang', (req, res) => {
  const { lang } = req.params;

  if (!LANGUAGES[lang]) {
    return res.status(404).json({ error: `Language ${lang} not supported` });
  }

  res.json(LANGUAGES[lang]);
});

// GET /api/languages
router.get('/languages', (req, res) => {
  res.json({
    languages: LANGUAGES,
    supported: Object.keys(LANGUAGES)
  });
});

module.exports = { router };
