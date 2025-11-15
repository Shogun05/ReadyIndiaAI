const express = require('express');
const logger = require('../services/logger');

const router = express.Router();

let geminiClient = null;
let translationService = null;

function setServices(gemini, translation) {
  geminiClient = gemini;
  translationService = translation;
}

// POST /api/ai/simplify
router.post('/ai/simplify', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!geminiClient) {
    return res.status(500).json({ error: 'AI service not initialized' });
  }

  try {
    // Get simplified version
    const result = await geminiClient.simplifyAlert(text);

    // Translate to all languages
    const translations = {};
    const languages = ['hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu'];

    for (const lang of languages) {
      try {
        const simpleTranslated = await translationService.translateAlert(
          result.simple,
          lang
        );
        const stepsTranslated = [];

        for (const step of result.steps) {
          const stepTranslated = await translationService.translateAlert(
            step,
            lang
          );
          stepsTranslated.push(stepTranslated);
        }

        translations[lang] = {
          simple: simpleTranslated,
          steps: stepsTranslated
        };
      } catch (error) {
        logger.error(`Translation failed for ${lang}: ${error.message}`);
        translations[lang] = {
          simple: result.simple,
          steps: result.steps
        };
      }
    }

    res.json({
      simple: result.simple,
      steps: result.steps,
      translations
    });
  } catch (error) {
    logger.error(`Error simplifying alert: ${error.message}`);
    res.status(500).json({ error: 'Failed to simplify alert' });
  }
});

module.exports = { router, setServices };
