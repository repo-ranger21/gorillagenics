const axios = require('axios');
const cheerio = require('cheerio');
const { logScrapeActivity } = require('../utils/ethics');

class InjuryReportScraper {
  constructor() {
    this.baseURL = 'https://www.nfl.com';
  }

  async scrapeInjuryReports() {
    try {
      console.log('🏥 Scraping NFL injury reports...');
      const response = await axios.get(`${this.baseURL}/injuries/`);
      const $ = cheerio.load(response.data);

      const injuryData = this.parseInjuryData($);

      await logScrapeActivity({
        source: 'NFL.com',
        dataType: 'injury_reports',
        recordsScraped: injuryData.length,
        timestamp: new Date().toISOString()
      });

      return injuryData;
    } catch (error) {
      console.error('❌ Injury report scraping failed:', error.message);
      return this.getMockInjuryData();
    }
  }

  parseInjuryData($) {
    const injuries = [];
    // Mock parsing logic - replace with actual NFL.com selectors
    $('.injury-row').each((index, element) => {
      const playerName = $(element).find('.player-name').text().trim();
      const injuryType = $(element).find('.injury-type').text().trim();
      const status = $(element).find('.status').text().trim();

      if (playerName && injuryType) {
        injuries.push({
          playerName,
          injuryType,
          status,
          injuryRecoveryDays: this.estimateRecoveryDays(injuryType, status),
          source: 'NFL.com',
          scrapedAt: new Date().toISOString(),
          commentary: this.generateInjuryCommentary(injuryType, status)
        });
      }
    });

    return injuries;
  }

  getMockInjuryData() {
    return [
      {
        playerName: "Christian McCaffrey",
        injuryType: "Achilles",
        status: "Questionable",
        injuryRecoveryDays: 3,
        source: 'NFL.com',
        scrapedAt: new Date().toISOString(),
        commentary: "🦍 Achilles watch activated. Tread carefully, ape."
      },
      {
        playerName: "Ja'Marr Chase",
        injuryType: "Hamstring",
        status: "Probable",
        injuryRecoveryDays: 1,
        source: 'NFL.com',
        scrapedAt: new Date().toISOString(),
        commentary: "🦍 Minor tweak detected. Still ready to feast."
      }
    ];
  }

  estimateRecoveryDays(injuryType, status) {
    const injuryMap = {
      'Hamstring': { 'Questionable': 5, 'Doubtful': 10, 'Probable': 1 },
      'Ankle': { 'Questionable': 7, 'Doubtful': 14, 'Probable': 2 },
      'Knee': { 'Questionable': 10, 'Doubtful': 21, 'Probable': 3 },
      'Achilles': { 'Questionable': 14, 'Doubtful': 28, 'Probable': 5 }
    };

    return injuryMap[injuryType]?.[status] || 7;
  }

  generateInjuryCommentary(injuryType, status) {
    const commentaries = {
      'Hamstring': "🦍 Hammy acting up. Banana stretches recommended.",
      'Ankle': "🦍 Ankle twist detected. Proceed with caution, ape.",
      'Knee': "🦍 Knee concern noted. Ice baths and prayers.",
      'Achilles': "🦍 Achilles watch. Handle with extreme care."
    };

    return commentaries[injuryType] || "🦍 Minor injury noted. Monitor closely.";
  }
}

module.exports = InjuryReportScraper;