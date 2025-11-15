const alertsRouter = require('./alerts');
const aiRouter = require('./ai');
const languagesRouter = require('./languages');

module.exports = {
  alerts: alertsRouter,
  ai: aiRouter,
  languages: languagesRouter
};
