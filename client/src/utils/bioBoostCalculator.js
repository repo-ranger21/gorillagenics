// GuerillaGenics BioBoost Scoring Engine
// Calculates 0-100 score based on multiple factors affecting game outcomes

export function calculateBioBoost(gameData) {
  let score = 50; // Base score
  
  const {
    awayTeam,
    homeTeam,
    overUnder,
    weather = {},
    injuries = {},
    lineMovement = {},
    restDays = {}
  } = gameData;

  // Injury Impact Analysis (-20 to +10 points)
  const injuryImpact = calculateInjuryImpact(injuries);
  score += injuryImpact;

  // Weather Conditions (-15 to +5 points)
  const weatherImpact = calculateWeatherImpact(weather);
  score += weatherImpact;

  // Line Movement Analysis (-10 to +15 points)
  const lineImpact = calculateLineMovement(lineMovement);
  score += lineImpact;

  // Rest/Travel Factors (-8 to +8 points)
  const restImpact = calculateRestImpact(restDays);
  score += restImpact;

  // Over/Under Bias (+/- 5 points based on total)
  const totalBias = calculateTotalBias(overUnder);
  score += totalBias;

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateInjuryImpact(injuries) {
  if (!injuries || Object.keys(injuries).length === 0) {
    return Math.random() * 6 - 3; // Random small variation
  }
  
  let impact = 0;
  
  // Key position injuries have bigger impact
  if (injuries.quarterback) impact -= 15;
  if (injuries.runningBack) impact -= 8;
  if (injuries.wideReceiver) impact -= 6;
  if (injuries.offensiveLine) impact -= 10;
  if (injuries.defense) impact -= 5;
  
  return impact;
}

function calculateWeatherImpact(weather) {
  if (!weather || Object.keys(weather).length === 0) {
    return Math.random() * 4 - 2; // Random small variation
  }
  
  let impact = 0;
  
  // Wind affects passing games (favors under)
  if (weather.wind && weather.wind > 15) impact -= 8;
  if (weather.wind && weather.wind > 25) impact -= 15;
  
  // Temperature extremes
  if (weather.temp && weather.temp < 25) impact -= 5;
  if (weather.temp && weather.temp > 95) impact -= 3;
  
  // Precipitation
  if (weather.precipitation && weather.precipitation > 50) impact -= 10;
  
  // Dome games get slight boost
  if (weather.dome) impact += 3;
  
  return impact;
}

function calculateLineMovement(lineMovement) {
  if (!lineMovement || Object.keys(lineMovement).length === 0) {
    return Math.random() * 4 - 2; // Random small variation
  }
  
  let impact = 0;
  
  // Sharp money movement (reverse line movement)
  if (lineMovement.sharpMoney) impact += 10;
  
  // Public betting percentage
  if (lineMovement.publicBetting > 80) impact -= 5;
  if (lineMovement.publicBetting < 30) impact += 8;
  
  // Line steam/reverse
  if (lineMovement.steamMove) impact += 12;
  if (lineMovement.reverseLineMovement) impact += 15;
  
  return impact;
}

function calculateRestImpact(restDays) {
  if (!restDays || Object.keys(restDays).length === 0) {
    return Math.random() * 3 - 1.5; // Random small variation
  }
  
  let impact = 0;
  
  // Rest advantage
  const restDiff = (restDays.home || 7) - (restDays.away || 7);
  impact += restDiff * 1.5;
  
  // Travel distance impact
  if (restDays.travelMiles > 2000) impact -= 3;
  if (restDays.travelMiles > 3000) impact -= 6;
  
  // Divisional games
  if (restDays.divisional) impact += 2;
  
  return impact;
}

function calculateTotalBias(overUnder) {
  // Slight bias based on total
  if (overUnder < 40) return 3; // Low totals favor over
  if (overUnder > 55) return -2; // High totals favor under
  return Math.random() * 2 - 1;
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

export function generateMockGameFactors(gameId) {
  // Generate consistent mock data for each game based on ID
  const seed = hashCode(gameId);
  const random = seedRandom(seed);
  
  return {
    injuries: {
      quarterback: random() < 0.1,
      runningBack: random() < 0.15,
      wideReceiver: random() < 0.2,
      offensiveLine: random() < 0.12,
      defense: random() < 0.18
    },
    weather: {
      temp: 45 + random() * 40, // 45-85°F
      wind: random() * 20, // 0-20 mph
      precipitation: random() * 100, // 0-100% chance
      dome: random() < 0.3
    },
    lineMovement: {
      sharpMoney: random() < 0.2,
      publicBetting: 30 + random() * 40, // 30-70%
      steamMove: random() < 0.15,
      reverseLineMovement: random() < 0.1
    },
    restDays: {
      home: 6 + Math.floor(random() * 3), // 6-8 days
      away: 6 + Math.floor(random() * 3), // 6-8 days
      travelMiles: random() * 3000, // 0-3000 miles
      divisional: random() < 0.25
    }
  };
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