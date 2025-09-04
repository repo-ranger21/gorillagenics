const axios = require('axios');
const { logScrapeActivity } = require('../utils/ethics');

class WeatherTagsScraper {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
  }

  async scrapeGameDayWeather(games = []) {
    try {
      console.log('🌤️ Scraping game-day weather conditions...');
      
      const weatherData = [];
      
      for (const game of games) {
        const weather = await this.getWeatherForGame(game);
        if (weather) {
          weatherData.push(weather);
        }
      }

      await logScrapeActivity({
        source: 'OpenWeatherMap',
        dataType: 'weather_conditions',
        recordsScraped: weatherData.length,
        timestamp: new Date().toISOString()
      });

      return weatherData;
    } catch (error) {
      console.error('❌ Weather scraping failed:', error.message);
      return this.getMockWeatherData();
    }
  }

  async getWeatherForGame(game) {
    if (!this.apiKey) {
      console.warn('⚠️ OpenWeather API key not found');
      return null;
    }

    try {
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: game.city,
          appid: this.apiKey,
          units: 'imperial'
        }
      });

      const weather = response.data;
      return this.processWeatherData(weather, game);
    } catch (error) {
      console.warn(`⚠️ Weather data unavailable for ${game.city}`);
      return null;
    }
  }

  processWeatherData(weather, game) {
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const windSpeed = weather.wind?.speed || 0;
    const conditions = weather.weather[0].main.toLowerCase();

    // Tag players for weather-related risks
    const tags = this.generateWeatherTags(temp, humidity, conditions);
    
    return {
      gameId: game.id,
      city: game.city,
      temperature: temp,
      humidity,
      windSpeed,
      conditions,
      tags,
      playersAtRisk: this.identifyPlayersAtRisk(game.players, tags),
      commentary: this.generateWeatherCommentary(temp, conditions),
      scrapedAt: new Date().toISOString()
    };
  }

  generateWeatherTags(temp, humidity, conditions) {
    const tags = [];

    // Temperature-based tags
    if (temp > 85) {
      tags.push('high_heat');
    }
    if (temp < 32) {
      tags.push('freezing');
    }

    // Humidity tags
    if (humidity > 80) {
      tags.push('high_humidity');
    }

    // Condition-based tags
    if (conditions.includes('rain')) {
      tags.push('wet_conditions');
    }
    if (conditions.includes('snow')) {
      tags.push('snow');
    }
    if (conditions.includes('wind')) {
      tags.push('windy');
    }

    return tags;
  }

  identifyPlayersAtRisk(players = [], tags) {
    const playersAtRisk = [];

    for (const player of players) {
      const riskFactors = [];

      // Heat-related risks
      if (tags.includes('high_heat') || tags.includes('high_humidity')) {
        riskFactors.push('dehydration_risk');
        
        // Higher risk for skill positions in hot weather
        if (['RB', 'WR', 'LB'].includes(player.position)) {
          riskFactors.push('high_activity_heat_risk');
        }
      }

      // Cold weather impacts
      if (tags.includes('freezing')) {
        riskFactors.push('cold_weather_impact');
        
        // Kickers especially affected by cold
        if (player.position === 'K') {
          riskFactors.push('kicking_accuracy_risk');
        }
      }

      // Wind impacts passing game
      if (tags.includes('windy')) {
        if (['QB', 'WR', 'TE'].includes(player.position)) {
          riskFactors.push('passing_game_impact');
        }
      }

      if (riskFactors.length > 0) {
        playersAtRisk.push({
          playerName: player.name,
          position: player.position,
          riskFactors,
          hydrationAlert: riskFactors.includes('dehydration_risk'),
          commentary: this.generatePlayerWeatherCommentary(player, riskFactors)
        });
      }
    }

    return playersAtRisk;
  }

  generateWeatherCommentary(temp, conditions) {
    if (temp > 90) {
      return "🦍 Scorching conditions ahead. Hydration stations on standby.";
    }
    if (temp < 25) {
      return "🦍 Frozen tundra detected. Prepare for ice-cold domination.";
    }
    if (conditions.includes('rain')) {
      return "🦍 Wet and wild conditions. Fumble alert activated.";
    }
    return "🦍 Weather conditions noted. Game on, apes.";
  }

  generatePlayerWeatherCommentary(player, riskFactors) {
    if (riskFactors.includes('dehydration_risk')) {
      return `🦍 ${player.name} in the heat zone. Extra bananas required.`;
    }
    if (riskFactors.includes('cold_weather_impact')) {
      return `🦍 ${player.name} facing arctic conditions. Frozen banana protocol.`;
    }
    if (riskFactors.includes('passing_game_impact')) {
      return `🦍 ${player.name} vs. wind tunnel. Accuracy challenge accepted.`;
    }
    return `🦍 ${player.name} weather-tagged. Monitor conditions.`;
  }

  getMockWeatherData() {
    return [
      {
        gameId: "LAR_vs_DET_W1",
        city: "Detroit",
        temperature: 78,
        humidity: 65,
        conditions: "clear",
        tags: [],
        playersAtRisk: [],
        commentary: "🦍 Perfect dome conditions. Let the games begin.",
        scrapedAt: new Date().toISOString()
      },
      {
        gameId: "MIA_vs_BUF_W1", 
        city: "Miami",
        temperature: 94,
        humidity: 89,
        conditions: "sunny",
        tags: ["high_heat", "high_humidity"],
        playersAtRisk: [
          {
            playerName: "Tua Tagovailoa",
            position: "QB",
            riskFactors: ["dehydration_risk"],
            hydrationAlert: true,
            commentary: "🦍 Tua in the heat zone. Extra bananas required."
          }
        ],
        commentary: "🦍 Scorching conditions ahead. Hydration stations on standby.",
        scrapedAt: new Date().toISOString()
      }
    ];
  }
}

module.exports = WeatherTagsScraper;