/**
 * Normalizes raw biometric data to 0-100 scale for BioBoost scoring
 */

class MetricNormalizer {
  constructor() {
    // Define baseline ranges for different metrics
    this.metricRanges = {
      sleep: { min: 4, max: 10, optimal: 8 }, // hours
      recovery: { min: 0, max: 100, optimal: 85 }, // percentage
      hrv: { min: 20, max: 80, optimal: 50 }, // ms
      hydration: { min: 0, max: 100, optimal: 80 }, // percentage
      testosterone: { min: 0, max: 100, optimal: 75 }, // proxy score
      cortisol: { min: 0, max: 100, optimal: 30 }, // proxy score (lower is better)
      performance: { min: 0, max: 100, optimal: 80 }, // game performance
      injury: { min: 0, max: 30, optimal: 0 } // recovery days
    };
  }

  normalizeMetric(value, metricType) {
    const range = this.metricRanges[metricType];
    
    if (!range) {
      console.warn(`⚠️ Unknown metric type: ${metricType}`);
      return Math.min(Math.max(value, 0), 100);
    }

    // Handle special cases
    switch (metricType) {
      case 'cortisol':
        return this.normalizeCortisol(value, range);
      case 'injury':
        return this.normalizeInjury(value, range);
      case 'sleep':
        return this.normalizeSleep(value, range);
      default:
        return this.normalizeStandard(value, range);
    }
  }

  normalizeStandard(value, range) {
    // Standard 0-100 normalization
    const normalized = ((value - range.min) / (range.max - range.min)) * 100;
    return Math.min(Math.max(normalized, 0), 100);
  }

  normalizeSleep(hours, range) {
    // Sleep follows a bell curve - optimal around 8 hours
    if (hours <= 0) return 0;
    if (hours >= range.max) return 85; // Too much sleep isn't perfect
    
    const distanceFromOptimal = Math.abs(hours - range.optimal);
    const penalty = distanceFromOptimal * 15; // 15 points per hour deviation
    
    return Math.max(100 - penalty, 0);
  }

  normalizeCortisol(level, range) {
    // Lower cortisol is better (inverted scale)
    const inverted = range.max - level;
    return this.normalizeStandard(inverted, range);
  }

  normalizeInjury(recoveryDays, range) {
    // Fewer recovery days = higher score
    if (recoveryDays <= 0) return 100;
    if (recoveryDays >= range.max) return 0;
    
    return Math.max(100 - (recoveryDays * 5), 0); // 5 points per day
  }

  calculateBioBoostScore(metrics) {
    const weights = {
      sleepScore: 0.25,
      recoveryScore: 0.20,
      hydrationLevel: 0.15,
      testosteroneProxy: 0.15,
      cortisolProxy: 0.10,
      injuryRecoveryScore: 0.15
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric] !== null && metrics[metric] !== undefined) {
        weightedSum += metrics[metric] * weight;
        totalWeight += weight;
      }
    }

    // Normalize by actual weights used
    const bioBoostScore = totalWeight > 0 ? weightedSum / totalWeight : 50;
    
    return {
      bioBoostScore: Math.round(bioBoostScore),
      components: this.getScoreBreakdown(metrics, weights),
      confidence: this.calculateConfidence(metrics)
    };
  }

  getScoreBreakdown(metrics, weights) {
    const breakdown = {};
    
    for (const [metric, weight] of Object.entries(weights)) {
      if (metrics[metric] !== null && metrics[metric] !== undefined) {
        breakdown[metric] = {
          value: metrics[metric],
          weight: weight,
          contribution: metrics[metric] * weight
        };
      }
    }
    
    return breakdown;
  }

  calculateConfidence(metrics) {
    // Confidence based on how many metrics we have
    const totalMetrics = 6;
    const availableMetrics = Object.values(metrics).filter(v => v !== null && v !== undefined).length;
    
    return Math.round((availableMetrics / totalMetrics) * 100);
  }

  generateBioBoostCommentary(score) {
    if (score >= 90) {
      return "🦍 MAXIMUM JUICE DETECTED! Expect banana-fueled domination.";
    } else if (score >= 80) {
      return "🦍 High-octane ape mode activated. Prepare for fireworks.";
    } else if (score >= 70) {
      return "🦍 Solid biometric readings. Ready for battle.";
    } else if (score >= 60) {
      return "🦍 Moderate juice levels. Proceed with caution.";
    } else if (score >= 50) {
      return "🦍 Sub-optimal metrics detected. Tread carefully, ape.";
    } else {
      return "🦍 Low juice alert! Consider fade opportunities.";
    }
  }
}

// Export singleton instance
const normalizer = new MetricNormalizer();

module.exports = {
  normalizeMetric: (value, type) => normalizer.normalizeMetric(value, type),
  calculateBioBoostScore: (metrics) => normalizer.calculateBioBoostScore(metrics),
  generateBioBoostCommentary: (score) => normalizer.generateBioBoostCommentary(score),
  MetricNormalizer
};