import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Player } from "@shared/schema";
import { Info } from "lucide-react";

interface BioBoostBreakdownProps {
  player: Player;
  isExpanded?: boolean;
  onToggle?: () => void;
}

interface MetricInfo {
  key: keyof Player;
  label: string;
  icon: string;
  color: string;
  weight: number;
  tooltip: string;
  unit?: string;
}

const BIOBOOST_METRICS: MetricInfo[] = [
  {
    key: "sleepScore",
    label: "Sleep Score",
    icon: "😴",
    color: "sleep",
    weight: 30,
    tooltip: "Quality and duration of sleep over the last 7 days. Critical for recovery and cognitive performance.",
    unit: "/100"
  },
  {
    key: "testosteroneProxy",
    label: "T-Index",
    icon: "💪",
    color: "testosterone", 
    weight: 40,
    tooltip: "Testosterone proxy based on workout intensity, aggression metrics, and performance indicators.",
    unit: "/100"
  },
  {
    key: "cortisolProxy",
    label: "Cortisol Level",
    icon: "🧘",
    color: "cortisol",
    weight: 15,
    tooltip: "Stress hormone levels affecting focus and decision-making under pressure.",
    unit: "ng/mL"
  },
  {
    key: "hydrationLevel",
    label: "Hydration",
    icon: "💧",
    color: "hydration",
    weight: 10,
    tooltip: "Optimal fluid balance for peak athletic performance and endurance.",
    unit: "%"
  },
  {
    key: "injuryRecoveryDays",
    label: "Recovery Status",
    icon: "🏥",
    color: "recovery",
    weight: 5,
    tooltip: "Days since last injury and current physical condition assessment.",
    unit: " days"
  }
];

export default function BioBoostBreakdown({ 
  player, 
  isExpanded = true,
  onToggle 
}: BioBoostBreakdownProps) {
  
  const getMascotReaction = (score: number) => {
    if (score >= 90) return { emoji: "🦍", text: "MAXIMUM GORILLA POWER!", animation: "bounce" };
    if (score >= 80) return { emoji: "⚡", text: "HIGH VOLTAGE APE!", animation: "pulse" };
    if (score >= 70) return { emoji: "🍌", text: "SOLID BANANA ENERGY", animation: "swing" };
    if (score >= 60) return { emoji: "💤", text: "Sleepy but functional", animation: "sway" };
    return { emoji: "😴", text: "Needs jungle rest", animation: "fade" };
  };

  const reaction = getMascotReaction(player.bioBoostScore);

  const getMetricValue = (metric: MetricInfo, player: Player): number => {
    const value = player[metric.key] as number;
    
    // Special handling for cortisol (invert scale) and injury days
    if (metric.key === "cortisolProxy") {
      return 100 - value; // Lower cortisol = better score
    }
    if (metric.key === "injuryRecoveryDays") {
      return Math.max(0, 100 - (value * 10)); // Fewer days = better score
    }
    
    return value;
  };

  const getAnimationVariant = (animation: string) => {
    switch (animation) {
      case "bounce":
        return { y: [0, -10, 0] };
      case "pulse":
        return { scale: [1, 1.2, 1] };
      case "swing":
        return { rotate: [0, 10, -10, 0] };
      case "sway":
        return { x: [0, 5, -5, 0] };
      default:
        return { opacity: [1, 0.7, 1] };
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  BioBoost Breakdown
                </CardTitle>
                <p className="text-muted-foreground">
                  Advanced biometric analysis for {player.name}
                </p>
              </div>
              
              {/* Mascot Reaction */}
              <motion.div
                className="text-center"
                animate={getAnimationVariant(reaction.animation)}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <div className="text-4xl mb-1">{reaction.emoji}</div>
                <Badge 
                  variant="outline" 
                  className="text-xs font-bold border-primary text-primary"
                >
                  {reaction.text}
                </Badge>
              </motion.div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Overall Score */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Overall BioBoost Score
              </div>
              <motion.div
                className="text-5xl font-bold text-primary mb-2"
                animate={player.bioBoostScore >= 85 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {player.bioBoostScore}
              </motion.div>
              <div className="text-sm text-muted-foreground">
                Out of 100 possible points
              </div>
            </div>

            {/* Metric Breakdown */}
            <div className="space-y-6">
              {BIOBOOST_METRICS.map((metric, index) => {
                const value = getMetricValue(metric, player);
                const rawValue = player[metric.key] as number;
                
                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="space-y-3"
                  >
                    {/* Metric Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.span
                          className="text-2xl"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {metric.icon}
                        </motion.span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {metric.label}
                            </span>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{metric.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Weight: {metric.weight}% of total score
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-foreground">
                          {rawValue}{metric.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {Math.round(value)}/100
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <Progress 
                        value={value} 
                        className="h-3"
                      />
                      {value >= 85 && (
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

                    {/* Performance Level */}
                    <div className="flex items-center justify-between text-xs">
                      <Badge 
                        variant={value >= 80 ? "default" : value >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {value >= 80 ? "Elite" : value >= 60 ? "Good" : "Needs Work"}
                      </Badge>
                      
                      <span className="text-muted-foreground">
                        Contributes {Math.round((value / 100) * metric.weight)} points to total
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Algorithm Explanation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-4 bg-muted/20 rounded-lg"
            >
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                🧮 Algorithm Breakdown
              </h4>
              <p className="text-sm text-muted-foreground">
                BioBoost Score = (Sleep × 30%) + (T-Index × 40%) + (Cortisol × 15%) + (Hydration × 10%) + (Recovery × 5%)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Our proprietary algorithm weighs testosterone and sleep most heavily, 
                as these metrics show the strongest correlation with on-field performance.
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
}