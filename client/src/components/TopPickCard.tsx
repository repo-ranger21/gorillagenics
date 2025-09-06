import React, { useState } from 'react';
import { Clock, TrendingUp, Zap } from 'lucide-react';

interface TopPick {
  playerId: string;
  name: string;
  teamAbbr: string;
  position: string;
  matchup: string;
  kickoffEt: string;
  slate: 'Main' | 'Prime';
  ggScore: number;
  confidence: number;
  commentary: string;
  headshotUrl?: string;
  gameTotal: number;
}

interface TopPickCardProps {
  pick: TopPick;
  rank: number;
}

export function TopPickCard({ pick, rank }: TopPickCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getConfidenceBand = (confidence: number) => {
    if (confidence >= 80) return { label: 'High', color: 'text-vine', bg: 'bg-vine/20' };
    if (confidence >= 65) return { label: 'Moderate', color: 'text-banana', bg: 'bg-banana/20' };
    return { label: 'Low', color: 'text-action', bg: 'bg-action/20' };
  };

  const confidenceBand = getConfidenceBand(pick.confidence);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-vine';
    if (score >= 65) return 'text-banana';
    return 'text-orange-400';
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-200 cursor-pointer border border-white/20"
      onClick={() => setShowDetails(!showDetails)}
      data-testid={`top-pick-card-${pick.playerId}`}
    >
      {/* Rank Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-6 h-6 bg-banana text-jungle rounded-full flex items-center justify-center text-xs font-bold">
          {rank}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          pick.slate === 'Prime' ? 'bg-action text-white' : 'bg-vine text-white'
        }`}>
          {pick.slate}
        </div>
      </div>

      {/* Player Info */}
      <div className="text-center mb-3">
        {/* Player Image */}
        <div className="relative w-16 h-16 mx-auto mb-2">
          {!imageError && pick.headshotUrl ? (
            <img
              src={pick.headshotUrl}
              alt={pick.name}
              className="w-full h-full rounded-full object-cover border-2 border-banana/30"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-jungle-light/30 flex items-center justify-center text-banana text-lg font-bold border-2 border-banana/30">
              {pick.position}
            </div>
          )}
        </div>

        {/* Player Name */}
        <h3 className="text-white font-bold text-sm leading-tight">
          {pick.name}
        </h3>
        
        {/* Team & Position */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-banana text-xs font-medium">{pick.teamAbbr}</span>
          <span className="text-jungle-light text-xs">•</span>
          <span className="text-jungle-light text-xs">{pick.position}</span>
        </div>
      </div>

      {/* Matchup & Time */}
      <div className="text-center mb-3">
        <div className="text-white text-xs font-medium mb-1">
          {pick.matchup}
        </div>
        <div className="flex items-center justify-center gap-1 text-jungle-light text-xs">
          <Clock className="w-3 h-3" />
          {pick.kickoffEt}
        </div>
      </div>

      {/* GG Score Meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-jungle-light">GG Score</span>
          <span className={`text-sm font-bold ${getScoreColor(pick.ggScore)}`}>
            {pick.ggScore}
          </span>
        </div>
        <div className="w-full bg-jungle-light/30 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              pick.ggScore >= 80 ? 'bg-vine' : 
              pick.ggScore >= 65 ? 'bg-banana' : 'bg-orange-400'
            }`}
            style={{ width: `${pick.ggScore}%` }}
          />
        </div>
      </div>

      {/* Confidence Band */}
      <div className={`${confidenceBand.bg} rounded px-2 py-1 mb-3`}>
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className={`w-3 h-3 ${confidenceBand.color}`} />
          <span className={`text-xs font-medium ${confidenceBand.color}`}>
            {confidenceBand.label} ({pick.confidence}%)
          </span>
        </div>
      </div>

      {/* Commentary */}
      <div className="text-jungle-light text-xs text-center leading-relaxed">
        {pick.commentary}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-white/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-jungle-light">Game Total:</span>
            <span className="text-white font-medium">
              {pick.gameTotal}
              {pick.gameTotal > 48 && (
                <Zap className="w-3 h-3 inline ml-1 text-banana" />
              )}
            </span>
          </div>
          
          {pick.gameTotal > 48 && (
            <div className="text-xs text-banana text-center">
              🔥 High-scoring game environment
            </div>
          )}
          
          <div className="text-xs text-jungle-light text-center">
            Tap to view correlations & stack suggestions
          </div>
        </div>
      )}
    </div>
  );
}