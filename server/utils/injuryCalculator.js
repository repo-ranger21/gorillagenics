// Server-side injury impact calculator for GuerillaGenics
// Calculates injury impact probabilities for teams and integrates with BioBoost

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

// Injury types with impact modifiers
export const INJURY_TYPES = {
  'Concussion': { modifier: 1.2, recurrence: 0.3 },
  'ACL': { modifier: 1.0, recurrence: 0.15 },
  'Achilles': { modifier: 1.0, recurrence: 0.20 },
  'Shoulder': { modifier: 0.8, recurrence: 0.25 },
  'Back': { modifier: 0.9, recurrence: 0.40 },
  'Knee': { modifier: 0.8, recurrence: 0.30 },
  'Hamstring': { modifier: 0.6, recurrence: 0.35 },
  'Ankle': { modifier: 0.5, recurrence: 0.25 },
  'Groin': { modifier: 0.5, recurrence: 0.30 },
  'Wrist': { modifier: 0.4, recurrence: 0.20 },
  'Finger': { modifier: 0.3, recurrence: 0.15 },
  'Hip': { modifier: 0.4, recurrence: 0.20 },
  'Ribs': { modifier: 0.3, recurrence: 0.10 },
  'Quad': { modifier: 0.4, recurrence: 0.25 },
  'Calf': { modifier: 0.3, recurrence: 0.20 }
};

/**
 * Calculate individual player injury impact
 */
export function calculatePlayerInjuryImpact(player) {
  const {
    position = 'WR2',
    injuryStatus = 'HEALTHY',
    injuryType = null,
    weeksInjured = 0,
    isStarter = true,
    teamDepth = 'average'
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
  
  // Duration factor
  const durationFactor = Math.min(1 + (weeksInjured * 0.1), 1.5);
  
  // Starter vs backup adjustment
  const starterMultiplier = isStarter ? 1.0 : 0.4;
  
  // Team depth adjustment
  const depthMultipliers = {
    'poor': 1.3,
    'average': 1.0,
    'good': 0.8,
    'excellent': 0.6
  };
  const depthMultiplier = depthMultipliers[teamDepth] || 1.0;
  
  // Calculate final impact score
  const rawImpact = positionWeight * severityImpact * typeModifier * 
                   durationFactor * starterMultiplier * depthMultiplier;
  
  const impactScore = Math.min(100, rawImpact * 100);
  const playingProbability = severityData.probability * (1 - (recurrenceRisk * 0.2));
  
  return {
    impactScore: Math.round(impactScore),
    playingProbability: Math.round(playingProbability * 100),
    recurrenceRisk: Math.round(recurrenceRisk * 100),
    riskLevel: impactScore >= 70 ? 'high' : 
               impactScore >= 40 ? 'moderate' : 
               impactScore >= 15 ? 'low' : 'minimal'
  };
}

/**
 * Calculate team-wide injury impact
 */
export function calculateTeamInjuryImpact(players) {
  if (!players || players.length === 0) {
    return {
      totalImpact: 0,
      averageImpact: 0,
      riskLevel: 'minimal',
      injuredCount: 0,
      highImpactCount: 0
    };
  }
  
  const playerAnalytics = players.map(player => ({
    ...player,
    analysis: calculatePlayerInjuryImpact(player)
  }));
  
  const totalImpact = playerAnalytics.reduce((sum, player) => 
    sum + player.analysis.impactScore, 0);
  
  const averageImpact = totalImpact / players.length;
  const injuredPlayers = playerAnalytics.filter(p => p.injuryStatus !== 'HEALTHY');
  const highImpactPlayers = playerAnalytics.filter(p => p.analysis.impactScore >= 60);
  
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
    playerAnalytics
  };
}

/**
 * Generate mock injury data for testing
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
      isStarter: Math.random() > 0.3,
      teamDepth: ['poor', 'average', 'good'][Math.floor(Math.random() * 3)]
    };
  });
}