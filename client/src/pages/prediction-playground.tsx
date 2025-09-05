import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, TrendingDown, Target, Activity, Zap, Users } from "lucide-react";
import { Link } from "wouter";

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  bioBoostScore: number;
  sleepScore: number;
  testosteroneProxy: number;
  cortisolProxy: number;
  hydrationLevel: number;
  injuryRecoveryDays: number;
}

interface PredictionFactors {
  sleepWeight: number;
  testosteroneWeight: number;
  cortisolWeight: number;
  hydrationWeight: number;
  injuryWeight: number;
  weatherImpact: number;
  matchupDifficulty: number;
}

const DEFAULT_FACTORS: PredictionFactors = {
  sleepWeight: 30,
  testosteroneWeight: 40,
  cortisolWeight: 15,
  hydrationWeight: 10,
  injuryWeight: 5,
  weatherImpact: 0,
  matchupDifficulty: 50,
};

export default function PredictionPlayground() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [factors, setFactors] = useState<PredictionFactors>(DEFAULT_FACTORS);
  const [activeTab, setActiveTab] = useState("factors");

  // Fetch players data
  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
    refetchInterval: 2 * 60 * 1000,
  });

  // Fetch weekly picks for comparison
  const { data: weeklyPicks = [] } = useQuery<any[]>({
    queryKey: ['/api/weekly-picks/1'],
    refetchInterval: 2 * 60 * 1000,
  });

  // Calculate custom prediction based on adjusted factors
  const customPrediction = useMemo(() => {
    if (!selectedPlayer) return null;

    const {
      sleepWeight,
      testosteroneWeight,
      cortisolWeight,
      hydrationWeight,
      injuryWeight,
      weatherImpact,
      matchupDifficulty
    } = factors;

    // Normalize scores to 0-100 range
    const sleepScore = (selectedPlayer.sleepScore / 10) * 10;
    const testScore = (selectedPlayer.testosteroneProxy / 10) * 10;
    const cortisolScore = 100 - (selectedPlayer.cortisolProxy / 10) * 10; // Lower is better
    const hydrationScore = (selectedPlayer.hydrationLevel / 10) * 10;
    const injuryScore = Math.max(0, 100 - (selectedPlayer.injuryRecoveryDays * 10)); // Fewer days is better

    // Calculate weighted BioBoost
    const customBioBoost = Math.round(
      (sleepScore * sleepWeight / 100) +
      (testScore * testosteroneWeight / 100) +
      (cortisolScore * cortisolWeight / 100) +
      (hydrationScore * hydrationWeight / 100) +
      (injuryScore * injuryWeight / 100)
    );

    // Apply weather and matchup adjustments
    const weatherAdjustment = (weatherImpact - 50) * 0.2; // -10 to +10 range
    const matchupAdjustment = (matchupDifficulty - 50) * 0.1; // -5 to +5 range
    
    const finalScore = Math.max(0, Math.min(100, customBioBoost + weatherAdjustment + matchupAdjustment));

    // Determine confidence and recommendation
    const confidence = finalScore > 75 ? 'HIGH' : finalScore > 50 ? 'MODERATE' : 'LOW';
    const recommendation = finalScore > selectedPlayer.bioBoostScore ? 'BUY' : 
                          finalScore < selectedPlayer.bioBoostScore ? 'SELL' : 'HOLD';

    return {
      customBioBoost: Math.round(finalScore),
      originalBioBoost: selectedPlayer.bioBoostScore,
      difference: Math.round(finalScore - selectedPlayer.bioBoostScore),
      confidence,
      recommendation,
      breakdown: {
        sleep: Math.round(sleepScore * sleepWeight / 100),
        testosterone: Math.round(testScore * testosteroneWeight / 100),
        cortisol: Math.round(cortisolScore * cortisolWeight / 100),
        hydration: Math.round(hydrationScore * hydrationWeight / 100),
        injury: Math.round(injuryScore * injuryWeight / 100),
      }
    };
  }, [selectedPlayer, factors]);

  // Reset to defaults
  const resetFactors = () => {
    setFactors(DEFAULT_FACTORS);
  };

  // Factor update handler
  const updateFactor = (key: keyof PredictionFactors, value: number) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A]">
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2">
              🧬 Prediction Playground
            </h1>
            <p className="text-primary text-lg">
              Interactive Player Performance Analysis Lab
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              LIVE DATA
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/weekly-picks">
                <Target className="h-4 w-4 mr-2" />
                View Picks
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Player Selection */}
          <div className="xl:col-span-1">
            <Card className="bg-background/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                  <Users className="h-5 w-5" />
                  Select Player
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedPlayer?.id || ""} 
                  onValueChange={(id) => setSelectedPlayer(players.find(p => p.id === id) || null)}
                >
                  <SelectTrigger data-testid="player-select">
                    <SelectValue placeholder="Choose a player..." />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({player.position}) - {player.team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPlayer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-primary/10 rounded-lg"
                  >
                    <h3 className="font-semibold text-foreground mb-3">Current Stats</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">BioBoost</div>
                        <div className="font-bold text-primary">{selectedPlayer.bioBoostScore}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Sleep</div>
                        <div className="font-bold">{selectedPlayer.sleepScore}/10</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Testosterone</div>
                        <div className="font-bold">{selectedPlayer.testosteroneProxy}/10</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Cortisol</div>
                        <div className="font-bold">{selectedPlayer.cortisolProxy}/10</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Hydration</div>
                        <div className="font-bold">{selectedPlayer.hydrationLevel}/10</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Recovery</div>
                        <div className="font-bold">{selectedPlayer.injuryRecoveryDays}d</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls & Results */}
          <div className="xl:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-background/20 backdrop-blur-sm">
                <TabsTrigger value="factors" data-testid="factors-tab">
                  <Zap className="h-4 w-4 mr-2" />
                  Factors
                </TabsTrigger>
                <TabsTrigger value="results" data-testid="results-tab">
                  <Target className="h-4 w-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="comparison" data-testid="comparison-tab">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Compare
                </TabsTrigger>
              </TabsList>

              {/* Factor Controls */}
              <TabsContent value="factors" className="mt-6">
                <Card className="bg-background/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Prediction Factors</span>
                      <Button variant="outline" size="sm" onClick={resetFactors} data-testid="reset-factors">
                        Reset Defaults
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* BioBoost Factor Weights */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">BioBoost Weights</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Sleep Impact</label>
                            <span className="text-sm text-muted-foreground">{factors.sleepWeight}%</span>
                          </div>
                          <Slider
                            value={[factors.sleepWeight]}
                            onValueChange={([value]) => updateFactor('sleepWeight', value)}
                            max={60}
                            step={5}
                            className="w-full"
                            data-testid="sleep-weight-slider"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Testosterone Impact</label>
                            <span className="text-sm text-muted-foreground">{factors.testosteroneWeight}%</span>
                          </div>
                          <Slider
                            value={[factors.testosteroneWeight]}
                            onValueChange={([value]) => updateFactor('testosteroneWeight', value)}
                            max={60}
                            step={5}
                            className="w-full"
                            data-testid="testosterone-weight-slider"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Cortisol Impact</label>
                            <span className="text-sm text-muted-foreground">{factors.cortisolWeight}%</span>
                          </div>
                          <Slider
                            value={[factors.cortisolWeight]}
                            onValueChange={([value]) => updateFactor('cortisolWeight', value)}
                            max={30}
                            step={5}
                            className="w-full"
                            data-testid="cortisol-weight-slider"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Hydration Impact</label>
                            <span className="text-sm text-muted-foreground">{factors.hydrationWeight}%</span>
                          </div>
                          <Slider
                            value={[factors.hydrationWeight]}
                            onValueChange={([value]) => updateFactor('hydrationWeight', value)}
                            max={25}
                            step={5}
                            className="w-full"
                            data-testid="hydration-weight-slider"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Injury Recovery Impact</label>
                            <span className="text-sm text-muted-foreground">{factors.injuryWeight}%</span>
                          </div>
                          <Slider
                            value={[factors.injuryWeight]}
                            onValueChange={([value]) => updateFactor('injuryWeight', value)}
                            max={20}
                            step={5}
                            className="w-full"
                            data-testid="injury-weight-slider"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Environmental Factors */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-foreground">Environmental Factors</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Weather Impact</label>
                            <span className="text-sm text-muted-foreground">
                              {factors.weatherImpact > 50 ? '+' : factors.weatherImpact < 50 ? '-' : '±'}
                              {Math.abs(factors.weatherImpact - 50)}
                            </span>
                          </div>
                          <Slider
                            value={[factors.weatherImpact]}
                            onValueChange={([value]) => updateFactor('weatherImpact', value)}
                            max={100}
                            step={10}
                            className="w-full"
                            data-testid="weather-impact-slider"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Matchup Difficulty</label>
                            <span className="text-sm text-muted-foreground">
                              {factors.matchupDifficulty > 50 ? 'Hard' : factors.matchupDifficulty < 50 ? 'Easy' : 'Average'}
                            </span>
                          </div>
                          <Slider
                            value={[factors.matchupDifficulty]}
                            onValueChange={([value]) => updateFactor('matchupDifficulty', value)}
                            max={100}
                            step={10}
                            className="w-full"
                            data-testid="matchup-difficulty-slider"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Results */}
              <TabsContent value="results" className="mt-6">
                <Card className="bg-background/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Custom Prediction Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlayer && customPrediction ? (
                      <div className="space-y-6">
                        {/* Main Result */}
                        <div className="text-center p-6 bg-primary/10 rounded-lg">
                          <div className="text-4xl font-bold text-primary mb-2" data-testid="custom-bioboost">
                            {customPrediction.customBioBoost}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">Custom BioBoost Score</div>
                          <div className="flex items-center justify-center gap-2">
                            {customPrediction.difference > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : customPrediction.difference < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            ) : null}
                            <span className={`font-semibold ${
                              customPrediction.difference > 0 ? 'text-green-500' : 
                              customPrediction.difference < 0 ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                              {customPrediction.difference > 0 ? '+' : ''}{customPrediction.difference} vs Original
                            </span>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-background/30 rounded-lg">
                            <div className="text-2xl font-bold mb-1" data-testid="recommendation">
                              {customPrediction.recommendation}
                            </div>
                            <div className="text-sm text-muted-foreground">Recommendation</div>
                          </div>
                          <div className="text-center p-4 bg-background/30 rounded-lg">
                            <div className="text-2xl font-bold mb-1" data-testid="confidence">
                              {customPrediction.confidence}
                            </div>
                            <div className="text-sm text-muted-foreground">Confidence</div>
                          </div>
                        </div>

                        {/* Factor Breakdown */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-foreground">Score Breakdown</h3>
                          <div className="space-y-2">
                            {Object.entries(customPrediction.breakdown).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center p-2 bg-background/20 rounded">
                                <span className="capitalize text-sm">{key}</span>
                                <span className="font-semibold">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Select a player to see custom predictions</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comparison */}
              <TabsContent value="comparison" className="mt-6">
                <Card className="bg-background/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Weekly Picks Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPlayer ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Compare your custom prediction with this week's official GuerillaGenics picks
                        </p>
                        <div className="space-y-3">
                          {weeklyPicks.slice(0, 3).map((pick: any, index: number) => (
                            <div 
                              key={pick.gameId || index} 
                              className="flex items-center justify-between p-3 bg-background/30 rounded-lg"
                            >
                              <div>
                                <div className="font-semibold">{pick.awayTeam} @ {pick.homeTeam}</div>
                                <div className="text-xs text-muted-foreground">
                                  Pick: {pick.winner === 'home' ? pick.homeTeam : pick.awayTeam}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold">{pick.winnerConfidence}</div>
                                <div className="text-xs text-muted-foreground">Confidence</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center">
                          <Button variant="outline" asChild>
                            <Link href="/weekly-picks">View All Picks</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Select a player to compare with weekly picks</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}