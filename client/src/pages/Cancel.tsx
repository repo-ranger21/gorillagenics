import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Heart, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';
import SubscribeButton from '@/components/SubscribeButton';
import SEO from '@/components/SEO';

export default function Cancel() {
  return (
    <>
      <SEO 
        title="Payment Canceled | GuerillaGenics"
        description="Your payment was canceled. No worries - you can try again anytime to unlock full jungle access."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-destructive/5 to-muted/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <Card className="border-2 border-destructive/20 shadow-xl">
            <CardHeader className="text-center py-8">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <XCircle className="w-16 h-16 text-destructive" />
              </motion.div>
              
              <CardTitle className="text-2xl font-bold mb-2 text-destructive">
                Payment Canceled
              </CardTitle>
              
              <p className="text-muted-foreground">
                No worries! You can try again anytime.
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                {/* What they're missing out on */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    Still want jungle access?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Join thousands getting premium NFL picks with 85% win rate
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <TrendingUp className="w-3 h-3" />
                    <span>Weekly Picks • Top 5 DFS • Juice Watch Alerts</span>
                  </div>
                  
                  <SubscribeButton 
                    fullWidth
                    size="sm"
                    showBadge
                  />
                </div>

                {/* Alternative actions */}
                <div className="space-y-3">
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Or continue with{' '}
                      <Link href="/weekly-picks" className="text-primary hover:underline">
                        free picks
                      </Link>
                      {' '}(limited access)
                    </p>
                  </div>
                </div>

                {/* Support */}
                <div className="border-t pt-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    Having payment issues?{' '}
                    <a 
                      href={`mailto:support@guerillagenics.com`}
                      className="text-primary hover:underline"
                    >
                      Contact support
                    </a>
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}