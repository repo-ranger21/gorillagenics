import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Player } from "@shared/schema";
import { useState, useEffect } from "react";

interface PersonalizedRecommendation {
  player: Player;
  recommendationType: 'high_confidence' | 'value_bet' | 'safe_play' | 'longshot';
  personalizedScore: number;
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

interface PersonalizedRecommendationsProps {
  players: Player[];
}

interface UserProfile {
  id: number;
  preferredBetTypes: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  favoriteTeams: string[];
  bankrollSize: number;
  maxBetSize: number;
  winRate: number;
  totalBets: number;
  preferences: {
    favoritePositions?: string[];
    preferredOdds?: 'underdog' | 'favorite' | 'any';
    minConfidence?: number;
    avoidInjured?: boolean;
    preferPrimetime?: boolean;
  };
}

const RECOMMENDATION_TYPES = {
  high_confidence: {
    emoji: '🎯',
    title: 'High Confidence',
    description: 'Algorithm highly confident in this pick',
    color: 'bg-primary/20 text-primary border-primary/30',
    textColor: 'text-primary'
  },
  value_bet: {
    emoji: '💰',
    title: 'Value Bet',
    description: 'Great value opportunity based on your profile',
    color: 'bg-accent/20 text-accent border-accent/30',
    textColor: 'text-accent'
  },
  safe_play: {
    emoji: '🛡️',
    title: 'Safe Play',
    description: 'Conservative pick matching your risk profile',
    color: 'bg-sleep/20 text-sleep border-sleep/30',
    textColor: 'text-sleep'
  },
  longshot: {
    emoji: '🚀',
    title: 'Longshot',
    description: 'High-risk, high-reward opportunity',
    color: 'bg-destructive/20 text-destructive border-destructive/30',
    textColor: 'text-destructive'
  }
};

// Sample user profile for demonstration
const SAMPLE_USER_PROFILE: UserProfile = {
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

export default function PersonalizedRecommendations({ players }: PersonalizedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(SAMPLE_USER_PROFILE);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PersonalizedRecommendation | null>(null);

  // Generate personalized recommendations
  useEffect(() => {
    if (players.length > 0) {
      const personalizedRecs = generatePersonalizedRecommendations(players, userProfile);
      setRecommendations(personalizedRecs);
    }
  }, [players, userProfile]);

  const generatePersonalizedRecommendations = (
    playerList: Player[],
    profile: UserProfile
  ): PersonalizedRecommendation[] => {
    return playerList
      .map(player => calculatePersonalizedScore(player, profile))
      .filter(rec => rec.personalizedScore > 60)
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 6); // Top 6 recommendations
  };

  const calculatePersonalizedScore = (
    player: Player,
    profile: UserProfile
  ): PersonalizedRecommendation => {
    let score = player.bioBoostScore * 0.4;
    const reasons: string[] = [];
    const matchReasons = {
      teamMatch: false,
      positionMatch: false,
      betTypeMatch: false,
      riskMatch: false,
      confidenceMatch: false
    };

    // Team preference boost
    if (profile.favoriteTeams.includes(player.team)) {
      score += 15;
      reasons.push(`🏈 Favorite team ${player.team}`);
      matchReasons.teamMatch = true;
    }

    // Position preference
    if (profile.preferences.favoritePositions?.includes(player.position)) {
      score += 10;
      reasons.push(`⭐ Preferred ${player.position} position`);
      matchReasons.positionMatch = true;
    }

    // Risk alignment
    const playerRisk = getPlayerRisk(player);
    if (isRiskAligned(playerRisk, profile.riskTolerance)) {
      score += 8;
      reasons.push(`📊 Matches ${profile.riskTolerance} risk tolerance`);
      matchReasons.riskMatch = true;
    }

    // Confidence threshold
    if (player.confidence >= (profile.preferences.minConfidence || 70)) {
      score += 5;
      reasons.push(`✅ High confidence (${player.confidence}%)`);
      matchReasons.confidenceMatch = true;
    }

    // BioBoost bonuses
    if (player.sleepScore >= 85) {
      score += 5;
      reasons.push(`😴 Elite sleep performance`);
    }
    if (player.testosteroneProxy >= 90) {
      score += 6;
      reasons.push(`💪 Peak T-Index indicators`);
    }

    // Injury penalty
    if (profile.preferences.avoidInjured && player.injuryRecoveryDays > 0) {
      score -= 20;
      reasons.push(`🚨 Recent injury concern`);
    }

    const recommendationType = getRecommendationType(player, score, profile);
    const suggestedBetSize = calculateBetSize(score, profile);
    const expectedValue = (player.confidence / 100 * 1.8) - 1; // Simplified EV

    return {
      player,
      recommendationType,
      personalizedScore: Math.min(100, Math.max(0, Math.round(score))),
      reasons: reasons.slice(0, 3),
      suggestedBetSize,
      expectedValue,
      riskLevel: playerRisk,
      matchReasons
    };
  };

  const getPlayerRisk = (player: Player): 'low' | 'medium' | 'high' => {
    if (player.confidence >= 85 && player.bioBoostScore >= 85) return 'low';
    if (player.confidence >= 70 && player.bioBoostScore >= 70) return 'medium';
    return 'high';
  };

  const isRiskAligned = (playerRisk: string, userTolerance: string): boolean => {
    if (userTolerance === 'low') return playerRisk === 'low';
    if (userTolerance === 'medium') return playerRisk === 'low' || playerRisk === 'medium';
    return true;
  };

  const getRecommendationType = (
    player: Player, 
    score: number, 
    profile: UserProfile
  ): PersonalizedRecommendation['recommendationType'] => {
    if (score >= 90 && player.confidence >= 85) return 'high_confidence';
    if (score >= 80) return 'value_bet';
    if (profile.riskTolerance === 'low' && player.confidence >= 80) return 'safe_play';
    if (profile.riskTolerance === 'high' && score >= 75) return 'longshot';
    return 'value_bet';
  };

  const calculateBetSize = (score: number, profile: UserProfile): number => {
    const confidence = score / 100;
    let suggestedSize = profile.bankrollSize * (confidence * 0.05); // Max 5% of bankroll
    suggestedSize = Math.min(suggestedSize, profile.maxBetSize);
    return Math.max(Math.round(suggestedSize), 1);
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-card-foreground flex items-center gap-2">
            🎯 Your Personal Picks
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Based on your profile • {recommendations.length} recommendations
          </div>
        </div>
        
        {/* User Profile Summary */}
        <div className="mt-4 p-4 bg-muted/20 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-foreground">Risk Level</div>
              <div className="text-muted-foreground capitalize">{userProfile.riskTolerance}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Win Rate</div>
              <div className="text-primary font-bold">{(userProfile.winRate * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Bankroll</div>
              <div className="text-accent font-bold">${userProfile.bankrollSize}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Favorite Teams</div>
              <div className="text-muted-foreground">{userProfile.favoriteTeams.join(', ')}</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => {
            const typeInfo = RECOMMENDATION_TYPES[rec.recommendationType];
            
            return (
              <motion.div
                key={`${rec.player.id}-rec-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="cursor-pointer"
                onClick={() => setSelectedRecommendation(rec)}
              >
                <Card className={`border-2 transition-all hover:shadow-lg ${typeInfo.color}`}>
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-card-foreground" data-testid={`rec-player-${rec.player.id}`}>
                          {rec.player.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {rec.player.team} • {rec.player.position}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={typeInfo.color}>
                          {typeInfo.emoji} {typeInfo.title}
                        </Badge>
                      </div>
                    </div>

                    {/* Personalized Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Personal Match Score</span>
                        <span className={`text-xl font-bold ${typeInfo.textColor}`}>
                          {rec.personalizedScore}/100
                        </span>
                      </div>
                      <Progress 
                        value={rec.personalizedScore} 
                        className="h-2"
                      />
                    </div>

                    {/* Bet Details */}
                    <div className="mb-4 p-3 bg-muted/10 rounded">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {rec.player.recommendedPick} {rec.player.betLine}
                        </div>
                        <div className="text-sm text-muted-foreground">{rec.player.betType}</div>
                        <div className={`text-lg font-semibold ${typeInfo.textColor} mt-2`}>
                          ${rec.suggestedBetSize} suggested bet
                        </div>
                      </div>
                    </div>

                    {/* Match Indicators */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {rec.matchReasons.teamMatch && (
                          <Badge variant="outline" className="text-xs">🏈 Team</Badge>
                        )}
                        {rec.matchReasons.positionMatch && (
                          <Badge variant="outline" className="text-xs">⭐ Position</Badge>
                        )}
                        {rec.matchReasons.riskMatch && (
                          <Badge variant="outline" className="text-xs">📊 Risk</Badge>
                        )}
                        {rec.matchReasons.confidenceMatch && (
                          <Badge variant="outline" className="text-xs">✅ Confidence</Badge>
                        )}
                      </div>
                    </div>

                    {/* Top Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-card-foreground mb-2">Why this pick:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {rec.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <Button 
                      className={`w-full ${typeInfo.textColor === 'text-primary' ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-accent/90'} text-white font-bold`}
                      data-testid={`button-lock-rec-${rec.player.id}`}
                    >
                      {typeInfo.emoji} Lock in ${rec.suggestedBetSize}
                    </Button>

                    {/* Stats */}
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>Confidence: {rec.player.confidence}%</span>
                      <span>EV: {(rec.expectedValue * 100).toFixed(1)}%</span>
                      <span>Risk: {rec.riskLevel}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🦍</div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Building Your Personal Recommendations
            </h3>
            <p className="text-muted-foreground">
              Our gorilla is analyzing your preferences and player data...
            </p>
          </div>
        )}

        {/* Profile Customization CTA */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">
              🎯 Customize Your Recommendations
            </h3>
            <p className="text-muted-foreground mb-4">
              Update your betting preferences, risk tolerance, and favorite teams to get even better personalized picks.
            </p>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-customize-profile"
            >
              📊 Update Profile Settings
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}