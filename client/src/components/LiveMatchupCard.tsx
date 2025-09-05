import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Wifi, WifiOff } from 'lucide-react';

interface LiveMatchupCardProps {
  game: {
    id: string;
    homeTeam: { name: string; abbr: string; logo?: string };
    awayTeam: { name: string; abbr: string; logo?: string };
    startEt: string;
    timeSlot: string;
    status: string;
  };
  odds: {
    spread: { home: number; away: number };
    total: number;
    moneylineHome: number;
    moneylineAway: number;
    lastUpdatedISO: string;
    lineMove: { spreadΔ: number; totalΔ: number };
    bookmaker?: string;
  };
  pick: {
    winner: 'home' | 'away';
    ouLean: 'Over' | 'Under';
    confidence: number;
    band: 'Low' | 'Moderate' | 'High';
    commentary: string;
  };
  offense: {
    home: { players: Array<{ name: string; position: string; roleTag: string }> };
    away: { players: Array<{ name: string; position: string; roleTag: string }> };
  };
}

export function LiveMatchupCard({ game, odds, pick, offense }: LiveMatchupCardProps) {
  const isLive = game.status === 'in_progress';
  const isStaleOdds = (Date.now() - new Date(odds.lastUpdatedISO).getTime()) > 10 * 60 * 1000;
  
  const getConfidenceColor = (band: string) => {
    switch (band) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getLineMoveIcon = (delta: number) => {
    if (Math.abs(delta) < 0.1) return null;
    return delta > 0 ? 
      <TrendingUp className="h-3 w-3 text-green-500" /> : 
      <TrendingDown className="h-3 w-3 text-red-500" />;
  };

  const formatMoneyline = (ml: number) => {
    return ml > 0 ? `+${ml}` : ml.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header with Live Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{game.timeSlot}</span>
          {isLive && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          {isStaleOdds ? (
            <><WifiOff className="h-3 w-3" /> Stale</>
          ) : (
            <><Wifi className="h-3 w-3" /> Live</>
          )}
        </div>
      </div>

      {/* Teams & Spread */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">{game.awayTeam.name}</div>
            <div className="text-xs text-gray-500">@</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">
              {odds.spread.away > 0 ? '+' : ''}{odds.spread.away}
            </span>
            {getLineMoveIcon(odds.lineMove.spreadΔ)}
            <span className="text-xs text-gray-500">
              {formatMoneyline(odds.moneylineAway)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">{game.homeTeam.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono">
              {odds.spread.home > 0 ? '+' : ''}{odds.spread.home}
            </span>
            {getLineMoveIcon(-odds.lineMove.spreadΔ)}
            <span className="text-xs text-gray-500">
              {formatMoneyline(odds.moneylineHome)}
            </span>
          </div>
        </div>
      </div>

      {/* Over/Under */}
      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
        <span className="text-sm">Total</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">O/U {odds.total}</span>
          {getLineMoveIcon(odds.lineMove.totalΔ)}
        </div>
      </div>

      {/* Featured Offensive Players */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">{game.awayTeam.abbr} Offense</div>
          <div className="space-y-1">
            {offense.away.players.slice(0, 2).map((player, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium">{player.name}</span>
                <span className="text-gray-500 ml-1">({player.roleTag})</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500 mb-1">{game.homeTeam.abbr} Offense</div>
          <div className="space-y-1">
            {offense.home.players.slice(0, 2).map((player, i) => (
              <div key={i} className="text-xs">
                <span className="font-medium">{player.name}</span>
                <span className="text-gray-500 ml-1">({player.roleTag})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GuerillaGenics Pick */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">🦍 GG Pick</span>
          <span className={`text-xs font-medium ${getConfidenceColor(pick.band)}`}>
            {pick.band} ({pick.confidence}%)
          </span>
        </div>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="text-sm">
            <span className="font-medium">Winner:</span>
            <span className={`ml-1 ${pick.winner === 'home' ? 'text-green-600' : 'text-blue-600'}`}>
              {pick.winner === 'home' ? game.homeTeam.abbr : game.awayTeam.abbr}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Total:</span>
            <span className={`ml-1 ${pick.ouLean === 'Over' ? 'text-red-600' : 'text-blue-600'}`}>
              {pick.ouLean}
            </span>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-300 italic">
          {pick.commentary}
        </p>
      </div>

      {/* Game Time & Bookmaker */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {game.startEt}
        </span>
        <span>{odds.bookmaker || 'Multiple Books'}</span>
      </div>
    </motion.div>
  );
}