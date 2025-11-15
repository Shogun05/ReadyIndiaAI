const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const logger = require('./services/logger');
const GeminiClient = require('./services/gemini_client');
const AlertFetcher = require('./services/alert_fetcher');
const TranslationService = require('./services/translation_service');

// Import models
const { Alert, SEVERITY_LEVELS, DISASTER_TYPES } = require('./models/alert');

// Import routers
const { router: alertsRouter, setDatabase: setAlertsDatabase } = require('./routers/alerts');
const { router: aiRouter, setServices: setAiServices } = require('./routers/ai');
const { router: languagesRouter } = require('./routers/languages');

// Initialize services
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);
const translationService = new TranslationService(geminiClient);
const alertFetcher = new AlertFetcher({
  usgsUrl: process.env.USGS_API_URL,
  incoisUrl: process.env.INCOIS_API_URL,
  gdacsUrl: process.env.GDACS_API_URL
});

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGINS || '*').split(','),
  credentials: true,
  methods: ['*'],
  allowedHeaders: ['*']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
})
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

const db = mongoose.connection;

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'ReadyIndia AI API', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize routers with dependencies
setAlertsDatabase(mongoose);
setAiServices(geminiClient, translationService);

app.use('/api', alertsRouter);
app.use('/api', aiRouter);
app.use('/api', languagesRouter);

// Scheduled task to fetch and process alerts
async function fetchAndProcessAlerts() {
  try {
    logger.info('Fetching alerts from external sources...');
    
    // Fetch from all sources
    const usgsAlerts = await alertFetcher.fetchUsgsEarthquakes();
    const gdacsAlerts = await alertFetcher.fetchGdacsAlerts();
    const incoisAlerts = await alertFetcher.fetchIncoisAlerts();
    
    const allAlerts = [...usgsAlerts, ...gdacsAlerts, ...incoisAlerts];
    
    // Process each alert
    for (const alertData of allAlerts) {
      try {
        // Check if alert already exists
        const existing = await Alert.findOne({
          raw_text: alertData.raw_text,
          source: alertData.source
        });
        
        if (existing) continue;
        
        // Simplify alert with AI
        const simplified = await geminiClient.simplifyAlert(alertData.raw_text);
        
        // Translate to all languages
        const translations = {};
        const languages = ['hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu'];
        
        for (const lang of languages) {
          const simpleTranslated = await translationService.translateAlert(simplified.simple, lang);
          const stepsTranslated = [];
          
          for (const step of simplified.steps) {
            const stepTrans = await translationService.translateAlert(step, lang);
            stepsTranslated.push(stepTrans);
          }
          
          translations[lang] = {
            simple: simpleTranslated,
            steps: stepsTranslated
          };
        }
        
        // Create alert document
        const alertDoc = new Alert({
          id: uuidv4(),
          type: alertData.type,
          severity: alertData.severity,
          raw_text: alertData.raw_text,
          ai_summary: simplified.simple,
          ai_steps: simplified.steps,
          languages: translations,
          location: alertData.location || 'Unknown',
          latitude: alertData.latitude,
          longitude: alertData.longitude,
          magnitude: alertData.magnitude,
          source: alertData.source,
          created_at: new Date()
        });
        
        await alertDoc.save();
        logger.info(`Processed and stored alert: ${alertData.type} - ${alertData.location}`);
      } catch (error) {
        logger.error(`Error processing alert: ${error.message}`);
        continue;
      }
    }
    
    logger.info(`Completed alert fetch cycle. Processed ${allAlerts.length} alerts.`);
  } catch (error) {
    logger.error(`Error in scheduled alert fetch: ${error.message}`);
  }
}

// Startup
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  logger.info('Starting ReadyIndia AI backend...');
  
  // Wait for database connection to be ready
  await new Promise(resolve => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once('open', resolve);
    }
  });
  
  // Schedule alert fetching every 30 minutes
  schedule.scheduleJob('*/30 * * * *', fetchAndProcessAlerts);
  
  // Fetch alerts immediately on startup
  await fetchAndProcessAlerts();
  
  logger.info(`ReadyIndia AI backend started successfully on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down ReadyIndia AI backend...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
