import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Zap, 
  Clock,
  DollarSign,
  Star,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface TopFivePlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  ggScore: number;
  salary: number;
  ownership: number;
  matchup: string;
  opponent: string;
  spread: number;
  total: number;
  weatherImpact: string;
  slate: "Main" | "Prime-Time";
  commentary: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  projectedPoints: number;
  valueRating: number;
}

export default function TopFive() {
  const [selectedSlate, setSelectedSlate] = useState<"Main" | "Prime-Time">("Main");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: topFivePlayers = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/top-five', selectedSlate],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-vine border-vine bg-vine/10';
      case 'MEDIUM': return 'text-banana border-banana bg-banana/10';
      case 'LOW': return 'text-gray-600 border-gray-400 bg-gray-100';
      default: return 'text-gray-600 border-gray-400 bg-gray-100';
    }
  };

  const getValueRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-vine';
    if (rating >= 6) return 'text-banana';
    return 'text-red-600';
  };

  if (isLoading && topFivePlayers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦍</div>
          <div className="text-xl font-semibold text-jungle mb-2">Analyzing Elite Targets...</div>
          <div className="text-muted-foreground">Peeling the data bananas for top DFS plays</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-jungle to-vine border-b border-jungle/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Trophy className="w-8 h-8 text-banana" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Top 5 DFS Picks</h1>
                  <p className="text-banana text-lg">Elite offensive superstars with ggScore analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right text-white/80">
                <div className="text-sm">Last Updated</div>
                <div className="text-xs">{lastUpdated.toLocaleTimeString()}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="refresh-top-five"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Slate Selection */}
        <Tabs value={selectedSlate} onValueChange={(value) => setSelectedSlate(value as "Main" | "Prime-Time")} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2 bg-white/50">
              <TabsTrigger 
                value="Main" 
                className="data-[state=active]:bg-jungle data-[state=active]:text-white"
                data-testid="main-slate-tab"
              >
                <Target className="w-4 h-4 mr-2" />
                Main Slate
              </TabsTrigger>
              <TabsTrigger 
                value="Prime-Time"
                className="data-[state=active]:bg-jungle data-[state=active]:text-white"
                data-testid="primetime-slate-tab"
              >
                <Star className="w-4 h-4 mr-2" />
                Prime-Time
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Updates every 30 seconds</span>
            </div>
          </div>

          <TabsContent value="Main" className="space-y-6">
            <TopFiveGrid players={topFivePlayers.filter((p: TopFivePlayer) => p.slate === "Main")} />
          </TabsContent>

          <TabsContent value="Prime-Time" className="space-y-6">
            <TopFiveGrid players={topFivePlayers.filter((p: TopFivePlayer) => p.slate === "Prime-Time")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TopFiveGrid({ players }: { players: TopFivePlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🍌</div>
        <div className="text-xl font-semibold text-jungle mb-2">No Elite Targets Found</div>
        <div className="text-muted-foreground">Data is swinging in late — check back soon!</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {players.slice(0, 5).map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          data-testid={`top-pick-${index + 1}`}
        >
          <Card className="hover:shadow-lg transition-all duration-200 border-jungle/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-jungle to-vine rounded-lg">
                    <span className="text-white font-bold text-lg">#{index + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-jungle/10 text-jungle border-jungle/30">
                        {player.team} {player.position}
                      </Badge>
                      <Badge className={`border ${player.confidence === 'HIGH' ? 'bg-vine/10 text-vine border-vine' : 
                        player.confidence === 'MEDIUM' ? 'bg-banana/10 text-banana border-banana' : 
                        'bg-gray-100 text-gray-600 border-gray-400'}`}>
                        {player.confidence}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-jungle">{player.ggScore}</div>
                  <div className="text-xs text-muted-foreground">ggScore</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Salary</div>
                  <div className="font-bold text-jungle">${(player.salary / 1000).toFixed(1)}K</div>
                </div>
                <div className="text-center p-3 bg-accent/50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Proj. Pts</div>
                  <div className="font-bold text-jungle">{player.projectedPoints.toFixed(1)}</div>
                </div>
              </div>

              {/* Value Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Value Rating</span>
                  <span className={`text-lg font-bold ${player.valueRating >= 8 ? 'text-vine' : 
                    player.valueRating >= 6 ? 'text-banana' : 'text-red-600'}`}>
                    {player.valueRating.toFixed(1)}/10
                  </span>
                </div>
                <Progress 
                  value={player.valueRating * 10} 
                  className="h-2"
                  data-testid={`value-rating-${player.id}`}
                />
              </div>

              {/* Matchup Info */}
              <div className="p-3 bg-jungle/5 rounded-lg border-l-4 border-jungle">
                <div className="text-sm font-medium text-jungle mb-1">
                  {player.matchup} vs {player.opponent}
                </div>
                <div className="text-xs text-muted-foreground">
                  Spread: {player.spread > 0 ? '+' : ''}{player.spread} | Total: {player.total}
                </div>
              </div>

              {/* Commentary */}
              <div className="p-3 bg-banana/5 rounded-lg border-l-4 border-banana">
                <div className="text-sm">
                  <div className="font-medium text-banana mb-1">🦍 Gorilla Take</div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{player.commentary}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {player.ownership}% owned
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {player.weatherImpact}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}