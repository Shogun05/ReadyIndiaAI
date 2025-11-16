const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.chatHistory = [];
    logger.info('Gemini chatbot client initialized');
  }

  async chatAboutDisaster(question, alertContext = null) {
    try {
      let systemPrompt = `You are a knowledgeable disaster management assistant. You help people understand disaster alerts, provide safety information, and answer questions about disaster preparedness and response.

Your role:
- Explain disaster alerts in simple, clear language
- Provide actionable safety advice
- Answer questions about what to do during emergencies
- Keep responses concise and helpful (2-4 sentences)
- Be empathetic and reassuring

Guidelines:
- Use simple language that everyone can understand
- Focus on practical, actionable advice
- If unsure, recommend contacting local authorities
- Never provide medical advice - refer to healthcare professionals`;

      if (alertContext) {
        systemPrompt += `\n\nCurrent Alert Context:\n${JSON.stringify(alertContext, null, 2)}`;
      }

      const fullPrompt = `${systemPrompt}\n\nUser Question: ${question}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const answer = response.text().trim();

      logger.info('Successfully generated chatbot response');
      return answer;
    } catch (error) {
      logger.error(`Error generating chatbot response: ${error.message}`);
      return "I'm having trouble responding right now. Please try again or contact local emergency services for immediate assistance.";
    }
  }

  async startConversation(initialContext = null) {
    this.chatHistory = [];
    if (initialContext) {
      this.chatHistory.push({
        role: 'system',
        content: `Context: ${JSON.stringify(initialContext)}`
      });
    }
    logger.info('Started new conversation');
  }

  async continueConversation(userMessage, alertContext = null) {
    try {
      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Generate response with context
      const response = await this.chatAboutDisaster(userMessage, alertContext);

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      logger.info('Continued conversation successfully');
      return {
        response,
        history: this.chatHistory.slice(-6) // Return last 6 messages (3 exchanges)
      };
    } catch (error) {
      logger.error(`Error continuing conversation: ${error.message}`);
      throw error;
    }
  }

  getChatHistory() {
    return this.chatHistory;
  }

  clearChatHistory() {
    this.chatHistory = [];
    logger.info('Cleared chat history');
  }
}

module.exports = GeminiClient;
