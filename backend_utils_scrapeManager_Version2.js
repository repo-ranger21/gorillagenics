const cron = require('node-cron');
const NFLStatsScaper = require('../scrapers/nflStats');
const InjuryReportScraper = require('../scrapers/injuryReports');
const SocialMetricsScraper = require('../scrapers/socialMetrics');
const WeatherTagsScraper = require('../scrapers/weatherTags');
const PlayerMetric = require('../models/PlayerMetric');
const { calculateBioBoostScore, generateBioBoostCommentary } = require('./normalizeMetrics');
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
    cron.schedule('0 6 * * *', () => { this.runFullScrape('daily'); });
    cron.schedule('0 */2 * * 0', () => { this.runFullScrape('gameday'); });
    cron.schedule('0 */4 * * *', () => { this.runSocialScrape(); });
    cron.schedule('0 14 * * 1-5', () => { this.runInjuryScrape(); });
    console.log('✅ Scrape scheduler initialized with multiple cadences');
  }

  async runFullScrape(mode = 'manual') {
    if (this.isRunning) { console.log('⚠️ Scrape already in progress, skipping...'); return; }
    this.isRunning = true;
    this.lastRun = new Date();
    console.log(`🚀 Starting ${mode} scrape at ${this.lastRun.toISOString()}`);

    try {
      const nflStats = await this.scrapers.nflStats.scrapeWeeklyStats();
      const injuries = await this.scrapers.injuryReports.scrapeInjuryReports();
      const playerNames = this.extractPlayerNames(nflStats, injuries);
      const socialMetrics = await this.scrapers.socialMetrics.scrapeSocialPosts(playerNames);
      const games = this.getActiveGames();
      const weatherData = await this.scrapers.weatherTags.scrapeGameDayWeather(games);

      const mergedMetrics = await this.mergeAndNormalizeData({ nflStats, injuries, socialMetrics, weatherData });
      const savedRecords = await this.saveMetricsToDatabase(mergedMetrics);
      await this.checkJuiceWatchAlerts(savedRecords);

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
    return Array.from(names).slice(0, 50);
  }

  getActiveGames() {
    return [
      { id: 'LAR_vs_DET_W1', city: 'Detroit', players: [{ name: 'Matthew Stafford', position: 'QB' }, { name: 'Cooper Kupp', position: 'WR' }] },
      { id: 'MIA_vs_BUF_W1', city: 'Miami', players: [{ name: 'Tua Tagovailoa', position: 'QB' }, { name: 'Tyreek Hill', position: 'WR' }] }
    ];
  }

  async mergeAndNormalizeData({ nflStats, injuries, socialMetrics, weatherData }) {
    const playerMetrics = new Map();
    nflStats.forEach(stat => {
      if (!playerMetrics.has(stat.playerName)) {
        playerMetrics.set(stat.playerName, { playerName: stat.playerName, position: stat.position, date: new Date(), sources: [] });
      }
      const metric = playerMetrics.get(stat.playerName);
      metric.performanceScore = stat.performanceScore;
      metric.sources.push({ type: 'nflfastR', scrapedAt: new Date() });
    });
    injuries.forEach(injury => {
      if (!playerMetrics.has(injury.playerName)) {
        playerMetrics.set(injury.playerName, { playerName: injury.playerName, date: new Date(), sources: [] });
      }
      const metric = playerMetrics.get(injury.playerName);
      metric.injuryRecoveryDays = injury.injuryRecoveryDays;
      metric.injuryType = injury.injuryType;
      metric.injuryStatus = injury.status;
      metric.sources.push({ type: 'NFL.com', scrapedAt: new Date() });
    });
    socialMetrics.forEach(social => {
      if (!playerMetrics.has(social.playerName)) {
        playerMetrics.set(social.playerName, { playerName: social.playerName, date: new Date(), sources: [] });
      }
      const metric = playerMetrics.get(social.playerName);
      if (social.sleepScore) metric.sleepScore = social.sleepScore;
      if (social.testosteroneProxy) metric.testosteroneProxy = social.testosteroneProxy;
      if (social.hydrationLevel) metric.hydrationLevel = social.hydrationLevel;
      if (social.recoveryScore) metric.recoveryScore = social.recoveryScore;
      metric.sources.push({ type: social.source === 'Social Media' ? 'Instagram' : social.source, scrapedAt: new Date() });
    });
    weatherData.forEach(weather => {
      weather.playersAtRisk?.forEach(playerRisk => {
        if (playerMetrics.has(playerRisk.playerName)) {
          const metric = playerMetrics.get(playerRisk.playerName);
          metric.weatherTags = weather.tags;
          metric.hydrationAlert = playerRisk.hydrationAlert;
        }
      });
    });
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
        const existing = await PlayerMetric.findOne({
          playerName: metric.playerName,
          date: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        });
        if (existing) {
          Object.assign(existing, metric);
          await existing.save();
          savedRecords.push(existing);
        } else {
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
          // Placeholder for Juice Watch alert
          console.log(`🚨 JUICE WATCH: ${metric.playerName} triggered alert!`);
        }
      } catch (error) {
        console.error(`❌ Juice Watch check failed for ${metric.playerName}:`, error.message);
      }
    }
  }
}

const scrapeManager = new ScrapeManager();
if (require.main === module) {
  scrapeManager.initializeScheduler();
  scrapeManager.runFullScrape('manual');
}

module.exports = scrapeManager;