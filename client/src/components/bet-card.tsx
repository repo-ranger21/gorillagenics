import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

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

interface BetCardProps {
  bet: LineItem;
}

export default function BetCard({ bet }: BetCardProps) {
  const isOver = bet.recommendation === "Over";
  
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { label: "HIGH", color: "bg-green-600", emoji: "🔥" };
    if (confidence >= 65) return { label: "MODERATE", color: "bg-yellow-600", emoji: "⚡" };
    return { label: "LOW", color: "bg-gray-600", emoji: "💭" };
  };

  const getBioBoostLevel = (score: number) => {
    if (score >= 85) return { label: "ELITE", color: "text-green-400", emoji: "🦍" };
    if (score >= 70) return { label: "SOLID", color: "text-yellow-400", emoji: "💪" };
    return { label: "AVERAGE", color: "text-muted-foreground", emoji: "📊" };
  };

  const confidenceLevel = getConfidenceLevel(bet.confidence);
  const bioBoostLevel = getBioBoostLevel(bet.bioBoost);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-background/20 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isOver ? 'bg-red-600' : 'bg-green-600'}`}>
                {isOver ? (
                  <TrendingUp className="w-4 h-4 text-white" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-foreground text-lg">
                  {bet.matchup}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {bet.market}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {bet.line}
              </div>
              <Badge className={`${isOver ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                {bet.recommendation.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Confidence */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Confidence</span>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">
                  {bet.confidence}%
                </div>
                <Badge className={`text-xs ${confidenceLevel.color} hover:${confidenceLevel.color}`}>
                  {confidenceLevel.emoji} {confidenceLevel.label}
                </Badge>
              </div>
            </div>
            
            {/* BioBoost Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">BioBoost</span>
              </div>
              <div className="space-y-1">
                <div className="text-xl font-bold text-foreground">
                  {bet.bioBoost}
                </div>
                <div className={`text-xs font-bold ${bioBoostLevel.color}`}>
                  {bioBoostLevel.emoji} {bioBoostLevel.label}
                </div>
              </div>
            </div>
            
            {/* Line Movement */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-sm text-muted-foreground">Movement</span>
              </div>
              <div className="space-y-1">
                <div className={`text-xl font-bold ${
                  bet.move > 0 ? 'text-red-400' : 
                  bet.move < 0 ? 'text-green-400' : 'text-muted-foreground'
                }`}>
                  {bet.move > 0 ? `+${bet.move}` : bet.move}
                </div>
                <div className="text-xs text-muted-foreground">
                  {bet.move === 0 ? 'No change' : 'vs opening'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Confidence Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence Level</span>
              <span className="text-foreground font-semibold">{bet.confidence}%</span>
            </div>
            <Progress 
              value={bet.confidence} 
              className={`h-2 ${
                bet.confidence >= 80 ? '[&>div]:bg-green-500' :
                bet.confidence >= 65 ? '[&>div]:bg-yellow-500' :
                '[&>div]:bg-gray-500'
              }`}
            />
          </div>
          
          {/* Commentary */}
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <span className="text-lg">🦍</span>
              <div>
                <div className="font-semibold text-primary text-sm mb-1">
                  Gorilla Intelligence:
                </div>
                <p className="text-foreground text-sm italic">
                  "{bet.commentary}"
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}