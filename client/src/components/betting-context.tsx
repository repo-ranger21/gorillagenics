import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Player } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus, Cloud, Thermometer, Wind } from "lucide-react";

interface BettingContextProps {
  player: Player;
}

// Mock data for betting context
const mockBettingData = {
  lineMovement: [
    { time: "24h ago", line: 275.5, direction: "up" },
    { time: "12h ago", line: 277.5, direction: "up" },
    { time: "6h ago", line: 278.5, direction: "up" },
    { time: "2h ago", line: 277.5, direction: "down" },
    { time: "Now", line: 277.5, direction: "stable" }
  ],
  consensusOdds: [
    { book: "DraftKings", odds: "-110", line: 277.5, updated: "2m ago" },
    { book: "FanDuel", odds: "-105", line: 278.0, updated: "5m ago" },
    { book: "BetMGM", odds: "-108", line: 277.5, updated: "3m ago" },
    { book: "Caesars", odds: "-112", line: 277.0, updated: "1m ago" },
    { book: "PointsBet", odds: "-110", line: 277.5, updated: "4m ago" }
  ],
  weather: {
    temperature: 72,
    windSpeed: 8,
    precipitation: 0,
    conditions: "Clear",
    impact: "Minimal"
  }
};

export default function BettingContext({ player }: BettingContextProps) {
  const getMovementIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-accent" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMovementColor = (direction: string) => {
    switch (direction) {
      case "up":
        return "text-accent";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getBestOdds = () => {
    return mockBettingData.consensusOdds.reduce((best, current) => {
      const bestValue = parseInt(best.odds.replace("+", "").replace("-", ""));
      const currentValue = parseInt(current.odds.replace("+", "").replace("-", ""));
      return currentValue < bestValue ? current : best;
    });
  };

  const getWeatherImpact = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return { color: "text-destructive", bg: "bg-destructive/10" };
      case "moderate":
        return { color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/20" };
      default:
        return { color: "text-primary", bg: "bg-primary/10" };
    }
  };

  const bestOdds = getBestOdds();
  const weatherImpact = getWeatherImpact(mockBettingData.weather.impact);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Line Movement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Line Movement (Last 24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockBettingData.lineMovement.map((movement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.direction)}
                  <span className="text-sm font-medium">{movement.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getMovementColor(movement.direction)}`}>
                    {movement.line}
                  </span>
                  {index < mockBettingData.lineMovement.length - 1 && (
                    <span className="text-xs text-muted-foreground">
                      ({movement.direction === "up" ? "+" : movement.direction === "down" ? "-" : ""}
                      {index > 0 ? Math.abs(movement.line - mockBettingData.lineMovement[index - 1].line) : 0})
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
            <div className="text-sm font-semibold text-foreground mb-1">
              📊 Movement Analysis
            </div>
            <p className="text-xs text-muted-foreground">
              Line has moved up 2 points in the last 24 hours, indicating sharp money on the Over. 
              Recent pullback suggests some value might be returning.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Consensus Odds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Consensus Odds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockBettingData.consensusOdds.map((book, index) => (
              <motion.div
                key={book.book}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  book.book === bestOdds.book
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">{book.book}</span>
                  {book.book === bestOdds.book && (
                    <Badge className="text-xs bg-primary text-primary-foreground">
                      BEST ODDS
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">
                    {book.line} ({book.odds})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {book.updated}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Average Line</div>
              <div className="text-lg font-bold text-foreground">277.6</div>
            </div>
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Line Range</div>
              <div className="text-lg font-bold text-foreground">277.0 - 278.0</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🌤️ Weather Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-muted/20 rounded-lg"
            >
              <Thermometer className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-sm text-muted-foreground">Temperature</div>
              <div className="text-lg font-bold text-foreground">
                {mockBettingData.weather.temperature}°F
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-muted/20 rounded-lg"
            >
              <Wind className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm text-muted-foreground">Wind Speed</div>
              <div className="text-lg font-bold text-foreground">
                {mockBettingData.weather.windSpeed} mph
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-center p-4 bg-muted/20 rounded-lg"
            >
              <Cloud className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <div className="text-sm text-muted-foreground">Conditions</div>
              <div className="text-lg font-bold text-foreground">
                {mockBettingData.weather.conditions}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`p-4 rounded-lg ${weatherImpact.bg}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">Weather Impact Assessment</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Ideal conditions for passing. Clear skies and minimal wind should not affect {player.name}'s performance.
                </p>
              </div>
              <Badge className={`${weatherImpact.color} ${weatherImpact.bg} border`}>
                {mockBettingData.weather.impact}
              </Badge>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              🎯 Key Betting Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span className="text-muted-foreground">
                  Line movement suggests sharp action on the Over, but recent pullback creates value opportunity
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span className="text-muted-foreground">
                  {bestOdds.book} offering best odds at {bestOdds.odds} - shop around for maximum value
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span className="text-muted-foreground">
                  Weather conditions are ideal with no expected impact on passing game performance
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-bold">•</span>
                <span className="text-muted-foreground">
                  BioBoost score of {player.bioBoostScore} supports the {player.recommendedPick} recommendation
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}