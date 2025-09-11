// @ts-ignore - JavaScript import without declaration
import { PredictionsService } from './predictions.js';
import { 
  gematriaScoringService, 
  type GematriaEnhancedPlayer, 
  type MatchupGematriaAnalysis 
} from './gematria-scoring.js';
import type { Player } from '../../shared/schema.js';

/**
 * Enhanced predictions with Gematria meta-layer integration
 */
export interface GematriaEnhancedPrediction {
  // Base prediction fields
  gameId: string;
  winner: string;
  winnerConfidence: number;
  ouLean: string;
  ouConfidence: number;
  confidence: number;
  band: string;
  commentary: string;
  factors: Record<string, any>;
  lastUpdated: string;
  
  // Gematria enhancement fields
  gematria: {
    homeGAS: number;
    awayGAS: number;
    gasDifferential: number;
    ritualAlignment: number;
    birthdayAlignment: number;
    numerologyFactor: string;
    gematriaConfidence: 'Jungle Green' | 'Canopy' | 'Trail';
    gematriaCommentary: string;
    fusedWinnerConfidence: number;
    fusedOuConfidence: number;
    edgeOverBioBoost: number;
  };
  
  // Enhanced player analysis
  topGematriaPlayers: Array<{
    name: string;
    position: string;
    team: string;
    bioBoostScore: number;
    gas: number;
    fusedScore: number;
    edgeProb: number;
    confidence: string;
    gematriaCommentary: string;
  }>;
}

/**
 * Enhanced Predictions Service with Gematria integration
 */
export class GematriaPredictionsService extends PredictionsService {
  gematriaCommentaryTemplates: Record<string, string[]>;
  
  constructor() {
    super();
    
    // Add Gematria-specific commentary templates
    this.gematriaCommentaryTemplates = {
      highNumerology: [
        "🔢 Cosmic alignment detected: {numerologyFactor} creates powerful {pick} energy!",
        "🦍 Numerological dominance: {numerologyFactor} shows {pick} written in the stars!",
        "🔥 Sacred numbers converge: {numerologyFactor} screams max confidence {pick}!",
        "⚡ Gematria fury unleashed: {numerologyFactor} makes {pick} inevitable!"
      ],
      moderateNumerology: [
        "🔢 Solid numerical foundation: {numerologyFactor} supports {pick} lean.",
        "🦍 Gematria whispers: {numerologyFactor} nudges toward {pick}.",
        "🌟 Cosmic influence present: {numerologyFactor} favors {pick} outcome.",
        "📊 Numbers align: {numerologyFactor} creates {pick} advantage."
      ],
      lowNumerology: [
        "🔢 Minimal cosmic influence: {numerologyFactor} provides slight {pick} edge.",
        "🦍 Faint numerical signals: {numerologyFactor} barely tilts {pick}.",
        "⭐ Weak alignment: {numerologyFactor} offers marginal {pick} support.",
        "📈 Thin numerological edge: {numerologyFactor} suggests {pick}."
      ]
    };
  }

  /**
   * Generate enhanced prediction with Gematria meta-layer
   */
  async generateGematriaPrediction(
    game: any,
    oddsSnapshot: any,
    featuredOffense: any,
    homeTeamPlayers: Player[],
    awayTeamPlayers: Player[],
    gameDate: Date,
    weather: any = null
  ): Promise<GematriaEnhancedPrediction> {
    try {
      // Get base prediction from parent class
      const basePrediction = await (this as any).generatePick(game, oddsSnapshot, featuredOffense, weather);
      
      // Generate mock birthdays for development
      const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
      const mockBirthdays = gematriaScoringService.generateMockBirthdays(allPlayers);
      
      // Enhance players with Gematria analysis
      const enhancedHomePlayers = gematriaScoringService.enhancePlayersWithGematria(
        homeTeamPlayers, 
        gameDate, 
        mockBirthdays
      );
      const enhancedAwayPlayers = gematriaScoringService.enhancePlayersWithGematria(
        awayTeamPlayers, 
        gameDate, 
        mockBirthdays
      );
      
      // Calculate team-level Gematria analysis
      const homeGematria = gematriaScoringService.calculateTeamGematria(
        enhancedHomePlayers, 
        game.homeTeam.name
      );
      const awayGematria = gematriaScoringService.calculateTeamGematria(
        enhancedAwayPlayers, 
        game.awayTeam.name
      );
      
      // Perform matchup analysis
      const matchupAnalysis = gematriaScoringService.analyzeMatchupGematria(
        enhancedHomePlayers,
        enhancedAwayPlayers,
        game.homeTeam.name,
        game.awayTeam.name,
        game.id,
        this.convertConfidenceToProb(basePrediction.winnerConfidence, basePrediction.winner === 'home')
      );
      
      // Get top Gematria players
      const topPlayers = gematriaScoringService.getTopGematriaPicks([
        ...enhancedHomePlayers, 
        ...enhancedAwayPlayers
      ], 8);
      
      // Calculate fusion adjustments
      const gematriaWinnerAdjustment = this.calculateGematriaWinnerAdjustment(matchupAnalysis);
      const gematriaOuAdjustment = this.calculateGematriaOuAdjustment(enhancedHomePlayers, enhancedAwayPlayers);
      
      // Apply Gematria fusion to base predictions
      const fusedWinnerConfidence = this.fuseConfidence(
        basePrediction.winnerConfidence, 
        gematriaWinnerAdjustment
      );
      const fusedOuConfidence = this.fuseConfidence(
        basePrediction.ouConfidence, 
        gematriaOuAdjustment
      );
      
      // Determine primary numerology factor
      const numerologyFactor = this.determinePrimaryNumerologyFactor(
        homeGematria, 
        awayGematria, 
        enhancedHomePlayers, 
        enhancedAwayPlayers
      );
      
      // Generate Gematria commentary
      const gematriaCommentary = this.generateGematriaCommentary(
        matchupAnalysis, 
        numerologyFactor, 
        basePrediction
      );
      
      // Calculate edge over pure BioBoost
      const edgeOverBioBoost = Math.abs(fusedWinnerConfidence - basePrediction.winnerConfidence) / 100;
      
      return {
        ...basePrediction,
        // Override with fused confidence
        winnerConfidence: fusedWinnerConfidence,
        ouConfidence: fusedOuConfidence,
        confidence: (fusedWinnerConfidence + fusedOuConfidence) / 2,
        band: (this as any).getConfidenceBand((fusedWinnerConfidence + fusedOuConfidence) / 2),
        
        // Add Gematria analysis
        gematria: {
          homeGAS: homeGematria.avgGAS,
          awayGAS: awayGematria.avgGAS,
          gasDifferential: matchupAnalysis.gasDifferential,
          ritualAlignment: (homeGematria.avgRitualStrength + awayGematria.avgRitualStrength) / 2,
          birthdayAlignment: (homeGematria.avgBirthdayAlignment + awayGematria.avgBirthdayAlignment) / 2,
          numerologyFactor,
          gematriaConfidence: matchupAnalysis.confidence,
          gematriaCommentary,
          fusedWinnerConfidence,
          fusedOuConfidence,
          edgeOverBioBoost
        },
        
        // Top Gematria players
        topGematriaPlayers: topPlayers.map(player => ({
          name: player.name,
          position: player.position,
          team: player.team,
          bioBoostScore: player.bioBoostScore,
          gas: player.gas!,
          fusedScore: player.gematriaBioBoostFinal!,
          edgeProb: player.gematriaEdgeProb!,
          confidence: player.gematriaConfidence!,
          gematriaCommentary: gematriaScoringService.generateGematriaCommentary(player)
        }))
      };
      
    } catch (error) {
      console.error('Gematria prediction generation failed:', error);
      // Fall back to base prediction with empty Gematria data
      const basePrediction = await (this as any).generatePick(game, oddsSnapshot, featuredOffense, weather);
      return this.createFallbackGematriaPrediction(basePrediction);
    }
  }

  /**
   * Convert confidence percentage to probability (accounting for home/away)
   */
  private convertConfidenceToProb(confidence: number, isHome: boolean): number {
    // Convert 50-100 confidence to 0.5-1.0 probability
    const prob = 0.5 + (confidence - 50) / 100;
    return isHome ? prob : (1 - prob);
  }

  /**
   * Calculate Gematria adjustment for winner prediction
   */
  private calculateGematriaWinnerAdjustment(matchupAnalysis: MatchupGematriaAnalysis): number {
    const edgeMagnitude = Math.abs(matchupAnalysis.homeWinProbFused - matchupAnalysis.homeWinProbBio);
    return edgeMagnitude * 100; // Convert to confidence scale
  }

  /**
   * Calculate Gematria adjustment for over/under prediction  
   */
  private calculateGematriaOuAdjustment(
    homeePlayers: GematriaEnhancedPlayer[],
    awayPlayers: GematriaEnhancedPlayer[]
  ): number {
    const allPlayers = [...homeePlayers, ...awayPlayers];
    const avgGAS = allPlayers.reduce((sum, p) => sum + p.gas!, 0) / allPlayers.length;
    const avgEdge = allPlayers.reduce((sum, p) => sum + Math.abs(p.gematriaEdgeProb!), 0) / allPlayers.length;
    
    // High GAS + high average edge suggests more variance/higher total
    return (avgGAS * 15) + (avgEdge * 25);
  }

  /**
   * Fuse base confidence with Gematria adjustment
   */
  private fuseConfidence(baseConfidence: number, gematriaAdjustment: number): number {
    const weight = 0.25; // Gematria influence weight (25%)
    const adjustment = gematriaAdjustment * weight;
    return Math.min(95, Math.max(55, baseConfidence + adjustment));
  }

  /**
   * Determine primary numerological factor for commentary
   */
  private determinePrimaryNumerologyFactor(
    homeGematria: any,
    awayGematria: any,
    homePlayers: GematriaEnhancedPlayer[],
    awayPlayers: GematriaEnhancedPlayer[]
  ): string {
    const allPlayers = [...homePlayers, ...awayPlayers];
    
    // Check for exact matches
    const exactMatches = allPlayers.filter(p => p.exactMatch).length;
    if (exactMatches >= 2) return 'multiple exact cipher alignments';
    
    // Check for ritual hits
    const ritualHits = allPlayers.filter(p => p.ritualHit).length;
    if (ritualHits >= 2) return 'ritual number convergence';
    
    // Check for birthday alignments
    const birthdayAligns = allPlayers.filter(p => p.bdayWeek).length;
    if (birthdayAligns >= 1) return 'birthday cosmic timing';
    
    // Check for high GAS differential
    const gasDiff = Math.abs(homeGematria.avgGAS - awayGematria.avgGAS);
    if (gasDiff >= 0.3) return 'significant GAS differential';
    
    // Default
    return 'subtle numerological influences';
  }

  /**
   * Generate Gematria-specific commentary
   */
  private generateGematriaCommentary(
    matchupAnalysis: MatchupGematriaAnalysis,
    numerologyFactor: string,
    basePrediction: any
  ): string {
    const edgeMagnitude = Math.abs(matchupAnalysis.homeWinProbFused - matchupAnalysis.homeWinProbBio);
    
    let templateCategory: 'highNumerology' | 'moderateNumerology' | 'lowNumerology';
    if (edgeMagnitude >= 0.15) templateCategory = 'highNumerology';
    else if (edgeMagnitude >= 0.08) templateCategory = 'moderateNumerology';
    else templateCategory = 'lowNumerology';
    
    const templates = this.gematriaCommentaryTemplates[templateCategory];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const pick = `${basePrediction.winner.toUpperCase()} + ${basePrediction.ouLean.toUpperCase()}`;
    
    return template
      .replace('{numerologyFactor}', numerologyFactor)
      .replace('{pick}', pick)
      .replace(/\{pick\}/g, pick);
  }

  /**
   * Create fallback Gematria prediction when analysis fails
   */
  private createFallbackGematriaPrediction(basePrediction: any): GematriaEnhancedPrediction {
    return {
      ...basePrediction,
      gematria: {
        homeGAS: 0.5,
        awayGAS: 0.5,
        gasDifferential: 0,
        ritualAlignment: 0.5,
        birthdayAlignment: 0,
        numerologyFactor: 'data compilation in progress',
        gematriaConfidence: 'Trail',
        gematriaCommentary: '🔢 Gematria analysis loading - check back for full cosmic insights!',
        fusedWinnerConfidence: basePrediction.winnerConfidence,
        fusedOuConfidence: basePrediction.ouConfidence,
        edgeOverBioBoost: 0
      },
      topGematriaPlayers: []
    };
  }
}

export const gematriaPredictionsService = new GematriaPredictionsService();