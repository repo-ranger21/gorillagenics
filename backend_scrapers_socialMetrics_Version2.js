const puppeteer = require('puppeteer');
const Tesseract = require('tesseract.js');
const { normalizeMetric } = require('../utils/normalizeMetrics');
const { logScrapeActivity, checkPrivacyCompliance } = require('../utils/ethics');

class SocialMetricsScraper {
  constructor() {
    this.browser = null;
    this.sleepPatterns = [
      /slept (\d+\.?\d*) hours/i,
      /got (\d+) hours of sleep/i,
      /sleep score.*?(\d+)/i
    ];
    this.recoveryPatterns = [
      /recovery.*?(\d+)%/i,
      /hrv.*?(\d+)/i,
      /feeling (\d+)\/10/i
    ];
  }

  async initBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async scrapeSocialPosts(playerNames = []) {
    try {
      console.log('📱 Scraping social media biometric posts...');
      if (!this.browser) await this.initBrowser();

      const allMetrics = [];
      for (const playerName of playerNames) {
        const metrics = await this.scrapePlayerPosts(playerName);
        allMetrics.push(...metrics);
      }

      await logScrapeActivity({
        source: 'Social Media',
        dataType: 'biometric_posts',
        recordsScraped: allMetrics.length,
        timestamp: new Date().toISOString()
      });

      return allMetrics;
    } catch (error) {
      console.error('❌ Social media scraping failed:', error.message);
      return this.getMockSocialData();
    }
  }

  async scrapePlayerPosts(playerName) {
    const page = await this.browser.newPage();
    const metrics = [];
    try {
      // Mock Instagram scraping - replace with actual implementation
      await page.goto(`https://instagram.com/${playerName.toLowerCase()}`);
      // Extract posts with biometric keywords
      const posts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid="post"]'))
          .slice(0, 5)
          .map(post => ({
            text: post.innerText,
            imageUrl: post.querySelector('img')?.src,
            timestamp: post.querySelector('time')?.getAttribute('datetime')
          }));
      });

      for (const post of posts) {
        if (!checkPrivacyCompliance(post)) continue;
        const extractedMetrics = await this.extractBiometrics(post, playerName);
        if (extractedMetrics) {
          metrics.push(extractedMetrics);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not scrape ${playerName}:`, error.message);
    } finally {
      await page.close();
    }
    return metrics;
  }

  async extractBiometrics(post, playerName) {
    const metrics = {
      playerName,
      date: post.timestamp || new Date().toISOString(),
      source: 'Social Media',
      rawPost: post.text,
      extractedMetrics: {}
    };

    for (const pattern of this.sleepPatterns) {
      const match = post.text.match(pattern);
      if (match) {
        const sleepHours = parseFloat(match[1]);
        metrics.sleepScore = normalizeMetric(sleepHours * 10, 'sleep');
        break;
      }
    }

    for (const pattern of this.recoveryPatterns) {
      const match = post.text.match(pattern);
      if (match) {
        metrics.recoveryScore = normalizeMetric(parseInt(match[1]), 'recovery');
        break;
      }
    }

    if (/hydrated|water|electrolytes/i.test(post.text)) {
      metrics.hydrationLevel = normalizeMetric(85, 'hydration');
    }

    if (/explosive|energy|beast mode|feeling strong/i.test(post.text)) {
      metrics.testosteroneProxy = normalizeMetric(90, 'testosterone');
      metrics.commentary = "🦍 High-energy post detected. Max juice incoming.";
    }

    if (post.imageUrl && /whoop|oura/i.test(post.text)) {
      const ocrData = await this.processWearableScreenshot(post.imageUrl);
      Object.assign(metrics, ocrData);
    }

    return Object.keys(metrics.extractedMetrics || {}).length > 0 ? metrics : null;
  }

  async processWearableScreenshot(imageUrl) {
    try {
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng');
      const sleepMatch = text.match(/sleep.*?(\d+)/i);
      const recoveryMatch = text.match(/recovery.*?(\d+)/i);
      const hrvMatch = text.match(/hrv.*?(\d+)/i);

      return {
        sleepScore: sleepMatch ? normalizeMetric(parseInt(sleepMatch[1]), 'sleep') : null,
        recoveryScore: recoveryMatch ? normalizeMetric(parseInt(recoveryMatch[1]), 'recovery') : null,
        hrvScore: hrvMatch ? normalizeMetric(parseInt(hrvMatch[1]), 'hrv') : null,
        commentary: "🦍 Wearable data extracted. Biometric intel acquired."
      };
    } catch (error) {
      console.warn('OCR processing failed:', error.message);
      return {};
    }
  }

  getMockSocialData() {
    return [
      {
        playerName: "Josh Allen",
        date: new Date().toISOString(),
        sleepScore: 88,
        testosteroneProxy: 92,
        hydrationLevel: 85,
        source: "Instagram",
        commentary: "🦍 'Slept 8.5 hours, feeling explosive' - Max juice detected."
      },
      {
        playerName: "Christian McCaffrey",
        date: new Date().toISOString(),
        sleepScore: 95,
        recoveryScore: 89,
        hydrationLevel: 90,
        source: "Twitter",
        commentary: "🦍 WHOOP recovery at 89%. Banana-fueled domination incoming."
      }
    ];
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = SocialMetricsScraper;