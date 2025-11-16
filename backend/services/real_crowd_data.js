class RealCrowdDataService {
  constructor() {
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.socialMediaApis = {
      instagram: process.env.INSTAGRAM_API_KEY,
      twitter: process.env.TWITTER_API_KEY
    };
  }

  async getRealCrowdData(latitude, longitude, locationName) {
    const crowdSources = await Promise.allSettled([
      this.getTrafficBasedCrowdEstimate(latitude, longitude),
      this.getSocialMediaActivity(latitude, longitude, locationName),
      this.getEventData(latitude, longitude),
      this.getTransitData(latitude, longitude),
      this.getWeatherImpact(latitude, longitude)
    ]);

    return this.aggregateCrowdData(crowdSources);
  }

  async getTrafficBasedCrowdEstimate(lat, lon) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${lat},${lon}&destination=${lat},${lon}&` +
        `departure_time=now&traffic_model=best_guess&` +
        `key=${this.googleMapsApiKey}`
      );

      const data = await response.json();

      const trafficLevel = this.parseTrafficLevel(data);
      return this.trafficToCrowdMapping(trafficLevel);
    } catch (error) {
      console.error('Traffic data error:', error);
      return { source: 'traffic', estimate: 0, confidence: 0 };
    }
  }

  async getSocialMediaActivity(lat, lon, locationName) {
    try {
      const radius = 500;

      const instagramPosts = await this.getInstagramLocationPosts(
        locationName, lat, lon, radius
      );

      const tweets = await this.getGeoTaggedTweets(lat, lon, radius);
      const activityScore = this.calculateSocialActivity(
        instagramPosts, tweets
      );

      return {
        source: 'social_media',
        estimate: activityScore * 50,
        confidence: 0.6,
        details: {
          instagram_posts: instagramPosts.length,
          tweets: tweets.length
        }
      };
    } catch (error) {
      console.error('Social media data error:', error);
      return { source: 'social_media', estimate: 0, confidence: 0 };
    }
  }

  async getEventData(lat, lon) {
    try {
      const events = await Promise.all([
        this.getBookMyShowEvents(lat, lon),
        this.getPaytmEvents(lat, lon),
        this.getFacebookEvents(lat, lon)
      ]);

      const activeEvents = events.flat().filter(event =>
        this.isEventActive(event)
      );

      const totalExpectedAttendees = activeEvents.reduce(
        (sum, event) => sum + (event.expected_attendees || 0), 0
      );

      return {
        source: 'events',
        estimate: totalExpectedAttendees,
        confidence: 0.8,
        details: { active_events: activeEvents.length }
      };
    } catch (error) {
      console.error('Event data error:', error);
      return { source: 'events', estimate: 0, confidence: 0 };
    }
  }

  async getTransitData(lat, lon) {
    try {
      const busData = await this.getBMTCCrowdData(lat, lon);
      const metroData = await this.getMetroCrowdData(lat, lon);

      return {
        source: 'transit',
        estimate: (busData.crowdLevel + metroData.crowdLevel) * 100,
        confidence: 0.7,
        details: {
          bus_crowding: busData.crowdLevel,
          metro_crowding: metroData.crowdLevel
        }
      };
    } catch (error) {
      console.error('Transit data error:', error);
      return { source: 'transit', estimate: 0, confidence: 0 };
    }
  }

  async getWeatherImpact(lat, lon) {
    try {
      const weather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?` +
        `lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`
      );

      const weatherData = await weather.json();

      const weatherMultiplier = this.calculateWeatherImpact(weatherData);

      return {
        source: 'weather',
        multiplier: weatherMultiplier,
        confidence: 0.5,
        details: {
          condition: weatherData.weather[0].main,
          temperature: weatherData.main.temp
        }
      };
    } catch (error) {
      console.error('Weather data error:', error);
      return { source: 'weather', multiplier: 1, confidence: 0 };
    }
  }

  aggregateCrowdData(crowdSources) {
    const validSources = crowdSources
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(data => data.confidence > 0);

    if (validSources.length === 0) {
      return { estimate: 0, confidence: 0, sources: [] };
    }

    const totalWeight = validSources.reduce((sum, source) =>
      sum + source.confidence, 0
    );

    const weightedEstimate = validSources.reduce((sum, source) =>
      sum + (source.estimate * source.confidence), 0
    ) / totalWeight;

    const weatherSource = validSources.find(s => s.source === 'weather');
    const finalEstimate = weatherSource ?
      weightedEstimate * weatherSource.multiplier : weightedEstimate;

    return {
      estimate: Math.round(finalEstimate),
      confidence: totalWeight / validSources.length,
      sources: validSources.map(s => s.source),
      breakdown: validSources
    };
  }

  calculateWeatherImpact(weatherData) {
    const temp = weatherData.main.temp - 273.15;
    const condition = weatherData.weather[0].main.toLowerCase();

    if (condition.includes('rain')) return 0.6;
    if (temp > 35) return 0.7;
    if (temp >= 20 && temp <= 30 && condition === 'clear') return 1.3;

    return 1.0;
  }

  isEventActive(event) {
    const now = new Date();
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    return now >= eventStart && now <= eventEnd;
  }
}

module.exports = RealCrowdDataService;