const cron = require('node-cron');
const NFLStatsScaper = require('../scrapers/nflStats');
const InjuryReportScraper = require('../scrapers/injuryReports');
const SocialMetricsScraper = require('../scrapers/socialMetrics');
const WeatherTagsScraper = require('../scrapers/weatherTags');
const PlayerMetric = require('../models/PlayerMetric');
const { calculateBioBoostScore, generateBioBoostCommentary } = require('./normalizeMetrics');
const { triggerJuiceWatchAlert } = require('./juiceWatch');
const { logScrapeActivity } = require('./ethics');

class ScrapeManager {
  constructor() {
    this.scrapers = {
      nflStats: new NFLStatsScaper(),
      injuryReports: new InjuryReportScraper(),
      socialMetrics: new SocialMetricsScraper(),
      weatherTags: new WeatherTagsScraper()
    };
    
    this.isRunning = false;
    this.lastRun = null;
  }

  async initializeScheduler() {
    console.log('🦍 Initializing GuerillaGenics scrape scheduler...');

    // Daily morning scrape (6 AM UTC)
    cron.schedule('0 6 * * *', () => {
      this.runFullScrape('daily');
    });

    // Game day intensive scraping (every 2 hours on Sundays)
    cron.schedule('0 */2 * * 0', () => {
      this.runFullScrape('gameday');
    });

    // Social media monitoring (every 4 hours)
    cron.schedule('0 */4 * * *', () => {
      this.runSocialScrape();
    });

    // Injury report updates (weekdays at 2 PM)
    cron.schedule('0 14 * * 1-5', () => {
      this.runInjuryScrape();
    });

    console.log('✅ Scrape scheduler initialized with multiple cadences');
  }

  async runFullScrape(mode = 'manual') {
    if (this.isRunning) {
      console.log('⚠️ Scrape already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();

    console.log(`🚀 Starting ${mode} scrape at ${this.lastRun.toISOString()}`);

    try {
      // 1. Scrape NFL performance stats
      const nflStats = await this.scrapers.nflStats.scrapeWeeklyStats();
      console.log(`📊 Scraped ${nflStats.length} NFL stat records`);

      // 2. Scrape injury reports
      const injuries = await this.scrapers.injuryReports.scrapeInjuryReports();
      console.log(`🏥 Scraped ${injuries.length} injury records`);

      // 3. Scrape social media biometrics
      const playerNames = this.extractPlayerNames(nflStats, injuries);
      const socialMetrics = await this.scrapers.socialMetrics.scrapeSocialPosts(playerNames);
      console.log(`📱 Scraped ${socialMetrics.length} social metric records`);

      // 4. Scrape weather conditions for active games
      const games = this.getActiveGames();
      const weatherData = await this.scrapers.weatherTags.scrapeGameDayWeather(games);
      console.log(`🌤️ Scraped ${weatherData.length} weather records`);

      // 5. Merge and normalize all data
      const mergedMetrics = await this.mergeAndNormalizeData({
        nflStats,
        injuries,
        socialMetrics,
        weatherData
      });

      // 6. Save to database and trigger alerts
      const savedRecords = await this.saveMetricsToDatabase(mergedMetrics);
      console.log(`💾 Saved ${savedRecords.length} player metric records`);

      // 7. Check for Juice Watch alerts
      await this.checkJuiceWatchAlerts(savedRecords);

      // 8. Log scrape completion
      await logScrapeActivity({
        type: 'full_scrape',
        mode,
        recordsProcessed: savedRecords.length,
        duration: Date.now() - this.lastRun.getTime(),
        timestamp: new Date().toISOString()
      });

      console.log(`✅ ${mode} scrape completed successfully`);

    } catch (error) {
      console.error('❌ Scrape failed:', error.message);
      await logScrapeActivity({
        type: 'scrape_error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isRunning = false;
    }
  }

  async runSocialScrape() {
    console.log('📱 Running focused social media scrape...');
    
    try {
      // Get top players from recent metrics
      const topPlayers = await PlayerMetric.getBioBoostLeaderboard(20);
      const playerNames = topPlayers.map(p => p._id);
      
      const socialMetrics = await this.scrapers.socialMetrics.scrapeSocialPosts(playerNames);
      
      if (socialMetrics.length > 0) {
        const savedRecords = await this.saveMetricsToDatabase(socialMetrics);
        console.log(`💾 Saved ${savedRecords.length} social metric updates`);
      }
    } catch (error) {
      console.error('❌ Social scrape failed:', error.message);
    }
  }

  async runInjuryScrape() {
    console.log('🏥 Running injury report update...');
    
    try {
      const injuries = await this.scrapers.injuryReports.scrapeInjuryReports();
      
      if (injuries.length > 0) {
        const savedRecords = await this.saveMetricsToDatabase(injuries);
        console.log(`💾 Updated ${savedRecords.length} injury records`);
      }
    } catch (error) {
      console.error('❌ Injury scrape failed:', error.message);
    }
  }

  extractPlayerNames(nflStats, injuries) {
    const names = new Set();
    
    nflStats.forEach(stat => names.add(stat.playerName));
    injuries.forEach(injury => names.add(injury.playerName));
    
    return Array.from(names).slice(0, 50); // Limit to top 50 for social scraping
  }

  getActiveGames() {
    // Mock game data - replace with actual NFL schedule API
    return [
      {
        id: 'LAR_vs_DET_W1',
        city: 'Detroit',
        players: [
          { name: 'Matthew Stafford', position: 'QB' },
          { name: 'Cooper Kupp', position: 'WR' }
        ]
      },
      {
        id: 'MIA_vs_BUF_W1',
        city: 'Miami', 
        players: [
          { name: 'Tua Tagovailoa', position: 'QB' },
          { name: 'Tyreek Hill', position: 'WR' }
        ]
      }
    ];
  }

  async mergeAndNormalizeData({ nflStats, injuries, socialMetrics, weatherData }) {
    const playerMetrics = new Map();

    // Process NFL stats
    nflStats.forEach(stat => {
      if (!playerMetrics.has(stat.playerName)) {
        playerMetrics.set(stat.playerName, {
          playerName: stat.playerName,
          position: stat.position,
          date: new Date(),
          sources: []
        });
      }
      
      const metric = playerMetrics.get(stat.playerName);
      metric.performanceScore = stat.performanceScore;
      metric.sources.push({
        type: 'nflfastR',
        scrapedAt: new Date()
      });
    });

    // Process injuries
    injuries.forEach(injury => {
      if (!playerMetrics.has(injury.playerName)) {
        playerMetrics.set(injury.playerName, {
          playerName: injury.playerName,
          date: new Date(),
          sources: []
        });
      }
      
      const metric = playerMetrics.get(injury.playerName);
      metric.injuryRecoveryDays = injury.injuryRecoveryDays;
      metric.injuryType = injury.injuryType;
      metric.injuryStatus = injury.status;
      metric.sources.push({
        type: 'NFL.com',
        scrapedAt: new Date()
      });
    });

    // Process social metrics
    socialMetrics.forEach(social => {
      if (!playerMetrics.has(social.playerName)) {
        playerMetrics.set(social.playerName, {
          playerName: social.playerName,
          date: new Date(),
          sources: []
        });
      }
      
      const metric = playerMetrics.get(social.playerName);
      if (social.sleepScore) metric.sleepScore = social.sleepScore;
      if (social.testosteroneProxy) metric.testosteroneProxy = social.testosteroneProxy;
      if (social.hydrationLevel) metric.hydrationLevel = social.hydrationLevel;
      if (social.recoveryScore) metric.recoveryScore = social.recoveryScore;
      
      metric.sources.push({
        type: social.source === 'Social Media' ? 'Instagram' : social.source,
        scrapedAt: new Date()
      });
    });

    // Process weather data and apply tags
    weatherData.forEach(weather => {
      weather.playersAtRisk?.forEach(playerRisk => {
        if (playerMetrics.has(playerRisk.playerName)) {
          const metric = playerMetrics.get(playerRisk.playerName);
          metric.weatherTags = weather.tags;
          metric.hydrationAlert = playerRisk.hydrationAlert;
        }
      });
    });

    // Calculate BioBoost scores for all players
    const results = [];
    for (const [playerName, metric] of playerMetrics) {
      const bioBoost = calculateBioBoostScore(metric);
      metric.bioBoostScore = bioBoost.bioBoostScore;
      metric.bioBoostComponents = bioBoost.components;
      metric.confidence = bioBoost.confidence;
      metric.commentary = generateBioBoostCommentary(bioBoost.bioBoostScore);
      
      results.push(metric);
    }

    return results;
  }

  async saveMetricsToDatabase(metrics) {
    const savedRecords = [];

    for (const metric of metrics) {
      try {
        // Check for existing record for today
        const existing = await PlayerMetric.findOne({
          playerName: metric.playerName,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        });

        if (existing) {
          // Update existing record
          Object.assign(existing, metric);
          await existing.save();
          savedRecords.push(existing);
        } else {
          // Create new record
          const newMetric = new PlayerMetric(metric);
          await newMetric.save();
          savedRecords.push(newMetric);
        }
      } catch (error) {
        console.error(`❌ Failed to save metric for ${metric.playerName}:`, error.message);
      }
    }

    return savedRecords;
  }

  async checkJuiceWatchAlerts(metrics) {
    for (const metric of metrics) {
      try {
        const alertTriggered = await metric.checkJuiceWatchThreshold();
        if (alertTriggered) {
          await triggerJuiceWatchAlert(metric);
          console.log(`🚨 JUICE WATCH: ${metric.playerName} triggered alert!`);
        }
      } catch (error) {
        console.error(`❌ Juice Watch check failed for ${metric.playerName}:`, error.message);
      }
    }
  }

  async getScrapingStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextScheduledRun: this.getNextScheduledRun(),
      recentActivity: await this.getRecentScrapeActivity()
    };
  }

  getNextScheduledRun() {
    // Calculate next 6 AM UTC
    const now = new Date();
    const next6AM = new Date(now);
    next6AM.setUTCHours(6, 0, 0, 0);
    
    if (next6AM <= now) {
      next6AM.setUTCDate(next6AM.getUTCDate() + 1);
    }
    
    return next6AM;
  }

  async getRecentScrapeActivity() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentMetrics = await PlayerMetric.countDocuments({
        createdAt: { $gte: oneDayAgo }
      });
      
      return {
        last24Hours: recentMetrics,
        totalPlayers: await PlayerMetric.distinct('playerName').countDocuments()
      };
    } catch (error) {
      return { last24Hours: 0, totalPlayers: 0 };
    }
  }
}

// Create singleton instance
const scrapeManager = new ScrapeManager();

// Auto-initialize if running directly
if (require.main === module) {
  scrapeManager.initializeScheduler();
  scrapeManager.runFullScrape('manual');
}

module.exports = scrapeManager;