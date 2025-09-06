import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, Clock, X } from 'lucide-react';

interface FallbackBannerProps {
  type: 'cached' | 'offline' | 'error' | 'stale';
  message?: string;
  cacheAge?: number;
  onRefresh?: () => void;
  onDismiss?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export default function FallbackBanner({
  type,
  message,
  cacheAge,
  onRefresh,
  onDismiss,
  isRefreshing = false,
  className = ''
}: FallbackBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getConfig = () => {
    switch (type) {
      case 'cached':
        return {
          icon: Clock,
          color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          iconColor: 'text-yellow-600',
          title: 'Showing cached jungle data',
          defaultMessage: 'Displaying last known data while fresh updates load. Swing back soon!'
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'border-red-500 bg-red-50 dark:bg-red-900/20',
          iconColor: 'text-red-600',
          title: 'You\'re offline',
          defaultMessage: 'No internet connection detected. Showing cached gorilla picks.'
        };
      case 'error':
        return {
          icon: RefreshCw,
          color: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
          iconColor: 'text-orange-600',
          title: 'Connection hiccup',
          defaultMessage: 'Having trouble fetching fresh data. Using cached jungle intel.'
        };
      case 'stale':
        return {
          icon: Wifi,
          color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
          iconColor: 'text-blue-600',
          title: 'Data getting stale',
          defaultMessage: 'Current data is getting old. Consider refreshing for the latest picks.'
        };
      default:
        return {
          icon: Clock,
          color: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20',
          iconColor: 'text-gray-600',
          title: 'Fallback mode',
          defaultMessage: 'Using alternative data source.'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  const formatCacheAge = (ageMs: number): string => {
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -50, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={className}
        >
          <Alert className={`${config.color} border-l-4 relative overflow-hidden`}>
            {/* Animated background pulse for error/offline states */}
            {(type === 'error' || type === 'offline') && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className="flex items-start gap-3 relative z-10">
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
              >
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{config.title}</h4>
                  {cacheAge !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      🕒 {formatCacheAge(cacheAge)}
                    </Badge>
                  )}
                  {type === 'cached' && (
                    <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                      🦍 Jungle Cache
                    </Badge>
                  )}
                </div>
                <AlertDescription className="text-sm">
                  {displayMessage}
                </AlertDescription>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {onRefresh && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="h-7 px-2 text-xs"
                    data-testid="fallback-refresh-button"
                  >
                    <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                )}
                
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    data-testid="fallback-dismiss-button"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress indicator for refresh */}
            {isRefreshing && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            )}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Specialized fallback banners
export function CachedDataBanner(props: Omit<FallbackBannerProps, 'type'>) {
  return <FallbackBanner type="cached" {...props} />;
}

export function OfflineBanner(props: Omit<FallbackBannerProps, 'type'>) {
  return <FallbackBanner type="offline" {...props} />;
}

export function ErrorBanner(props: Omit<FallbackBannerProps, 'type'>) {
  return <FallbackBanner type="error" {...props} />;
}

export function StaleDataBanner(props: Omit<FallbackBannerProps, 'type'>) {
  return <FallbackBanner type="stale" {...props} />;
}