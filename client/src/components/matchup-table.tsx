import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchupRow from "./matchup-row";

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

interface MatchupTableProps {
  games: Game[];
  isLoading?: boolean;
}

const timeSlots = [
  { value: "all", label: "All Games", count: 0 },
  { value: "thursday", label: "Thursday", count: 0 },
  { value: "friday", label: "Friday", count: 0 },
  { value: "sunday-early", label: "Sunday Early", count: 0 },
  { value: "sunday-late", label: "Sunday Late", count: 0 },
  { value: "snf", label: "SNF", count: 0 },
  { value: "mnf", label: "MNF", count: 0 }
];

export default function MatchupTable({ games = [], isLoading = false }: MatchupTableProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Calculate counts for each time slot
  const slotsWithCounts = timeSlots.map(slot => ({
    ...slot,
    count: slot.value === "all" 
      ? games.length 
      : games.filter(game => {
          switch (slot.value) {
            case "thursday": return game.timeSlot === "Thursday";
            case "friday": return game.timeSlot === "Friday";
            case "sunday-early": return game.timeSlot === "Sunday Early";
            case "sunday-late": return game.timeSlot === "Sunday Late";
            case "snf": return game.timeSlot === "SNF";
            case "mnf": return game.timeSlot === "MNF";
            default: return true;
          }
        }).length
  }));

  // Filter games based on active filter
  const filteredGames = games.filter(game => {
    if (activeFilter === "all") return true;
    
    switch (activeFilter) {
      case "thursday": return game.timeSlot === "Thursday";
      case "friday": return game.timeSlot === "Friday"; 
      case "sunday-early": return game.timeSlot === "Sunday Early";
      case "sunday-late": return game.timeSlot === "Sunday Late";
      case "snf": return game.timeSlot === "SNF";
      case "mnf": return game.timeSlot === "MNF";
      default: return true;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filter skeleton */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted/40 rounded-md animate-pulse" />
          ))}
        </div>
        
        {/* Table skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Slot Filters */}
      <div className="flex flex-wrap gap-2">
        {slotsWithCounts.map((slot) => (
          <button
            key={slot.value}
            onClick={() => setActiveFilter(slot.value)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all hover:scale-105 ${
              activeFilter === slot.value
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'bg-background/20 backdrop-blur-sm text-foreground hover:bg-background/30'
            }`}
            data-testid={`filter-${slot.value}`}
          >
            {slot.label}
            <Badge 
              variant="outline" 
              className={`ml-1 ${
                activeFilter === slot.value 
                  ? 'border-primary-foreground/30 text-primary-foreground' 
                  : 'border-foreground/30'
              }`}
            >
              {slot.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Games List */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {filteredGames.length > 0 ? (
            filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MatchupRow game={game} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-background/10 backdrop-blur-sm rounded-lg border border-border/30"
            >
              <div className="text-6xl mb-4">🦍</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No Games in This Time Slot
              </h3>
              <p className="text-muted-foreground">
                Try a different filter to see more matchups!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      {filteredGames.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-6 p-4 bg-background/10 backdrop-blur-sm rounded-lg border border-border/30"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {filteredGames.length}
            </div>
            <div className="text-sm text-muted-foreground">Games</div>
          </div>
          
          <div className="w-px h-8 bg-border" />
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {filteredGames.reduce((sum, game) => sum + game.overUnder, 0) / filteredGames.length}
            </div>
            <div className="text-sm text-muted-foreground">Avg O/U</div>
          </div>
          
          <div className="w-px h-8 bg-border" />
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              🦍
            </div>
            <div className="text-sm text-muted-foreground">Week 1</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}