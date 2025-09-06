import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, TrendingUp, TrendingDown, Target, Zap, 
  ChevronDown, ChevronUp, Users, BarChart3 
} from "lucide-react";
import { formatGameDate } from "@/utils/weekFetcher";

interface WeeklyPickCardProps {
  game: any;
  index?: number;
  showDetails?: boolean;
  onToggleDetails?: (expanded: boolean) => void;
}

export default function WeeklyPickCard({ 
  game, 
  index = 0, 
  showDetails = false,
  onToggleDetails 
}: WeeklyPickCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [currentSpread, setCurrentSpread] = useState(game.spread);
  const [currentTotal, setCurrentTotal] = useState(game.total);

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (onToggleDetails) {
      onToggleDetails(newExpanded);
    }
  };

  // Determine winner styling
  const isAwayWinner = game.predicted === game.away.code;
  const isHomeWinner = game.predicted === game.home.code;
  
  // BioBoost difference for confidence
  const bioBoostDiff = Math.abs(game.away.bioBoost - game.home.bioBoost);
  const confidenceColor = game.confidence === 'HIGH' ? 'text-green-600' : 
                         game.confidence === 'MEDIUM' ? 'text-yellow-600' : 'text-gray-600';

  // Time slot styling
  const timeSlotColors: Record<string, string> = {
    'thursday': 'bg-purple-100 text-purple-800',
    'friday': 'bg-blue-100 text-blue-800',
    'sunday_early': 'bg-green-100 text-green-800',
    'sunday_late': 'bg-orange-100 text-orange-800',
    'snf': 'bg-indigo-100 text-indigo-800',
    'mnf': 'bg-red-100 text-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      data-testid={`pick-card-${game.id}`}
    >
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-4">
          <div className="space-y-3">
            {/* Game Time & Slot */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={timeSlotColors[game.timeSlot] || 'bg-gray-100 text-gray-800'}>
                  {formatGameDate(game.date)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {game.time}
                </div>
                {game.location && (
                  <Badge variant="outline" className="text-xs">
                    {game.location}
                  </Badge>
                )}
              </div>
            </div>

            {/* Matchup Title */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">
                {game.away.code} @ {game.home.code}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Week {game.week} • {game.time}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Teams Matchup */}
          <div className="grid grid-cols-2 gap-4">
            {/* Away Team */}
            <div className={`text-center p-4 rounded-lg border-2 transition-all ${
              isAwayWinner 
                ? 'border-jungle bg-jungle/10 shadow-md' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="space-y-3">
                <div className="text-3xl">{game.away.emoji}</div>
                <div className="font-semibold text-sm leading-tight px-2">{game.away.team}</div>
                <div className="text-xs text-muted-foreground font-medium">@ AWAY</div>
                
                {/* BioBoost Score */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">BioBoost Score</div>
                  <div className={`text-xl font-bold ${
                    game.away.bioBoost >= 80 ? 'text-green-600' :
                    game.away.bioBoost >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {game.away.bioBoost}
                  </div>
                  <Progress 
                    value={game.away.bioBoost} 
                    className="h-2"
                    data-testid={`bioboost-away-${game.away.bioBoost}`}
                  />
                </div>

                {isAwayWinner && (
                  <Badge className="bg-jungle text-white text-xs px-2 py-1">
                    🦍 PICK
                  </Badge>
                )}
              </div>
            </div>

            {/* Home Team */}
            <div className={`text-center p-4 rounded-lg border-2 transition-all ${
              isHomeWinner 
                ? 'border-jungle bg-jungle/10 shadow-md' 
                : 'border-gray-200 bg-gray-50/50'
            }`}>
              <div className="space-y-3">
                <div className="text-3xl">{game.home.emoji}</div>
                <div className="font-semibold text-sm leading-tight px-2">{game.home.team}</div>
                <div className="text-xs text-muted-foreground font-medium">🏠 HOME</div>
                
                {/* BioBoost Score */}
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">BioBoost Score</div>
                  <div className={`text-xl font-bold ${
                    game.home.bioBoost >= 80 ? 'text-green-600' :
                    game.home.bioBoost >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {game.home.bioBoost}
                  </div>
                  <Progress 
                    value={game.home.bioBoost} 
                    className="h-2"
                    data-testid={`bioboost-home-${game.home.bioBoost}`}
                  />
                </div>

                {isHomeWinner && (
                  <Badge className="bg-jungle text-white text-xs px-2 py-1">
                    🦍 PICK
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Betting Lines */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground">LIVE BETTING LINES</h4>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2 font-medium">POINT SPREAD</div>
                <div className="font-bold text-lg flex items-center justify-center gap-2">
                  <span className="text-primary">
                    {currentSpread > 0 ? '+' : ''}{currentSpread}
                  </span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-2 font-medium">OVER/UNDER</div>
                <div className="font-bold text-lg flex items-center justify-center gap-2">
                  <span className="text-primary">
                    {currentTotal}
                  </span>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Gorilla Intel with Pick */}
          <div className="bg-jungle/5 rounded-lg p-4 border-l-4 border-jungle">
            <div className="space-y-3">
              <div className="font-semibold text-jungle flex items-center gap-2">
                🦍 <span>Gorilla Intel</span>
              </div>
              
              {/* TO WIN Pick */}
              <div className="bg-gradient-to-r from-jungle to-jungle/80 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-banana text-xs font-medium mb-1">GUERILLAGENICS PICK</div>
                  <div className="text-white text-lg font-bold">
                    {game.predicted === game.away.code ? (
                      <>{game.away.emoji} {game.away.team} <span className="text-banana">TO WIN</span></>
                    ) : (
                      <>{game.home.emoji} {game.home.team} <span className="text-banana">TO WIN</span></>
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${
                    game.confidence === 'HIGH' ? 'text-vine' : 
                    game.confidence === 'MEDIUM' ? 'text-banana' : 'text-white/80'
                  }`}>
                    {game.confidence} CONFIDENCE
                  </div>
                </div>
              </div>
              
              {/* Analysis Commentary */}
              <p className="text-muted-foreground leading-relaxed text-sm">
                {game.commentary}
              </p>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            onClick={handleToggleExpanded}
            className="w-full"
            data-testid="expand-pick-details"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show Details
              </>
            )}
          </Button>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 border-t pt-4"
            >
              {/* Advanced Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">BioBoost Edge</div>
                    <div className="text-lg font-bold text-primary">
                      {bioBoostDiff} pts
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {bioBoostDiff >= 10 ? 'Strong' : bioBoostDiff >= 5 ? 'Moderate' : 'Weak'} Advantage
                    </div>
                  </div>
                </Card>

                <Card className="p-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-2">Market Action</div>
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {Math.floor(Math.random() * 30) + 60}% Public
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Betting {isHomeWinner ? 'Home' : 'Away'}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Risk Factors */}
              <div className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Key Factors
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Strong BioBoost fundamentals</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Favorable rest advantage</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Weather conditions neutral</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span>Line movement stable</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" data-testid="track-pick">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Track Pick
                </Button>
                <Button variant="outline" size="sm" className="flex-1" data-testid="add-to-watchlist">
                  <Zap className="w-4 h-4 mr-2" />
                  Add to Watchlist
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}