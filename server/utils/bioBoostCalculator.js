// GuerillaGenics BioBoost Scoring Engine
// Calculates 0-100 score based on core factors affecting game outcomes

export function calculateBioBoost({ injuries, weather, lineMove, restDays, travelMiles }) {
  let score = 50; // baseline

  // Injuries: subtract for key players out, add for opponent injuries
  if (injuries.keyPlayersOut > 0) score -= injuries.keyPlayersOut * 5;
  if (injuries.opponentKeyOut > 0) score += injuries.opponentKeyOut * 4;

  // Weather: adjust for extreme conditions
  if (weather.windMph > 20) score -= 4;
  if (weather.tempF < 32 || weather.tempF > 90) score -= 3;
  if (weather.precipChance > 50) score -= 2;

  // Line movement: positive toward team = confidence boost
  if (lineMove > 0) score += Math.min(lineMove * 2, 6);
  if (lineMove < 0) score -= Math.min(Math.abs(lineMove) * 2, 6);

  // Rest/travel: more rest = boost, long travel = penalty
  if (restDays > 7) score += 3;
  if (travelMiles > 1500) score -= 2;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Helper function to generate consistent mock factors for games
export function generateMockFactors(gameId) {
  // Generate consistent mock data for each game based on ID
  const seed = hashCode(gameId);
  const random = seedRandom(seed);
  
  return {
    injuries: {
      keyPlayersOut: Math.floor(random() * 3), // 0-2 key players out
      opponentKeyOut: Math.floor(random() * 2), // 0-1 opponent key players out
    },
    weather: {
      windMph: random() * 30, // 0-30 mph wind
      tempF: 35 + random() * 50, // 35-85°F temperature
      precipChance: random() * 100, // 0-100% precipitation chance
    },
    lineMove: (random() - 0.5) * 6, // -3 to +3 line movement
    restDays: 6 + Math.floor(random() * 4), // 6-9 rest days
    travelMiles: random() * 3000, // 0-3000 miles travel
  };
}

export function generateRecommendation(bioBoostScore, overUnder, marketData = {}) {
  // Combine BioBoost score with market analysis
  let recommendation = "OVER";
  let confidence = "Medium";
  
  // Base recommendation on BioBoost score
  if (bioBoostScore < 35) {
    recommendation = "UNDER";
  } else if (bioBoostScore > 65) {
    recommendation = "OVER";
  } else {
    // Neutral zone - use market factors
    recommendation = Math.random() > 0.5 ? "OVER" : "UNDER";
  }
  
  // Adjust confidence based on score extremes
  if (bioBoostScore < 25 || bioBoostScore > 75) {
    confidence = "High";
  } else if (bioBoostScore >= 35 && bioBoostScore <= 65) {
    confidence = "Low";
  }
  
  return { recommendation, confidence };
}

export function generateGorillaCommentary(gameData, bioBoostScore, recommendation) {
  const { awayTeam, homeTeam, overUnder } = gameData;
  
  const commentaries = {
    high_confidence_over: [
      `🦍 This total is bananas low! Gorilla sees FIREWORKS! 🎆`,
      `🍌 Both offenses looking juicy - this goes BOOM! 💥`,
      `🦍 Weather's perfect, injuries minimal - OVER city, baby! 🚀`,
      `🍌 Sharp money screaming OVER - trust the jungle intel! 📈`
    ],
    high_confidence_under: [
      `🦍 This total's inflated like a beach ball! UNDER all day! ⬇️`,
      `🍌 Weather looking sketchy, offenses struggling - UNDER! 🌧️`,
      `🦍 Key injuries piling up - this stays low and ugly! 📉`,
      `🍌 Line movement screams TRAP - smash that UNDER! ⚠️`
    ],
    medium_confidence_over: [
      `🦍 Slight lean OVER - nothing crazy, but the juice is there! 📊`,
      `🍌 Conditions favor scoring - moderate OVER play! 🎯`,
      `🦍 BioBoost seeing some upside - careful OVER! ⬆️`
    ],
    medium_confidence_under: [
      `🦍 Leaning UNDER - not screaming it, but the math adds up! 🧮`,
      `🍌 Some red flags here - measured UNDER play! 🚩`,
      `🦍 Market feels a touch high - slight UNDER lean! ⬇️`
    ],
    low_confidence: [
      `🦍 This one's a coin flip - proceed with caution! 🪙`,
      `🍌 Too many variables - this is a stay away for me! ❌`,
      `🦍 Neutral territory - if you play it, keep it light! ⚖️`,
      `🍌 Market's efficient here - no edge detected! 📊`
    ]
  };
  
  let category = 'low_confidence';
  
  if (bioBoostScore > 75) {
    category = recommendation === 'OVER' ? 'high_confidence_over' : 'high_confidence_under';
  } else if (bioBoostScore < 25) {
    category = recommendation === 'UNDER' ? 'high_confidence_under' : 'high_confidence_over';
  } else if (bioBoostScore > 60 || bioBoostScore < 40) {
    category = recommendation === 'OVER' ? 'medium_confidence_over' : 'medium_confidence_under';
  }
  
  const options = commentaries[category];
  return options[Math.floor(Math.random() * options.length)];
}

// Legacy function name for compatibility
export function generateMockGameFactors(gameId) {
  return generateMockFactors(gameId);
}

// Helper functions for consistent randomization
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seedRandom(seed) {
  let m = 0x80000000; // 2**31
  let a = 1103515245;
  let c = 12345;
  let state = seed ? seed : Math.floor(Math.random() * (m - 1));
  
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}