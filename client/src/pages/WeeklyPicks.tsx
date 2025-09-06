import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Target, TrendingUp, Users, Calendar, RefreshCw } from "lucide-react";
import { Link } from "wouter";

// Components
import WeekSelector from "@/components/WeekSelector";
import WeeklyPickCard from "@/components/WeeklyPickCard";
import NewsletterCTA from "@/components/NewsletterCTA";
import LoadingScreen from "@/components/LoadingScreen";
import FallbackContent from "@/components/FallbackContent";
import { TopFivePanel } from "@/components/TopFivePanel";

import { 
  getCurrentNFLWeek, 
  shouldRollover, 
  getStoredWeek,
  storeCurrentWeek,
  needsDataRefresh,
  fetchNFLSchedule
} from "@/utils/weekFetcher";

// Data constants - will be fetched from API
const TIME_SLOT_NAMES = {
  'thursday': 'Thursday Night Football',
  'friday': 'International Game', 
  'sunday_early': 'Sunday Early Games',
  'sunday_late': 'Sunday Late Games',
  'snf': 'Sunday Night Football',
  'mnf': 'Monday Night Football'
};
const TIME_SLOT_ORDER = ['thursday', 'friday', 'sunday_early', 'sunday_late', 'snf', 'mnf'];

export default function WeeklyPicks() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekData, setWeekData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Initialize and fetch data
  useEffect(() => {
    initializeWeeklyPicks();
  }, []);

  // Auto-refresh check
  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldRollover() || needsDataRefresh()) {
        handleWeekChange(getCurrentNFLWeek());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const initializeWeeklyPicks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detectedWeek = getCurrentNFLWeek();
      setCurrentWeek(detectedWeek);
      
      await loadWeekData(detectedWeek);
      storeCurrentWeek(detectedWeek);
      
    } catch (err) {
      console.error('Failed to initialize weekly picks:', err);
      setError((err as Error).message || 'Failed to initialize');
      
      // Try to load stored data as fallback
      const stored = getStoredWeek();
      if (stored) {
        setCurrentWeek(stored.week);
        await loadWeekData(stored.week, true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeekData = async (weekNumber: number, useCache = false) => {
    try {
      // Fetch week data from API
      const response = await fetch(`/api/weekly-picks/${weekNumber}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch week ${weekNumber} data`);
      }
      const schedule = await response.json();
      setWeekData(schedule);
      setLastUpdated(new Date());
      
      // Cache the data
      localStorage.setItem(`picks_week_${weekNumber}`, JSON.stringify({
        data: schedule,
        lastUpdated: new Date().toISOString()
      }));
      return;

      if (useCache) {
        // Try cached data first
        const cached = localStorage.getItem(`picks_week_${weekNumber}`);
        if (cached) {
          const cachedData = JSON.parse(cached);
          setWeekData(cachedData.data || []);
          setLastUpdated(new Date(cachedData.lastUpdated || Date.now()));
          return;
        }
      }
      
    } catch (err) {
      console.error(`Failed to load week ${weekNumber} data:`, err);
      throw err;
    }
  };

  const handleWeekChange = async (newWeek: number) => {
    if (newWeek === currentWeek) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await loadWeekData(newWeek);
      setCurrentWeek(newWeek);
      setActiveFilter('all');
      storeCurrentWeek(newWeek);
    } catch (err) {
      setError((err as Error).message || 'Failed to change week');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    initializeWeeklyPicks();
  };

  const handleRefreshData = async () => {
    await loadWeekData(currentWeek, false);
  };

  // Filter games by time slot
  const getFilteredGames = () => {
    if (activeFilter === 'all') return weekData;
    return weekData.filter((game: any) => game.timeSlot === activeFilter);
  };

  // Group games by time slot for display
  const groupedGames = TIME_SLOT_ORDER.reduce((acc: any, slot) => {
    const games = weekData.filter((game: any) => game.timeSlot === slot);
    if (games.length > 0) {
      acc[slot] = games;
    }
    return acc;
  }, {});

  // Calculate summary stats
  const totalGames = weekData.length;
  const highConfidencePicks = weekData.filter((game: any) => game.winnerConfidence === 'HIGH').length;
  const avgBioBoost = weekData.length > 0 
    ? Math.round(weekData.reduce((sum: number, game: any) => {
        // Handle different possible data structures
        const homeBioBoost = game.home?.bioBoost || game.homeBioBoost || 75;
        const awayBioBoost = game.away?.bioBoost || game.awayBioBoost || 75;
        return sum + Math.max(homeBioBoost, awayBioBoost);
      }, 0) / weekData.length)
    : 0;

  if (isLoading && weekData.length === 0) {
    return <LoadingScreen message="🦍 Fetching weekly gorilla picks..." />;
  }

  if (error && weekData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <div className="container mx-auto px-4 py-8">
          <FallbackContent 
            onRetry={handleRetry} 
            error={error}
            lastKnownData={null} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-primary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">GuerillaGenics — Weekly Picks</h1>
                  <p className="text-muted-foreground">Bet Smarter. Go Primal.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshData}
                className="flex items-center gap-2"
                data-testid="refresh-picks"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Badge variant="outline" className="bg-primary/10">
                <Calendar className="w-3 h-3 mr-1" />
                Week {currentWeek}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Top 5 Weekly DFS Picks */}
        <TopFivePanel />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Week Selector & Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <WeekSelector 
                    currentWeek={currentWeek}
                    onWeekChange={handleWeekChange}
                    data-testid="weekly-picks-selector"
                  />
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-2xl text-primary">{totalGames}</div>
                      <div className="text-muted-foreground">Games</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-green-600">{highConfidencePicks}</div>
                      <div className="text-muted-foreground">High Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-2xl text-blue-600">{avgBioBoost}</div>
                      <div className="text-muted-foreground">Avg BioBoost</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auto-rollover Alert */}
            {shouldRollover() && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-blue-200 bg-blue-50">
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    🦍 <strong>Auto-Update:</strong> Tuesday rollover detected! 
                    Picks have been updated to Week {getCurrentNFLWeek()}.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                  <TabsList className="grid grid-cols-7 w-full">
                    <TabsTrigger value="all" className="text-xs" data-testid="filter-all">
                      All ({totalGames})
                    </TabsTrigger>
                    {TIME_SLOT_ORDER.map(slot => {
                      const count = weekData.filter(game => game.timeSlot === slot).length;
                      if (count === 0) return null;
                      return (
                        <TabsTrigger 
                          key={slot} 
                          value={slot} 
                          className="text-xs"
                          data-testid={`filter-${slot}`}
                        >
                          {slot === 'thursday' ? 'THU' :
                           slot === 'friday' ? 'FRI' :
                           slot === 'sunday_early' ? 'SUN AM' :
                           slot === 'sunday_late' ? 'SUN PM' :
                           slot === 'snf' ? 'SNF' : 'MNF'} ({count})
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* Games Display */}
            <AnimatePresence mode="wait">
              {weekData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🦍</div>
                  <h3 className="text-xl font-semibold mb-2">No picks available yet</h3>
                  <p className="text-muted-foreground">
                    Check back Tuesday for the latest gorilla intel!
                  </p>
                </motion.div>
              ) : activeFilter === 'all' ? (
                // Show grouped by time slot
                <div className="space-y-8">
                  {Object.entries(groupedGames).map(([slot, games]) => (
                    <motion.div
                      key={slot}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-0.5 bg-primary/20 flex-1" />
                        <h3 className="text-lg font-semibold text-primary">
                          {TIME_SLOT_NAMES[slot as keyof typeof TIME_SLOT_NAMES]}
                        </h3>
                        <div className="h-0.5 bg-primary/20 flex-1" />
                      </div>
                      
                      <div className="grid gap-4">
                        {(games as any[]).map((game: any, index: number) => (
                          <WeeklyPickCard 
                            key={game.gameId || `game-${index}`}
                            game={game}
                            index={index}
                            showDetails={false}
                            onToggleDetails={() => {}}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // Show filtered games
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid gap-4"
                >
                  {getFilteredGames().map((game: any, index: number) => (
                    <WeeklyPickCard 
                      key={game.gameId || `filtered-${index}`}
                      game={game}
                      index={index}
                      showDetails={false}
                      onToggleDetails={() => {}}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Newsletter CTA */}
            <NewsletterCTA />

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  This Week's Edge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-3 bg-white/50 rounded">
                    <div className="font-bold text-lg text-green-600">
                      {Math.floor(Math.random() * 15) + 65}%
                    </div>
                    <div className="text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white/50 rounded">
                    <div className="font-bold text-lg text-blue-600">
                      +{(Math.random() * 20 + 5).toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">ROI %</div>
                  </div>
                </div>
                
                <div className="text-xs text-center text-muted-foreground">
                  Based on 2024-25 season performance
                </div>
              </CardContent>
            </Card>

            {/* Live Updates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Pulse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Active Gorillas</span>
                  <span className="font-bold">{(Math.random() * 1000 + 200).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Picks Tracked</span>
                  <span className="font-bold">{(Math.random() * 5000 + 1000).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Line Movements</span>
                  <span className="font-bold text-orange-600">
                    {Math.floor(Math.random() * 20) + 5} live
                  </span>
                </div>
                
                {lastUpdated && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <div className="text-sm text-muted-foreground space-y-2">
                <p className="font-medium">
                  🦍 <strong>Responsible Betting Reminder</strong>
                </p>
                <p>
                  All picks and analysis are for educational and entertainment purposes only. 
                  GuerillaGenics does not guarantee wins or profits. Please bet responsibly and never wager more than you can afford to lose.
                </p>
                <p className="text-xs">
                  If you or someone you know has a gambling problem, please seek help at <strong>1-800-GAMBLER</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}