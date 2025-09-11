import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AccessGate from "@/components/AccessGate";
import { useUserId } from "@/hooks/useUser";
import { useSubscription } from "@/hooks/useSubscription";

export default function GematriaSection() {
  const [selectedGameDate, setSelectedGameDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // User authentication and subscription status
  const userId = useUserId();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription(userId);
  
  // Only enable queries when user is authenticated and subscribed
  const shouldEnableQueries = !subscriptionLoading && isSubscribed && !!userId;

  // Fetch Gematria player analysis
  const { data: gematriaData, isLoading: gematriaLoading, error: gematriaError } = useQuery({
    queryKey: ['/api/gematria/players', selectedGameDate, userId],
    enabled: shouldEnableQueries,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch Gematria predictions
  const { data: predictionData, isLoading: predictionLoading, error: predictionError } = useQuery({
    queryKey: ['/api/gematria/predictions', selectedGameDate, userId],
    enabled: shouldEnableQueries,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch matchup analysis
  const { data: matchupData, isLoading: matchupLoading, error: matchupError } = useQuery({
    queryKey: ['/api/gematria/matchups', selectedGameDate, userId],
    enabled: shouldEnableQueries,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
  
  // Check for authentication errors
  const hasAuthError = [gematriaError, predictionError, matchupError].some(
    (error: any) => error?.message?.includes('401') || error?.message?.includes('403')
  );

  return (
    <AccessGate 
      userId={userId}
      featureName="Gematria Analysis" 
      description="Advanced numerological analysis combining sacred numbers with player BioBoost data"
      showPreview={false}
    >
      <div className="space-y-6" data-testid="gematria-section">
        {/* Authentication Error Alert */}
        {hasAuthError && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              🔐 <strong>Authentication Issue:</strong> Unable to verify your premium access. 
              Please refresh the page or contact support if the issue persists.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Loading State for Subscription Check */}
        {subscriptionLoading && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription>
              🔍 Verifying your premium access...
            </AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-jungle">🔢 Gematria Analysis</h2>
            <p className="text-muted-foreground mt-2">
              Sacred number analysis fused with BioBoost data for enhanced predictions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <label className="block text-muted-foreground mb-1">Game Date</label>
              <input
                type="date"
                value={selectedGameDate}
                onChange={(e) => setSelectedGameDate(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
                data-testid="gematria-date-picker"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-jungle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Players Analyzed</p>
                  <p className="text-2xl font-bold text-jungle" data-testid="gematria-players-count">
                    {gematriaData?.totalAnalyzed || 0}
                  </p>
                </div>
                <div className="text-2xl">🦍</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-banana">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Elite Picks</p>
                  <p className="text-2xl font-bold text-banana" data-testid="gematria-elite-count">
                    {gematriaData?.topPicks?.filter((p: any) => p.confidence === 'ELITE').length || 0}
                  </p>
                </div>
                <div className="text-2xl">⚡</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-vine">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg GAS Score</p>
                  <p className="text-2xl font-bold text-vine" data-testid="gematria-gas-avg">
                    {gematriaData?.players ? 
                      Math.round(gematriaData.players.reduce((sum: number, p: any) => sum + (p.gas || 0), 0) / gematriaData.players.length * 100) : 0}%
                  </p>
                </div>
                <div className="text-2xl">🔮</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fusion Edge</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="gematria-fusion-edge">
                    {predictionData?.prediction?.gematria?.edgeOverBioBoost ? 
                      `+${(predictionData.prediction.gematria.edgeOverBioBoost * 100).toFixed(1)}%` : '0.0%'}
                  </p>
                </div>
                <div className="text-2xl">🚀</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Gematria Picks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Top Gematria Picks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gematriaLoading ? (
              <div className="text-center py-8" data-testid="gematria-loading">
                <div className="text-4xl mb-4 animate-spin">🔢</div>
                <div className="text-lg font-semibold">Analyzing Sacred Numbers...</div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2" data-testid="gematria-picks-grid">
                {gematriaData?.topPicks?.slice(0, 6).map((player: any, index: number) => (
                  <motion.div
                    key={player.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-jungle/20 hover:border-jungle/40 transition-colors" data-testid={`gematria-player-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-lg text-jungle">{player.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {player.position} - {player.team}
                            </div>
                          </div>
                          <Badge 
                            variant={player.confidence === 'ELITE' ? 'default' : 
                                   player.confidence === 'STRONG' ? 'secondary' : 'outline'}
                            className={player.confidence === 'ELITE' ? 'bg-jungle text-white' : ''}
                          >
                            {player.confidence}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>BioBoost Score:</span>
                            <span className="font-semibold">{player.bioBoostScore}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>GAS Score:</span>
                            <span className="font-semibold text-jungle">{Math.round(player.gas * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Fusion Score:</span>
                            <span className="font-semibold text-vine">{Math.round(player.fusedScore * 100)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Edge vs Bio:</span>
                            <span className={`font-semibold ${player.edgeProb > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {player.edgeProb > 0 ? '+' : ''}{(player.edgeProb * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-jungle/5 rounded text-xs">
                          {player.gematriaCommentary}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AccessGate>
  );
}