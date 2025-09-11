import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star,
  Heart,
  TrendingUp,
  Bell,
  Target,
  Trophy,
  Clock,
  ArrowRight,
  Bookmark,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import AccessGate from "@/components/AccessGate";
import GematriaSection from "@/components/GematriaSection";

interface SavedPick {
  id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  pickedTeam: string;
  confidence: string;
  date: string;
  status: "pending" | "won" | "lost";
}

interface FavoriteTeam {
  id: string;
  name: string;
  code: string;
  emoji: string;
  record: string;
  nextGame: string;
  bioBoostTrend: "up" | "down" | "stable";
}

interface RecentAlert {
  id: string;
  type: "line_movement" | "injury" | "weather";
  title: string;
  description: string;
  time: string;
  urgency: "low" | "medium" | "high";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: savedPicks = [] } = useQuery({
    queryKey: ['/api/user/saved-picks']
  });

  const { data: favoriteTeams = [] } = useQuery({
    queryKey: ['/api/user/favorite-teams']
  });

  const { data: recentAlerts = [] } = useQuery({
    queryKey: ['/api/user/recent-alerts']
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦍</div>
          <div className="text-xl font-semibold text-jungle mb-2">Loading Your Jungle...</div>
          <div className="text-muted-foreground">Personalizing your GuerillaGenics experience</div>
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
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  🦍
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold text-white">Your Jungle Dashboard</h1>
                <p className="text-banana text-lg">Personalized picks, alerts, and performance tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/50">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="overview-tab"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="picks"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="picks-tab"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Picks
            </TabsTrigger>
            <TabsTrigger 
              value="gematria"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white relative"
              data-testid="gematria-tab"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🔢</span>
                <span className="hidden sm:inline">Gematria</span>
                <span className="sm:hidden">Num</span>
                <div className="absolute -top-1 -right-1 bg-banana text-jungle text-xs px-1 rounded font-bold">
                  PRO
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="teams-tab"
            >
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Teams</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alerts"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="alerts-tab"
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <DashboardOverview dashboardData={dashboardData} />
          </TabsContent>

          <TabsContent value="picks" className="space-y-6 mt-6">
            <SavedPicksSection picks={savedPicks} />
          </TabsContent>

          <TabsContent value="gematria" className="space-y-6 mt-6">
            <GematriaSection />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6 mt-6">
            <FavoriteTeamsSection teams={favoriteTeams} />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6 mt-6">
            <RecentAlertsSection alerts={recentAlerts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardOverview({ dashboardData }: { dashboardData: any }) {
  const stats = dashboardData?.stats || {
    totalPicks: 0,
    winRate: 0,
    currentStreak: 0,
    favoriteTeams: 0
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-jungle">{stats.totalPicks}</div>
            <div className="text-sm text-muted-foreground">Total Picks Made</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-vine">{stats.winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-banana">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-jungle">{stats.favoriteTeams}</div>
            <div className="text-sm text-muted-foreground">Favorite Teams</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-jungle" />
              Weekly Picks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View this week's GuerillaGenics picks with live odds and BioBoost analysis.
            </p>
            <Button asChild className="w-full">
              <Link href="/weekly-picks">
                View Weekly Picks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-jungle" />
              Top 5 DFS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Discover elite DFS targets with ggScore analysis and value ratings.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/top5">
                Explore DFS Picks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-jungle" />
              Juice Watch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with real-time line movements and betting alerts.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/alerts">
                View Alerts
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SavedPicksSection({ picks }: { picks: SavedPick[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-jungle">Your Saved Picks</h2>
        <Badge variant="outline">{picks.length} picks saved</Badge>
      </div>

      {picks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">🍌</div>
            <div className="text-xl font-semibold text-jungle mb-2">No Saved Picks Yet</div>
            <div className="text-muted-foreground mb-4">
              Start saving picks from the Weekly Picks or Top 5 DFS pages
            </div>
            <Button asChild>
              <Link href="/weekly-picks">Browse Weekly Picks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((pick: SavedPick, index: number) => (
            <motion.div
              key={pick.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{pick.awayTeam} @ {pick.homeTeam}</div>
                      <div className="text-sm text-muted-foreground">
                        Picked: {pick.pickedTeam}
                      </div>
                    </div>
                    <Badge className={
                      pick.status === 'won' ? 'bg-vine/10 text-vine' :
                      pick.status === 'lost' ? 'bg-red-50 text-red-600' :
                      'bg-banana/10 text-banana'
                    }>
                      {pick.status === 'pending' ? 'Pending' : pick.status === 'won' ? 'Won' : 'Lost'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="ml-2 font-medium">{pick.confidence}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="ml-2">{new Date(pick.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function FavoriteTeamsSection({ teams }: { teams: FavoriteTeam[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-jungle">Your Favorite Teams</h2>
        <Badge variant="outline">{teams.length} teams followed</Badge>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">❤️</div>
            <div className="text-xl font-semibold text-jungle mb-2">No Favorite Teams Yet</div>
            <div className="text-muted-foreground mb-4">
              Add your favorite NFL teams to get personalized updates and analysis
            </div>
            <Button asChild>
              <Link href="/profile">Manage Favorites</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team: FavoriteTeam, index: number) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{team.emoji}</div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">{team.record}</div>
                    </div>
                    <div className="ml-auto">
                      {team.bioBoostTrend === 'up' && <TrendingUp className="w-4 h-4 text-vine" />}
                      {team.bioBoostTrend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {team.bioBoostTrend === 'stable' && <TrendingUp className="w-4 h-4 text-banana rotate-90" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Next Game:</span>
                    <div className="font-medium mt-1">{team.nextGame}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentAlertsSection({ alerts }: { alerts: RecentAlert[] }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'line_movement': return '📈';
      case 'injury': return '🏥';
      case 'weather': return '🌧️';
      default: return '🔔';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-banana bg-banana/5';
      case 'low': return 'border-l-vine bg-vine/5';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-jungle">Recent Alerts</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/alerts">View All Alerts</Link>
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">🔔</div>
            <div className="text-xl font-semibold text-jungle mb-2">No Recent Alerts</div>
            <div className="text-muted-foreground">
              You'll see Juice Watch alerts and important updates here
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert: RecentAlert, index: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${getUrgencyColor(alert.urgency)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-jungle">{alert.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.description}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                        <Badge size="sm" className={
                          alert.urgency === 'high' ? 'bg-red-500 text-white' :
                          alert.urgency === 'medium' ? 'bg-banana text-black' :
                          'bg-vine text-white'
                        }>
                          {alert.urgency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}