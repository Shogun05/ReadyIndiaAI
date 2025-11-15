const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    logger.info('Gemini client initialized');
  }

  async simplifyAlert(text) {
    try {
      const prompt = `You are a disaster communication expert. Simplify this disaster alert into easy-to-understand language for common people:

Alert: ${text}

Provide:
1. A simple summary (2-3 sentences)
2. 5 specific safety steps people should take

Format your response as JSON:
{
  "simple": "simple summary here",
  "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let resultText = response.text().trim();

      // Remove markdown code blocks if present
      if (resultText.startsWith('```json')) {
        resultText = resultText.substring(7, resultText.length - 3).trim();
      } else if (resultText.startsWith('```')) {
        resultText = resultText.substring(3, resultText.length - 3).trim();
      }

      const parsed = JSON.parse(resultText);
      logger.info('Successfully simplified alert with Gemini');
      return parsed;
    } catch (error) {
      logger.error(`Error simplifying alert: ${error.message}`);
      // Fallback response
      return {
        simple: text.substring(0, 200) + '...',
        steps: [
          'Stay calm and follow official instructions',
          'Monitor official news channels',
          'Prepare emergency supplies',
          'Inform family members',
          'Avoid affected areas'
        ]
      };
    }
  }

  async translateText(text, targetLanguage) {
    try {
      const prompt = `Translate the following text to ${targetLanguage}. Only provide the translation, no explanations:\n\n${text}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error(`Error translating text: ${error.message}`);
      return text;
    }
  }
}

module.exports = GeminiClient;
