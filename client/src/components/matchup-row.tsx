import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, TrendingUp, TrendingDown } from "lucide-react";

interface Game {
  id: string;
  date: string;
  time: string;
  timeSlot: string;
  awayTeam: {
    name: string;
    abbreviation: string;
    spread: string;
    spreadValue: number;
  };
  homeTeam: {
    name: string;
    abbreviation: string;
    spread: string;
    spreadValue: number;
  };
  overUnder: number;
  location?: string;
  moneyline: {
    away: string;
    home: string;
  };
  bioBoost: {
    score: number | null;
    recommendation: string | null;
    confidence: string | null;
    commentary: string | null;
    factors?: {
      injury: any;
      weather: any;
      lineMovement: any;
      rest: any;
    };
  };
}

interface MatchupRowProps {
  game: Game;
}

export default function MatchupRow({ game }: MatchupRowProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm} ET`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get time slot color
  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case "Thursday": return "bg-purple-600";
      case "Friday": return "bg-blue-600";
      case "Sunday Early": return "bg-green-600";
      case "Sunday Late": return "bg-orange-600";
      case "SNF": return "bg-yellow-600";
      case "MNF": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Card className="bg-background/20 backdrop-blur-sm border-border/30 hover:bg-background/30 transition-all duration-200 hover:border-primary/30">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className={`${getTimeSlotColor(game.timeSlot)} text-white font-semibold`}>
              {game.timeSlot}
            </Badge>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {formatDate(game.date)} • {formatTime(game.time)}
              </span>
            </div>
            
            {game.location && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{game.location}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showDetails ? 'Less' : 'More'}
          </Button>
        </div>

        {/* Matchup Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Away Team */}
          <div className="lg:col-span-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center font-bold text-sm">
              {game.awayTeam.abbreviation}
            </div>
            <div>
              <div className="font-semibold text-foreground">{game.awayTeam.name}</div>
              <div className="text-sm text-muted-foreground">Away</div>
            </div>
          </div>

          {/* @ symbol */}
          <div className="lg:col-span-1 text-center text-muted-foreground font-bold">
            @
          </div>

          {/* Home Team */}
          <div className="lg:col-span-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center font-bold text-sm">
              {game.homeTeam.abbreviation}
            </div>
            <div>
              <div className="font-semibold text-foreground">{game.homeTeam.name}</div>
              <div className="text-sm text-muted-foreground">Home</div>
            </div>
          </div>

          {/* Betting Lines */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-4">
            {/* Spread */}
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Spread</div>
              <div className="font-bold text-foreground">
                <div>{game.awayTeam.spread}</div>
                <div className="text-xs text-muted-foreground mt-1">{game.homeTeam.spread}</div>
              </div>
            </div>

            {/* Over/Under */}
            <div className="text-center p-3 bg-background/30 rounded-lg">
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total</div>
              <div className="font-bold text-foreground">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-red-400" />
                  O {game.overUnder}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendingDown className="w-3 h-3 text-green-400" />
                  U {game.overUnder}
                </div>
              </div>
            </div>

            {/* BioBoost Score */}
            <div className="text-center p-3 bg-gradient-to-br from-yellow-500/20 to-primary/20 rounded-lg border border-yellow-500/30">
              <div className="text-xs text-yellow-400 uppercase tracking-wide mb-1">BioBoost</div>
              <div className="font-bold">
                {game.bioBoost.score !== null ? (
                  <>
                    <div className={`text-xl ${
                      game.bioBoost.score > 65 ? 'text-green-400' :
                      game.bioBoost.score < 35 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {game.bioBoost.score}
                    </div>
                    <div className="text-xs font-semibold mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        game.bioBoost.recommendation === 'OVER' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {game.bioBoost.recommendation}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {game.bioBoost.confidence} Confidence
                    </div>
                  </>
                ) : (
                  <div className="text-yellow-400/60">🦍 Loading...</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {/* Moneylines */}
              <div>
                <div className="text-muted-foreground mb-2">Moneyline</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{game.awayTeam.abbreviation}:</span>
                    <span className="font-mono">{game.moneyline.away}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{game.homeTeam.abbreviation}:</span>
                    <span className="font-mono">{game.moneyline.home}</span>
                  </div>
                </div>
              </div>

              {/* BioBoost Details */}
              <div>
                <div className="text-muted-foreground mb-2">🦍 Gorilla Intel</div>
                <div className="text-yellow-400/80">
                  BioBoost projections coming soon...
                </div>
              </div>

              {/* Game Info */}
              <div>
                <div className="text-muted-foreground mb-2">Game Info</div>
                <div className="space-y-1">
                  <div>Week 1</div>
                  <div>NFL 2025-26</div>
                </div>
              </div>

              {/* Gorilla Commentary */}
              <div className="md:col-span-2">
                <div className="text-muted-foreground mb-2">🍌 Gorilla Commentary</div>
                <div className="text-primary/90 text-sm italic bg-primary/10 p-3 rounded-lg border border-primary/20">
                  {game.bioBoost.commentary || "🦍 Gorilla analyzing the jungle intel..."}
                </div>
                
                {/* BioBoost Factors */}
                {game.bioBoost.factors && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weather:</span>
                      <span className={`${
                        game.bioBoost.factors.weather.windMph > 20 ? 'text-red-400' :
                        game.bioBoost.factors.weather.tempF < 32 || game.bioBoost.factors.weather.tempF > 90 ? 'text-orange-400' : 'text-green-400'
                      }`}>
                        {game.bioBoost.factors.weather.windMph > 20 ? 'Windy' :
                         game.bioBoost.factors.weather.tempF < 32 ? 'Cold' :
                         game.bioBoost.factors.weather.tempF > 90 ? 'Hot' : 'Good'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Injuries:</span>
                      <span className={`${
                        game.bioBoost.factors.injuries.keyPlayersOut > 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {game.bioBoost.factors.injuries.keyPlayersOut > 0 ? 
                         `${game.bioBoost.factors.injuries.keyPlayersOut} Out` : 'Healthy'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Line Move:</span>
                      <span className={`${
                        game.bioBoost.factors.lineMove > 1 ? 'text-green-400' :
                        game.bioBoost.factors.lineMove < -1 ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {game.bioBoost.factors.lineMove > 1 ? 'Favorable' :
                         game.bioBoost.factors.lineMove < -1 ? 'Against' : 'Neutral'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Travel:</span>
                      <span className={`${
                        game.bioBoost.factors.travelMiles > 1500 ? 'text-orange-400' : 'text-green-400'
                      }`}>
                        {game.bioBoost.factors.travelMiles > 1500 ? 'Long' : 'Short'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}