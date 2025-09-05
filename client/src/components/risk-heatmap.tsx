import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, TrendingDown, AlertTriangle, Target, Brain, 
  Zap, Shield, DollarSign, BarChart3, Activity 
} from "lucide-react";
// @ts-ignore
import { calculateBettingRisk } from "@/utils/riskCalculator";

interface RiskData {
  betType: string;
  game: string;
  teams: string;
  riskScore: number;
  confidence: number;
  potentialReturn: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid' | 'strong_avoid';
  factors: {
    lineMovement: number;
    publicBetting: number;
    weather: number;
    injuries: number;
    history: number;
  };
  aiInsight: string;
  projection: number;
}

interface RiskHeatmapProps {
  games?: any[];
  compact?: boolean;
  className?: string;
}

// Risk calculation algorithms using advanced risk calculator
function calculateRiskScore(game: any): RiskData[] {
  const betTypes = ['spread', 'overUnder', 'moneyline'];
  const betTypeLabels = ['Spread', 'Over/Under', 'Moneyline'];
  
  return betTypes.map((betType, index) => {
    // Use advanced risk calculator
    const riskAnalysis = calculateBettingRisk(game, betType);
    
    return {
      betType: betTypeLabels[index],
      game: game.id || 'game',
      teams: `${game.awayTeam?.abbreviation || 'AWAY'} @ ${game.homeTeam?.abbreviation || 'HOME'}`,
      riskScore: riskAnalysis.riskScore,
      confidence: riskAnalysis.confidence,
      potentialReturn: riskAnalysis.potentialReturn,
      recommendation: riskAnalysis.recommendation,
      factors: {
        lineMovement: riskAnalysis.factors.lineMovement,
        publicBetting: riskAnalysis.factors.publicBetting,
        weather: riskAnalysis.factors.weather,
        injuries: riskAnalysis.factors.injuries,
        history: riskAnalysis.factors.history
      },
      aiInsight: riskAnalysis.aiInsight,
      projection: riskAnalysis.projection
    };
  });
}

// Color mapping for risk levels
const getRiskColor = (score: number) => {
  if (score < 20) return "bg-green-500";
  if (score < 40) return "bg-green-400";
  if (score < 60) return "bg-yellow-400";
  if (score < 80) return "bg-orange-500";
  return "bg-red-500";
};

const getRecommendationColor = (rec: string) => {
  switch (rec) {
    case 'strong_buy': return "text-green-500";
    case 'buy': return "text-green-400";
    case 'hold': return "text-yellow-400";
    case 'avoid': return "text-orange-500";
    case 'strong_avoid': return "text-red-500";
    default: return "text-gray-400";
  }
};

export default function RiskHeatmap({ games = [], compact = false, className = "" }: RiskHeatmapProps) {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [selectedCell, setSelectedCell] = useState<RiskData | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'list' | 'insights'>('heatmap');

  // Generate risk data for all games
  useEffect(() => {
    if (games.length > 0) {
      const allRiskData = games.flatMap(game => calculateRiskScore(game));
      setRiskData(allRiskData);
    } else {
      // Mock data for standalone view
      const mockGames = [
        { id: 'BUF-NYJ', awayTeam: { abbreviation: 'BUF' }, homeTeam: { abbreviation: 'NYJ' } },
        { id: 'MIA-NE', awayTeam: { abbreviation: 'MIA' }, homeTeam: { abbreviation: 'NE' } },
        { id: 'CIN-CLE', awayTeam: { abbreviation: 'CIN' }, homeTeam: { abbreviation: 'CLE' } },
        { id: 'HOU-IND', awayTeam: { abbreviation: 'HOU' }, homeTeam: { abbreviation: 'IND' } },
      ];
      const allRiskData = mockGames.flatMap(game => calculateRiskScore(game));
      setRiskData(allRiskData);
    }
  }, [games]);

  // Group data by game for heatmap display
  const groupedData = riskData.reduce((acc, item) => {
    if (!acc[item.teams]) acc[item.teams] = {};
    acc[item.teams][item.betType] = item;
    return acc;
  }, {} as Record<string, Record<string, RiskData>>);

  const teamList = Object.keys(groupedData);
  const betTypes = ['Spread', 'Over/Under', 'Moneyline'];

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-primary" />
            Risk Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-1 text-xs">
            {riskData.slice(0, 9).map((risk, index) => (
              <div
                key={index}
                className={`p-2 rounded text-white text-center ${getRiskColor(risk.riskScore)}`}
                data-testid={`risk-cell-${risk.betType}-${risk.teams.replace(/\s/g, '-')}`}
              >
                <div className="font-medium">{risk.betType.split('/')[0]}</div>
                <div className="text-xs opacity-90">{risk.riskScore}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Dynamic Betting Risk Heatmap
              <Badge variant="outline" className="bg-primary/10">
                AI Powered
              </Badge>
            </CardTitle>
            <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as 'heatmap' | 'list' | 'insights')} className="w-auto">
              <TabsList>
                <TabsTrigger value="heatmap" data-testid="tab-heatmap">Heatmap</TabsTrigger>
                <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
                <TabsTrigger value="insights" data-testid="tab-insights">AI Insights</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={viewMode} className="w-full">
            {/* Heatmap View */}
            <TabsContent value="heatmap" className="space-y-4">
              <div className="grid gap-2">
                {/* Header */}
                <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                  <div>Teams</div>
                  {betTypes.map(type => (
                    <div key={type} className="text-center">{type}</div>
                  ))}
                </div>
                
                {/* Risk Cells */}
                <TooltipProvider>
                  {teamList.map(team => (
                    <motion.div
                      key={team}
                      className="grid grid-cols-4 gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center text-sm font-medium">
                        {team}
                      </div>
                      
                      {betTypes.map(betType => {
                        const risk = groupedData[team][betType];
                        if (!risk) return <div key={betType} />;
                        
                        return (
                          <Tooltip key={betType}>
                            <TooltipTrigger asChild>
                              <motion.div
                                className={`
                                  relative p-4 rounded-lg cursor-pointer text-white text-center
                                  ${getRiskColor(risk.riskScore)}
                                  hover:scale-105 transition-all duration-200
                                `}
                                onClick={() => setSelectedCell(risk)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                data-testid={`risk-cell-${betType}-${team.replace(/\s/g, '-')}`}
                              >
                                <div className="font-bold text-lg">{risk.riskScore}</div>
                                <div className="text-xs opacity-90">
                                  {risk.recommendation.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="absolute inset-0 bg-white/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity" />
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-sm">
                                <div className="font-semibold">{team} - {betType}</div>
                                <div>Risk Score: {risk.riskScore}/100</div>
                                <div>Confidence: {risk.confidence}%</div>
                                <div>Potential Return: +{risk.potentialReturn}%</div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </motion.div>
                  ))}
                </TooltipProvider>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Low Risk (0-20)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                  <span>Medium Risk (21-60)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High Risk (61-100)</span>
                </div>
              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="space-y-3">
              {riskData
                .sort((a, b) => a.riskScore - b.riskScore)
                .map((risk, index) => (
                  <motion.div
                    key={`${risk.teams}-${risk.betType}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    data-testid={`list-item-${risk.betType}-${risk.teams.replace(/\s/g, '-')}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(risk.riskScore)}`} />
                      <div>
                        <div className="font-medium">{risk.teams}</div>
                        <div className="text-sm text-muted-foreground">{risk.betType}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">Risk: {risk.riskScore}</div>
                        <div className="text-sm text-muted-foreground">+{risk.potentialReturn}%</div>
                      </div>
                      <Badge className={getRecommendationColor(risk.recommendation)}>
                        {risk.recommendation.replace('_', ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
            </TabsContent>

            {/* AI Insights View */}
            <TabsContent value="insights" className="space-y-4">
              {riskData
                .filter(risk => risk.recommendation === 'strong_buy' || risk.recommendation === 'strong_avoid')
                .map((risk, index) => (
                  <motion.div
                    key={`${risk.teams}-${risk.betType}-insight`}
                    className="p-4 border rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        risk.recommendation === 'strong_buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {risk.recommendation === 'strong_buy' ? 
                          <TrendingUp className="w-4 h-4" /> : 
                          <AlertTriangle className="w-4 h-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{risk.teams}</span>
                          <Badge variant="outline">{risk.betType}</Badge>
                          <Badge className={getRecommendationColor(risk.recommendation)}>
                            {risk.recommendation.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {risk.aiInsight}
                        </p>
                        
                        {/* Factor Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                          {Object.entries(risk.factors).map(([factor, value]) => (
                            <div key={factor} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                                <span>{value}%</span>
                              </div>
                              <Progress value={value} className="h-1" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Cell Detail Modal */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCell(null)}
          >
            <motion.div
              className="bg-background border rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{selectedCell.teams}</h3>
                  <Badge className={getRecommendationColor(selectedCell.recommendation)}>
                    {selectedCell.recommendation.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bet Type:</span>
                    <div className="font-medium">{selectedCell.betType}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk Score:</span>
                    <div className="font-medium text-lg">{selectedCell.riskScore}/100</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="font-medium">{selectedCell.confidence}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Potential Return:</span>
                    <div className="font-medium">+{selectedCell.potentialReturn}%</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <span className="text-muted-foreground text-sm">AI Insight:</span>
                  <p className="text-sm mt-1">{selectedCell.aiInsight}</p>
                </div>
                
                <Button 
                  onClick={() => setSelectedCell(null)} 
                  className="w-full"
                  data-testid="close-detail-modal"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { type RiskData };