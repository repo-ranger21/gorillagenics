import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OddsTicker from "@/components/odds-ticker";
import BetCard from "@/components/bet-card";
import LiveAlerts from "@/components/live-alerts";
import NewsletterCTA from "@/components/newsletter-cta";
import LoadingScreen from "@/components/loading-screen";
import { TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

interface LineItem {
  id: string;
  matchup: string;
  market: string;
  line: number;
  recommendation: "Over" | "Under";
  confidence: number;
  bioBoost: number;
  move: number;
  commentary: string;
  player?: string;
  team?: string;
  opponent?: string;
}

interface LiveAlert {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  timestamp: string;
  type: "bioboost" | "line_move" | "weather" | "injury";
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"over" | "under">("over");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch betting lines
  const { data: lines, isLoading: linesLoading } = useQuery<LineItem[]>({
    queryKey: ['/api/lines'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch live alerts
  const { data: alerts } = useQuery<LiveAlert[]>({
    queryKey: ['/api/bets/live'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Show loading screen briefly
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const overBets = lines?.filter(line => line.recommendation === "Over") || [];
  const underBets = lines?.filter(line => line.recommendation === "Under") || [];

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A]">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
                className="border-primary/20 hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">
                  GUERILLAGENICS — Over/Unders
                </h1>
                <p className="text-primary text-sm">Live Jungle Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                LIVE
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                🦍 {lines?.length || 0} Markets
              </Badge>
            </div>
          </div>
          
          {/* Odds Ticker */}
          <OddsTicker lines={lines || []} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Dashboard - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            {/* Over/Under Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "over" | "under")}>
              <TabsList className="grid w-full grid-cols-2 bg-background/20 backdrop-blur-sm">
                <TabsTrigger 
                  value="over" 
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold"
                  data-testid="over-tab"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  OVER ({overBets.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="under" 
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-bold"
                  data-testid="under-tab"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  UNDER ({underBets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="over" className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="over-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {linesLoading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-background/20 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-muted/40 rounded w-1/3"></div>
                              <div className="h-6 bg-muted/40 rounded w-2/3"></div>
                              <div className="h-4 bg-muted/40 rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : overBets.length > 0 ? (
                      overBets.map((bet, index) => (
                        <motion.div
                          key={bet.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <BetCard bet={bet} />
                        </motion.div>
                      ))
                    ) : (
                      <Card className="bg-background/20 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                          <div className="text-4xl mb-4">🦍</div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            No Over Plays Right Now
                          </h3>
                          <p className="text-muted-foreground">
                            The jungle is quiet... Check back soon for fresh opportunities!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="under" className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key="under-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {linesLoading ? (
                      // Loading skeletons
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-background/20 backdrop-blur-sm">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-3">
                              <div className="h-4 bg-muted/40 rounded w-1/3"></div>
                              <div className="h-6 bg-muted/40 rounded w-2/3"></div>
                              <div className="h-4 bg-muted/40 rounded w-1/2"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : underBets.length > 0 ? (
                      underBets.map((bet, index) => (
                        <motion.div
                          key={bet.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <BetCard bet={bet} />
                        </motion.div>
                      ))
                    ) : (
                      <Card className="bg-background/20 backdrop-blur-sm">
                        <CardContent className="p-8 text-center">
                          <div className="text-4xl mb-4">🦍</div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            No Under Plays Right Now
                          </h3>
                          <p className="text-muted-foreground">
                            The jungle is quiet... Check back soon for fresh opportunities!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>

            {/* Disclaimer */}
            <Card className="bg-yellow-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <span className="text-lg">⚠️</span>
                  <span className="font-semibold">Responsible Betting:</span>
                  <span>
                    GuerillaGenics provides entertainment and analysis only. 
                    Bet responsibly and within your means. Must be 21+ where legal.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-6">
            {/* Live Alerts Feed */}
            <LiveAlerts alerts={alerts || []} />
            
            {/* Newsletter CTA */}
            <NewsletterCTA />
          </div>
        </div>
      </main>
    </div>
  );
}