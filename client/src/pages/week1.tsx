import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import MatchupTable from "@/components/matchup-table";
import NewsletterCTA from "@/components/newsletter-cta";
import LoadingScreen from "@/components/loading-screen";
import { Wifi, Calendar, Trophy } from "lucide-react";

export default function Week1() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch Week 1 games
  const { data: games, isLoading: gamesLoading, error } = useQuery({
    queryKey: ['/api/week1'],
    refetchInterval: 30000, // Refresh every 30 seconds for live odds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  // Show loading screen briefly
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Check for cached data in localStorage
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem('week1-games');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  // Save data to cache
  useEffect(() => {
    if (games) {
      localStorage.setItem('week1-games', JSON.stringify(games));
    }
  }, [games]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Fallback content if API fails and no cache
  if (error && !games && !getCachedData()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A]">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-20">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-8"
            >
              🦍
            </motion.div>
            
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">
              Data is swinging in late...
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our gorillas are still peeling the Week 1 data bananas. Check back soon for the complete NFL schedule with live betting lines!
            </p>
            
            <NewsletterCTA />
          </div>
        </div>
      </div>
    );
  }

  const displayGames = games || getCachedData() || [];
  const isUsingCache = !games && getCachedData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A]">
      {/* Header */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl lg:text-4xl font-bold text-yellow-400 mb-2"
            >
              GuerillaGenics — Week 1 NFL Picks & Lines
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-primary text-lg"
            >
              2025-26 Season • Complete Schedule with BioBoost Intelligence
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {/* Live Status */}
            <Badge 
              variant="outline" 
              className={`${
                isUsingCache 
                  ? 'border-yellow-500 text-yellow-400' 
                  : 'border-green-500 text-green-400'
              } font-semibold`}
            >
              <Wifi className={`w-3 h-3 mr-2 ${!isUsingCache && 'animate-pulse'}`} />
              {isUsingCache ? 'CACHED' : 'LIVE'}
            </Badge>
            
            <Badge variant="outline" className="border-primary text-primary">
              <Calendar className="w-3 h-3 mr-2" />
              {displayGames.length} Games
            </Badge>
            
            <Badge variant="outline" className="border-yellow-500 text-yellow-400">
              <Trophy className="w-3 h-3 mr-2" />
              Week 1
            </Badge>
          </motion.div>
        </div>

        {/* Cache Notice */}
        {isUsingCache && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🍌</div>
                  <div>
                    <div className="text-yellow-400 font-semibold">
                      Using cached data
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Live odds temporarily unavailable. Showing last known lines.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Games Table - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-3"
          >
            <MatchupTable games={displayGames} isLoading={gamesLoading} />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Newsletter CTA */}
            <NewsletterCTA />

            {/* Week 1 Stats */}
            <Card className="bg-background/20 backdrop-blur-sm border-border/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  🦍 Week 1 Intel
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Games:</span>
                    <span className="font-semibold text-foreground">{displayGames.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Highest O/U:</span>
                    <span className="font-semibold text-foreground">
                      {displayGames.length > 0 
                        ? Math.max(...displayGames.map((g: any) => g.overUnder))
                        : '---'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lowest O/U:</span>
                    <span className="font-semibold text-foreground">
                      {displayGames.length > 0 
                        ? Math.min(...displayGames.map((g: any) => g.overUnder))
                        : '---'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">BioBoost Ready:</span>
                    <span className="font-semibold text-yellow-400">Soon 🍌</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsible Gaming */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4">
                <div className="text-center text-sm">
                  <div className="text-red-400 font-semibold mb-2">
                    ⚠️ Bet Responsibly
                  </div>
                  <div className="text-muted-foreground">
                    Gambling can be addictive. Please play responsibly and within your means.
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}