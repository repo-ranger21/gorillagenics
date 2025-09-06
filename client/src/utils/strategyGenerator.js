// GuerillaGenics Personalized NFL Betting Strategy Generator
// Creates customized betting strategies based on user profiles and market analysis

export function generatePersonalizedStrategy(userProfile, gameData, marketConditions = {}) {
  const {
    riskTolerance = 'medium', // 'conservative', 'medium', 'aggressive'
    bettingStyle = 'balanced', // 'value', 'contrarian', 'sharp', 'balanced'
    bankrollSize = 1000,
    unitSize = 50,
    preferredBets = ['spread', 'total'], // 'spread', 'total', 'moneyline', 'props'
    avoidanceFactors = [], // 'primetime', 'divisional', 'weather', 'travel'
    experience = 'intermediate' // 'beginner', 'intermediate', 'advanced'
  } = userProfile;

  const strategies = [];

  gameData.forEach(game => {
    const gameStrategy = analyzeGameForStrategy(game, userProfile, marketConditions);
    if (gameStrategy.confidence > getMinConfidenceThreshold(riskTolerance)) {
      strategies.push(gameStrategy);
    }
  });

  // Sort by confidence and filter by risk tolerance
  const filteredStrategies = strategies
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, getMaxRecommendations(riskTolerance));

  return {
    strategies: filteredStrategies,
    bankrollManagement: calculateBankrollAllocation(filteredStrategies, userProfile),
    riskAssessment: assessOverallRisk(filteredStrategies),
    personalizedTips: generatePersonalizedTips(userProfile, filteredStrategies)
  };
}

function analyzeGameForStrategy(game, userProfile, marketConditions) {
  const { riskTolerance, bettingStyle, avoidanceFactors, preferredBets } = userProfile;

  let confidence = 0;
  let recommendedBets = [];
  let reasoning = [];

  // Analyze BioBoost score alignment with user style
  const bioBoostAnalysis = analyzeBioBoostForUser(game.bioBoost, bettingStyle);
  confidence += bioBoostAnalysis.confidence;
  reasoning.push(bioBoostAnalysis.reason);

  // Check avoidance factors
  const avoidanceCheck = checkAvoidanceFactors(game, avoidanceFactors);
  if (avoidanceCheck.shouldAvoid) {
    return {
      gameId: game.id,
      matchup: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
      recommended: false,
      reason: avoidanceCheck.reason,
      confidence: 0
    };
  }

  // Generate specific bet recommendations
  if (preferredBets.includes('spread')) {
    const spreadAnalysis = analyzeSpread(game, userProfile);
    if (spreadAnalysis.recommended) {
      recommendedBets.push(spreadAnalysis);
      confidence += spreadAnalysis.confidence;
      reasoning.push(spreadAnalysis.reasoning);
    }
  }

  if (preferredBets.includes('total')) {
    const totalAnalysis = analyzeTotal(game, userProfile);
    if (totalAnalysis.recommended) {
      recommendedBets.push(totalAnalysis);
      confidence += totalAnalysis.confidence;
      reasoning.push(totalAnalysis.reasoning);
    }
  }

  if (preferredBets.includes('moneyline')) {
    const moneylineAnalysis = analyzeMoneyline(game, userProfile);
    if (moneylineAnalysis.recommended) {
      recommendedBets.push(moneylineAnalysis);
      confidence += moneylineAnalysis.confidence;
      reasoning.push(moneylineAnalysis.reasoning);
    }
  }

  // Adjust confidence based on risk tolerance
  confidence = adjustConfidenceForRisk(confidence, riskTolerance);

  return {
    gameId: game.id,
    matchup: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
    timeSlot: game.timeSlot,
    recommended: recommendedBets.length > 0 && confidence > 0,
    bets: recommendedBets,
    overallConfidence: Math.min(100, Math.max(0, confidence)),
    reasoning: reasoning,
    riskLevel: calculateRiskLevel(game, recommendedBets),
    expectedValue: calculateExpectedValue(recommendedBets, game),
    bankrollRecommendation: calculateBetSize(confidence, userProfile)
  };
}

function analyzeBioBoostForUser(bioBoost, bettingStyle) {
  const score = bioBoost.score || 50;

  switch (bettingStyle) {
    case 'value':
      // Value bettors look for market inefficiencies
      if (score > 65 || score < 35) {
        return {
          confidence: 15,
          reason: `🎯 Value spotted: BioBoost ${score} suggests market mispricing`
        };
      }
      return { confidence: 0, reason: 'No clear value detected' };

    case 'contrarian':
      // Contrarian bettors fade the public
      if (score >= 45 && score <= 55) {
        return {
          confidence: 12,
          reason: `🦍 Contrarian play: Market consensus, but BioBoost neutral at ${score}`
        };
      }
      return { confidence: 0, reason: 'Not a contrarian spot' };

    case 'sharp':
      // Sharp bettors focus on high-confidence edges
      if (score > 70 || score < 30) {
        return {
          confidence: 20,
          reason: `⚡ Sharp edge: Strong BioBoost signal at ${score}`
        };
      }
      return { confidence: 0, reason: 'Edge not strong enough for sharp play' };

    case 'balanced':
    default:
      // Balanced approach considers moderate edges
      if (score > 60 || score < 40) {
        return {
          confidence: 10,
          reason: `⚖️ Solid spot: BioBoost ${score} shows clear lean`
        };
      }
      return { confidence: 5, reason: 'Moderate BioBoost signal' };
  }
}

function checkAvoidanceFactors(game, avoidanceFactors) {
  for (const factor of avoidanceFactors) {
    switch (factor) {
      case 'primetime':
        if (['Thursday', 'SNF', 'MNF'].includes(game.timeSlot)) {
          return {
            shouldAvoid: true,
            reason: `🌙 Avoiding primetime game (${game.timeSlot}) per your preferences`
          };
        }
        break;

      case 'divisional':
        // Mock divisional check (in real app, would check team divisions)
        if (Math.random() < 0.25) { // 25% chance it's divisional
          return {
            shouldAvoid: true,
            reason: `🏆 Avoiding divisional matchup per your preferences`
          };
        }
        break;

      case 'weather':
        if (game.bioBoost.factors?.weather?.windMph > 20 || 
            game.bioBoost.factors?.weather?.precipChance > 70) {
          return {
            shouldAvoid: true,
            reason: `🌧️ Avoiding weather-impacted game per your preferences`
          };
        }
        break;

      case 'travel':
        if (game.bioBoost.factors?.travelMiles > 2000) {
          return {
            shouldAvoid: true,
            reason: `✈️ Avoiding long-travel game per your preferences`
          };
        }
        break;
    }
  }

  return { shouldAvoid: false };
}

function analyzeSpread(game, userProfile) {
  const bioBoost = game.bioBoost.score || 50;
  const spread = Math.abs(game.awayTeam.spreadValue);

  let confidence = 0;
  let side = '';
  let reasoning = '';

  // Large spreads with strong BioBoost signals
  if (spread >= 7 && bioBoost > 65) {
    confidence = 15;
    side = game.awayTeam.spreadValue > 0 ? game.awayTeam.abbreviation : game.homeTeam.abbreviation;
    reasoning = `Large spread with strong BioBoost (${bioBoost}) favoring ${side}`;
  }

  // Small spreads with moderate signals
  else if (spread <= 3 && (bioBoost > 55 || bioBoost < 45)) {
    confidence = 10;
    side = bioBoost > 55 ? 
      (game.awayTeam.spreadValue < 0 ? game.awayTeam.abbreviation : game.homeTeam.abbreviation) :
      (game.awayTeam.spreadValue > 0 ? game.awayTeam.abbreviation : game.homeTeam.abbreviation);
    reasoning = `Close spread with BioBoost lean (${bioBoost}) toward ${side}`;
  }

  return {
    type: 'spread',
    recommended: confidence > 0,
    confidence,
    side,
    line: spread,
    reasoning
  };
}

function analyzeTotal(game, userProfile) {
  const bioBoost = game.bioBoost.score || 50;
  const total = game.overUnder;
  const recommendation = game.bioBoost.recommendation;

  let confidence = 0;
  let reasoning = '';

  // Strong BioBoost signals on totals
  if (bioBoost > 70 && recommendation === 'OVER') {
    confidence = 18;
    reasoning = `Strong OVER signal - BioBoost ${bioBoost} with ${total} total`;
  } else if (bioBoost < 30 && recommendation === 'UNDER') {
    confidence = 18;
    reasoning = `Strong UNDER signal - BioBoost ${bioBoost} with ${total} total`;
  }

  // Moderate signals
  else if (bioBoost > 60 && recommendation === 'OVER') {
    confidence = 12;
    reasoning = `Moderate OVER lean - BioBoost ${bioBoost}`;
  } else if (bioBoost < 40 && recommendation === 'UNDER') {
    confidence = 12;
    reasoning = `Moderate UNDER lean - BioBoost ${bioBoost}`;
  }

  return {
    type: 'total',
    recommended: confidence > 0,
    confidence,
    side: recommendation,
    line: total,
    reasoning
  };
}

function analyzeMoneyline(game, userProfile) {
  const bioBoost = game.bioBoost.score || 50;
  const { riskTolerance } = userProfile;

  // Only recommend moneylines for conservative players on heavy favorites
  // or aggressive players on strong underdogs with good BioBoost

  let confidence = 0;
  let side = '';
  let reasoning = '';

  const awaySpread = game.awayTeam.spreadValue;
  const homeSpread = game.homeTeam.spreadValue;

  if (riskTolerance === 'conservative') {
    // Heavy favorites with good BioBoost
    if (awaySpread < -6 && bioBoost > 65) {
      confidence = 8;
      side = game.awayTeam.abbreviation;
      reasoning = `Conservative ML play: Heavy favorite with strong BioBoost ${bioBoost}`;
    } else if (homeSpread < -6 && bioBoost > 65) {
      confidence = 8;
      side = game.homeTeam.abbreviation;
      reasoning = `Conservative ML play: Heavy favorite with strong BioBoost ${bioBoost}`;
    }
  } else if (riskTolerance === 'aggressive') {
    // Underdogs with strong BioBoost
    if (awaySpread >= 3 && bioBoost > 70) {
      confidence = 12;
      side = game.awayTeam.abbreviation;
      reasoning = `Aggressive ML play: Underdog with exceptional BioBoost ${bioBoost}`;
    } else if (homeSpread >= 3 && bioBoost > 70) {
      confidence = 12;
      side = game.homeTeam.abbreviation;
      reasoning = `Aggressive ML play: Underdog with exceptional BioBoost ${bioBoost}`;
    }
  }

  return {
    type: 'moneyline',
    recommended: confidence > 0,
    confidence,
    side,
    reasoning
  };
}

function getMinConfidenceThreshold(riskTolerance) {
  switch (riskTolerance) {
    case 'conservative': return 15;
    case 'medium': return 10;
    case 'aggressive': return 5;
    default: return 10;
  }
}

function getMaxRecommendations(riskTolerance) {
  switch (riskTolerance) {
    case 'conservative': return 3;
    case 'medium': return 5;
    case 'aggressive': return 8;
    default: return 5;
  }
}

function adjustConfidenceForRisk(confidence, riskTolerance) {
  // Input validation
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 100) {
    console.warn('🦍 Invalid confidence score, using default');
    confidence = 50;
  }

  const adjustments = {
    'low': -10,
    'medium': 0, 
    'high': +5
  };

  const adjustment = adjustments[riskTolerance] || 0;
  return Math.max(0, Math.min(100, confidence + adjustment));
}

function validateBankrollManagement(userProfile, recommendedBetSize) {
  const { bankrollSize, maxBetSize, totalWeeklyLimit } = userProfile;

  // Responsible gambling checks
  if (recommendedBetSize > bankrollSize * 0.1) {
    console.warn('🦍 Bet size exceeds 10% of bankroll - reducing');
    return bankrollSize * 0.05; // Cap at 5%
  }

  if (maxBetSize && recommendedBetSize > maxBetSize) {
    console.warn('🦍 Bet size exceeds user maximum - capping');
    return maxBetSize;
  }

  // Weekly limit check (would need session storage)
  const weeklySpent = getWeeklySpending(userProfile.userId); // Implement this
  if (totalWeeklyLimit && (weeklySpent + recommendedBetSize) > totalWeeklyLimit) {
    console.warn('🦍 Bet would exceed weekly limit');
    return Math.max(0, totalWeeklyLimit - weeklySpent);
  }

  return recommendedBetSize;
}

function getWeeklySpending(userId) {
  // This should track actual weekly spending
  // For now, return 0 as placeholder
  return 0;
}

function calculateBankrollAllocation(strategies, userProfile) {
  const { bankrollSize, unitSize } = userProfile;
  const totalUnits = strategies.reduce((sum, strategy) => 
    sum + strategy.bankrollRecommendation, 0
  );

  // Apply bankroll validation to each recommended bet size
  const validatedAllocations = strategies.map(strategy => {
    const validatedSize = validateBankrollManagement(userProfile, strategy.bankrollRecommendation * userProfile.unitSize);
    return {
      ...strategy,
      bankrollRecommendation: validatedSize / userProfile.unitSize // convert back to units
    };
  });
  
  const validatedTotalUnits = validatedAllocations.reduce((sum, strategy) => 
    sum + strategy.bankrollRecommendation, 0
  );


  return {
    totalUnits: validatedTotalUnits,
    totalRisk: (validatedTotalUnits * unitSize),
    riskPercentage: ((validatedTotalUnits * unitSize) / bankrollSize) * 100,
    recommendation: validatedTotalUnits <= 5 ? 'Conservative allocation' :
                   validatedTotalUnits <= 8 ? 'Moderate allocation' : 'Aggressive allocation'
  };
}

function assessOverallRisk(strategies) {
  const avgConfidence = strategies.reduce((sum, s) => sum + s.overallConfidence, 0) / strategies.length;
  const highRiskCount = strategies.filter(s => s.riskLevel === 'high').length;

  return {
    level: highRiskCount > 2 ? 'high' : avgConfidence > 70 ? 'moderate' : 'low',
    description: `${strategies.length} recommended bets with ${avgConfidence.toFixed(0)}% avg confidence`
  };
}

function generatePersonalizedTips(userProfile, strategies) {
  const tips = [];
  const { riskTolerance, experience, bettingStyle } = userProfile;

  if (experience === 'beginner') {
    tips.push('🎓 Start with smaller unit sizes until you build confidence');
    tips.push('📚 Focus on learning one bet type well before expanding');
  }

  if (riskTolerance === 'conservative' && strategies.length > 3) {
    tips.push('🛡️ Consider reducing bet count to maintain conservative approach');
  }

  if (bettingStyle === 'value' && strategies.filter(s => s.overallConfidence > 80).length === 0) {
    tips.push('💎 No high-value spots found - consider waiting for better opportunities');
  }

  tips.push('🦍 Remember: BioBoost scores are one factor - trust your research!');

  return tips;
}

function calculateRiskLevel(game, bets) {
  const hasMoneyline = bets.some(bet => bet.type === 'moneyline');
  const avgConfidence = bets.reduce((sum, bet) => sum + bet.confidence, 0) / bets.length;

  if (hasMoneyline || avgConfidence < 40) return 'high';
  if (avgConfidence > 70) return 'low';
  return 'moderate';
}

function calculateExpectedValue(bets, game) {
  // Simplified EV calculation based on confidence
  const avgConfidence = bets.reduce((sum, bet) => sum + bet.confidence, 0) / bets.length;
  const impliedWinRate = (avgConfidence / 100) * 1.1; // Slight boost for confidence
  return ((impliedWinRate * 1.91) - 1) * 100; // Assuming -110 odds
}

function calculateBetSize(confidence, userProfile) {
  const { riskTolerance, unitSize, bankrollSize } = userProfile;
  const baseSize = unitSize / bankrollSize; // Base percentage

  // Kelly-inspired sizing based on confidence
  const confidentMultiplier = Math.min(confidence / 50, 2); // Max 2x multiplier

  let recommendedUnits = Math.max(0.5, confidentMultiplier);

  // Risk tolerance adjustment
  if (riskTolerance === 'conservative') recommendedUnits *= 0.7;
  if (riskTolerance === 'aggressive') recommendedUnits *= 1.3;

  return Math.min(recommendedUnits, 3); // Cap at 3 units
}

// Default user profiles for quick setup
export const DEFAULT_PROFILES = {
  conservative: {
    riskTolerance: 'conservative',
    bettingStyle: 'value',
    bankrollSize: 1000,
    unitSize: 25,
    preferredBets: ['spread', 'total'],
    avoidanceFactors: ['weather', 'travel'],
    experience: 'intermediate'
  },

  balanced: {
    riskTolerance: 'medium',
    bettingStyle: 'balanced',
    bankrollSize: 1000,
    unitSize: 50,
    preferredBets: ['spread', 'total', 'moneyline'],
    avoidanceFactors: [],
    experience: 'intermediate'
  },

  aggressive: {
    riskTolerance: 'aggressive',
    bettingStyle: 'sharp',
    bankrollSize: 1000,
    unitSize: 75,
    preferredBets: ['spread', 'total', 'moneyline'],
    avoidanceFactors: [],
    experience: 'advanced'
  }
};