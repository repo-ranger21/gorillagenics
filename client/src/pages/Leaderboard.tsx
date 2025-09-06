import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Trophy, 
  TrendingUp, 
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Target,
  Zap,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface Contributor {
  id: string;
  name: string;
  avatar?: string;
  rank: number;
  previousRank: number;
  pickAccuracy: number;
  bioBoostWinRate: number;
  currentStreak: number;
  streakType: "win" | "loss";
  totalPicks: number;
  weeklyWins: number;
  seasonWins: number;
  badge: "silverback" | "banana_streak" | "fast_climber" | "veteran" | "rookie";
  specialization: string;
  lastActive: string;
}

const badgeConfig = {
  silverback: { emoji: "🦍", label: "Silverback", color: "bg-jungle text-white" },
  banana_streak: { emoji: "🍌", label: "Banana Streak", color: "bg-banana text-black" },
  fast_climber: { emoji: "🐆", label: "Fast Climber", color: "bg-vine text-white" },
  veteran: { emoji: "⭐", label: "Veteran", color: "bg-blue-500 text-white" },
  rookie: { emoji: "🌱", label: "Rookie", color: "bg-green-500 text-white" }
};

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "season">("weekly");

  const { data: contributors = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard', timeframe],
    refetchInterval: 60000, // Refresh every minute
  });

  const getRankChange = (current: number, previous: number) => {
    if (current < previous) return { direction: "up", change: previous - current };
    if (current > previous) return { direction: "down", change: current - previous };
    return { direction: "same", change: 0 };
  };

  const getRankIcon = (direction: string, change: number) => {
    if (direction === "up") return <ArrowUp className="w-3 h-3 text-vine" />;
    if (direction === "down") return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <div className="text-xl font-semibold text-jungle mb-2">Calculating Rankings...</div>
          <div className="text-muted-foreground">Ranking the jungle's top contributors</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-jungle to-vine border-b border-jungle/20">
        <div className="container mx-auto px-4 py-8">
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
                <h1 className="text-4xl font-bold text-white">Contributor Leaderboard</h1>
                <p className="text-banana text-lg">Top contributors ranked by pick accuracy and BioBoost performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Timeframe Selection */}
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as "weekly" | "season")} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2 bg-white/50">
              <TabsTrigger 
                value="weekly" 
                className="data-[state=active]:bg-jungle data-[state=active]:text-white"
                data-testid="weekly-tab"
              >
                <Target className="w-4 h-4 mr-2" />
                This Week
              </TabsTrigger>
              <TabsTrigger 
                value="season"
                className="data-[state=active]:bg-jungle data-[state=active]:text-white"
                data-testid="season-tab"
              >
                <Crown className="w-4 h-4 mr-2" />
                Season
              </TabsTrigger>
            </TabsList>

            <div className="text-sm text-muted-foreground">
              {contributors.length} contributors ranked
            </div>
          </div>

          <TabsContent value="weekly" className="space-y-6">
            <LeaderboardTable contributors={contributors} timeframe="weekly" />
          </TabsContent>

          <TabsContent value="season" className="space-y-6">
            <LeaderboardTable contributors={contributors} timeframe="season" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function LeaderboardTable({ contributors, timeframe }: { contributors: Contributor[], timeframe: string }) {
  const topThree = contributors.slice(0, 3);
  const remaining = contributors.slice(3);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4">
        {topThree.map((contributor, index) => {
          const rankChange = getRankChange(contributor.rank, contributor.previousRank);
          const badge = badgeConfig[contributor.badge];
          
          return (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden ${
                index === 0 ? 'ring-2 ring-banana shadow-xl' : 
                index === 1 ? 'ring-2 ring-gray-300' : 
                'ring-2 ring-amber-600'
              }`}>
                <CardHeader className="text-center pb-3">
                  <div className="flex items-center justify-center mb-3">
                    {index === 0 && <Crown className="w-6 h-6 text-banana mr-2" />}
                    <div className={`text-3xl font-bold ${
                      index === 0 ? 'text-banana' : 
                      index === 1 ? 'text-gray-400' : 
                      'text-amber-600'
                    }`}>
                      #{contributor.rank}
                    </div>
                    <div className="ml-2 flex items-center">
                      {getRankIcon(rankChange.direction, rankChange.change)}
                    </div>
                  </div>
                  
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback className="text-lg font-bold">
                      {contributor.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <CardTitle className="text-lg">{contributor.name}</CardTitle>
                  <Badge className={`${badge.color} text-xs`}>
                    {badge.emoji} {badge.label}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-vine/10 rounded-lg">
                      <div className="text-lg font-bold text-vine">{contributor.pickAccuracy}%</div>
                      <div className="text-xs text-muted-foreground">Pick Accuracy</div>
                    </div>
                    <div className="p-2 bg-jungle/10 rounded-lg">
                      <div className="text-lg font-bold text-jungle">{contributor.bioBoostWinRate}%</div>
                      <div className="text-xs text-muted-foreground">BioBoost Win %</div>
                    </div>
                  </div>

                  <div className="text-center p-2 bg-banana/10 rounded-lg">
                    <div className="text-lg font-bold text-banana">
                      {contributor.currentStreak} {contributor.streakType === "win" ? "🔥" : "❄️"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current {contributor.streakType === "win" ? "Win" : "Loss"} Streak
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      {timeframe === "weekly" ? contributor.weeklyWins : contributor.seasonWins} wins this {timeframe}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Specializes in {contributor.specialization}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Remaining Contributors Table */}
      {remaining.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-jungle" />
              Full Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {remaining.map((contributor, index) => {
                const rankChange = getRankChange(contributor.rank, contributor.previousRank);
                const badge = badgeConfig[contributor.badge];
                
                return (
                  <motion.div
                    key={contributor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    data-testid={`contributor-rank-${contributor.rank}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        <span className="font-bold text-jungle">#{contributor.rank}</span>
                        {getRankIcon(rankChange.direction, rankChange.change)}
                      </div>
                      
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contributor.avatar} />
                        <AvatarFallback className="text-sm">
                          {contributor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="font-medium">{contributor.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${badge.color} text-xs`}>
                            {badge.emoji} {badge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {contributor.specialization}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-vine">{contributor.pickAccuracy}%</div>
                        <div className="text-xs text-muted-foreground">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-jungle">{contributor.bioBoostWinRate}%</div>
                        <div className="text-xs text-muted-foreground">BioBoost</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-banana">
                          {contributor.currentStreak} {contributor.streakType === "win" ? "🔥" : "❄️"}
                        </div>
                        <div className="text-xs text-muted-foreground">Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">
                          {timeframe === "weekly" ? contributor.weeklyWins : contributor.seasonWins}
                        </div>
                        <div className="text-xs text-muted-foreground">Wins</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}