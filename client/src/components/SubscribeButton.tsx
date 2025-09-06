import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, Zap } from 'lucide-react';
import { createCheckoutSession } from '@/utils/stripeClient';
import { useToast } from '@/hooks/use-toast';

interface SubscribeButtonProps {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  userId?: number;
  className?: string;
  showBadge?: boolean;
  fullWidth?: boolean;
}

export default function SubscribeButton({ 
  variant = 'default', 
  size = 'md', 
  userId,
  className = '',
  showBadge = false,
  fullWidth = false
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await createCheckoutSession(userId);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={fullWidth ? 'w-full' : ''}
      >
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          variant={variant}
          className={`
            relative group overflow-hidden
            ${sizeClasses[size]}
            ${fullWidth ? 'w-full' : ''}
            bg-gradient-to-r from-primary via-primary to-secondary
            hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90
            text-primary-foreground font-bold
            border-2 border-primary/20
            shadow-lg hover:shadow-xl
            transition-all duration-300
          `}
          data-testid="button-subscribe"
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary opacity-0 group-hover:opacity-30"
            initial={{ x: '-100%' }}
            animate={{ x: loading ? ['0%', '100%'] : '0%' }}
            transition={{ 
              duration: loading ? 1.5 : 0,
              repeat: loading ? Infinity : 0,
              ease: 'linear'
            }}
          />
          
          <div className="relative flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            
            <span>
              {loading ? 'Processing...' : 'Unlock Full Jungle Access'}
            </span>
            
            <Zap className="w-4 h-4 opacity-70" />
          </div>
        </Button>
      </motion.div>
      
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-center"
        >
          <Badge variant="secondary" className="text-xs">
            🦍 $10/month • Cancel anytime
          </Badge>
        </motion.div>
      )}
    </div>
  );
}