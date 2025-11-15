const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('./logger');

class AlertFetcher {
  constructor(config) {
    this.usgsUrl = config.usgsUrl;
    this.incoisUrl = config.incoisUrl;
    this.gdacsUrl = config.gdacsUrl;
    this.httpClient = axios.create({ timeout: 30000 });
  }

  async fetchUsgsEarthquakes() {
    try {
      const response = await this.httpClient.get(this.usgsUrl);
      const data = response.data;

      const alerts = [];
      const features = data.features || [];

      for (const feature of features.slice(0, 10)) {
        const props = feature.properties || {};
        const coords = feature.geometry?.coordinates || [0, 0, 0];

        alerts.push({
          type: 'earthquake',
          severity: this._getEarthquakeSeverity(props.mag || 0),
          raw_text: `Magnitude ${props.mag || 'Unknown'} earthquake near ${props.place || 'Unknown location'}`,
          location: props.place || 'Unknown',
          latitude: coords[1],
          longitude: coords[0],
          magnitude: props.mag,
          source: 'USGS'
        });
      }

      logger.info(`Fetched ${alerts.length} alerts from USGS`);
      return alerts;
    } catch (error) {
      logger.error(`Error fetching USGS data: ${error.message}`);
      return [];
    }
  }

  async fetchGdacsAlerts() {
    try {
      const response = await this.httpClient.get(this.gdacsUrl);
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      const alerts = [];
      const items = result.rss?.channel?.[0]?.item || [];

      for (const item of items.slice(0, 10)) {
        const title = item.title?.[0] || 'Unknown';
        const description = item.description?.[0] || '';

        let disasterType = 'storm';
        if (title.toLowerCase().includes('earthquake')) {
          disasterType = 'earthquake';
        } else if (title.toLowerCase().includes('flood')) {
          disasterType = 'flood';
        } else if (title.toLowerCase().includes('cyclone') || title.toLowerCase().includes('tropical')) {
          disasterType = 'cyclone';
        }

        alerts.push({
          type: disasterType,
          severity: 'high',
          raw_text: `${title}. ${description.substring(0, 200)}`,
          location: title.includes(' in ') ? title.split(' in ').pop() : 'Global',
          source: 'GDACS'
        });
      }

      logger.info(`Fetched ${alerts.length} alerts from GDACS`);
      return alerts;
    } catch (error) {
      logger.error(`Error fetching GDACS data: ${error.message}`);
      return [];
    }
  }

  async fetchIncoisAlerts() {
    try {
      const response = await this.httpClient.get(this.incoisUrl);
      const data = response.data;

      const alerts = [];
      if (Array.isArray(data)) {
        for (const item of data.slice(0, 5)) {
          alerts.push({
            type: 'tsunami',
            severity: 'high',
            raw_text: `Seismic activity detected: ${item.location || 'Unknown'}`,
            location: item.location || 'Indian Ocean',
            source: 'INCOIS'
          });
        }
      }

      logger.info(`Fetched ${alerts.length} alerts from INCOIS`);
      return alerts;
    } catch (error) {
      logger.error(`Error fetching INCOIS data: ${error.message}`);
      return [];
    }
  }

  _getEarthquakeSeverity(magnitude) {
    if (magnitude >= 7.0) {
      return 'critical';
    } else if (magnitude >= 6.0) {
      return 'high';
    } else if (magnitude >= 4.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = AlertFetcher;
