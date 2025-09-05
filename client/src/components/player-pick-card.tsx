import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Player } from "@shared/schema";

interface PlayerPickCardProps {
  player: Player;
}

export default function PlayerPickCard({ player }: PlayerPickCardProps) {
  const isOver = player.recommendedPick === "OVER";
  const pickColor = isOver ? "text-destructive" : "text-accent";
  const buttonColor = isOver ? "bg-destructive hover:bg-destructive/90" : "bg-accent hover:bg-accent/90";
  const borderColor = isOver ? "hover:border-destructive/50" : "hover:border-accent/50";
  const scoreColor = player.bioBoostScore >= 90 ? "text-destructive" : 
                    player.bioBoostScore >= 75 ? "text-sleep" :
                    player.bioBoostScore >= 60 ? "text-cortisol" : "text-muted-foreground";

  // Mock player images based on position
  const getPlayerImage = (position: string) => {
    switch (position) {
      case "QB":
        return "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300";
      case "WR":
        return "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300";
      case "RB":
        return "https://images.unsplash.com/photo-1508817628441-c5d414d650ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300";
      default:
        return "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300";
    }
  };

  return (
    <Card className={`bg-card border border-border ${borderColor} transition-all overflow-hidden group`}>
      <div className="relative">
        <img 
          src={getPlayerImage(player.position)} 
          alt={`${player.name} in action`}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-card-foreground" data-testid={`player-name-${player.id}`}>
              {player.name}
            </h3>
            <p className="text-muted-foreground">{player.matchup}</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${pickColor}`} data-testid={`pick-${player.id}`}>
              {player.recommendedPick}
            </div>
            <div className="text-sm text-muted-foreground">{player.betType}</div>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-foreground mb-2" data-testid={`bet-line-${player.id}`}>
            {player.betLine}
          </div>
          <div className="text-sm text-muted-foreground">Line</div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">BioBoost Score</span>
            <span className={`text-xl font-bold ${scoreColor}`} data-testid={`bioboost-score-${player.id}`}>
              {player.bioBoostScore}/100
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${player.bioBoostScore}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-2 rounded-full ${scoreColor.replace('text-', 'bg-')}`}
            />
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h4 className="font-semibold text-card-foreground">Key Signals:</h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sleep:</span>
            <span className="text-sleep font-semibold" data-testid={`sleep-${player.id}`}>
              {player.sleepScore}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">T-Index:</span>
            <span className="text-testosterone font-semibold" data-testid={`testosterone-${player.id}`}>
              {player.testosteroneProxy}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hydration:</span>
            <span className="text-hydration font-semibold" data-testid={`hydration-${player.id}`}>
              {player.hydrationLevel}
            </span>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground mb-1" data-testid={`game-time-${player.id}`}>
            {player.gameTime}
          </div>
          <div className={`text-2xl font-bold ${pickColor}`} data-testid={`confidence-${player.id}`}>
            {player.confidence}% Confidence
          </div>
        </div>

        <Button 
          className={`w-full ${buttonColor} text-white py-3 font-bold transition-colors`}
          data-testid={`button-lock-in-${player.id}`}
        >
          🎯 Lock in {player.recommendedPick}
        </Button>

        {player.commentary && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg"
          >
            <p className="text-sm text-primary font-medium" data-testid={`commentary-${player.id}`}>
              {player.commentary}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
