import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, Star, Zap } from "lucide-react";

export default function NewsletterCTA({ variant = "sidebar", className = "" }) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;
    
    setIsLoading(true);
    
    // Simulate subscription process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubscribed(true);
    setIsLoading(false);
    
    // Reset after 3 seconds for demo
    setTimeout(() => {
      setIsSubscribed(false);
      setEmail("");
    }, 3000);
  };

  const features = [
    "🦍 Weekly BioBoost Analysis",
    "🎯 Exclusive Gorilla Picks", 
    "📊 Line Movement Alerts",
    "🍌 Premium Commentary",
    "💰 Bankroll Management Tips"
  ];

  if (variant === "compact") {
    return (
      <Card className={`bg-gradient-to-br from-primary/10 to-secondary/10 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Get Weekly Picks</h4>
              <p className="text-xs text-muted-foreground">$10/month premium intel</p>
            </div>
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.open('https://guerillagenics.substack.com', '_blank')}
              data-testid="newsletter-compact-cta"
            >
              Subscribe
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "fallback") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center space-y-4 ${className}`}
      >
        <div className="space-y-2">
          <div className="text-6xl">🦍</div>
          <h3 className="text-2xl font-bold">Data Swinging In Late!</h3>
          <p className="text-muted-foreground">
            While we fetch the latest picks, why not join the premium jungle?
          </p>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-primary/20 text-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  $10/month
                </Badge>
              </div>
              
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.open('https://guerillagenics.substack.com', '_blank')}
                data-testid="newsletter-fallback-cta"
              >
                <Mail className="w-4 h-4 mr-2" />
                Subscribe to Newsletter
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default sidebar variant
  return (
    <Card className={`bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <span>Premium Weekly Picks</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                <Star className="w-3 h-3 mr-1" />
                $10/month
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                500+ Subscribers
              </Badge>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {!isSubscribed ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Join the jungle elite and get GuerillaGenics' premium weekly analysis delivered every Tuesday.
              </p>
              
              <div className="space-y-1">
                {features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9"
                disabled={isLoading}
                data-testid="newsletter-email-input"
              />
              <Button 
                type="submit" 
                className="w-full h-9 bg-primary hover:bg-primary/90"
                disabled={isLoading || !email}
                data-testid="newsletter-subscribe-button"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </div>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-8"
                onClick={() => window.open('https://guerillagenics.substack.com', '_blank')}
                data-testid="newsletter-external-link"
              >
                Visit Substack Page
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-3 py-4"
          >
            <div className="text-4xl">🎉</div>
            <div>
              <h4 className="font-semibold text-green-700">Welcome to the Jungle!</h4>
              <p className="text-sm text-muted-foreground">
                Check your email for premium access
              </p>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground/80 text-center pt-2 border-t">
          <p>🦍 Educational content only. Bet responsibly.</p>
        </div>
      </CardContent>
    </Card>
  );
}