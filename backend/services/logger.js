const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');

function formatLog(level, message) {
  const timestamp = new Date().toISOString();
  return `${timestamp} - ${level} - ${message}`;
}

const logger = {
  info: (message) => {
    const log = formatLog('INFO', message);
    console.log(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  error: (message) => {
    const log = formatLog('ERROR', message);
    console.error(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  warn: (message) => {
    const log = formatLog('WARN', message);
    console.warn(log);
    fs.appendFileSync(logFile, log + '\n');
  },

  debug: (message) => {
    const log = formatLog('DEBUG', message);
    console.log(log);
    fs.appendFileSync(logFile, log + '\n');
  }
};

module.exports = logger;
