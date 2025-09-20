/**
 * Pick Builder Service - Integrates player metrics with bankroll management
 * Combines biometric data, weather conditions, and market analysis for optimal picks
 */

const BankrollManager = require('./backend_utils_bankrollManager');
const Pick = require('./backend_models_Pick');
const PlayerMetric = require('./backend_models_PlayerMetric_Version2');

class PickBuilderService {
  constructor(options = {}) {
    this.bankrollManager = new BankrollManager(options);
    this.defaultConfidenceThreshold = options.confidenceThreshold || 75;
    this.minEVThreshold = options.minEVThreshold || 0.05; // 5% minimum EV
  }

  /**
   * Convert American odds to decimal odds
   * @param {number} americanOdds - American odds (e.g., -110, +150)
   * @returns {number} Decimal odds
   */
  americanToDecimal(americanOdds) {
    if (americanOdds > 0) {
      return (americanOdds / 100) + 1;
    } else {
      return (100 / Math.abs(americanOdds)) + 1;
    }
  }

  /**
   * Calculate implied probability from decimal odds
   * @param {number} decimalOdds - Decimal odds
   * @returns {number} Implied probability (0-1)
   */
  calculateImpliedProbability(decimalOdds) {
    return 1 / decimalOdds;
  }

  /**
   * Enhance probability based on biometric data
   * @param {number} baseProbability - Base probability from market analysis
   * @param {Object} playerMetrics - Player biometric data
   * @param {Object} marketInfo - Market type and details
   * @returns {number} Enhanced probability
   */
  enhanceProbabilityWithBiometrics(baseProbability, playerMetrics, marketInfo) {
    if (!playerMetrics) return baseProbability;

    let enhancement = 0;
    
    // BioBoost score impact (up to ±10% probability adjustment)
    if (playerMetrics.bioBoostScore) {
      const bioBoostImpact = (playerMetrics.bioBoostScore - 50) / 500; // -0.1 to +0.1
      enhancement += bioBoostImpact;
    }

    // Injury status impact
    if (playerMetrics.injuryStatus) {
      switch (playerMetrics.injuryStatus) {
        case 'Healthy':
          enhancement += 0.02;
          break;
        case 'Probable':
          enhancement -= 0.01;
          break;
        case 'Questionable':
          enhancement -= 0.05;
          break;
        case 'Doubtful':
          enhancement -= 0.15;
          break;
        case 'Out':
          return 0; // Player won't play
      }
    }

    // Weather impact based on position and market type
    if (playerMetrics.weatherTags && playerMetrics.weatherTags.length > 0) {
      const weatherImpact = this.calculateWeatherImpact(
        playerMetrics.weatherTags, 
        marketInfo
      );
      enhancement += weatherImpact;
    }

    // Sleep and recovery impact for skill positions
    if (marketInfo.requiresSkill && playerMetrics.sleepScore && playerMetrics.recoveryScore) {
      const sleepImpact = (playerMetrics.sleepScore - 75) / 1000; // ±2.5% max
      const recoveryImpact = (playerMetrics.recoveryScore - 75) / 1000; // ±2.5% max
      enhancement += sleepImpact + recoveryImpact;
    }

    // Cap enhancement to reasonable bounds
    enhancement = Math.max(-0.2, Math.min(0.2, enhancement));
    
    // Apply enhancement to base probability
    const enhancedProbability = baseProbability + enhancement;
    
    // Ensure result is within valid probability range
    return Math.max(0.01, Math.min(0.99, enhancedProbability));
  }

  /**
   * Calculate weather impact on player performance
   * @param {Array} weatherTags - Weather conditions
   * @param {Object} marketInfo - Market details
   * @returns {number} Weather adjustment (-0.1 to +0.1)
   */
  calculateWeatherImpact(weatherTags, marketInfo) {
    let impact = 0;
    
    weatherTags.forEach(tag => {
      switch (tag) {
        case 'high_heat':
          if (marketInfo.type === 'passing_yards') impact -= 0.02;
          if (marketInfo.type === 'rushing_yards') impact -= 0.03;
          break;
        case 'freezing':
          if (marketInfo.type === 'passing_yards') impact -= 0.03;
          if (marketInfo.type === 'receiving_yards') impact -= 0.02;
          break;
        case 'windy':
          if (marketInfo.type === 'passing_yards') impact -= 0.05;
          if (marketInfo.type === 'receiving_yards') impact -= 0.04;
          break;
        case 'wet_conditions':
          if (marketInfo.type === 'rushing_yards') impact += 0.02; // More rushing in rain
          if (marketInfo.type === 'passing_yards') impact -= 0.03;
          break;
        case 'snow':
          if (marketInfo.type === 'passing_yards') impact -= 0.04;
          if (marketInfo.type === 'rushing_yards') impact += 0.01;
          break;
      }
    });

    return Math.max(-0.1, Math.min(0.1, impact));
  }

  /**
   * Get latest player metrics for bankroll analysis
   * @param {string} playerName - Player name
   * @param {number} week - NFL week
   * @param {number} season - NFL season
   * @returns {Object} Latest player metrics
   */
  async getPlayerMetrics(playerName, week = null, season = null) {
    const query = { playerName };
    
    if (week) query.week = week;
    if (season) query.season = season;

    const metrics = await PlayerMetric.findOne(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return metrics;
  }

  /**
   * Create a pick with biometric enhancement and bankroll analysis
   * @param {Object} pickData - Raw pick data
   * @returns {Object} Enhanced pick with recommendations
   */
  async createEnhancedPick(pickData) {
    const {
      player,
      market,
      line,
      overUnder,
      odds: inputOdds,
      baseProbability,
      week,
      season,
      gameTime,
      bookmaker
    } = pickData;

    // Convert odds to decimal if needed
    const decimalOdds = typeof inputOdds === 'string' && inputOdds.startsWith('+') || inputOdds < 0 
      ? this.americanToDecimal(parseFloat(inputOdds))
      : parseFloat(inputOdds);

    // Get implied probability
    const impliedProbability = this.calculateImpliedProbability(decimalOdds);

    // Get player metrics
    const playerMetrics = await this.getPlayerMetrics(player, week, season);

    // Determine market info
    const marketInfo = this.parseMarketInfo(market, line, overUnder);

    // Enhance probability with biometrics
    const enhancedProbability = this.enhanceProbabilityWithBiometrics(
      baseProbability || impliedProbability,
      playerMetrics,
      marketInfo
    );

    // Calculate expected value
    const expectedValue = this.bankrollManager.calculateExpectedValue(
      decimalOdds, 
      enhancedProbability
    );

    // Skip picks with negative EV or below threshold
    if (expectedValue < this.minEVThreshold) {
      return {
        ...pickData,
        rejected: true,
        reason: `EV ${Math.round(expectedValue * 100)}% below ${Math.round(this.minEVThreshold * 100)}% threshold`
      };
    }

    // Calculate bankroll recommendations
    const stakeRecommendation = this.bankrollManager.calculateStake({
      odds: decimalOdds,
      winProbability: enhancedProbability,
      ev: expectedValue
    });

    // Create enhanced pick object
    const enhancedPick = {
      player,
      team: playerMetrics?.team,
      market,
      marketType: marketInfo.type,
      line,
      overUnder,
      odds: decimalOdds,
      impliedProbability,
      estimatedProbability: baseProbability,
      winProbability: enhancedProbability,
      expectedValue,
      confidence: playerMetrics?.confidence || this.defaultConfidenceThreshold,
      kellyFraction: stakeRecommendation.kellyFraction,
      adjustedKellyFraction: stakeRecommendation.adjustedFraction,
      recommendedStake: stakeRecommendation.recommendedStake,
      riskLevel: stakeRecommendation.riskLevel,
      
      // Biometric data
      bioBoostScore: playerMetrics?.bioBoostScore,
      sleepScore: playerMetrics?.sleepScore,
      recoveryScore: playerMetrics?.recoveryScore,
      injuryStatus: playerMetrics?.injuryStatus,
      weatherTags: playerMetrics?.weatherTags,
      
      // Meta data
      week,
      season,
      gameTime: new Date(gameTime),
      bookmaker,
      source: 'analysis'
    };

    return enhancedPick;
  }

  /**
   * Parse market information from market string
   * @param {string} market - Market description
   * @param {number} line - Betting line
   * @param {string} overUnder - Over/Under
   * @returns {Object} Parsed market info
   */
  parseMarketInfo(market, line, overUnder) {
    const marketLower = market.toLowerCase();
    
    let type = 'other';
    let requiresSkill = true;
    
    if (marketLower.includes('passing') && marketLower.includes('yard')) {
      type = 'passing_yards';
    } else if (marketLower.includes('rushing') && marketLower.includes('yard')) {
      type = 'rushing_yards';
    } else if (marketLower.includes('receiving') && marketLower.includes('yard')) {
      type = 'receiving_yards';
    } else if (marketLower.includes('touchdown')) {
      type = 'touchdowns';
    } else if (marketLower.includes('reception')) {
      type = 'receptions';
    }

    return { type, requiresSkill, line, overUnder };
  }

  /**
   * Process multiple picks for optimal bankroll allocation
   * @param {Array} rawPicks - Array of raw pick data
   * @returns {Object} Complete bankroll recommendation
   */
  async processBankrollRecommendation(rawPicks) {
    // Create enhanced picks
    const enhancedPicks = [];
    
    for (const rawPick of rawPicks) {
      const enhanced = await this.createEnhancedPick(rawPick);
      if (!enhanced.rejected) {
        enhancedPicks.push(enhanced);
      }
    }

    // Filter picks above confidence threshold
    const qualityPicks = enhancedPicks.filter(pick => 
      pick.confidence >= this.defaultConfidenceThreshold &&
      pick.expectedValue >= this.minEVThreshold
    );

    if (qualityPicks.length === 0) {
      return {
        recommendation: 'No qualifying picks found',
        rejected_picks: enhancedPicks.filter(p => p.rejected),
        bankroll_stats: this.bankrollManager.getBankrollStats()
      };
    }

    // Generate bankroll recommendation
    const recommendation = this.bankrollManager.processPicksRecommendation(qualityPicks);
    
    // Add metadata
    recommendation.processed_at = new Date().toISOString();
    recommendation.total_picks_analyzed = rawPicks.length;
    recommendation.qualifying_picks = qualityPicks.length;
    recommendation.rejected_picks = rawPicks.length - qualityPicks.length;

    return recommendation;
  }

  /**
   * Save picks to database
   * @param {Array} picks - Enhanced picks to save
   * @returns {Array} Saved pick documents
   */
  async savePicks(picks) {
    const savedPicks = [];
    
    for (const pickData of picks) {
      if (!pickData.rejected) {
        const pick = new Pick(pickData);
        const saved = await pick.save();
        savedPicks.push(saved);
      }
    }
    
    return savedPicks;
  }

  /**
   * Get example pick data for testing
   * @returns {Array} Sample pick data
   */
  getExamplePicks() {
    return [
      {
        player: "Josh Allen",
        market: "Over 265.5 Passing Yards",
        line: 265.5,
        overUnder: "over",
        odds: 1.9,
        baseProbability: 0.62,
        week: 1,
        season: 2024,
        gameTime: "2024-09-08T17:00:00Z",
        bookmaker: "DraftKings"
      },
      {
        player: "James Cook",
        market: "Over 58.5 Rushing Yards",
        line: 58.5,
        overUnder: "over",
        odds: 1.85,
        baseProbability: 0.59,
        week: 1,
        season: 2024,
        gameTime: "2024-09-08T17:00:00Z",
        bookmaker: "FanDuel"
      },
      {
        player: "De'Von Achane",
        market: "Under 97.5 Rush+Rec Yards",
        line: 97.5,
        overUnder: "under",
        odds: 1.9,
        baseProbability: 0.56,
        week: 1,
        season: 2024,
        gameTime: "2024-09-08T20:00:00Z",
        bookmaker: "DraftKings"
      }
    ];
  }

  /**
   * Update bankroll after settling picks
   * @param {number} newBankroll - Updated bankroll
   */
  updateBankroll(newBankroll) {
    this.bankrollManager.updateBankroll(newBankroll);
  }

  /**
   * Get current bankroll manager stats
   * @returns {Object} Current bankroll stats
   */
  getBankrollStats() {
    return this.bankrollManager.getBankrollStats();
  }
}

module.exports = PickBuilderService;