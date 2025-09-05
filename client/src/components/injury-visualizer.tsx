import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, Shield, TrendingDown, TrendingUp, User, Users } from "lucide-react";

// Player position impact weights
const POSITION_WEIGHTS = {
  QB: 0.9,      // Quarterback - highest impact
  RB: 0.7,      // Running Back
  WR: 0.6,      // Wide Receiver
  TE: 0.5,      // Tight End
  OL: 0.8,      // Offensive Line
  DL: 0.6,      // Defensive Line
  LB: 0.5,      // Linebacker
  CB: 0.4,      // Cornerback
  S: 0.4,       // Safety
  K: 0.1,       // Kicker
  P: 0.1        // Punter
};

// Injury severity levels
const INJURY_SEVERITY = {
  OUT: { weight: 1.0, color: 'red', label: 'Out', emoji: '🚫' },
  DOUBTFUL: { weight: 0.8, color: 'red', label: 'Doubtful', emoji: '⚠️' },
  QUESTIONABLE: { weight: 0.5, color: 'yellow', label: 'Questionable', emoji: '❓' },
  PROBABLE: { weight: 0.2, color: 'yellow', label: 'Probable', emoji: '🤕' },
  HEALTHY: { weight: 0.0, color: 'green', label: 'Healthy', emoji: '✅' }
};

interface InjuryData {
  playerId: string;
  playerName: string;
  position: keyof typeof POSITION_WEIGHTS;
  status: keyof typeof INJURY_SEVERITY;
  injuryType?: string;
  weeksTrend?: number[]; // Historical injury status over weeks
  impactScore: number; // 0-100 calculated impact
}

interface InjuryVisualizerProps {
  teamName: string;
  teamAbbr: string;
  injuries: InjuryData[];
  className?: string;
  compact?: boolean;
}

export default function InjuryVisualizer({ 
  teamName, 
  teamAbbr, 
  injuries, 
  className = "",
  compact = false 
}: InjuryVisualizerProps) {
  const [animatedImpact, setAnimatedImpact] = useState(0);
  const [selectedInjury, setSelectedInjury] = useState<InjuryData | null>(null);

  // Calculate total team injury impact
  const calculateTeamImpact = () => {
    if (!injuries || injuries.length === 0) return 0;
    
    const totalImpact = injuries.reduce((sum, injury) => {
      const positionWeight = POSITION_WEIGHTS[injury.position] || 0.3;
      const severityWeight = INJURY_SEVERITY[injury.status]?.weight || 0;
      return sum + (positionWeight * severityWeight * 100);
    }, 0);
    
    return Math.min(100, totalImpact);
  };

  const teamImpact = calculateTeamImpact();

  // Animate impact score
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedImpact(teamImpact);
    }, 300);
    return () => clearTimeout(timer);
  }, [teamImpact]);

  // Get impact color and description
  const getImpactStyle = (impact: number) => {
    if (impact >= 70) return { 
      color: 'text-red-400', 
      bgColor: 'bg-red-500/20', 
      borderColor: 'border-red-500/40',
      description: 'Critical Impact',
      emoji: '🚨'
    };
    if (impact >= 40) return { 
      color: 'text-yellow-400', 
      bgColor: 'bg-yellow-500/20', 
      borderColor: 'border-yellow-500/40',
      description: 'Moderate Impact',
      emoji: '⚠️'
    };
    if (impact >= 15) return { 
      color: 'text-orange-400', 
      bgColor: 'bg-orange-500/20', 
      borderColor: 'border-orange-500/40',
      description: 'Minor Impact',
      emoji: '🤕'
    };
    return { 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/20', 
      borderColor: 'border-green-500/40',
      description: 'Minimal Impact',
      emoji: '✅'
    };
  };

  const impactStyle = getImpactStyle(animatedImpact);

  // Group injuries by severity
  const groupedInjuries = injuries.reduce((acc, injury) => {
    const severity = injury.status;
    if (!acc[severity]) acc[severity] = [];
    acc[severity].push(injury);
    return acc;
  }, {} as Record<string, InjuryData[]>);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className}`}
      >
        <div className={`p-2 rounded-lg ${impactStyle.bgColor} ${impactStyle.borderColor} border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-lg">{impactStyle.emoji}</div>
              <div className="text-sm">
                <div className={`font-semibold ${impactStyle.color}`}>
                  {animatedImpact.toFixed(0)}% Impact
                </div>
                <div className="text-xs text-muted-foreground">
                  {injuries.length} injuries
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className}`}
    >
      <Card className={`bg-background/20 backdrop-blur-sm border-border/30 ${impactStyle.borderColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg">
            <motion.div
              animate={{ 
                rotate: animatedImpact > 50 ? [0, 10, -10, 0] : 0,
                scale: animatedImpact > 70 ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                duration: 2, 
                repeat: animatedImpact > 50 ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="text-xl"
            >
              {impactStyle.emoji}
            </motion.div>
            
            <div>
              <div className="flex items-center gap-2">
                <span>{teamName} Injury Impact</span>
                <Badge 
                  variant="outline" 
                  className={`${impactStyle.color} ${impactStyle.borderColor} text-xs`}
                >
                  {impactStyle.description}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Impact Score */}
          <div className={`p-4 rounded-lg ${impactStyle.bgColor} ${impactStyle.borderColor} border`}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-foreground">Overall Impact</div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`text-2xl font-bold ${impactStyle.color}`}
              >
                {animatedImpact.toFixed(0)}%
              </motion.div>
            </div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            >
              <Progress 
                value={animatedImpact} 
                className={`h-2 ${
                  animatedImpact >= 70 ? 'bg-red-200 [&>div]:bg-red-500' :
                  animatedImpact >= 40 ? 'bg-yellow-200 [&>div]:bg-yellow-500' :
                  animatedImpact >= 15 ? 'bg-orange-200 [&>div]:bg-orange-500' :
                  'bg-green-200 [&>div]:bg-green-500'
                }`}
              />
            </motion.div>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Gorilla Health Index</span>
              <span>{100 - animatedImpact.toFixed(0)}% Team Strength</span>
            </div>
          </div>

          {/* Injury Breakdown */}
          {injuries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Injury Report ({injuries.length})
              </h4>
              
              <AnimatePresence>
                {Object.entries(groupedInjuries).map(([severity, injuryList]) => {
                  const severityData = INJURY_SEVERITY[severity as keyof typeof INJURY_SEVERITY];
                  if (!severityData || injuryList.length === 0) return null;
                  
                  return (
                    <motion.div
                      key={severity}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-3 rounded-lg border ${
                        severityData.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                        severityData.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{severityData.emoji}</span>
                          <span className={`text-sm font-medium ${
                            severityData.color === 'red' ? 'text-red-400' :
                            severityData.color === 'yellow' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {severityData.label} ({injuryList.length})
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {injuryList.map((injury, index) => (
                          <motion.div
                            key={injury.playerId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between text-xs"
                            onClick={() => setSelectedInjury(injury)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {injury.position}
                              </Badge>
                              <span className="text-foreground font-medium">
                                {injury.playerName}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {injury.injuryType || 'Injury'}
                              </span>
                              
                              <motion.div
                                animate={{ 
                                  scale: injury.impactScore > 60 ? [1, 1.1, 1] : 1
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: injury.impactScore > 60 ? Infinity : 0 
                                }}
                                className={`text-xs font-bold ${
                                  injury.impactScore > 60 ? 'text-red-400' :
                                  injury.impactScore > 30 ? 'text-yellow-400' :
                                  'text-green-400'
                                }`}
                              >
                                {injury.impactScore.toFixed(0)}
                              </motion.div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* No Injuries State */}
          {injuries.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 bg-green-500/10 rounded-lg border border-green-500/30"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-4xl mb-2"
              >
                💪
              </motion.div>
              
              <div className="text-green-400 font-semibold mb-1">
                Peak Gorilla Health!
              </div>
              
              <div className="text-sm text-muted-foreground">
                No significant injuries reported
              </div>
            </motion.div>
          )}

          {/* Team Health Trend */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Team Health Trend</span>
              <div className="flex items-center gap-1">
                {teamImpact < 30 ? (
                  <>
                    <TrendingUp className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">Improving</span>
                  </>
                ) : teamImpact > 60 ? (
                  <>
                    <TrendingDown className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">Declining</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">Stable</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Injury Modal/Popup could go here */}
      <AnimatePresence>
        {selectedInjury && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInjury(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background border border-border rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">
                  {INJURY_SEVERITY[selectedInjury.status]?.emoji}
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {selectedInjury.playerName}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="outline">
                    {selectedInjury.position}
                  </Badge>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                    Impact: {selectedInjury.impactScore.toFixed(0)}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-4">
                  <div><strong>Status:</strong> {INJURY_SEVERITY[selectedInjury.status]?.label}</div>
                  {selectedInjury.injuryType && (
                    <div><strong>Injury:</strong> {selectedInjury.injuryType}</div>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedInjury(null)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Utility function to generate mock injury data for testing
export function generateMockInjuryData(teamAbbr: string): InjuryData[] {
  const mockPlayers = [
    { name: 'Star Quarterback', position: 'QB' as const, status: 'QUESTIONABLE' as const, injuryType: 'Shoulder' },
    { name: 'Top Receiver', position: 'WR' as const, status: 'PROBABLE' as const, injuryType: 'Hamstring' },
    { name: 'Elite Back', position: 'RB' as const, status: 'OUT' as const, injuryType: 'Knee' },
    { name: 'O-Line Anchor', position: 'OL' as const, status: 'DOUBTFUL' as const, injuryType: 'Ankle' },
    { name: 'Defensive Star', position: 'LB' as const, status: 'HEALTHY' as const }
  ];

  // Generate 2-4 random injuries
  const numInjuries = Math.floor(Math.random() * 3) + 2;
  const selectedPlayers = mockPlayers
    .sort(() => Math.random() - 0.5)
    .slice(0, numInjuries);

  return selectedPlayers.map((player, index) => {
    const positionWeight = POSITION_WEIGHTS[player.position] || 0.3;
    const severityWeight = INJURY_SEVERITY[player.status]?.weight || 0;
    const impactScore = Math.min(100, positionWeight * severityWeight * 100 + Math.random() * 20);
    
    return {
      playerId: `${teamAbbr}-${index}`,
      playerName: player.name,
      position: player.position,
      status: player.status,
      injuryType: player.injuryType,
      impactScore
    };
  });
}