import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';

interface PlayerSpotlight {
  id: string;
  name: string;
  position: string;
  role: string;
  team: string;
  headshot: string;
  usageNotes: string;
  dfsValue: 'Elite' | 'Mid' | 'Sleeper';
  salary: {
    draftkings?: number;
    fanduel?: number;
  };
  slateEligibility: string[];
  projectedPoints: number;
  targetShare?: number;
  carryShare?: number;
  redZoneUsage?: number;
  bioBoostScore?: number;
}

interface PlayerSpotlightProps {
  player: PlayerSpotlight;
  compact?: boolean;
}

export default function PlayerSpotlight({ player, compact = false }: PlayerSpotlightProps) {
  const getValueColor = (value: string) => {
    switch (value) {
      case 'Elite': return 'bg-yellow-500 text-yellow-900';
      case 'Mid': return 'bg-blue-500 text-blue-900';
      case 'Sleeper': return 'bg-green-500 text-green-900';
      default: return 'bg-gray-500 text-gray-900';
    }
  };

  const getBioBoostColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Player headshot */}
          <div className="relative">
            <img
              src={player.headshot}
              alt={player.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/48/48';
              }}
            />
            <Badge 
              variant="secondary" 
              className="absolute -bottom-1 -right-1 text-xs px-1 py-0"
            >
              {player.position}
            </Badge>
          </div>

          <div className="flex-1 min-w-0">
            {/* Name and role */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-sm truncate">{player.name}</h4>
                <p className="text-xs text-muted-foreground">{player.role} • {player.team}</p>
              </div>
              <Badge className={`text-xs ${getValueColor(player.dfsValue)}`}>
                {player.dfsValue}
              </Badge>
            </div>

            {/* Usage notes */}
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {player.usageNotes}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-2 text-xs">
              {player.projectedPoints && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{player.projectedPoints} pts</span>
                </div>
              )}
              
              {player.bioBoostScore && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className={getBioBoostColor(player.bioBoostScore)}>
                    {player.bioBoostScore}
                  </span>
                </div>
              )}

              {(player.targetShare || player.carryShare) && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{player.targetShare || player.carryShare}%</span>
                </div>
              )}
            </div>

            {/* Salary info */}
            <div className="flex items-center gap-3 mt-2">
              {player.salary.draftkings && (
                <div className="flex items-center gap-1 text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium">DK: ${player.salary.draftkings.toLocaleString()}</span>
                </div>
              )}
              {player.salary.fanduel && (
                <div className="flex items-center gap-1 text-xs">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium">FD: ${player.salary.fanduel.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Slate eligibility */}
            <div className="flex flex-wrap gap-1 mt-2">
              {player.slateEligibility.map((slate) => (
                <Badge key={slate} variant="outline" className="text-xs px-1 py-0">
                  {slate}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}