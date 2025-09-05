import React from 'react';
import { motion } from 'framer-motion';
import { User, Star, Activity, AlertCircle } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  roleTag: string;
  jerseyNumber?: number;
  age?: number;
  experience?: number;
  injuryStatus?: string;
  headshotUrl?: string;
}

interface FeaturedOffenseProps {
  teamName: string;
  teamAbbr: string;
  players: Player[];
  isLoading?: boolean;
  fallback?: boolean;
}

export function FeaturedOffense({ 
  teamName, 
  teamAbbr, 
  players, 
  isLoading = false,
  fallback = false 
}: FeaturedOffenseProps) {
  
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'RB': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'WR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'TE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'QB': return '🎯';
      case 'RB': return '💨';
      case 'WR': return '⚡';
      case 'TE': return '🎪';
      default: return '🏈';
    }
  };

  const getInjuryStatusColor = (status?: string) => {
    if (!status || status === 'Healthy') return 'text-green-600';
    if (status.includes('Questionable')) return 'text-yellow-600';
    if (status.includes('Doubtful') || status.includes('Out')) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (fallback || players.length === 0) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Offensive players swinging in late...
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Check back soon for featured offense
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {teamAbbr} Offense
        </h4>
        <Star className="h-3 w-3 text-yellow-500" />
      </div>
      
      <div className="space-y-2">
        {players.slice(0, 4).map((player, index) => (
          <motion.div
            key={player.id || index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {/* Player Avatar */}
            <div className="relative">
              {player.headshotUrl ? (
                <img
                  src={player.headshotUrl}
                  alt={player.name}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs"
                style={{ display: player.headshotUrl ? 'none' : 'flex' }}
              >
                {getPositionIcon(player.position)}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {player.name}
                </span>
                <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${getPositionColor(player.position)}`}>
                  {player.roleTag}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                {player.jerseyNumber && (
                  <span className="text-xs text-gray-500">
                    #{player.jerseyNumber}
                  </span>
                )}
                {player.experience !== undefined && (
                  <span className="text-xs text-gray-500">
                    {player.experience}Y
                  </span>
                )}
                {player.injuryStatus && player.injuryStatus !== 'Healthy' && (
                  <span className={`text-xs font-medium ${getInjuryStatusColor(player.injuryStatus)}`}>
                    {player.injuryStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Position Badge */}
            <div className="flex items-center">
              <Activity className="h-3 w-3 text-gray-400" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Validation Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-200 dark:border-gray-600">
        🦍 Strictly offensive positions only (QB/RB/WR/TE)
      </div>
    </div>
  );
}