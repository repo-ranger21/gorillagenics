import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, X, Sparkles } from 'lucide-react';
import { shouldShowFreePickModal, dismissModal, grantFreePick, trackEvent, getFreePicksRemaining } from '@/modules/funnel/clientFunnel';

interface FreePickModalProps {
  onClaimPick?: () => void;
  onMaybeLater?: () => void;
}

export default function FreePickModal({ onClaimPick, onMaybeLater }: FreePickModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Check if modal should show on mount
    const shouldShow = shouldShowFreePickModal();
    if (shouldShow) {
      // Small delay for better UX
      setTimeout(() => {
        setIsOpen(true);
        trackEvent('modal_open', { trigger: 'first_visit' });
      }, 1500);
    }
  }, []);

  const handleClaimPick = () => {
    const granted = grantFreePick();
    if (granted) {
      setIsOpen(false);
      dismissModal();
      onClaimPick?.();
      
      // Show success animation
      setHasAnimated(true);
      setTimeout(() => setHasAnimated(false), 3000);
    }
  };

  const handleMaybeLater = () => {
    setIsOpen(false);
    dismissModal();
    onMaybeLater?.();
    trackEvent('modal_dismiss', { action: 'maybe_later' });
  };

  const handleClose = () => {
    setIsOpen(false);
    dismissModal();
    trackEvent('modal_dismiss', { action: 'close' });
  };

  const freePicksRemaining = getFreePicksRemaining();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-secondary/10">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Gift className="w-6 h-6 text-primary" />
                    Your first pick's on the house
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Animated gorilla */}
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div
                    className="text-6xl mb-2"
                    animate={{ 
                      rotate: [0, -10, 10, -5, 5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 3 
                    }}
                  >
                    🦍
                  </motion.div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    First Pick Free
                  </Badge>
                </motion.div>

                {/* Content */}
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Taste the Max Juice before you swing from the vines
                  </h3>
                  <p className="text-muted-foreground">
                    One free pick, then go primal with full jungle access. 
                    {freePicksRemaining > 1 && ` You get ${freePicksRemaining} free picks this week.`}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Weekly Picks
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Top 5 DFS
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      Juice Watch
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleClaimPick}
                    className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 text-white font-semibold py-3"
                    data-testid="claim-free-pick"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Free Pick
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleMaybeLater}
                    className="w-full text-muted-foreground hover:text-foreground"
                    data-testid="maybe-later"
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Fine print */}
                <p className="text-xs text-muted-foreground text-center">
                  Free picks reset every Tuesday. Full access includes unlimited picks, 
                  premium analytics, and live alerts.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Success animation overlay */}
      <AnimatePresence>
        {hasAnimated && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
            >
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Free pick unlocked! 🎉</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}