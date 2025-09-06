import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, TrendingUp, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import SEO from '@/components/SEO';

export default function Success() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    // Extract session ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    setSessionId(id);
  }, []);

  return (
    <>
      <SEO 
        title="Welcome to the Jungle 🦍 | GuerillaGenics"
        description="Your subscription is active! Access premium NFL DFS picks, BioBoost analytics, and Juice Watch alerts."
        canonical="/success"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white text-center py-8">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <CheckCircle className="w-16 h-16" />
                  <motion.div
                    className="absolute -top-2 -right-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </motion.div>
                </div>
              </motion.div>
              
              <CardTitle className="text-3xl font-bold mb-2">
                Welcome to the Jungle! 🦍
              </CardTitle>
              
              <p className="text-lg opacity-90">
                Your Jungle Access subscription is now active
              </p>
              
              {sessionId && (
                <Badge variant="secondary" className="mt-3 bg-white/20 text-white border-white/30">
                  Session: {sessionId.slice(-8)}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-6"
              >
                {/* What's unlocked */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-primary" />
                    You now have full access to:
                  </h3>
                  
                  <div className="grid gap-4">
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold">Weekly Picks</div>
                        <div className="text-sm text-muted-foreground">
                          Expert NFL picks with live betting odds integration
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Zap className="w-5 h-5 text-secondary" />
                      <div>
                        <div className="font-semibold">Top 5 DFS Picks</div>
                        <div className="text-sm text-muted-foreground">
                          BioBoost-powered daily fantasy recommendations
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">Juice Watch Alerts</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time biometric change notifications
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Next steps */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Ready to dominate? 🏆</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/weekly-picks" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                        View Weekly Picks
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    
                    <Link href="/top5" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Top 5 DFS Picks
                        <TrendingUp className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Support info */}
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Need help? Contact us or check your subscription in{' '}
                    <Link href="/dashboard" className="text-primary hover:underline">
                      your dashboard
                    </Link>
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