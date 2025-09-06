import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SkeletonCardProps {
  type?: 'matchup' | 'player' | 'pick' | 'odds' | 'alert';
  className?: string;
}

export default function SkeletonCard({ type = 'matchup', className = '' }: SkeletonCardProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-green-100 via-yellow-50 to-green-100 dark:from-green-900 dark:via-yellow-900 dark:to-green-900";
  
  const renderMatchupSkeleton = () => (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-6 w-16 rounded ${baseClasses}`} />
          <div className={`h-4 w-12 rounded ${baseClasses}`} />
        </div>
        
        {/* Teams display skeleton */}
        <div className="flex items-center justify-between py-4">
          {/* Away team */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${baseClasses}`} />
            <div>
              <div className={`h-6 w-16 rounded mb-1 ${baseClasses}`} />
              <div className={`h-4 w-12 rounded ${baseClasses}`} />
            </div>
          </div>
          
          <div className={`h-4 w-4 rounded ${baseClasses}`} />
          
          {/* Home team */}
          <div className="flex items-center gap-3">
            <div>
              <div className={`h-6 w-16 rounded mb-1 ${baseClasses}`} />
              <div className={`h-4 w-12 rounded ${baseClasses}`} />
            </div>
            <div className={`w-12 h-12 rounded-full ${baseClasses}`} />
          </div>
        </div>
        
        {/* Game info skeleton */}
        <div className="flex items-center justify-between">
          <div className={`h-4 w-32 rounded ${baseClasses}`} />
          <div className={`h-4 w-24 rounded ${baseClasses}`} />
        </div>
        
        {/* Odds skeleton */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center space-y-2">
            <div className={`h-3 w-12 rounded mx-auto ${baseClasses}`} />
            <div className={`h-5 w-8 rounded mx-auto ${baseClasses}`} />
          </div>
          <div className="text-center space-y-2">
            <div className={`h-3 w-12 rounded mx-auto ${baseClasses}`} />
            <div className={`h-5 w-12 rounded mx-auto ${baseClasses}`} />
          </div>
          <div className="text-center space-y-2">
            <div className={`h-3 w-16 rounded mx-auto ${baseClasses}`} />
            <div className={`h-5 w-16 rounded mx-auto ${baseClasses}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className={`h-4 w-full rounded ${baseClasses}`} />
          <div className={`h-4 w-3/4 rounded ${baseClasses}`} />
          <div className={`h-4 w-1/2 rounded ${baseClasses}`} />
        </div>
      </CardContent>
    </Card>
  );

  const renderPlayerSkeleton = () => (
    <Card className={`${className} h-full`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full ${baseClasses}`} />
            <div className={`absolute -bottom-1 -right-1 w-6 h-4 rounded ${baseClasses}`} />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`h-4 w-24 rounded ${baseClasses}`} />
                <div className={`h-3 w-16 rounded ${baseClasses}`} />
              </div>
              <div className={`h-5 w-12 rounded ${baseClasses}`} />
            </div>
            
            <div className={`h-3 w-full rounded ${baseClasses}`} />
            <div className={`h-3 w-4/5 rounded ${baseClasses}`} />
            
            <div className="flex items-center gap-4">
              <div className={`h-3 w-12 rounded ${baseClasses}`} />
              <div className={`h-3 w-8 rounded ${baseClasses}`} />
              <div className={`h-3 w-10 rounded ${baseClasses}`} />
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`h-3 w-16 rounded ${baseClasses}`} />
              <div className={`h-3 w-16 rounded ${baseClasses}`} />
            </div>
            
            <div className="flex flex-wrap gap-1">
              <div className={`h-4 w-12 rounded ${baseClasses}`} />
              <div className={`h-4 w-16 rounded ${baseClasses}`} />
              <div className={`h-4 w-14 rounded ${baseClasses}`} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPickSkeleton = () => (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className={`h-6 w-32 rounded ${baseClasses}`} />
            <div className={`h-5 w-16 rounded ${baseClasses}`} />
          </div>
          
          <div className="space-y-2">
            <div className={`h-4 w-full rounded ${baseClasses}`} />
            <div className={`h-4 w-5/6 rounded ${baseClasses}`} />
            <div className={`h-4 w-2/3 rounded ${baseClasses}`} />
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`h-3 w-20 rounded ${baseClasses}`} />
            <div className={`h-3 w-16 rounded ${baseClasses}`} />
            <div className={`h-3 w-12 rounded ${baseClasses}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOddsSkeleton = () => (
    <div className={`${className} p-4 border rounded-lg bg-card`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className={`h-4 w-20 rounded ${baseClasses}`} />
          <div className={`h-3 w-16 rounded ${baseClasses}`} />
        </div>
        <div className="text-right space-y-1">
          <div className={`h-5 w-12 rounded ${baseClasses}`} />
          <div className={`h-3 w-8 rounded ${baseClasses}`} />
        </div>
      </div>
    </div>
  );

  const renderAlertSkeleton = () => (
    <div className={`${className} p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-r-lg`}>
      <div className="flex items-start gap-3">
        <div className={`w-6 h-6 rounded ${baseClasses}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-32 rounded ${baseClasses}`} />
          <div className={`h-3 w-full rounded ${baseClasses}`} />
          <div className={`h-3 w-4/5 rounded ${baseClasses}`} />
        </div>
        <div className={`h-3 w-12 rounded ${baseClasses}`} />
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'matchup':
        return renderMatchupSkeleton();
      case 'player':
        return renderPlayerSkeleton();
      case 'pick':
        return renderPickSkeleton();
      case 'odds':
        return renderOddsSkeleton();
      case 'alert':
        return renderAlertSkeleton();
      default:
        return renderMatchupSkeleton();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {renderSkeleton()}
    </motion.div>
  );
}

// Specialized skeleton components for common use cases
export function MatchupCardSkeleton({ className }: { className?: string }) {
  return <SkeletonCard type="matchup" className={className} />;
}

export function PlayerSpotlightSkeleton({ className }: { className?: string }) {
  return <SkeletonCard type="player" className={className} />;
}

export function TopPickSkeleton({ className }: { className?: string }) {
  return <SkeletonCard type="pick" className={className} />;
}

export function OddsTickerSkeleton({ className }: { className?: string }) {
  return <SkeletonCard type="odds" className={className} />;
}

export function AlertSkeleton({ className }: { className?: string }) {
  return <SkeletonCard type="alert" className={className} />;
}