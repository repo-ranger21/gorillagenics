#!/usr/bin/env node

/**
 * Bankroll Management CLI Example
 * Demonstrates the bankroll management and staking strategies module
 */

const BankrollManager = require('./backend_utils_bankrollManager');

// Mock player metrics data for demonstration
const mockPlayerMetrics = {
  "Josh Allen": {
    playerName: "Josh Allen",
    team: "BUF",
    bioBoostScore: 92,
    sleepScore: 88,
    recoveryScore: 89,
    injuryStatus: "Healthy",
    confidence: 85,
    weatherTags: []
  },
  "James Cook": {
    playerName: "James Cook", 
    team: "BUF",
    bioBoostScore: 78,
    sleepScore: 82,
    recoveryScore: 80,
    injuryStatus: "Healthy",
    confidence: 75,
    weatherTags: []
  },
  "De'Von Achane": {
    playerName: "De'Von Achane",
    team: "MIA", 
    bioBoostScore: 85,
    sleepScore: 90,
    recoveryScore: 87,
    injuryStatus: "Probable",
    confidence: 70,
    weatherTags: ["high_humidity"]
  }
};

// Simplified pick builder for demo
class SimplifiedPickBuilder {
  constructor(bankrollOptions) {
    this.bankrollManager = new BankrollManager(bankrollOptions);
  }

  enhanceProbabilityWithBiometrics(baseProbability, playerMetrics) {
    if (!playerMetrics) return baseProbability;

    let enhancement = 0;
    
    // BioBoost score impact (up to ±10% probability adjustment)
    if (playerMetrics.bioBoostScore) {
      const bioBoostImpact = (playerMetrics.bioBoostScore - 50) / 500;
      enhancement += bioBoostImpact;
    }

    // Injury status impact
    if (playerMetrics.injuryStatus) {
      switch (playerMetrics.injuryStatus) {
        case 'Healthy': enhancement += 0.02; break;
        case 'Probable': enhancement -= 0.01; break;
        case 'Questionable': enhancement -= 0.05; break;
        case 'Doubtful': enhancement -= 0.15; break;
        case 'Out': return 0;
      }
    }

    // Cap enhancement to reasonable bounds
    enhancement = Math.max(-0.2, Math.min(0.2, enhancement));
    
    // Apply enhancement to base probability
    const enhancedProbability = baseProbability + enhancement;
    
    // Ensure result is within valid probability range
    return Math.max(0.01, Math.min(0.99, enhancedProbability));
  }

  createEnhancedPick(pickData) {
    const playerMetrics = mockPlayerMetrics[pickData.player];
    
    // Enhance probability with biometrics
    const enhancedProbability = this.enhanceProbabilityWithBiometrics(
      pickData.baseProbability,
      playerMetrics
    );

    // Calculate expected value
    const expectedValue = this.bankrollManager.calculateExpectedValue(
      pickData.odds, 
      enhancedProbability
    );

    // Calculate bankroll recommendations
    const stakeRecommendation = this.bankrollManager.calculateStake({
      odds: pickData.odds,
      winProbability: enhancedProbability,
      ev: expectedValue
    });

    return {
      player: pickData.player,
      market: pickData.market,
      odds: pickData.odds,
      ev: expectedValue,
      recommended_stake: stakeRecommendation.recommendedStake,
      risk_level: stakeRecommendation.riskLevel,
      kelly_fraction: stakeRecommendation.kellyFraction,
      enhanced_probability: enhancedProbability,
      original_probability: pickData.baseProbability
    };
  }

  processBankrollRecommendation(rawPicks) {
    const enhancedPicks = rawPicks.map(pick => {
      const playerMetrics = mockPlayerMetrics[pick.player];
      
      // Enhance probability with biometrics
      const enhancedProbability = this.enhanceProbabilityWithBiometrics(
        pick.baseProbability,
        playerMetrics
      );

      // Return pick in format expected by BankrollManager
      return {
        player: pick.player,
        market: pick.market,
        team: playerMetrics?.team,
        odds: pick.odds,
        winProbability: enhancedProbability,
        ev: this.bankrollManager.calculateExpectedValue(pick.odds, enhancedProbability)
      };
    });
    
    // Filter picks with positive EV
    const qualityPicks = enhancedPicks.filter(pick => pick.ev > 0.05);
    
    if (qualityPicks.length === 0) {
      return { error: 'No qualifying picks found' };
    }

    return this.bankrollManager.processPicksRecommendation(qualityPicks);
  }
}

async function demonstrateBankrollManagement() {
  console.log('🦍 GORILLAGENICS BANKROLL MANAGEMENT DEMO\n');
  console.log('========================================\n');

  // Initialize bankroll manager with $1000 bankroll
  const bankrollOptions = {
    bankroll: 1000,
    riskTolerance: 0.5, // Half-Kelly
    kellyCap: 0.05,     // 5% max per pick
    minStake: 10
  };

  console.log('💰 Bankroll Configuration:');
  console.log(`   Starting Bankroll: $${bankrollOptions.bankroll}`);
  console.log(`   Risk Tolerance: ${bankrollOptions.riskTolerance} (Half-Kelly)`);
  console.log(`   Kelly Cap: ${bankrollOptions.kellyCap * 100}%`);
  console.log(`   Minimum Stake: $${bankrollOptions.minStake}\n`);

  // Create simplified pick builder
  const pickBuilder = new SimplifiedPickBuilder(bankrollOptions);

  // Example picks from the problem statement
  const examplePicks = [
    {
      player: "Josh Allen",
      market: "Over 265.5 Passing Yards",
      odds: 1.9,
      baseProbability: 0.62, // 62% chance based on analysis
    },
    {
      player: "James Cook",
      market: "Over 58.5 Rushing Yards", 
      odds: 1.85,
      baseProbability: 0.59,
    },
    {
      player: "De'Von Achane",
      market: "Under 97.5 Rush+Rec Yards",
      odds: 1.9,
      baseProbability: 0.56,
    }
  ];

  console.log('📊 ANALYZING PICKS...\n');

  // Process picks for bankroll recommendation
  const recommendation = pickBuilder.processBankrollRecommendation(examplePicks);

  if (recommendation.error) {
    console.log(`❌ ${recommendation.error}`);
    return;
  }

  // Display results in the format from problem statement
  console.log('🎯 BANKROLL RECOMMENDATION:');
  console.log('============================\n');
  
  console.log(JSON.stringify({
    bankroll: recommendation.bankroll,
    risk_tolerance: recommendation.risk_tolerance,
    kelly_cap: recommendation.kelly_cap,
    parlay_recommendation: recommendation.parlay_recommendation,
    picks: recommendation.picks.map(pick => ({
      player: pick.player,
      market: pick.market,
      odds: pick.odds,
      ev: Math.round(pick.ev * 100) / 100,
      recommended_stake: pick.recommended_stake
    }))
  }, null, 2));

  console.log('\n📈 DETAILED ANALYSIS:');
  console.log('=====================\n');
  
  console.log(`Total Picks Analyzed: 3`);
  console.log(`Qualifying Picks: ${recommendation.picks.length}`);
  console.log(`Average EV: ${Math.round(recommendation.average_ev * 100)}%`);
  console.log(`Total Recommended Stake: $${recommendation.total_recommended_stake}`);
  console.log(`Bankroll Utilization: ${recommendation.bankroll_utilization}%`);
  console.log(`Correlation: ${recommendation.correlation_analysis.correlation}`);
  console.log(`Recommendation Reason: ${recommendation.correlation_analysis.reason}\n`);

  // Show individual pick analysis
  console.log('🔍 INDIVIDUAL PICK BREAKDOWN:');
  console.log('==============================\n');
  
  recommendation.picks.forEach((pick, index) => {
    console.log(`Pick ${index + 1}: ${pick.player}`);
    console.log(`   Market: ${pick.market}`);
    console.log(`   Odds: ${pick.odds} (${Math.round((1/pick.odds) * 100)}% implied)`);
    console.log(`   Expected Value: ${Math.round(pick.ev * 100)}%`);
    console.log(`   Kelly Fraction: ${Math.round(pick.kelly_fraction * 100)}%`);
    console.log(`   Recommended Stake: $${pick.recommended_stake}`);
    console.log(`   Risk Level: ${pick.risk_level}\n`);
  });

  // Show biometric enhancement details
  console.log('🧬 BIOMETRIC ENHANCEMENTS:');
  console.log('===========================\n');
  
  examplePicks.forEach((originalPick, index) => {
    const enhanced = pickBuilder.createEnhancedPick(originalPick);
    const metrics = mockPlayerMetrics[originalPick.player];
    
    console.log(`${originalPick.player}:`);
    console.log(`   BioBoost Score: ${metrics.bioBoostScore}/100`);
    console.log(`   Injury Status: ${metrics.injuryStatus}`);
    console.log(`   Original Probability: ${Math.round(originalPick.baseProbability * 100)}%`);
    console.log(`   Enhanced Probability: ${Math.round(enhanced.enhanced_probability * 100)}%`);
    console.log(`   Probability Boost: ${Math.round((enhanced.enhanced_probability - originalPick.baseProbability) * 100)}%\n`);
  });

  // Generate Notion-ready markdown
  console.log('📋 NOTION-READY MARKDOWN:');
  console.log('==========================\n');
  
  const markdown = pickBuilder.bankrollManager.generateNotionMarkdown(recommendation);
  console.log(markdown);

  console.log('\n✅ Demo completed successfully!');
  console.log('\n💡 This module can be integrated with:');
  console.log('   - Existing player metric scrapers');
  console.log('   - Weather condition APIs');  
  console.log('   - Injury report feeds');
  console.log('   - Real-time odds APIs');
  console.log('   - Database storage for tracking performance\n');
}

// Run demo if called directly
if (require.main === module) {
  demonstrateBankrollManagement().catch(console.error);
}

module.exports = { demonstrateBankrollManagement };