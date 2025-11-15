const logger = require('./logger');

const LANGUAGE_MAP = {
  'hi': 'Hindi',
  'mr': 'Marathi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'bn': 'Bengali',
  'gu': 'Gujarati'
};

class TranslationService {
  constructor(geminiClient) {
    this.geminiClient = geminiClient;
  }

  async translateAlert(text, targetLang) {
    if (!LANGUAGE_MAP[targetLang]) {
      return text;
    }

    const languageName = LANGUAGE_MAP[targetLang];
    return await this.geminiClient.translateText(text, languageName);
  }

  async translateToAllLanguages(text) {
    const translations = {};

    for (const [langCode, langName] of Object.entries(LANGUAGE_MAP)) {
      try {
        const translation = await this.geminiClient.translateText(text, langName);
        translations[langCode] = translation;
      } catch (error) {
        logger.error(`Failed to translate to ${langName}: ${error.message}`);
        translations[langCode] = text;
      }
    }

    return translations;
  }
}

module.exports = TranslationService;
