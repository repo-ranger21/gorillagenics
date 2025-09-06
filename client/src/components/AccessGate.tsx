import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import SubscribeButton from '@/components/SubscribeButton';
import { Badge } from '@/components/ui/badge';

interface AccessGateProps {
  children: ReactNode;
  userId?: number;
  featureName: string;
  description?: string;
  showPreview?: boolean;
  className?: string;
}

export default function AccessGate({ 
  children, 
  userId, 
  featureName, 
  description,
  showPreview = false,
  className = ''
}: AccessGateProps) {
  const { isSubscribed, loading } = useSubscription(userId);

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-muted/50 rounded-lg h-64 flex items-center justify-center ${className}`}>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If subscribed, show the protected content
  if (isSubscribed) {
    return <>{children}</>;
  }

  // Show access gate for non-subscribers
  return (
    <div className={className}>
      {showPreview && (
        <div className="relative mb-6">
          <div className="filter blur-sm pointer-events-none opacity-30">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
          <CardHeader className="text-center pb-4">
            <motion.div
              className="flex justify-center mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative">
                <Lock className="w-12 h-12 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Crown className="w-5 h-5 text-secondary" />
                </motion.div>
              </div>
            </motion.div>
            
            <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Premium Feature: {featureName}
              <Sparkles className="w-5 h-5 text-primary" />
            </CardTitle>
            
            {description && (
              <p className="text-muted-foreground mt-2">
                {description}
              </p>
            )}
          </CardHeader>

          <CardContent className="text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-semibold">Jungle Access Required</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlock this feature and get full access to all premium content
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                Weekly Picks
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Top 5 DFS
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Juice Watch
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Live Alerts
              </Badge>
            </div>

            <SubscribeButton 
              userId={userId}
              fullWidth
              showBadge
              size="lg"
              className="w-full"
            />

            <p className="text-xs text-muted-foreground">
              Join thousands of winning DFS players • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}