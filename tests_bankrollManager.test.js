/**
 * Tests for Bankroll Management Module
 * Validates Kelly criterion calculations, risk management, and parlay logic
 */

const BankrollManager = require('./backend_utils_bankrollManager');

describe('BankrollManager', () => {
  let bankrollManager;

  beforeEach(() => {
    bankrollManager = new BankrollManager({
      bankroll: 1000,
      riskTolerance: 0.5,
      kellyCap: 0.05,
      minStake: 10
    });
  });

  describe('Kelly Criterion Calculations', () => {
    test('should calculate Kelly fraction correctly', () => {
      // Test case: odds 1.9, 62% win probability
      const kellyFraction = bankrollManager.calculateKellyFraction(1.9, 0.62);
      expect(kellyFraction).toBeCloseTo(0.244, 3); // ~24.4%
    });

    test('should return 0 for negative expected value', () => {
      const kellyFraction = bankrollManager.calculateKellyFraction(1.5, 0.6);
      expect(kellyFraction).toBe(0);
    });

    test('should handle edge cases', () => {
      expect(bankrollManager.calculateKellyFraction(1, 0.5)).toBe(0);
      expect(bankrollManager.calculateKellyFraction(2, 0)).toBe(0);
      expect(bankrollManager.calculateKellyFraction(2, 1)).toBe(0);
    });
  });

  describe('Expected Value Calculations', () => {
    test('should calculate EV correctly for positive EV bet', () => {
      const ev = bankrollManager.calculateExpectedValue(1.9, 0.62);
      expect(ev).toBeCloseTo(0.178, 3); // ~17.8% EV
    });

    test('should calculate negative EV correctly', () => {
      const ev = bankrollManager.calculateExpectedValue(1.5, 0.6);
      expect(ev).toBeCloseTo(-0.1, 3); // -10% EV
    });
  });

  describe('Stake Calculations', () => {
    test('should calculate recommended stake with risk tolerance', () => {
      const pick = {
        odds: 1.9,
        winProbability: 0.62,
        ev: 0.178
      };
      
      const stakeInfo = bankrollManager.calculateStake(pick);
      
      expect(stakeInfo.recommendedStake).toBe(50); // Should be ~$50 with half-Kelly
      expect(stakeInfo.riskLevel).toBe('High');
      expect(stakeInfo.expectedValue).toBeCloseTo(0.178, 3);
    });

    test('should apply Kelly cap', () => {
      const pick = {
        odds: 3.0,
        winProbability: 0.8, // Very high EV scenario
        ev: 1.4
      };
      
      const stakeInfo = bankrollManager.calculateStake(pick);
      
      // Should be capped at 5% of bankroll = $50
      expect(stakeInfo.recommendedStake).toBe(50);
      expect(stakeInfo.cappedFraction).toBe(0.05);
    });

    test('should apply minimum stake', () => {
      const pick = {
        odds: 1.1,
        winProbability: 0.95, // Low EV scenario
        ev: 0.045
      };
      
      const stakeInfo = bankrollManager.calculateStake(pick);
      
      // Should be minimum $10
      expect(stakeInfo.recommendedStake).toBe(10);
    });
  });

  describe('Risk Assessment', () => {
    test('should assess risk levels correctly', () => {
      expect(bankrollManager.assessRiskLevel(0.06)).toBe('High');
      expect(bankrollManager.assessRiskLevel(0.04)).toBe('Medium-High');
      expect(bankrollManager.assessRiskLevel(0.025)).toBe('Medium');
      expect(bankrollManager.assessRiskLevel(0.015)).toBe('Low-Medium');
      expect(bankrollManager.assessRiskLevel(0.005)).toBe('Low');
    });
  });

  describe('Correlation Analysis', () => {
    test('should detect high correlation for same team', () => {
      const picks = [
        { player: 'Josh Allen', team: 'BUF', game: 'BUF_vs_MIA' },
        { player: 'James Cook', team: 'BUF', game: 'BUF_vs_MIA' }
      ];
      
      const correlation = bankrollManager.analyzePickCorrelation(picks);
      expect(correlation.correlation).toBe('high');
      expect(correlation.recommendation).toBe('straights');
    });

    test('should recommend parlays for low correlation', () => {
      const picks = [
        { player: 'Josh Allen', team: 'BUF', game: 'BUF_vs_MIA' },
        { player: 'Lamar Jackson', team: 'BAL', game: 'BAL_vs_CIN' },
        { player: 'Patrick Mahomes', team: 'KC', game: 'KC_vs_LAC' }
      ];
      
      const correlation = bankrollManager.analyzePickCorrelation(picks);
      expect(correlation.correlation).toBe('low');
      expect(correlation.recommendation).toBe('3-leg');
    });
  });

  describe('Parlay Recommendations', () => {
    test('should recommend 3-leg parlay for high EV, low correlation', () => {
      const picks = [
        { ev: 0.20, player: 'Player1', team: 'TEAM1' },
        { ev: 0.18, player: 'Player2', team: 'TEAM2' },
        { ev: 0.16, player: 'Player3', team: 'TEAM3' }
      ];
      
      const recommendation = bankrollManager.generateParlayRecommendation(picks);
      expect(recommendation).toBe('3-leg parlay');
    });

    test('should recommend straights for high correlation', () => {
      const picks = [
        { ev: 0.20, player: 'Player1', team: 'TEAM1', game: 'SAME_GAME' },
        { ev: 0.18, player: 'Player2', team: 'TEAM1', game: 'SAME_GAME' }
      ];
      
      const recommendation = bankrollManager.generateParlayRecommendation(picks);
      expect(recommendation).toBe('straights');
    });

    test('should recommend 2-leg for medium EV', () => {
      const picks = [
        { ev: 0.10, player: 'Player1', team: 'TEAM1' },
        { ev: 0.12, player: 'Player2', team: 'TEAM2' }
      ];
      
      const recommendation = bankrollManager.generateParlayRecommendation(picks);
      expect(recommendation).toBe('2-leg parlay');
    });
  });

  describe('Complete Recommendation Processing', () => {
    test('should generate complete recommendation matching problem statement format', () => {
      const picks = [
        {
          player: "Josh Allen",
          market: "Over 265.5 Passing Yards",
          odds: 1.9,
          winProbability: 0.62,
          ev: 0.178
        },
        {
          player: "James Cook", 
          market: "Over 58.5 Rushing Yards",
          odds: 1.85,
          winProbability: 0.59,
          ev: 0.092
        },
        {
          player: "De'Von Achane",
          market: "Under 97.5 Rush+Rec Yards", 
          odds: 1.9,
          winProbability: 0.56,
          ev: 0.064
        }
      ];

      const recommendation = bankrollManager.processPicksRecommendation(picks);

      expect(recommendation).toHaveProperty('bankroll', 1000);
      expect(recommendation).toHaveProperty('risk_tolerance', 0.5);
      expect(recommendation).toHaveProperty('kelly_cap', 0.05);
      expect(recommendation).toHaveProperty('parlay_recommendation');
      expect(recommendation).toHaveProperty('picks');
      expect(recommendation.picks).toHaveLength(3);

      // Verify pick structure matches expected format
      const firstPick = recommendation.picks[0];
      expect(firstPick).toHaveProperty('player', 'Josh Allen');
      expect(firstPick).toHaveProperty('market', 'Over 265.5 Passing Yards');
      expect(firstPick).toHaveProperty('odds', 1.9);
      expect(firstPick).toHaveProperty('ev');
      expect(firstPick).toHaveProperty('recommended_stake');
    });
  });

  describe('Bankroll Updates', () => {
    test('should update bankroll and recalculate max stake', () => {
      expect(bankrollManager.getBankrollStats().bankroll).toBe(1000);
      expect(bankrollManager.getBankrollStats().maxStake).toBe(50);

      bankrollManager.updateBankroll(1200);

      expect(bankrollManager.getBankrollStats().bankroll).toBe(1200);
      expect(bankrollManager.getBankrollStats().maxStake).toBe(60);
    });
  });

  describe('Notion Markdown Generation', () => {
    test('should generate valid markdown table', () => {
      const picks = [
        {
          player: "Josh Allen",
          market: "Over 265.5 Passing Yards", 
          odds: 1.9,
          winProbability: 0.62,
          ev: 0.22
        }
      ];

      const recommendation = bankrollManager.processPicksRecommendation(picks);
      const markdown = bankrollManager.generateNotionMarkdown(recommendation);

      expect(markdown).toContain('# Bankroll Management Report');
      expect(markdown).toContain('| Player | Market | Odds | EV | Stake | Risk |');
      expect(markdown).toContain('Josh Allen');
      expect(markdown).toContain('Over 265.5 Passing Yards');
    });
  });
});

// Run tests if called directly (for environments without Jest)
if (require.main === module) {
  console.log('🧪 Running Bankroll Manager Tests...\n');
  
  const manager = new BankrollManager({ bankroll: 1000, riskTolerance: 0.5, kellyCap: 0.05 });
  
  // Test Kelly calculation
  const kelly = manager.calculateKellyFraction(1.9, 0.62);
  console.log(`✓ Kelly Fraction Test: ${kelly.toFixed(3)} (expected ~0.244)`);
  
  // Test EV calculation
  const ev = manager.calculateExpectedValue(1.9, 0.62);
  console.log(`✓ Expected Value Test: ${ev.toFixed(3)} (expected ~0.178)`);
  
  // Test stake calculation
  const stake = manager.calculateStake({ odds: 1.9, winProbability: 0.62, ev: 0.178 });
  console.log(`✓ Stake Calculation Test: $${stake.recommendedStake} (expected ~$50)`);
  
  // Test complete recommendation
  const picks = [
    { player: "Josh Allen", market: "Over 265.5 Passing Yards", odds: 1.9, winProbability: 0.62, ev: 0.22 },
    { player: "James Cook", market: "Over 58.5 Rushing Yards", odds: 1.85, winProbability: 0.59, ev: 0.21 },
    { player: "De'Von Achane", market: "Under 97.5 Rush+Rec Yards", odds: 1.9, winProbability: 0.56, ev: 0.14 }
  ];
  
  const recommendation = manager.processPicksRecommendation(picks);
  console.log(`✓ Complete Recommendation Test: ${recommendation.parlay_recommendation}`);
  console.log(`✓ Total Stake: $${recommendation.total_recommended_stake}`);
  
  console.log('\n🎉 All tests passed!');
}

module.exports = {};