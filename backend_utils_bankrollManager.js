/**
 * Bankroll Management and Staking Strategies Module
 * Implements Kelly Criterion, risk management, and parlay recommendations
 */

class BankrollManager {
  constructor(options = {}) {
    this.bankroll = options.bankroll || 1000;
    this.riskTolerance = options.riskTolerance || 0.5; // Half-Kelly default
    this.kellyCap = options.kellyCap || 0.05; // 5% max stake per pick
    this.minStake = options.minStake || 10;
    this.maxStake = options.maxStake || this.bankroll * this.kellyCap;
  }

  /**
   * Calculate optimal Kelly fraction for a given pick
   * @param {number} odds - Decimal odds (e.g., 1.9 for -110)
   * @param {number} winProbability - Estimated win probability (0-1)
   * @returns {number} Kelly fraction (0-1)
   */
  calculateKellyFraction(odds, winProbability) {
    if (odds <= 1 || winProbability <= 0 || winProbability >= 1) {
      return 0;
    }
    
    const b = odds - 1; // Net odds received
    const p = winProbability;
    const q = 1 - p;
    
    const kellyFraction = (b * p - q) / b;
    return Math.max(0, kellyFraction);
  }

  /**
   * Calculate expected value for a pick
   * @param {number} odds - Decimal odds
   * @param {number} winProbability - Estimated win probability (0-1)
   * @returns {number} Expected value as decimal (e.g., 0.22 for 22% EV)
   */
  calculateExpectedValue(odds, winProbability) {
    return (odds * winProbability) - 1;
  }

  /**
   * Calculate recommended stake for a pick
   * @param {Object} pick - Pick object with odds and estimated win probability
   * @returns {Object} Stake recommendation with details
   */
  calculateStake(pick) {
    const { odds, winProbability, ev } = pick;
    
    // Calculate Kelly fraction
    const kellyFraction = this.calculateKellyFraction(odds, winProbability);
    
    // Apply risk tolerance (half-Kelly, quarter-Kelly, etc.)
    const adjustedFraction = kellyFraction * this.riskTolerance;
    
    // Apply Kelly cap
    const cappedFraction = Math.min(adjustedFraction, this.kellyCap);
    
    // Calculate raw stake
    const rawStake = this.bankroll * cappedFraction;
    
    // Apply min/max constraints
    let recommendedStake = Math.max(rawStake, this.minStake);
    recommendedStake = Math.min(recommendedStake, this.maxStake);
    
    // Round to nearest dollar
    recommendedStake = Math.round(recommendedStake);
    
    return {
      kellyFraction,
      adjustedFraction,
      cappedFraction,
      recommendedStake,
      expectedValue: ev || this.calculateExpectedValue(odds, winProbability),
      riskLevel: this.assessRiskLevel(cappedFraction)
    };
  }

  /**
   * Assess risk level based on fraction of bankroll
   * @param {number} fraction - Fraction of bankroll being risked
   * @returns {string} Risk level description
   */
  assessRiskLevel(fraction) {
    if (fraction >= 0.05) return 'High';
    if (fraction >= 0.03) return 'Medium-High';
    if (fraction >= 0.02) return 'Medium';
    if (fraction >= 0.01) return 'Low-Medium';
    return 'Low';
  }

  /**
   * Analyze correlation between picks for parlay recommendations
   * @param {Array} picks - Array of pick objects
   * @returns {Object} Correlation analysis
   */
  analyzePickCorrelation(picks) {
    if (picks.length < 2) return { correlation: 'none', recommendation: 'single' };

    // Simplified correlation analysis based on player/team/game
    const teams = new Set();
    const games = new Set();
    const players = new Set();
    
    picks.forEach(pick => {
      if (pick.team) teams.add(pick.team);
      if (pick.game) games.add(pick.game);
      if (pick.player) players.add(pick.player);
    });

    const uniqueTeams = teams.size;
    const uniqueGames = games.size;
    const uniquePlayers = players.size;

    // High correlation if same team/game
    if (uniqueTeams === 1 || uniqueGames === 1) {
      return { 
        correlation: 'high', 
        recommendation: 'straights',
        reason: 'Same team/game correlation detected'
      };
    }

    // Medium correlation if limited games
    if (uniqueGames <= 2 && picks.length >= 3) {
      return { 
        correlation: 'medium', 
        recommendation: '2-leg',
        reason: 'Limited games increase correlation'
      };
    }

    // Low correlation - good for parlays
    return { 
      correlation: 'low', 
      recommendation: '3-leg',
      reason: 'Low correlation suitable for parlays'
    };
  }

  /**
   * Generate parlay recommendations based on picks
   * @param {Array} picks - Array of pick objects with EV and correlation data
   * @returns {string} Recommended parlay strategy
   */
  generateParlayRecommendation(picks) {
    if (picks.length < 2) return 'single';
    
    const avgEV = picks.reduce((sum, pick) => sum + (pick.ev || 0), 0) / picks.length;
    const correlation = this.analyzePickCorrelation(picks);
    
    // High EV threshold for parlays
    const highEVThreshold = 0.15;
    const mediumEVThreshold = 0.08;
    
    // Decision logic
    if (correlation.correlation === 'high') {
      return 'straights'; // Avoid correlated parlays
    }
    
    if (avgEV >= highEVThreshold && correlation.correlation === 'low') {
      return '3-leg parlay';
    }
    
    if (avgEV >= mediumEVThreshold && picks.length >= 2) {
      return '2-leg parlay';
    }
    
    return 'straights';
  }

  /**
   * Process multiple picks and generate complete bankroll recommendation
   * @param {Array} picks - Array of pick objects
   * @returns {Object} Complete bankroll management recommendation
   */
  processPicksRecommendation(picks) {
    const processedPicks = picks.map(pick => {
      const stakeInfo = this.calculateStake(pick);
      return {
        player: pick.player,
        market: pick.market,
        team: pick.team,
        game: pick.game,
        odds: pick.odds,
        ev: stakeInfo.expectedValue,
        recommended_stake: stakeInfo.recommendedStake,
        risk_level: stakeInfo.riskLevel,
        kelly_fraction: stakeInfo.kellyFraction
      };
    });

    const parlayRecommendation = this.generateParlayRecommendation(processedPicks);
    const correlation = this.analyzePickCorrelation(picks);
    const totalStake = processedPicks.reduce((sum, pick) => sum + pick.recommended_stake, 0);
    const avgEV = processedPicks.reduce((sum, pick) => sum + pick.ev, 0) / processedPicks.length;

    return {
      bankroll: this.bankroll,
      risk_tolerance: this.riskTolerance,
      kelly_cap: this.kellyCap,
      parlay_recommendation: parlayRecommendation,
      correlation_analysis: correlation,
      total_recommended_stake: totalStake,
      average_ev: Math.round(avgEV * 10000) / 10000,
      bankroll_utilization: Math.round((totalStake / this.bankroll) * 10000) / 100,
      picks: processedPicks
    };
  }

  /**
   * Generate Notion-ready markdown table
   * @param {Object} recommendation - Bankroll recommendation object
   * @returns {string} Markdown formatted table
   */
  generateNotionMarkdown(recommendation) {
    let markdown = `# Bankroll Management Report\n\n`;
    markdown += `**Bankroll:** $${recommendation.bankroll}\n`;
    markdown += `**Risk Tolerance:** ${recommendation.risk_tolerance} (${Math.round(recommendation.risk_tolerance * 100)}%)\n`;
    markdown += `**Kelly Cap:** ${Math.round(recommendation.kelly_cap * 100)}%\n`;
    markdown += `**Recommendation:** ${recommendation.parlay_recommendation}\n`;
    markdown += `**Total Stake:** $${recommendation.total_recommended_stake}\n`;
    markdown += `**Bankroll Utilization:** ${recommendation.bankroll_utilization}%\n\n`;

    markdown += `## Picks Analysis\n\n`;
    markdown += `| Player | Market | Odds | EV | Stake | Risk |\n`;
    markdown += `|--------|--------|------|----|----- |----- |\n`;
    
    recommendation.picks.forEach(pick => {
      markdown += `| ${pick.player} | ${pick.market} | ${pick.odds} | ${Math.round(pick.ev * 100)}% | $${pick.recommended_stake} | ${pick.risk_level} |\n`;
    });

    markdown += `\n**Correlation Analysis:** ${recommendation.correlation_analysis.reason}\n`;
    
    return markdown;
  }

  /**
   * Update bankroll after wins/losses
   * @param {number} newBankroll - Updated bankroll amount
   */
  updateBankroll(newBankroll) {
    this.bankroll = newBankroll;
    this.maxStake = this.bankroll * this.kellyCap;
  }

  /**
   * Get current bankroll stats
   * @returns {Object} Current bankroll information
   */
  getBankrollStats() {
    return {
      bankroll: this.bankroll,
      riskTolerance: this.riskTolerance,
      kellyCap: this.kellyCap,
      maxStake: this.maxStake,
      minStake: this.minStake
    };
  }
}

module.exports = BankrollManager;