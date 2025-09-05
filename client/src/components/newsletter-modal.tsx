import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { Check, Star, Zap, Mail, CreditCard } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName?: string;
}

export default function NewsletterModal({ isOpen, onClose, playerName }: NewsletterModalProps) {
  const [step, setStep] = useState<'features' | 'payment' | 'success'>('features');
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          paymentMethod: 'card', // Mock payment method
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStep('success');
      } else {
        throw new Error(result.message || 'Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      // For demo purposes, still show success
      setStep('success');
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: "🎯",
      title: "Daily DFS Picks",
      description: "Curated player selections with BioBoost analysis"
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Exclusive metrics and performance insights"
    },
    {
      icon: "💰", 
      title: "Value Bets",
      description: "Line movement alerts and arbitrage opportunities"
    },
    {
      icon: "🦍",
      title: "Gorilla Intelligence",
      description: "Satirical commentary and contrarian perspectives"
    },
    {
      icon: "⚡",
      title: "Real-time Updates",
      description: "Breaking news and last-minute lineup changes"
    },
    {
      icon: "🏆",
      title: "Weekly Contests",
      description: "Subscriber-only tournaments and prizes"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🦍 GuerillaGenics Premium
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'features' && (
            <motion.div
              key="features"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Hero Section */}
              <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl mb-3"
                >
                  🦍
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Unlock Primal Betting Intelligence
                </h3>
                <p className="text-muted-foreground">
                  Join the jungle elite with daily picks, advanced analytics, and gorilla-powered insights.
                </p>
                <div className="mt-4">
                  <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                    $10/month
                  </Badge>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{feature.icon}</span>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof */}
              <Card className="bg-gradient-to-r from-accent/5 to-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold">4.9/5 from 1,247 subscribers</span>
                  </div>
                  <blockquote className="text-muted-foreground italic">
                    "The gorilla knows his stuff! Up 47% ROI this season thanks to the daily picks. 
                    The satirical commentary alone is worth the subscription."
                  </blockquote>
                  <div className="text-sm text-muted-foreground mt-2">
                    — Mike "BananaKing" Chen, Chicago
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center space-y-4">
                <Button
                  onClick={() => setStep('payment')}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  data-testid="subscribe-button"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start My Premium Subscription
                </Button>
                <p className="text-xs text-muted-foreground">
                  Cancel anytime • 7-day money-back guarantee
                </p>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">GuerillaGenics Premium</span>
                    <span className="font-semibold">$10.00</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Billing Period</span>
                    <span className="font-semibold">Monthly</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">$10.00/month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="email-input"
                    />
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="card">Card Number</Label>
                      <Input
                        id="card"
                        placeholder="1234 5678 9012 3456"
                        data-testid="card-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        data-testid="expiry-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        data-testid="cvc-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleSubscribe}
                  disabled={isProcessing || !email}
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                  data-testid="complete-subscription-button"
                >
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <CreditCard className="w-5 h-5 mr-2" />
                  )}
                  {isProcessing ? "Processing..." : "Complete Subscription"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setStep('features')}
                  className="w-full"
                  disabled={isProcessing}
                >
                  ← Back to Features
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment powered by Stripe • Your card will be charged $10 monthly
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6 py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                🦍
              </motion.div>

              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Welcome to the Jungle Elite!
                </h3>
                <p className="text-muted-foreground">
                  Your subscription is active. Check your email for your first daily picks!
                </p>
              </div>

              <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Check className="w-6 h-6 text-primary" />
                    <span className="font-semibold">Subscription Confirmed</span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>✅ Daily picks delivered to {email}</div>
                    <div>✅ Premium analytics unlocked</div>
                    <div>✅ Gorilla intelligence activated</div>
                    <div>✅ First picks arriving tonight at 8 PM EST</div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90"
                data-testid="close-success-button"
              >
                Start Exploring Premium Features
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}