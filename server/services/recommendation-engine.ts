import { Player } from "@shared/schema";

export interface UserProfile {
  id: number;
  preferredBetTypes: string[]; // ['over_under', 'player_props', 'spreads']
  riskTolerance: 'low' | 'medium' | 'high';
  favoriteTeams: string[];
  bankrollSize: number;
  maxBetSize: number;
  winRate: number;
  totalBets: number;
  preferences: {
    favoritePositions?: string[]; // ['QB', 'WR', 'RB']
    preferredOdds?: 'underdog' | 'favorite' | 'any';
    minConfidence?: number; // Minimum confidence threshold
    avoidInjured?: boolean;
    preferPrimetime?: boolean;
  };
}

export interface PersonalizedRecommendation {
  player: Player;
  recommendationType: 'high_confidence' | 'value_bet' | 'safe_play' | 'longshot';
  personalizedScore: number; // 0-100 personalized score
  reasons: string[];
  suggestedBetSize: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  matchReasons: {
    teamMatch: boolean;
    positionMatch: boolean;
    betTypeMatch: boolean;
    riskMatch: boolean;
    confidenceMatch: boolean;
  };
}

export class RecommendationEngine {
  private static readonly BET_TYPE_WEIGHTS = {
    over_under: 0.3,
    player_props: 0.4,
    spreads: 0.2,
    totals: 0.1
  };

  private static readonly RISK_MULTIPLIERS = {
    low: 0.6,
    medium: 1.0,
    high: 1.4
  };

  static generatePersonalizedRecommendations(
    players: Player[],
    userProfile: UserProfile
  ): PersonalizedRecommendation[] {
    return players
      .map(player => this.calculatePersonalizedScore(player, userProfile))
      .filter(rec => rec.personalizedScore > 60) // Only show promising recommendations
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 8); // Top 8 personalized recommendations
  }

  private static calculatePersonalizedScore(
    player: Player,
    userProfile: UserProfile
  ): PersonalizedRecommendation {
    let score = player.bioBoostScore * 0.4; // Base BioBoost weight
    const reasons: string[] = [];
    const matchReasons = {
      teamMatch: false,
      positionMatch: false,
      betTypeMatch: false,
      riskMatch: false,
      confidenceMatch: false
    };

    // Team preference boost
    if (userProfile.favoriteTeams.includes(player.team)) {
      score += 15;
      reasons.push(`🏈 Favorite team ${player.team}`);
      matchReasons.teamMatch = true;
    }

    // Position preference
    if (userProfile.preferences.favoritePositions?.includes(player.position)) {
      score += 10;
      reasons.push(`⭐ Preferred position ${player.position}`);
      matchReasons.positionMatch = true;
    }

    // Bet type alignment
    const playerBetType = this.mapPlayerToBetType(player);
    if (userProfile.preferredBetTypes.includes(playerBetType)) {
      score += 12;
      reasons.push(`🎯 Matches ${playerBetType} preference`);
      matchReasons.betTypeMatch = true;
    }

    // Risk tolerance alignment
    const playerRisk = this.calculatePlayerRisk(player);
    if (this.isRiskAligned(playerRisk, userProfile.riskTolerance)) {
      score += 8;
      reasons.push(`📊 Matches ${userProfile.riskTolerance} risk tolerance`);
      matchReasons.riskMatch = true;
    }

    // Confidence threshold
    if (player.confidence >= (userProfile.preferences.minConfidence || 70)) {
      score += 5;
      reasons.push(`✅ High confidence (${player.confidence}%)`);
      matchReasons.confidenceMatch = true;
    }

    // Injury avoidance
    if (userProfile.preferences.avoidInjured && player.injuryRecoveryDays > 0) {
      score -= 20;
      reasons.push(`🚨 Recent injury concern`);
    }

    // BioBoost specific boosts
    if (player.sleepScore >= 85) {
      score += 5;
      reasons.push(`😴 Elite sleep performance`);
    }
    
    if (player.testosteroneProxy >= 90) {
      score += 6;
      reasons.push(`💪 Peak testosterone indicators`);
    }

    if (player.hydrationLevel >= 80) {
      score += 3;
      reasons.push(`💧 Optimal hydration levels`);
    }

    // Historical performance boost
    if (userProfile.winRate > 0.6) {
      score *= 1.05; // Slight boost for successful users
      reasons.push(`🔥 Aligned with your winning patterns`);
    }

    // Calculate recommendation type
    const recommendationType = this.getRecommendationType(player, score, userProfile);
    
    // Calculate suggested bet size
    const suggestedBetSize = this.calculateBetSize(score, userProfile, playerRisk);

    // Calculate expected value
    const expectedValue = this.calculateExpectedValue(player, userProfile);

    return {
      player,
      recommendationType,
      personalizedScore: Math.min(100, Math.max(0, Math.round(score))),
      reasons: reasons.slice(0, 4), // Top 4 reasons
      suggestedBetSize,
      expectedValue,
      riskLevel: playerRisk,
      matchReasons
    };
  }

  private static mapPlayerToBetType(player: Player): string {
    // Map player bet types to user preferences
    if (player.betType.includes('Yards') || player.betType.includes('Completions')) {
      return 'player_props';
    }
    if (player.betType.includes('Total')) {
      return 'totals';
    }
    if (player.recommendedPick === 'OVER' || player.recommendedPick === 'UNDER') {
      return 'over_under';
    }
    return 'spreads';
  }

  private static calculatePlayerRisk(player: Player): 'low' | 'medium' | 'high' {
    if (player.confidence >= 85 && player.bioBoostScore >= 85) return 'low';
    if (player.confidence >= 70 && player.bioBoostScore >= 70) return 'medium';
    return 'high';
  }

  private static isRiskAligned(playerRisk: string, userTolerance: string): boolean {
    if (userTolerance === 'low') return playerRisk === 'low';
    if (userTolerance === 'medium') return playerRisk === 'low' || playerRisk === 'medium';
    return true; // High tolerance accepts all risks
  }

  private static getRecommendationType(
    player: Player, 
    score: number, 
    userProfile: UserProfile
  ): PersonalizedRecommendation['recommendationType'] {
    if (score >= 90 && player.confidence >= 85) return 'high_confidence';
    if (score >= 80 && this.calculateExpectedValue(player, userProfile) > 0.1) return 'value_bet';
    if (userProfile.riskTolerance === 'low' && player.confidence >= 80) return 'safe_play';
    if (userProfile.riskTolerance === 'high' && score >= 75) return 'longshot';
    return 'value_bet';
  }

  private static calculateBetSize(
    score: number, 
    userProfile: UserProfile, 
    riskLevel: string
  ): number {
    let baseSize = userProfile.maxBetSize * 0.1; // Start with 10% of max bet

    // Kelly Criterion inspired sizing
    const confidence = score / 100;
    const kellyMultiplier = Math.min(confidence * 0.5, 0.25); // Max 25% of bankroll
    
    let suggestedSize = userProfile.bankrollSize * kellyMultiplier;
    
    // Risk tolerance adjustment
    const riskMultiplier = RecommendationEngine.RISK_MULTIPLIERS[userProfile.riskTolerance];
    suggestedSize *= riskMultiplier;

    // Ensure within user limits
    suggestedSize = Math.min(suggestedSize, userProfile.maxBetSize);
    suggestedSize = Math.max(suggestedSize, 1); // Minimum $1

    return Math.round(suggestedSize);
  }

  private static calculateExpectedValue(player: Player, userProfile: UserProfile): number {
    // Simplified expected value calculation
    const impliedProb = player.confidence / 100;
    const payout = 1.8; // Assume average -125 odds
    
    return (impliedProb * payout) - 1;
  }

  static getRecommendationTypeInfo(type: PersonalizedRecommendation['recommendationType']) {
    const typeInfo = {
      high_confidence: {
        emoji: '🎯',
        title: 'High Confidence',
        description: 'Our algorithm is highly confident in this pick',
        color: 'text-primary'
      },
      value_bet: {
        emoji: '💰',
        title: 'Value Bet',
        description: 'Great value opportunity based on your preferences',
        color: 'text-accent'
      },
      safe_play: {
        emoji: '🛡️',
        title: 'Safe Play',
        description: 'Conservative pick matching your risk profile',
        color: 'text-sleep'
      },
      longshot: {
        emoji: '🚀',
        title: 'Longshot',
        description: 'High-risk, high-reward opportunity',
        color: 'text-destructive'
      }
    };

    return typeInfo[type];
  }

  static generateSampleUserProfile(): UserProfile {
    return {
      id: 1,
      preferredBetTypes: ['player_props', 'over_under'],
      riskTolerance: 'medium',
      favoriteTeams: ['KC', 'SF', 'BUF'],
      bankrollSize: 500,
      maxBetSize: 50,
      winRate: 0.62,
      totalBets: 47,
      preferences: {
        favoritePositions: ['QB', 'WR'],
        preferredOdds: 'any',
        minConfidence: 75,
        avoidInjured: true,
        preferPrimetime: false
      }
    };
  }
}