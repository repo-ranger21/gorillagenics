import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Player } from "@shared/schema";
import { useState, useMemo, useEffect } from "react";

interface PerformanceHeatmapProps {
  players: Player[];
}

type MetricKey = 'sleepScore' | 'testosteroneProxy' | 'hydrationLevel' | 'bioBoostScore';

interface HeatmapCell {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  metric: string;
  value: number;
  normalizedValue: number; // 0-1 for color intensity
  x: number; // grid position
  y: number;
}

const METRICS: { key: MetricKey; label: string; icon: string; color: string }[] = [
  { key: 'sleepScore', label: 'Sleep', icon: '😴', color: 'sleep' },
  { key: 'testosteroneProxy', label: 'T-Index', icon: '💪', color: 'testosterone' },
  { key: 'hydrationLevel', label: 'Hydration', icon: '💧', color: 'hydration' },
  { key: 'bioBoostScore', label: 'BioBoost', icon: '🦍', color: 'primary' },
];

export default function PerformanceHeatmap({ players }: PerformanceHeatmapProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('bioBoostScore');
  const [animationKey, setAnimationKey] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  // Process players into heatmap grid data
  const heatmapData = useMemo(() => {
    if (!players || players.length === 0) return [];

    // Get all values for the selected metric to normalize
    const metricValues = players.map(p => p[selectedMetric] as number);
    const minValue = Math.min(...metricValues);
    const maxValue = Math.max(...metricValues);
    
    // Create grid layout (8x4 for up to 32 players)
    const gridWidth = 8;
    const cells: HeatmapCell[] = [];
    
    players.slice(0, 32).forEach((player, index) => {
      const value = player[selectedMetric] as number;
      const normalizedValue = maxValue > minValue ? (value - minValue) / (maxValue - minValue) : 0.5;
      
      cells.push({
        playerId: player.id,
        playerName: player.name,
        team: player.team,
        position: player.position,
        metric: selectedMetric,
        value,
        normalizedValue,
        x: index % gridWidth,
        y: Math.floor(index / gridWidth)
      });
    });

    return cells;
  }, [players, selectedMetric]);

  // Auto-rotate metrics for dynamic display
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedMetric(current => {
        const currentIndex = METRICS.findIndex(m => m.key === current);
        const nextIndex = (currentIndex + 1) % METRICS.length;
        return METRICS[nextIndex].key;
      });
      setAnimationKey(prev => prev + 1);
    }, 5000); // Change metric every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getIntensityColor = (normalizedValue: number, metricColor: string) => {
    const intensity = Math.max(0.2, normalizedValue); // Minimum 20% opacity
    
    switch (metricColor) {
      case 'sleep':
        return `rgba(139, 69, 19, ${intensity})`; // Brown/orange tones
      case 'testosterone':
        return `rgba(220, 20, 60, ${intensity})`; // Red tones
      case 'hydration':
        return `rgba(30, 144, 255, ${intensity})`; // Blue tones
      case 'primary':
        return `rgba(255, 193, 7, ${intensity})`; // Banana yellow
      default:
        return `rgba(128, 128, 128, ${intensity})`;
    }
  };

  const getPerformanceLevel = (value: number, metricKey: MetricKey) => {
    if (metricKey === 'bioBoostScore') {
      if (value >= 90) return { level: 'Elite', emoji: '🔥', color: 'text-destructive' };
      if (value >= 75) return { level: 'Strong', emoji: '💪', color: 'text-primary' };
      if (value >= 60) return { level: 'Average', emoji: '⚡', color: 'text-muted-foreground' };
      return { level: 'Weak', emoji: '😴', color: 'text-muted-foreground' };
    }
    
    if (value >= 80) return { level: 'High', emoji: '🟢', color: 'text-primary' };
    if (value >= 60) return { level: 'Medium', emoji: '🟡', color: 'text-muted-foreground' };
    return { level: 'Low', emoji: '🔴', color: 'text-destructive' };
  };

  const currentMetric = METRICS.find(m => m.key === selectedMetric)!;

  return (
    <Card className="bg-card border border-border overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-card-foreground">
            🔥 Performance Heatmap
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {players.length} Players • Live Data
          </div>
        </div>
        
        {/* Metric Selector */}
        <div className="flex flex-wrap gap-2 mt-4">
          {METRICS.map((metric) => (
            <Button
              key={metric.key}
              variant={selectedMetric === metric.key ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedMetric(metric.key);
                setAnimationKey(prev => prev + 1);
              }}
              className="flex items-center gap-2"
              data-testid={`metric-${metric.key}`}
            >
              <span>{metric.icon}</span>
              <span>{metric.label}</span>
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {currentMetric.icon} {currentMetric.label} Performance
          </div>
          <div className="text-sm text-muted-foreground">
            Darker colors indicate higher performance • Hover for details
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="relative">
          <div 
            className="grid gap-2 mx-auto"
            style={{ 
              gridTemplateColumns: 'repeat(8, 1fr)',
              maxWidth: '640px'
            }}
          >
            {heatmapData.map((cell, index) => {
              const performance = getPerformanceLevel(cell.value, cell.metric as MetricKey);
              
              return (
                <motion.div
                  key={`${cell.playerId}-${cell.x}-${cell.y}-${selectedMetric}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.02, // Stagger animation
                    ease: "easeOut"
                  }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="relative aspect-square rounded-lg cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all"
                  style={{
                    backgroundColor: getIntensityColor(cell.normalizedValue, currentMetric.color)
                  }}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  data-testid={`heatmap-cell-${cell.playerId}`}
                >
                  {/* Player initials */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs font-bold text-white drop-shadow-lg">
                        {cell.playerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-xs text-white/80 font-medium">
                        {cell.position}
                      </div>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="absolute top-1 right-1">
                    <span className="text-xs">{performance.emoji}</span>
                  </div>

                  {/* Team badge */}
                  <div className="absolute bottom-1 left-1">
                    <div className="text-xs font-bold text-white/90 bg-black/30 px-1 rounded">
                      {cell.team}
                    </div>
                  </div>

                  {/* Value display */}
                  <div className="absolute bottom-1 right-1">
                    <div className="text-xs font-bold text-white drop-shadow-lg">
                      {cell.value}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  {hoveredCell?.playerId === cell.playerId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg shadow-lg z-20 min-w-max"
                    >
                      <div className="text-sm font-bold">{cell.playerName}</div>
                      <div className="text-xs text-gray-300">
                        {currentMetric.label}: {cell.value} {performance.level}
                      </div>
                      <div className="text-xs text-gray-400">
                        {cell.team} • {cell.position}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 flex items-center justify-center gap-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getIntensityColor(0.3, currentMetric.color) }}
                />
                <span className="text-sm text-muted-foreground">Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getIntensityColor(0.7, currentMetric.color) }}
                />
                <span className="text-sm text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getIntensityColor(1.0, currentMetric.color) }}
                />
                <span className="text-sm text-muted-foreground">High</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              📊 Auto-updates every 5 seconds
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <motion.div
          key={`summary-${selectedMetric}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {['Elite', 'Strong', 'Average'].map((level, index) => {
            const count = heatmapData.filter(cell => {
              const perf = getPerformanceLevel(cell.value, cell.metric as MetricKey);
              return perf.level === level;
            }).length;
            
            const colors = ['text-destructive', 'text-primary', 'text-muted-foreground'];
            
            return (
              <div key={level} className="text-center p-4 bg-muted/20 rounded-lg">
                <div className={`text-2xl font-bold ${colors[index]}`}>
                  {count}
                </div>
                <div className="text-sm text-muted-foreground">
                  {level} Performers
                </div>
              </div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}