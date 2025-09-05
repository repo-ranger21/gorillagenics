// GuerillaGenics Prediction Engine - Market Analysis + Offensive Player Weighting
export class PredictionsService {
  constructor() {
    this.commentaryTemplates = {
      highConfidence: [
        "Max Juice: {factor} + market momentum screams {pick}.",
        "Banana boat confidence: {factor} dominates this spot.", 
        "Primal instincts + data convergence = {pick} locks it up.",
        "Alpha gorilla play: {factor} too strong to fade."
      ],
      moderateConfidence: [
        "Solid vine swing: {factor} tilts the scales toward {pick}.",
        "Market whispers + {factor} suggests {pick} value.",
        "Jungle logic says {factor} creates {pick} edge.",
        "Gorilla gut + numbers align on {pick}."
      ],
      lowConfidence: [
        "Coin flip territory, but {factor} gives {pick} slight edge.",
        "Thin margins, yet {factor} nudges toward {pick}.",
        "Close call - {factor} provides minimal {pick} lean.",
        "Barely-there banana split: {factor} suggests {pick}."
      ]
    };
  }

  async generatePick(game, oddsSnapshot, featuredOffense, weather = null) {
    try {
      const homeOffense = featuredOffense.find(f => f.teamId === game.homeTeam.id);
      const awayOffense = featuredOffense.find(f => f.teamId === game.awayTeam.id);

      // Calculate winner prediction
      const winnerAnalysis = this.calculateWinner(game, oddsSnapshot, homeOffense, awayOffense);
      
      // Calculate Over/Under lean
      const ouAnalysis = this.calculateOverUnder(game, oddsSnapshot, homeOffense, awayOffense, weather);

      // Determine overall confidence band
      const confidence = this.calculateConfidence(winnerAnalysis, ouAnalysis, oddsSnapshot);
      const band = this.getConfidenceBand(confidence);

      // Generate commentary
      const commentary = this.generateCommentary(winnerAnalysis, ouAnalysis, band);

      return {
        gameId: game.id,
        winner: winnerAnalysis.winner,
        winnerConfidence: winnerAnalysis.confidence,
        ouLean: ouAnalysis.lean,
        ouConfidence: ouAnalysis.confidence,
        confidence,
        band,
        commentary,
        factors: {
          spread: winnerAnalysis.spreadFactor,
          offensiveStars: winnerAnalysis.starFactor,
          lineMovement: winnerAnalysis.lineMoveFactor,
          homeField: winnerAnalysis.homeFieldFactor,
          weather: ouAnalysis.weatherFactor,
          totalStars: ouAnalysis.totalStarsFactor
        },
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Prediction generation failed:', error);
      return this.getFallbackPick(game.id);
    }
  }

  calculateWinner(game, oddsSnapshot, homeOffense, awayOffense) {
    let homeScore = 0;
    let awayScore = 0;

    // Base market factor (spread direction)
    const spread = oddsSnapshot.spread?.home || 0;
    if (spread < 0) {
      homeScore += 2; // Home favored
    } else if (spread > 0) {
      awayScore += 2; // Away favored
    }

    // QB factor (most important)
    const homeQB = homeOffense?.players?.find(p => p.position === 'QB');
    const awayQB = awayOffense?.players?.find(p => p.position === 'QB');
    
    if (homeQB && this.isEliteQB(homeQB)) homeScore += 2;
    if (awayQB && this.isEliteQB(awayQB)) awayScore += 2;
    if (homeQB && this.isTopTierQB(homeQB)) homeScore += 1;
    if (awayQB && this.isTopTierQB(awayQB)) awayScore += 1;

    // Skill position stars factor
    const homeStars = this.countOffensiveStars(homeOffense);
    const awayStars = this.countOffensiveStars(awayOffense);
    homeScore += Math.min(2, homeStars);
    awayScore += Math.min(2, awayStars);

    // Line movement factor (last 24-48h simulation)
    const lineMove = oddsSnapshot.lineMove?.spreadΔ || 0;
    if (Math.abs(lineMove) >= 0.5) {
      if (lineMove > 0) homeScore += 1; // Line moved toward home
      else awayScore += 1; // Line moved toward away
    }

    // Home field advantage
    homeScore += 1;

    // Determine winner
    const winner = homeScore > awayScore ? 'home' : 'away';
    const confidence = Math.abs(homeScore - awayScore) * 10 + 50; // Scale to 50-100

    return {
      winner,
      confidence: Math.min(100, Math.max(50, confidence)),
      homeScore,
      awayScore,
      spreadFactor: spread !== 0 ? 2 : 0,
      starFactor: Math.abs(homeStars - awayStars),
      lineMoveFactor: Math.abs(lineMove) >= 0.5 ? 1 : 0,
      homeFieldFactor: 1
    };
  }

  calculateOverUnder(game, oddsSnapshot, homeOffense, awayOffense, weather) {
    let adjustment = 0;
    const marketTotal = oddsSnapshot.total || 45;

    // Weather impact (totals only)
    let weatherFactor = 0;
    if (weather) {
      if (weather.windSpeed > 18) {
        adjustment -= 2;
        weatherFactor = -2;
      }
      if (weather.precipProbability > 60) {
        adjustment -= 1;
        weatherFactor -= 1;
      }
    }

    // Combined offensive stars boost
    const totalStars = this.countOffensiveStars(homeOffense) + this.countOffensiveStars(awayOffense);
    let totalStarsFactor = 0;
    if (totalStars >= 6) {
      adjustment += 2;
      totalStarsFactor = 2;
    } else if (totalStars >= 4) {
      adjustment += 1;
      totalStarsFactor = 1;
    }

    // Line movement on total
    const totalMove = oddsSnapshot.lineMove?.totalΔ || 0;
    if (Math.abs(totalMove) >= 1) {
      adjustment += totalMove > 0 ? 0.5 : -0.5;
    }

    const adjustedTotal = marketTotal + adjustment;
    const lean = adjustedTotal >= marketTotal + 0.5 ? 'Over' : 'Under';
    const confidence = Math.min(90, Math.max(55, Math.abs(adjustment) * 15 + 60));

    return {
      lean,
      confidence,
      marketTotal,
      adjustedTotal,
      adjustment,
      weatherFactor,
      totalStarsFactor
    };
  }

  calculateConfidence(winnerAnalysis, ouAnalysis, oddsSnapshot) {
    // Combine winner and O/U confidence
    const avgConfidence = (winnerAnalysis.confidence + ouAnalysis.confidence) / 2;
    
    // Boost confidence if multiple factors align
    let boost = 0;
    if (Math.abs(oddsSnapshot.lineMove?.spreadΔ || 0) >= 1) boost += 5;
    if (Math.abs(oddsSnapshot.lineMove?.totalΔ || 0) >= 1.5) boost += 5;
    
    return Math.min(100, Math.max(50, avgConfidence + boost));
  }

  getConfidenceBand(confidence) {
    if (confidence >= 80) return 'High';
    if (confidence >= 65) return 'Moderate';
    return 'Low';
  }

  generateCommentary(winnerAnalysis, ouAnalysis, band) {
    const templates = this.commentaryTemplates[band.toLowerCase() + 'Confidence'] || 
                     this.commentaryTemplates.moderateConfidence;
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Determine primary factor for commentary
    let factor = 'market movement';
    if (winnerAnalysis.starFactor >= 2) factor = 'offensive firepower';
    else if (winnerAnalysis.lineMoveFactor > 0) factor = 'sharp money';
    else if (ouAnalysis.weatherFactor < -1) factor = 'weather impact';
    else if (ouAnalysis.totalStarsFactor >= 2) factor = 'elite skill positions';

    const pick = `${winnerAnalysis.winner.toUpperCase()} + ${ouAnalysis.lean.toUpperCase()}`;

    return template
      .replace('{factor}', factor)
      .replace('{pick}', pick)
      .replace(/\{pick\}/g, pick);
  }

  isEliteQB(qb) {
    // Elite QB determination based on experience and past performance
    const eliteQBs = ['Josh Allen', 'Patrick Mahomes', 'Aaron Rodgers', 'Tom Brady', 
                     'Lamar Jackson', 'Dak Prescott', 'Russell Wilson', 'Justin Herbert'];
    return eliteQBs.some(name => qb.name.includes(name.split(' ')[1]));
  }

  isTopTierQB(qb) {
    // Top-tier QB (just below elite)
    return qb.experience > 3 && qb.age < 35;
  }

  countOffensiveStars(offense) {
    if (!offense?.players) return 0;
    
    let stars = 0;
    offense.players.forEach(player => {
      // Star criteria based on position and role
      if (player.roleTag === 'QB1') stars += 1.5;
      else if (['WR1', 'RB1'].includes(player.roleTag)) stars += 1;
      else if (['WR2', 'RB2', 'TE1'].includes(player.roleTag)) stars += 0.5;
    });
    
    return Math.round(stars);
  }

  getFallbackPick(gameId) {
    return {
      gameId,
      winner: 'home', // Default to home
      winnerConfidence: 55,
      ouLean: 'Under', // Conservative default
      ouConfidence: 55,
      confidence: 55,
      band: 'Low',
      commentary: 'Data still swinging in - check back for full gorilla analysis.',
      factors: {},
      lastUpdated: new Date().toISOString(),
      fallback: true
    };
  }
}