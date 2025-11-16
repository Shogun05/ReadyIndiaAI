const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const logger = require('./services/logger');
const GeminiClient = require('./services/gemini_client');

// Import models
const { Alert, SEVERITY_LEVELS, DISASTER_TYPES } = require('./models/alert');

// Import routers
const { router: alertsRouter, setDatabase: setAlertsDatabase } = require('./routers/alerts');
const { router: aiRouter, setServices: setAiServices } = require('./routers/ai');
const { router: languagesRouter } = require('./routers/languages');
const { router: crowdRouter, setCrowdMonitor } = require('./routers/crowd');
const { router: emergencyRouter, setEmergencyServices } = require('./routers/emergency');

// Initialize services
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);

// Initialize crowd monitoring
const CrowdMonitor = require('./services/crowd_monitor');
const crowdMonitor = new CrowdMonitor();

// Initialize emergency services
const EmergencyService = require('./services/emergency_service');
const RouteOptimizer = require('./services/route_optimizer');
const emergencyService = new EmergencyService();
const routeOptimizer = new RouteOptimizer();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());

console.log('=== MongoDB Configuration ===');
console.log('MONGO_URL:', process.env.MONGO_URL);
console.log('DB_NAME:', process.env.DB_NAME || 'alerts (default)');
console.log('============================');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URL, {
  dbName: "alerts"
})
  .then(() => {
    console.log('✓ Successfully connected to MongoDB Atlas');
    logger.info('Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    logger.error('MongoDB connection error:', err);
    process.exit(1); // Exit if database connection fails
  });

const db = mongoose.connection;

// Handle connection events
db.on('error', (err) => {
  console.error('✗ MongoDB connection error:', err);
  logger.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected. Attempting to reconnect...');
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

db.on('reconnected', () => {
  console.log('✓ MongoDB reconnected successfully');
  logger.info('MongoDB reconnected successfully');
});

db.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully');
});

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'ReadyIndia AI API', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize routers with dependencies
setAlertsDatabase(mongoose);
setAiServices(geminiClient);
setCrowdMonitor(crowdMonitor);
setEmergencyServices({ emergencyService, routeOptimizer });

app.use('/api', alertsRouter);
app.use('/api', aiRouter);
app.use('/api', languagesRouter);
app.use('/api', crowdRouter);
app.use('/api', emergencyRouter);

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
  
  // Schedule crowd density simulation every 5 minutes
  schedule.scheduleJob('*/5 * * * *', async () => {
    try {
      await crowdMonitor.simulateCrowdDetection(12.9716, 77.5946, 10);
      logger.info('Crowd density simulation completed');
    } catch (error) {
      logger.error('Error in scheduled crowd simulation:', error);
    }
  });

  // Schedule emergency detection every 2 minutes
  schedule.scheduleJob('*/2 * * * *', async () => {
    try {
      await emergencyService.detectEmergencySituations();
      await emergencyService.cleanupExpiredAlerts();
      logger.info('Emergency detection and cleanup completed');
    } catch (error) {
      logger.error('Error in scheduled emergency detection:', error);
    }
  });
  
  // Initialize sample crowd monitoring locations
  await crowdMonitor.initializeSampleLocations();
  
  logger.info(`ReadyIndia AI backend started successfully on port ${PORT}`);
  logger.info('Gemini AI chatbot ready for questions from frontend');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down ReadyIndia AI backend...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
