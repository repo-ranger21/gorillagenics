const fs = require('fs').promises;
const path = require('path');

class EthicsFramework {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/scrapeLog.json');
    this.privacyRules = {
      requirePublicPosts: true,
      forbiddenDataTypes: [
        'personal_address',
        'private_messages',
        'medical_records',
        'private_photos',
        'family_information'
      ],
      approvedKeywords: [
        'sleep', 'recovery', 'hydration', 'energy', 'workout',
        'whoop', 'oura', 'fitbit', 'garmin', 'feeling', 'training'
      ],
      reviewRequired: ['injury_details', 'medication_mentions', 'personal_struggles']
    };
    this.sourceWhitelist = {
      approved: [
        'nfl.com',
        'nflfastr.com',
        'pro-football-reference.com',
        'instagram.com',
        'twitter.com',
        'openweathermap.org'
      ],
      requiresVerification: [
        'facebook.com',
        'snapchat.com',
        'tiktok.com'
      ],
      forbidden: [
        'private_apis',
        'leaked_data',
        'medical_databases',
        'private_trackers'
      ]
    };
  }

  async logScrapeActivity(activity) {
    try {
      const logEntry = {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
        ethicsCheck: await this.performEthicsCheck(activity)
      };
      let existingLog = [];
      try {
        const logData = await fs.readFile(this.logFile, 'utf8');
        existingLog = JSON.parse(logData);
      } catch (error) {}
      existingLog.push(logEntry);
      if (existingLog.length > 1000) existingLog = existingLog.slice(-1000);
      await fs.writeFile(this.logFile, JSON.stringify(existingLog, null, 2));
    } catch (error) {
      console.error('❌ Failed to log scrape activity:', error.message);
    }
  }

  async performEthicsCheck(activity) {
    const checks = {
      sourceApproved: this.checkSourceApproval(activity.source),
      dataTypeAllowed: this.checkDataTypeAllowed(activity.dataType),
      privacyCompliant: this.checkPrivacyCompliance(activity),
      transparencyMet: this.checkTransparencyRequirements(activity)
    };
    return {
      ...checks,
      overallCompliance: Object.values(checks).every(check => check === true),
      timestamp: new Date().toISOString()
    };
  }

  checkSourceApproval(source) {
    if (!source) return false;
    const domain = this.extractDomain(source);
    if (this.sourceWhitelist.approved.includes(domain)) return true;
    if (this.sourceWhitelist.forbidden.includes(domain)) return false;
    if (this.sourceWhitelist.requiresVerification.includes(domain)) return 'requires_verification';
    return 'unknown_source';
  }

  checkDataTypeAllowed(dataType) {
    if (!dataType) return true;
    if (this.privacyRules.forbiddenDataTypes.includes(dataType)) return false;
    if (this.privacyRules.reviewRequired.includes(dataType)) return 'requires_review';
    return true;
  }

  checkPrivacyCompliance(activity) {
    const checks = {
      publicOnly: this.privacyRules.requirePublicPosts,
      noForbiddenData: !this.containsForbiddenData(activity),
      approvedKeywords: this.usesApprovedKeywords(activity)
    };
    return Object.values(checks).every(check => check === true);
  }

  checkTransparencyRequirements(activity) {
    return !!(
      activity.source &&
      activity.timestamp &&
      activity.dataType
    );
  }

  containsForbiddenData(activity) {
    if (!activity.content) return false;
    const content = activity.content.toLowerCase();
    return this.privacyRules.forbiddenDataTypes.some(forbiddenType =>
      content.includes(forbiddenType.replace('_', ' '))
    );
  }

  usesApprovedKeywords(activity) {
    if (!activity.content) return true;
    const content = activity.content.toLowerCase();
    return this.privacyRules.approvedKeywords.some(keyword =>
      content.includes(keyword)
    );
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  }

  checkPrivacyCompliance(post) {
    if (!post) return false;
    if (!this.privacyRules.requirePublicPosts) return false;
    if (this.containsForbiddenData(post)) return false;
    if (!this.usesApprovedKeywords(post)) return false;
    return true;
  }
}

const ethicsFramework = new EthicsFramework();

module.exports = {
  logScrapeActivity: (activity) => ethicsFramework.logScrapeActivity(activity),
  checkPrivacyCompliance: (post) => ethicsFramework.checkPrivacyCompliance(post),
  EthicsFramework
};