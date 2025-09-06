import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TopPickCard } from './TopPickCard';
import { Loader2 } from 'lucide-react';

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

interface TopFiveData {
  week: number;
  picks: TopPick[];
  generatedAt: string;
  totalCandidates: number;
  fallback?: boolean;
}

export function TopFivePanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/top5'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-jungle to-jungle/80 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-banana mx-auto" />
            <p className="text-banana font-medium">🦍 Peeling the data bananas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-jungle to-jungle/80 rounded-xl p-6 mb-8">
        <div className="text-center py-8">
          <p className="text-banana font-medium mb-2">🦍 Data is swinging in late — check back soon!</p>
          <p className="text-jungle-light text-sm">We're working on getting the freshest picks loaded.</p>
        </div>
      </div>
    );
  }

  const topFiveData = data as TopFiveData;
  
  if (!topFiveData?.picks || topFiveData.picks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-jungle to-jungle/80 rounded-xl p-6 mb-8">
        <div className="text-center py-8">
          <p className="text-banana font-medium mb-2">🦍 No picks ready yet!</p>
          <p className="text-jungle-light text-sm">Check back when the week's schedule is released.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-jungle to-jungle/80 rounded-xl p-6 mb-8" data-testid="top-five-panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-banana mb-1">
            🏆 Top 5 Weekly DFS Picks
          </h2>
          <p className="text-jungle-light text-sm">
            Week {topFiveData.week} • {topFiveData.totalCandidates} players analyzed
            {topFiveData.fallback && (
              <span className="ml-2 text-yellow-400">• Backup data</span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-jungle-light text-xs">
            Updated: {new Date(topFiveData.generatedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/New_York'
            })} ET
          </div>
        </div>
      </div>

      {/* Top 5 Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {topFiveData.picks.map((pick, index) => (
          <TopPickCard 
            key={pick.playerId}
            pick={pick}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-jungle-light/20">
        <div className="flex flex-wrap gap-4 text-xs text-jungle-light">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-vine rounded-full"></div>
            <span>Main Slate Eligible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-action rounded-full"></div>
            <span>Prime Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🦍</span>
            <span>GuerillaGenics Algorithm</span>
          </div>
        </div>
      </div>
    </div>
  );
}