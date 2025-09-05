import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Player } from "@shared/schema";

interface FeaturedPickCardProps {
  player: Player;
  isSelected?: boolean;
  onSelect?: () => void;
  index?: number;
}

export default function FeaturedPickCard({ 
  player, 
  isSelected = false, 
  onSelect,
  index = 0 
}: FeaturedPickCardProps) {
  const getMascotReaction = (score: number) => {
    if (score >= 90) return { emoji: "🦍", text: "MAX JUICE" };
    if (score >= 80) return { emoji: "⚡", text: "PRIMAL POWER" };
    if (score >= 70) return { emoji: "🍌", text: "GOOD VIBES" };
    if (score >= 60) return { emoji: "💤", text: "SLEEPY APE" };
    return { emoji: "😴", text: "ZEN MODE" };
  };

  const reaction = getMascotReaction(player.bioBoostScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
      className="cursor-pointer"
      onClick={onSelect}
    >
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isSelected 
          ? "ring-2 ring-primary shadow-2xl bg-gradient-to-br from-primary/5 to-accent/5" 
          : "hover:shadow-xl"
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent" />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }} />
        </div>

        <CardHeader className="relative pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground">
                {player.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {player.team} • {player.position}
              </p>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-3xl"
            >
              {reaction.emoji}
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="relative pt-0">
          {/* Prop and Line */}
          <div className="text-center mb-6 p-4 bg-muted/20 rounded-lg">
            <div className="text-lg font-semibold text-foreground mb-1">
              {player.betType}
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {player.betLine}
            </div>
            <Badge 
              className={`text-sm font-bold ${
                player.recommendedPick === "Over" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-destructive text-destructive-foreground"
              }`}
            >
              {player.recommendedPick}
            </Badge>
          </div>

          {/* BioBoost Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                BioBoost Score
              </span>
              <motion.span 
                className="text-xl font-bold text-primary"
                animate={{ 
                  scale: player.bioBoostScore >= 85 ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 1, 
                  repeat: player.bioBoostScore >= 85 ? Infinity : 0 
                }}
              >
                {player.bioBoostScore}/100
              </motion.span>
            </div>
            <div className="relative">
              <Progress 
                value={player.bioBoostScore} 
                className="h-3"
              />
              {player.bioBoostScore >= 85 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: [-100, 200] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              )}
            </div>
          </div>

          {/* Mascot Reaction */}
          <div className="text-center mb-4">
            <Badge 
              variant="outline" 
              className="text-xs font-bold border-primary text-primary"
            >
              {reaction.text}
            </Badge>
          </div>

          {/* Commentary */}
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-3 rounded-lg">
            <p className="text-sm text-foreground font-medium text-center italic">
              "{player.commentary || "🦍 The gorilla sees potential in this pick..."}"
            </p>
          </div>

          {/* Confidence Indicator */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Confidence: {player.confidence}%</span>
            <span>Last Updated: Just now</span>
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            >
              <span className="text-primary-foreground font-bold">✓</span>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}