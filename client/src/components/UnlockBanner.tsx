import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, X, Crown, Zap, TrendingUp } from 'lucide-react';
import { shouldShowUnlockBanner, dismissBanner, trackEvent, getFreePicksRemaining } from '@/modules/funnel/clientFunnel';

interface UnlockBannerProps {
  position?: 'top' | 'bottom';
  onSubscribeClick?: () => void;
}

export default function UnlockBanner({ position = 'top', onSubscribeClick }: UnlockBannerProps) {
  const [isVisible, setIsVisible] = useState(shouldShowUnlockBanner());

  const handleSubscribe = () => {
    trackEvent('subscribe_click', { source: 'unlock_banner', position });
    onSubscribeClick?.();
    
    // Open Substack in new tab
    const substackUrl = import.meta.env.VITE_SUBSTACK_PUBLICATION || 'https://substack.com/@guerillagenics';
    window.open(substackUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissBanner();
    trackEvent('banner_click', { action: 'dismiss', position });
  };

  const freePicksRemaining = getFreePicksRemaining();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: position === 'top' ? -100 : 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          ${position === 'top' ? 'top-0' : 'bottom-0'} 
          fixed left-0 right-0 z-40 bg-gradient-to-r from-primary via-green-600 to-primary 
          border-b border-primary/20 shadow-lg
        `}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Crown className="w-6 h-6 text-yellow-300" />
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-bold text-sm sm:text-base">
                  Unlock Full Jungle Access
                </span>
                <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90">
                  <span className="hidden sm:inline">—</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Weekly Picks
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Top 5 DFS
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Juice Watch
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {freePicksRemaining > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                  {freePicksRemaining} free left
                </Badge>
              )}
              
              <Button
                onClick={handleSubscribe}
                size="sm"
                className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold px-4 py-2 text-sm"
                data-testid="unlock-subscribe-button"
              >
                $10/month on Substack
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                data-testid="unlock-banner-dismiss"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  );
}