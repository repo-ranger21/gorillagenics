import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
}

interface OddsTickerProps {
  lines: LineItem[];
}

export default function OddsTicker({ lines }: OddsTickerProps) {
  if (!lines || lines.length === 0) {
    return (
      <div className="bg-background/10 border border-primary/20 rounded-lg p-4 text-center">
        <div className="text-muted-foreground">📡 Loading live odds...</div>
      </div>
    );
  }

  const getMovementIcon = (move: number) => {
    if (move > 0) return <TrendingUp className="w-3 h-3 text-red-400" />;
    if (move < 0) return <TrendingDown className="w-3 h-3 text-green-400" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getMovementColor = (move: number) => {
    if (move > 0) return "text-red-400";
    if (move < 0) return "text-green-400";
    return "text-muted-foreground";
  };

  // Duplicate lines for seamless scrolling
  const scrollingLines = [...lines, ...lines];

  return (
    <div className="relative overflow-hidden bg-background/10 border border-primary/20 rounded-lg">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: "-50%" }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {scrollingLines.map((line, index) => (
          <div
            key={`${line.id}-${index}`}
            className="flex items-center gap-4 px-6 py-3 border-r border-primary/10 last:border-r-0"
            style={{ minWidth: "300px" }}
          >
            {/* Matchup */}
            <div className="text-foreground font-semibold text-sm">
              {line.matchup}
            </div>
            
            {/* Market & Line */}
            <div className="text-muted-foreground text-xs">
              {line.market}: {line.line}
            </div>
            
            {/* Recommendation */}
            <Badge 
              className={`text-xs ${
                line.recommendation === "Over" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {line.recommendation}
            </Badge>
            
            {/* Confidence */}
            <div className="text-yellow-400 text-xs font-bold">
              {line.confidence}%
            </div>
            
            {/* BioBoost Score */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">BB:</span>
              <span className="text-xs font-bold text-primary">
                {line.bioBoost}
              </span>
            </div>
            
            {/* Line Movement */}
            <div className="flex items-center gap-1">
              {getMovementIcon(line.move)}
              <span className={`text-xs font-bold ${getMovementColor(line.move)}`}>
                {line.move > 0 ? `+${line.move}` : line.move}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
      
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/10 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/10 to-transparent pointer-events-none" />
    </div>
  );
}