import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface TickerItem {
  gameId: string;
  teams: string;
  spreadChange: number;
  totalChange: number;
  lastUpdated: string;
}

interface OddsTickerProps {
  odds: Array<{
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    lineMove: { spreadΔ: number; totalΔ: number };
    lastUpdatedISO: string;
  }>;
}

export function OddsTicker({ odds }: OddsTickerProps) {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Filter odds with significant line movement
    const significantMoves = odds
      .filter(odd => 
        Math.abs(odd.lineMove?.spreadΔ || 0) >= 0.5 || 
        Math.abs(odd.lineMove?.totalΔ || 0) >= 1
      )
      .map(odd => ({
        gameId: odd.gameId,
        teams: `${odd.awayTeam} @ ${odd.homeTeam}`,
        spreadChange: odd.lineMove?.spreadΔ || 0,
        totalChange: odd.lineMove?.totalΔ || 0,
        lastUpdated: odd.lastUpdatedISO
      }));
    
    setTickerItems(significantMoves);
  }, [odds]);

  useEffect(() => {
    if (tickerItems.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % tickerItems.length);
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(interval);
  }, [tickerItems.length]);

  const getCurrentItem = () => tickerItems[currentIndex];
  const hasMovement = tickerItems.length > 0;

  if (!hasMovement) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>No significant line movement detected</span>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = getCurrentItem();
  
  const formatChange = (value: number, prefix = '') => {
    const formatted = Math.abs(value).toFixed(1);
    const sign = value > 0 ? '+' : '-';
    return `${sign}${formatted}${prefix}`;
  };

  const getChangeIcon = (value: number) => {
    if (Math.abs(value) < 0.1) return null;
    return value > 0 ? 
      <TrendingUp className="h-3 w-3 text-green-500" /> : 
      <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 border-b border-green-200 dark:border-gray-600 py-3"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Activity className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Live Line Movement
              </span>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-4 text-sm"
            >
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {currentItem.teams}
              </span>
              
              {Math.abs(currentItem.spreadChange) >= 0.5 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Spread:</span>
                  {getChangeIcon(currentItem.spreadChange)}
                  <span className={`text-xs font-mono ${
                    currentItem.spreadChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChange(currentItem.spreadChange)}
                  </span>
                </div>
              )}
              
              {Math.abs(currentItem.totalChange) >= 1 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Total:</span>
                  {getChangeIcon(currentItem.totalChange)}
                  <span className={`text-xs font-mono ${
                    currentItem.totalChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChange(currentItem.totalChange)}
                  </span>
                </div>
              )}
              
              <span className="text-xs text-gray-500">
                {new Date(currentItem.lastUpdated).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZone: 'America/New_York'
                })} ET
              </span>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex items-center gap-1">
            {tickerItems.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-1 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}