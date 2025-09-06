import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Radio, TrendingUp, Users } from 'lucide-react';
import PlayerSpotlight from './PlayerSpotlight';

interface LiveGame {
  id: string;
  week: number;
  date: string;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    record: string;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    record: string;
  };
  venue: string;
  broadcast: string | null;
  odds?: {
    spread: number;
    total: number;
    moneyline: { home: number; away: number };
  };
}

interface MatchupCardProps {
  game: LiveGame;
  pick?: any;
}

export default function MatchupCard({ game, pick }: MatchupCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch player spotlights for this matchup
  const { data: spotlights, isLoading: spotlightsLoading } = useQuery({
    queryKey: [`/api/players/spotlight/${game.homeTeam.abbreviation}/${game.awayTeam.abbreviation}`],
    enabled: activeTab === 'players'
  });

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
      timeZoneName: 'short'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500';
      case 'in progress': return 'bg-green-500 animate-pulse';
      case 'final': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(game.status)} text-white`}>
                {game.status}
              </Badge>
              {game.broadcast && (
                <Badge variant="outline" className="text-xs">
                  <Radio className="w-3 h-3 mr-1" />
                  {game.broadcast}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Week {game.week}
            </div>
          </div>

          {/* Teams display */}
          <div className="flex items-center justify-between py-4">
            {/* Away team */}
            <div className="flex items-center gap-3">
              <img
                src={game.awayTeam.logo}
                alt={game.awayTeam.name}
                className="w-12 h-12"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/48/48';
                }}
              />
              <div>
                <h3 className="font-bold text-lg">{game.awayTeam.abbreviation}</h3>
                <p className="text-sm text-muted-foreground">{game.awayTeam.record}</p>
              </div>
              {game.status === 'final' && (
                <div className="text-2xl font-bold text-primary">
                  {game.awayTeam.score}
                </div>
              )}
            </div>

            <div className="text-center text-muted-foreground">
              <div className="text-xs">@</div>
            </div>

            {/* Home team */}
            <div className="flex items-center gap-3">
              {game.status === 'final' && (
                <div className="text-2xl font-bold text-primary">
                  {game.homeTeam.score}
                </div>
              )}
              <div className="text-right">
                <h3 className="font-bold text-lg">{game.homeTeam.abbreviation}</h3>
                <p className="text-sm text-muted-foreground">{game.homeTeam.record}</p>
              </div>
              <img
                src={game.homeTeam.logo}
                alt={game.homeTeam.name}
                className="w-12 h-12"
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/48/48';
                }}
              />
            </div>
          </div>

          {/* Game info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatGameTime(game.date)}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {game.venue}
            </div>
          </div>

          {/* Odds display */}
          {game.odds && (
            <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Spread</div>
                <div className="font-medium">
                  {game.odds.spread > 0 ? `+${game.odds.spread}` : game.odds.spread}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-medium">O/U {game.odds.total}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">Moneyline</div>
                <div className="font-medium text-xs">
                  {formatOdds(game.odds.moneyline.away)} / {formatOdds(game.odds.moneyline.home)}
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="picks">Picks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Matchup Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {game.awayTeam.name} ({game.awayTeam.record}) travels to face {game.homeTeam.name} ({game.homeTeam.record}) 
                  in what promises to be an exciting matchup.
                </p>
                {game.odds && (
                  <div className="text-sm">
                    <span className="font-medium">{game.homeTeam.abbreviation}</span> favored by{' '}
                    <span className="font-bold text-primary">{Math.abs(game.odds.spread)} points</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-4">
              {spotlightsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : spotlights ? (
                <div className="space-y-4">
                  {/* Away team players */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <img src={game.awayTeam.logo} alt="" className="w-4 h-4" />
                      {game.awayTeam.abbreviation} Featured Players
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {spotlights.away?.map((player: any) => (
                        <PlayerSpotlight key={player.id} player={player} compact />
                      ))}
                    </div>
                  </div>

                  {/* Home team players */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <img src={game.homeTeam.logo} alt="" className="w-4 h-4" />
                      {game.homeTeam.abbreviation} Featured Players
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {spotlights.home?.map((player: any) => (
                        <PlayerSpotlight key={player.id} player={player} compact />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No player spotlights available
                </div>
              )}
            </TabsContent>

            <TabsContent value="picks" className="mt-4">
              {pick ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">GuerillaGenics Pick</h4>
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {pick.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="font-medium text-primary mb-1">
                      {pick.team} {pick.line}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pick.reasoning}
                    </p>
                  </div>

                  {pick.bioBoostScore && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">BioBoost Score:</span>
                      <span className="font-bold text-primary">{pick.bioBoostScore}/100</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Pick analysis coming soon
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}