// GuerillaGenics Injury Impact Probability Calculator
// Calculates injury impact probabilities for teams and individual players

// Position impact weights (0-1 scale, higher = more impact)
export const POSITION_WEIGHTS = {
  QB: 0.95,     // Quarterback - highest impact
  RB: 0.75,     // Running Back - high rushing impact
  WR1: 0.70,    // WR1 - primary receiving threat
  WR2: 0.50,    // WR2 - secondary receiver
  WR3: 0.30,    // WR3 - depth receiver
  TE: 0.55,     // Tight End - dual threat
  LT: 0.85,     // Left Tackle - protect QB blind side
  RT: 0.65,     // Right Tackle
  LG: 0.60,     // Left Guard
  RG: 0.60,     // Right Guard
  C: 0.70,      // Center - snapper and line captain
  EDGE: 0.65,   // Edge Rusher
  DT: 0.55,     // Defensive Tackle
  LB: 0.50,     // Linebacker
  CB1: 0.60,    // CB1 - covers top receiver
  CB2: 0.45,    // CB2 - covers second receiver
  S: 0.50,      // Safety
  K: 0.15,      // Kicker
  P: 0.10       // Punter
};

// Injury severity impact multipliers
export const INJURY_SEVERITY = {
  OUT: { multiplier: 1.0, probability: 0.0, label: 'Out', color: 'red' },
  DOUBTFUL: { multiplier: 0.8, probability: 0.25, label: 'Doubtful', color: 'red' },
  QUESTIONABLE: { multiplier: 0.5, probability: 0.50, label: 'Questionable', color: 'yellow' },
  PROBABLE: { multiplier: 0.2, probability: 0.85, label: 'Probable', color: 'yellow' },
  HEALTHY: { multiplier: 0.0, probability: 1.0, label: 'Healthy', color: 'green' }
};

// Injury type impact modifiers
export const INJURY_TYPES = {
  // High Impact Injuries
  'Concussion': { modifier: 1.2, recurrence: 0.3 },
  'ACL': { modifier: 1.0, recurrence: 0.15 },
  'Achilles': { modifier: 1.0, recurrence: 0.20 },
  'Shoulder': { modifier: 0.8, recurrence: 0.25 },
  'Back': { modifier: 0.9, recurrence: 0.40 },
  'Knee': { modifier: 0.8, recurrence: 0.30 },
  
  // Moderate Impact Injuries
  'Hamstring': { modifier: 0.6, recurrence: 0.35 },
  'Ankle': { modifier: 0.5, recurrence: 0.25 },
  'Groin': { modifier: 0.5, recurrence: 0.30 },
  'Wrist': { modifier: 0.4, recurrence: 0.20 },
  'Finger': { modifier: 0.3, recurrence: 0.15 },
  
  // Lower Impact Injuries
  'Hip': { modifier: 0.4, recurrence: 0.20 },
  'Ribs': { modifier: 0.3, recurrence: 0.10 },
  'Quad': { modifier: 0.4, recurrence: 0.25 },
  'Calf': { modifier: 0.3, recurrence: 0.20 }
};

/**
 * Calculate individual player injury impact
 * @param {Object} player - Player injury data
 * @returns {Object} Impact analysis
 */
export function calculatePlayerInjuryImpact(player) {
  const {
    position = 'WR2',
    injuryStatus = 'HEALTHY',
    injuryType = null,
    weeksInjured = 0,
    isStarter = true,
    teamDepth = 'average' // 'poor', 'average', 'good', 'excellent'
  } = player;

  // Base position weight
  const positionWeight = POSITION_WEIGHTS[position] || POSITION_WEIGHTS.WR2;
  
  // Injury severity impact
  const severityData = INJURY_SEVERITY[injuryStatus] || INJURY_SEVERITY.HEALTHY;
  const severityImpact = severityData.multiplier;
  
  // Injury type modifier
  let typeModifier = 1.0;
  let recurrenceRisk = 0.0;
  
  if (injuryType && INJURY_TYPES[injuryType]) {
    typeModifier = INJURY_TYPES[injuryType].modifier;
    recurrenceRisk = INJURY_TYPES[injuryType].recurrence;
  }
  
  // Duration factor (longer injuries = higher impact)
  const durationFactor = Math.min(1 + (weeksInjured * 0.1), 1.5);
  
  // Starter vs backup adjustment
  const starterMultiplier = isStarter ? 1.0 : 0.4;
  
  // Team depth adjustment
  const depthMultipliers = {
    'poor': 1.3,      // Poor depth increases impact
    'average': 1.0,   // Average depth
    'good': 0.8,      // Good depth reduces impact
    'excellent': 0.6  // Excellent depth significantly reduces impact
  };
  const depthMultiplier = depthMultipliers[teamDepth] || 1.0;
  
  // Calculate final impact score (0-100)
  const rawImpact = positionWeight * severityImpact * typeModifier * 
                   durationFactor * starterMultiplier * depthMultiplier;
  
  const impactScore = Math.min(100, rawImpact * 100);
  
  // Playing probability
  const playingProbability = severityData.probability * (1 - (recurrenceRisk * 0.2));
  
  return {
    impactScore: Math.round(impactScore),
    playingProbability: Math.round(playingProbability * 100),
    recurrenceRisk: Math.round(recurrenceRisk * 100),
    riskLevel: impactScore >= 70 ? 'high' : 
               impactScore >= 40 ? 'moderate' : 
               impactScore >= 15 ? 'low' : 'minimal',
    factors: {
      position: positionWeight,
      severity: severityImpact,
      type: typeModifier,
      duration: durationFactor,
      starter: starterMultiplier,
      depth: depthMultiplier
    }
  };
}

/**
 * Calculate team-wide injury impact
 * @param {Array} players - Array of player injury data
 * @returns {Object} Team impact analysis
 */
export function calculateTeamInjuryImpact(players) {
  if (!players || players.length === 0) {
    return {
      totalImpact: 0,
      averageImpact: 0,
      riskLevel: 'minimal',
      injuredCount: 0,
      highImpactCount: 0,
      playingProbabilities: {},
      positionGroups: {}
    };
  }
  
  // Calculate individual impacts
  const playerAnalytics = players.map(player => ({
    ...player,
    analysis: calculatePlayerInjuryImpact(player)
  }));
  
  // Aggregate team metrics
  const totalImpact = playerAnalytics.reduce((sum, player) => 
    sum + player.analysis.impactScore, 0);
  
  const averageImpact = totalImpact / players.length;
  
  const injuredPlayers = playerAnalytics.filter(p => 
    p.injuryStatus !== 'HEALTHY');
  
  const highImpactPlayers = playerAnalytics.filter(p => 
    p.analysis.impactScore >= 60);
  
  // Position group analysis
  const positionGroups = playerAnalytics.reduce((groups, player) => {
    const group = getPositionGroup(player.position);
    if (!groups[group]) {
      groups[group] = {
        totalImpact: 0,
        playerCount: 0,
        injuredCount: 0
      };
    }
    
    groups[group].totalImpact += player.analysis.impactScore;
    groups[group].playerCount++;
    
    if (player.injuryStatus !== 'HEALTHY') {
      groups[group].injuredCount++;
    }
    
    return groups;
  }, {});
  
  // Calculate position group averages
  Object.keys(positionGroups).forEach(group => {
    positionGroups[group].averageImpact = 
      positionGroups[group].totalImpact / positionGroups[group].playerCount;
  });
  
  // Overall risk level
  const riskLevel = totalImpact >= 200 ? 'critical' :
                   totalImpact >= 120 ? 'high' :
                   totalImpact >= 60 ? 'moderate' :
                   totalImpact >= 20 ? 'low' : 'minimal';
  
  return {
    totalImpact: Math.round(totalImpact),
    averageImpact: Math.round(averageImpact),
    riskLevel,
    injuredCount: injuredPlayers.length,
    highImpactCount: highImpactPlayers.length,
    playerAnalytics,
    positionGroups,
    recommendations: generateTeamRecommendations(totalImpact, positionGroups)
  };
}

/**
 * Get position group for analysis
 * @param {string} position - Player position
 * @returns {string} Position group
 */
function getPositionGroup(position) {
  if (['QB'].includes(position)) return 'Quarterback';
  if (['RB'].includes(position)) return 'Running Back';
  if (['WR1', 'WR2', 'WR3', 'TE'].includes(position)) return 'Skill Positions';
  if (['LT', 'RT', 'LG', 'RG', 'C'].includes(position)) return 'Offensive Line';
  if (['EDGE', 'DT'].includes(position)) return 'Defensive Line';
  if (['LB'].includes(position)) return 'Linebackers';
  if (['CB1', 'CB2', 'S'].includes(position)) return 'Secondary';
  if (['K', 'P'].includes(position)) return 'Special Teams';
  return 'Other';
}

/**
 * Generate team recommendations based on injury impact
 * @param {number} totalImpact - Total team injury impact
 * @param {Object} positionGroups - Position group analysis
 * @returns {Array} Array of recommendations
 */
function generateTeamRecommendations(totalImpact, positionGroups) {
  const recommendations = [];
  
  // Overall team recommendations
  if (totalImpact >= 200) {
    recommendations.push({
      type: 'critical',
      message: '🚨 Critical injury situation - significant impact expected',
      action: 'Consider fading this team in DFS and betting unders'
    });
  } else if (totalImpact >= 120) {
    recommendations.push({
      type: 'warning',
      message: '⚠️ High injury impact - proceed with caution',
      action: 'Reduce exposure and consider injury replacements'
    });
  } else if (totalImpact <= 20) {
    recommendations.push({
      type: 'positive',
      message: '💪 Excellent health situation',
      action: 'Good spot for DFS stacks and over bets'
    });
  }
  
  // Position-specific recommendations
  Object.entries(positionGroups).forEach(([group, data]) => {
    if (data.averageImpact >= 70) {
      recommendations.push({
        type: 'warning',
        message: `⚠️ ${group} heavily impacted by injuries`,
        action: `Monitor ${group.toLowerCase()} performance closely`
      });
    }
  });
  
  return recommendations;
}

/**
 * Generate mock injury data for development/testing
 * @param {string} teamName - Team name
 * @returns {Array} Mock injury data
 */
export function generateMockInjuries(teamName) {
  const positions = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'LT', 'RT', 'C', 'EDGE', 'LB', 'CB1', 'S'];
  const statuses = ['OUT', 'DOUBTFUL', 'QUESTIONABLE', 'PROBABLE', 'HEALTHY'];
  const injuryTypes = Object.keys(INJURY_TYPES);
  
  // Generate 3-8 mock injuries
  const numInjuries = Math.floor(Math.random() * 6) + 3;
  
  return Array.from({ length: numInjuries }, (_, index) => {
    const position = positions[Math.floor(Math.random() * positions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const injuryType = status === 'HEALTHY' ? null : 
      injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
    
    return {
      playerId: `${teamName}-${index}`,
      playerName: `${position} Player ${index + 1}`,
      position,
      injuryStatus: status,
      injuryType,
      weeksInjured: status === 'HEALTHY' ? 0 : Math.floor(Math.random() * 4) + 1,
      isStarter: Math.random() > 0.3, // 70% chance of being starter
      teamDepth: ['poor', 'average', 'good'][Math.floor(Math.random() * 3)]
    };
  });
}

/**
 * Calculate comparative injury advantage between two teams
 * @param {Array} team1Injuries - Team 1 injury data
 * @param {Array} team2Injuries - Team 2 injury data
 * @returns {Object} Comparative analysis
 */
export function calculateInjuryAdvantage(team1Injuries, team2Injuries) {
  const team1Analysis = calculateTeamInjuryImpact(team1Injuries);
  const team2Analysis = calculateTeamInjuryImpact(team2Injuries);
  
  const impactDifference = team2Analysis.totalImpact - team1Analysis.totalImpact;
  
  let advantage = 'Even';
  let confidence = 'Low';
  
  if (Math.abs(impactDifference) >= 50) {
    advantage = impactDifference > 0 ? 'Team 1' : 'Team 2';
    confidence = 'High';
  } else if (Math.abs(impactDifference) >= 25) {
    advantage = impactDifference > 0 ? 'Team 1' : 'Team 2';
    confidence = 'Medium';
  }
  
  return {
    team1Impact: team1Analysis.totalImpact,
    team2Impact: team2Analysis.totalImpact,
    impactDifference: Math.abs(impactDifference),
    advantage,
    confidence,
    recommendation: generateAdvantageRecommendation(advantage, confidence, impactDifference)
  };
}

function generateAdvantageRecommendation(advantage, confidence, difference) {
  if (advantage === 'Even') {
    return '🤝 Injury situations are fairly equal - look to other factors';
  }
  
  const strongerTeam = advantage;
  const weakerTeam = advantage === 'Team 1' ? 'Team 2' : 'Team 1';
  
  if (confidence === 'High') {
    return `💪 ${strongerTeam} has significant health advantage - strong DFS/betting spot`;
  } else {
    return `👀 ${strongerTeam} has moderate health edge - consider in lineup decisions`;
  }
}