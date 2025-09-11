import {
  calculateGematriaCiphers,
  calculateDateNumerology,
  calculateAlignmentFeatures,
  calculateBirthdayAlignment,
  calculateCompositeGematria,
  computeGAS,
  fuseGematriaBioBoost,
  type GematriaPlayerAnalysis,
  type GematriaCiphers,
  type DateNumerology,
  type AlignmentFeatures,
  type BirthdayAlignment,
  type GematriaFusionResult
} from './gematria.js';
import type { Player } from '../../shared/schema.js';

/**
 * Enhanced player data with Gematria analysis
 */
export interface GematriaEnhancedPlayer extends Player {
  gematriaAnalysis: GematriaPlayerAnalysis;
}

/**
 * Team-level Gematria aggregation for matchup analysis
 */
export interface TeamGematria {
  teamName: string;
  avgGAS: number;
  avgRitualStrength: number;
  avgBirthdayAlignment: number;
  totalPlayers: number;
}

/**
 * Matchup-level fusion result
 */
export interface MatchupGematriaAnalysis {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeGAS: number;
  awayGAS: number;
  gasDifferential: number;
  homeWinProbBio: number;
  homeWinProbFused: number;
  lean: string;
  confidence: 'Jungle Green' | 'Canopy' | 'Trail';
}

/**
 * Main Gematria scoring service
 */
export class GematriaScoringService {
  
  /**
   * Default coach mapping for teams (can be extended from external data)
   */
  private readonly teamCoaches: Record<string, string> = {
    'Lions': 'Dan Campbell',
    '49ers': 'Kyle Shanahan',
    'Chiefs': 'Andy Reid',
    'Bills': 'Sean McDermott',
    'Ravens': 'John Harbaugh',
    'Cowboys': 'Mike McCarthy',
    'Eagles': 'Nick Sirianni',
    'Dolphins': 'Mike McDaniel',
    'Bengals': 'Zac Taylor',
    'Chargers': 'Brandon Staley',
    'Jets': 'Robert Saleh',
    'Titans': 'Mike Vrabel',
    'Jaguars': 'Doug Pederson',
    'Colts': 'Shane Steichen',
    'Texans': 'DeMeco Ryans',
    'Broncos': 'Sean Payton',
    'Raiders': 'Josh McDaniels',
    'Steelers': 'Mike Tomlin',
    'Browns': 'Kevin Stefanski',
    'Packers': 'Matt LaFleur',
    'Vikings': 'Kevin O\'Connell',
    'Bears': 'Matt Eberflus',
    'Saints': 'Dennis Allen',
    'Falcons': 'Arthur Smith',
    'Panthers': 'Frank Reich',
    'Buccaneers': 'Todd Bowles',
    'Rams': 'Sean McVay',
    'Cardinals': 'Jonathan Gannon',
    'Seahawks': 'Pete Carroll',
    'Giants': 'Brian Daboll',
    'Commanders': 'Ron Rivera',
    'Patriots': 'Bill Belichick'
  };

  /**
   * Enhance a single player with complete Gematria analysis
   */
  enhancePlayerWithGematria(
    player: Player,
    gameDate: Date,
    playerBirthday?: Date
  ): GematriaEnhancedPlayer {
    const coachName = this.teamCoaches[player.team] || 'Unknown Coach';
    
    // Calculate base gematria scores
    const nameGematria = calculateGematriaCiphers(player.name);
    const compositeGematria = calculateCompositeGematria(player.name, player.team, coachName);
    
    // Calculate date numerology for game
    const dateNumerology = calculateDateNumerology(gameDate);
    
    // Calculate alignment features
    const alignmentFeatures = calculateAlignmentFeatures(nameGematria, dateNumerology);
    
    // Calculate birthday alignment (if birthday is available)
    const birthdayAlignment = playerBirthday
      ? calculateBirthdayAlignment(playerBirthday, gameDate)
      : { bdayExact: false, bdayWeek: false, bdayDiffDays: 0 };
    
    // Compute GAS (Gematria Alignment Score)
    const gas = computeGAS(nameGematria, dateNumerology, alignmentFeatures, birthdayAlignment);
    
    // Convert BioBoost score to probability (assuming 0-100 scale)
    const bioBoostProb = Math.min(Math.max(player.bioBoostScore / 100, 0.1), 0.9);
    
    // Perform model fusion
    const fusionResult = fuseGematriaBioBoost(
      bioBoostProb,
      gas,
      birthdayAlignment,
      alignmentFeatures
    );
    
    // Build complete analysis
    const gematriaAnalysis: GematriaPlayerAnalysis = {
      nameGematria,
      compositeGematria,
      dateNumerology,
      alignmentFeatures,
      birthdayAlignment,
      gas,
      fusionResult
    };
    
    return {
      ...player,
      // Update player with Gematria fields for database storage
      birthday: playerBirthday || null,
      coachName,
      gematriaOrdinal: nameGematria.ordinal,
      gematriaReduction: nameGematria.reduction,
      gematriaReverse: nameGematria.reverse,
      gematriaReverseReduction: nameGematria.reverseReduction,
      compositeOrdinal: compositeGematria.ordinal,
      compositeReduction: compositeGematria.reduction,
      compositeReverse: compositeGematria.reverse,
      compositeReverseReduction: compositeGematria.reverseReduction,
      gameYmdSum: dateNumerology.ymdSum,
      gameYmdReduced: dateNumerology.ymdReduced,
      gameDayOfYear: dateNumerology.dayOfYear,
      gameWeekdayNum: dateNumerology.weekdayNum,
      gameIsMaster: dateNumerology.isMaster,
      exactMatch: alignmentFeatures.exactMatch,
      ritualProximity: alignmentFeatures.ritualProximity,
      ritualHit: alignmentFeatures.ritualHit,
      ritualStrength: alignmentFeatures.ritualStrength,
      bdayExact: birthdayAlignment.bdayExact,
      bdayWeek: birthdayAlignment.bdayWeek,
      bdayDiffDays: birthdayAlignment.bdayDiffDays,
      gas,
      gematriaBioBoostFinal: fusionResult.finalProbability,
      gematriaEdgeProb: fusionResult.edgeProbability,
      gematriaConfidence: fusionResult.confidence,
      gematriaZ: fusionResult.z,
      gematriaAnalysis
    };
  }

  /**
   * Process multiple players for a game slate
   */
  enhancePlayersWithGematria(
    players: Player[],
    gameDate: Date,
    playerBirthdays?: Record<string, Date>
  ): GematriaEnhancedPlayer[] {
    return players.map(player => {
      const birthday = playerBirthdays?.[player.name];
      return this.enhancePlayerWithGematria(player, gameDate, birthday);
    });
  }

  /**
   * Aggregate team-level Gematria metrics
   */
  calculateTeamGematria(players: GematriaEnhancedPlayer[], teamName: string): TeamGematria {
    const teamPlayers = players.filter(p => p.team === teamName);
    
    if (teamPlayers.length === 0) {
      return {
        teamName,
        avgGAS: 0,
        avgRitualStrength: 0,
        avgBirthdayAlignment: 0,
        totalPlayers: 0
      };
    }
    
    const avgGAS = teamPlayers.reduce((sum, p) => sum + p.gas!, 0) / teamPlayers.length;
    const avgRitualStrength = teamPlayers.reduce((sum, p) => sum + p.ritualStrength!, 0) / teamPlayers.length;
    const avgBirthdayAlignment = teamPlayers.reduce((sum, p) => {
      return sum + (p.bdayWeek ? 0.7 : 0) + (p.bdayExact ? 0.3 : 0);
    }, 0) / teamPlayers.length;
    
    return {
      teamName,
      avgGAS,
      avgRitualStrength,
      avgBirthdayAlignment,
      totalPlayers: teamPlayers.length
    };
  }

  /**
   * Analyze matchup with team-level Gematria fusion
   */
  analyzeMatchupGematria(
    homeTeamPlayers: GematriaEnhancedPlayer[],
    awayTeamPlayers: GematriaEnhancedPlayer[],
    homeTeam: string,
    awayTeam: string,
    gameId: string,
    homeWinProbBio: number = 0.5
  ): MatchupGematriaAnalysis {
    const homeGematria = this.calculateTeamGematria(homeTeamPlayers, homeTeam);
    const awayGematria = this.calculateTeamGematria(awayTeamPlayers, awayTeam);
    
    const gasDifferential = homeGematria.avgGAS - awayGematria.avgGAS;
    const ritualDifferential = homeGematria.avgRitualStrength - awayGematria.avgRitualStrength;
    const birthdayDifferential = homeGematria.avgBirthdayAlignment - awayGematria.avgBirthdayAlignment;
    
    // Apply team-level fusion (similar to player-level but scaled)
    const logit = (p: number) => Math.log(Math.min(Math.max(p, 0.0001), 0.9999) / (1 - Math.min(Math.max(p, 0.0001), 0.9999)));
    const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
    
    const z = logit(homeWinProbBio) * 1.0 + 
             0.30 * gasDifferential + 
             0.20 * ritualDifferential + 
             0.10 * birthdayDifferential;
    
    const homeWinProbFused = sigmoid(z);
    
    const lean = homeWinProbFused >= 0.5 ? `HOME: ${homeTeam}` : `AWAY: ${awayTeam}`;
    
    let confidence: 'Jungle Green' | 'Canopy' | 'Trail';
    const edgeSize = Math.abs(homeWinProbFused - 0.5);
    if (edgeSize >= 0.15) confidence = 'Jungle Green';
    else if (edgeSize >= 0.08) confidence = 'Canopy';
    else confidence = 'Trail';
    
    return {
      gameId,
      homeTeam,
      awayTeam,
      homeGAS: homeGematria.avgGAS,
      awayGAS: awayGematria.avgGAS,
      gasDifferential,
      homeWinProbBio,
      homeWinProbFused,
      lean,
      confidence
    };
  }

  /**
   * Generate mock player birthdays for development/testing
   */
  generateMockBirthdays(players: Player[]): Record<string, Date> {
    const birthdays: Record<string, Date> = {};
    
    // Generate realistic birthdays spread across the year
    players.forEach((player, index) => {
      const month = (index % 12) + 1;
      const day = ((index * 7) % 28) + 1;
      const year = 1990 + (index % 10); // Ages 33-43 for current year
      birthdays[player.name] = new Date(year, month - 1, day);
    });
    
    return birthdays;
  }

  /**
   * Get top Gematria picks by edge probability
   */
  getTopGematriaPicks(
    players: GematriaEnhancedPlayer[],
    limit: number = 10
  ): GematriaEnhancedPlayer[] {
    return players
      .filter(p => p.gematriaEdgeProb !== null && p.gematriaEdgeProb !== undefined)
      .sort((a, b) => Math.abs(b.gematriaEdgeProb!) - Math.abs(a.gematriaEdgeProb!))
      .slice(0, limit);
  }

  /**
   * Generate Gematria commentary for a player
   */
  generateGematriaCommentary(player: GematriaEnhancedPlayer): string {
    const analysis = player.gematriaAnalysis;
    const edge = player.gematriaEdgeProb!;
    const gas = player.gas!;
    
    let commentary = `🔢 Gematria Analysis: `;
    
    if (analysis.alignmentFeatures.exactMatch) {
      commentary += `Name cipher aligns with game numerology! `;
    }
    
    if (analysis.alignmentFeatures.ritualHit) {
      commentary += `Direct ritual number hit detected! `;
    }
    
    if (analysis.birthdayAlignment.bdayExact) {
      commentary += `Birthday magic - playing on their special day! `;
    } else if (analysis.birthdayAlignment.bdayWeek) {
      commentary += `Birthday energy week - cosmic timing! `;
    }
    
    if (gas >= 0.7) {
      commentary += `Exceptional GAS score (${(gas * 100).toFixed(0)}%) suggests strong numerological favor. `;
    } else if (gas >= 0.5) {
      commentary += `Solid GAS score (${(gas * 100).toFixed(0)}%) shows positive alignment. `;
    }
    
    if (Math.abs(edge) >= 0.10) {
      commentary += `🚨 ELITE edge of ${(edge * 100).toFixed(1)}% over pure BioBoost! Numbers don't lie! 🦍`;
    } else if (Math.abs(edge) >= 0.05) {
      commentary += `Strong ${(edge * 100).toFixed(1)}% edge when fusing with numerology. `;
    } else {
      commentary += `Moderate numerological influence. `;
    }
    
    return commentary;
  }

}

export const gematriaScoringService = new GematriaScoringService();