const express = require('express');
const logger = require('../services/logger');

const router = express.Router();

let geminiClient = null;

function setServices(gemini) {
  geminiClient = gemini;
}

// POST /api/ai/chat - Chat with AI about disasters
router.post('/ai/chat', async (req, res) => {
  const { question, alertId, alertContext } = req.body;

  // Log incoming request
  console.log('=== AI Chat Request Received ===');
  console.log('Question:', question);
  console.log('Alert ID:', alertId || 'None');
  console.log('Has Context:', !!alertContext);
  console.log('Timestamp:', new Date().toISOString());
  console.log('================================');
  logger.info(`AI Chat Request: "${question}" ${alertId ? `(Alert: ${alertId})` : ''}`);

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!geminiClient) {
    return res.status(500).json({ error: 'AI service not initialized' });
  }

  try {
    // If alertId is provided, fetch the alert for context
    let context = alertContext;
    if (alertId && !context) {
      const { Alert } = require('../models/alert');
      const alert = await Alert.findOne({ id: alertId });
      if (alert) {
        context = {
          type: alert.type,
          severity: alert.severity,
          location: alert.location,
          summary: alert.ai_summary,
          steps: alert.ai_steps
        };
        logger.info(`Loaded alert context: ${alert.type} in ${alert.location}`);
      }
    }

    const answer = await geminiClient.chatAboutDisaster(question, context);

    console.log('✓ AI Response Generated Successfully');
    logger.info('AI Chat Response sent successfully');

    res.json({
      question,
      answer,
      context: context || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('✗ AI Chat Error:', error.message);
    logger.error(`Error in AI chat: ${error.message}`);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// POST /api/ai/conversation - Continue a conversation
router.post('/ai/conversation', async (req, res) => {
  const { message, alertContext } = req.body;

  // Log incoming conversation request
  console.log('=== Conversation Request Received ===');
  console.log('Message:', message);
  console.log('Has Context:', !!alertContext);
  console.log('Timestamp:', new Date().toISOString());
  console.log('====================================');
  logger.info(`Conversation Request: "${message}"`);

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!geminiClient) {
    return res.status(500).json({ error: 'AI service not initialized' });
  }

  try {
    const result = await geminiClient.continueConversation(message, alertContext);

    console.log('✓ Conversation Response Generated');
    logger.info('Conversation response sent successfully');

    res.json({
      message,
      response: result.response,
      history: result.history,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('✗ Conversation Error:', error.message);
    logger.error(`Error in conversation: ${error.message}`);
    res.status(500).json({ error: 'Failed to continue conversation' });
  }
});

// POST /api/ai/conversation/start - Start a new conversation
router.post('/ai/conversation/start', async (req, res) => {
  const { alertId } = req.body;

  if (!geminiClient) {
    return res.status(500).json({ error: 'AI service not initialized' });
  }

  try {
    let context = null;
    if (alertId) {
      const { Alert } = require('../models/alert');
      const alert = await Alert.findOne({ id: alertId });
      if (alert) {
        context = {
          type: alert.type,
          severity: alert.severity,
          location: alert.location,
          summary: alert.ai_summary,
          steps: alert.ai_steps
        };
      }
    }

    await geminiClient.startConversation(context);

    res.json({
      message: 'Conversation started',
      context: context || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error starting conversation: ${error.message}`);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// DELETE /api/ai/conversation - Clear conversation history
router.delete('/ai/conversation', async (req, res) => {
  if (!geminiClient) {
    return res.status(500).json({ error: 'AI service not initialized' });
  }

  try {
    geminiClient.clearChatHistory();
    res.json({ message: 'Conversation history cleared' });
  } catch (error) {
    logger.error(`Error clearing conversation: ${error.message}`);
    res.status(500).json({ error: 'Failed to clear conversation' });
  }
});

module.exports = { router, setServices };
