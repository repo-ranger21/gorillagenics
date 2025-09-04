const fs = require('fs').promises;
const path = require('path');

/**
 * Ethics and transparency framework for GuerillaGenics data scraping
 */

class EthicsFramework {
  constructor() {
    this.logFile = path.join(__dirname, '../logs/scrapeLog.json');
    this.privacyRules = this.initializePrivacyRules();
    this.sourceWhitelist = this.initializeSourceWhitelist();
  }

  initializePrivacyRules() {
    return {
      // Only scrape public posts
      requirePublicPosts: true,
      
      // Avoid personal/private information
      forbiddenDataTypes: [
        'personal_address',
        'private_messages', 
        'medical_records',
        'private_photos',
        'family_information'
      ],
      
      // Approved biometric keywords for extraction
      approvedKeywords: [
        'sleep', 'recovery', 'hydration', 'energy', 'workout',
        'whoop', 'oura', 'fitbit', 'garmin', 'feeling', 'training'
      ],
      
      // Content that should be flagged for review
      reviewRequired: [
        'injury_details',
        'medication_mentions',
        'personal_struggles'
      ]
    };
  }

  initializeSourceWhitelist() {
    return {
      // Approved public data sources
      approved: [
        'nfl.com',
        'nflfastr.com', 
        'pro-football-reference.com',
        'instagram.com', // public posts only
        'twitter.com', // public posts only
        'openweathermap.org'
      ],
      
      // Sources that require additional verification
      requiresVerification: [
        'facebook.com',
        'snapchat.com',
        'tiktok.com'
      ],
      
      // Explicitly forbidden sources
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

      // Read existing log
      let existingLog = [];
      try {
        const logData = await fs.readFile(this.logFile, 'utf8');
        existingLog = JSON.parse(logData);
      } catch (error) {
        // File doesn't exist yet, start with empty array
      }

      // Add new entry
      existingLog.push(logEntry);

      // Keep only last 1000 entries
      if (existingLog.length > 1000) {
        existingLog = existingLog.slice(-1000);
      }

      // Write back to file
      await fs.writeFile(this.logFile, JSON.stringify(existingLog, null, 2));
      
      console.log(`📝 Logged scrape activity: ${activity.type || 'unknown'}`);
      
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
    
    if (this.sourceWhitelist.approved.includes(domain)) {
      return true;
    }
    
    if (this.sourceWhitelist.forbidden.includes(domain)) {
      console.warn(`⚠️ Forbidden source detected: ${domain}`);
      return false;
    }
    
    if (this.sourceWhitelist.requiresVerification.includes(domain)) {
      console.warn(`⚠️ Source requires verification: ${domain}`);
      return 'requires_verification';
    }
    
    return 'unknown_source';
  }

  checkDataTypeAllowed(dataType) {
    if (!dataType) return true;
    
    if (this.privacyRules.forbiddenDataTypes.includes(dataType)) {
      console.warn(`⚠️ Forbidden data type: ${dataType}`);
      return false;
    }
    
    if (this.privacyRules.reviewRequired.includes(dataType)) {
      console.warn(`⚠️ Data type requires review: ${dataType}`);
      return 'requires_review';
    }
    
    return true;
  }

  checkPrivacyCompliance(activity) {
    // Check if scraping respects privacy rules
    const checks = {
      publicOnly: this.privacyRules.requirePublicPosts,
      noForbiddenData: !this.containsForbiddenData(activity),
      approvedKeywords: this.usesApprovedKeywords(activity)
    };
    
    return Object.values(checks).every(check => check === true);
  }

  checkTransparencyRequirements(activity) {
    // Ensure proper attribution and transparency
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
    if (!activity.content) return true; // No content to check
    
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
      return url; // Return as-is if not a valid URL
    }
  }

  checkPrivacyCompliance(post) {
    // Check if a social media post meets privacy requirements
    if (!post) return false;
    
    // Must be public post (implied by being scrapeable)
    if (!this.privacyRules.requirePublicPosts) return false;
    
    // Check for forbidden content
    if (this.containsForbiddenData(post)) {
      console.warn('⚠️ Post contains forbidden data types');
      return false;
    }
    
    // Check for approved biometric keywords
    if (!this.usesApprovedKeywords(post)) {
      console.warn('⚠️ Post does not contain approved biometric keywords');
      return false;
    }
    
    return true;
  }

  async generateEthicsReport() {
    try {
      const logData = await fs.readFile(this.logFile, 'utf8');
      const logs = JSON.parse(logData);
      
      const report = {
        generatedAt: new Date().toISOString(),
        totalActivities: logs.length,
        complianceStats: this.calculateComplianceStats(logs),
        sourceBreakdown: this.calculateSourceBreakdown(logs),
        recentViolations: this.findRecentViolations(logs),
        recommendations: this.generateRecommendations(logs)
      };
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate ethics report:', error.message);
      return null;
    }
  }

  calculateComplianceStats(logs) {
    const stats = {
      compliant: 0,
      violations: 0,
      requiresReview: 0
    };
    
    logs.forEach(log => {
      if (log.ethicsCheck?.overallCompliance === true) {
        stats.compliant++;
      } else if (log.ethicsCheck?.overallCompliance === false) {
        stats.violations++;
      } else {
        stats.requiresReview++;
      }
    });
    
    return {
      ...stats,
      complianceRate: stats.compliant / logs.length * 100
    };
  }

  calculateSourceBreakdown(logs) {
    const breakdown = {};
    
    logs.forEach(log => {
      const source = log.source || 'unknown';
      breakdown[source] = (breakdown[source] || 0) + 1;
    });
    
    return breakdown;
  }

  findRecentViolations(logs) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return logs
      .filter(log => 
        new Date(log.timestamp) >= oneDayAgo &&
        log.ethicsCheck?.overallCompliance === false
      )
      .slice(-10); // Last 10 violations
  }

  generateRecommendations(logs) {
    const recommendations = [];
    const violations = this.findRecentViolations(logs);
    
    if (violations.length > 0) {
      recommendations.push('🔍 Review recent compliance violations and update scraping rules');
    }
    
    const complianceStats = this.calculateComplianceStats(logs);
    if (complianceStats.complianceRate < 95) {
      recommendations.push('📈 Improve compliance rate by updating source validation');
    }
    
    recommendations.push('📋 Regular ethics audits recommended every 30 days');
    recommendations.push('🔄 Update privacy rules as new data sources are added');
    
    return recommendations;
  }
}

// Create singleton instance
const ethicsFramework = new EthicsFramework();

module.exports = {
  logScrapeActivity: (activity) => ethicsFramework.logScrapeActivity(activity),
  checkPrivacyCompliance: (post) => ethicsFramework.checkPrivacyCompliance(post),
  generateEthicsReport: () => ethicsFramework.generateEthicsReport(),
  EthicsFramework
};