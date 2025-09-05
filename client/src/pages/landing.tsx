import { motion } from "framer-motion";
import HeroSection from "@/components/hero-section";
import BioBoostCard from "@/components/bio-boost-card";
import PlayerPickCard from "@/components/player-pick-card";
import JuiceWatchAlerts from "@/components/juice-watch-alerts";
import { bioMetrics, players, alerts } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Menu, Twitter, Github } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="relative z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                🦍
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-destructive font-bold text-lg">OVER</span>
                <span className="text-accent font-bold text-lg">UNDER</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#picks" className="text-muted-foreground hover:text-foreground transition-colors">
                Picks
              </a>
              <a href="#alerts" className="text-muted-foreground hover:text-foreground transition-colors">
                Alerts
              </a>
              <Button 
                data-testid="button-enter-jungle"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Enter the Jungle
              </Button>
            </nav>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-t border-border py-4 space-y-4"
            >
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#picks" className="block text-muted-foreground hover:text-foreground transition-colors">
                Picks
              </a>
              <a href="#alerts" className="block text-muted-foreground hover:text-foreground transition-colors">
                Alerts
              </a>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Enter the Jungle
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* BioMetric Intelligence Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              BioMetric Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our gorilla-grade algorithms track the biological signals that matter most. Each metric feeds our primal prediction engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bioMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <BioBoostCard metric={metric} />
              </motion.div>
            ))}
            
            {/* Stats Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 hover:border-primary/50 transition-all">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-foreground mb-6">Intelligence Summary</h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-1">3</div>
                        <div className="text-sm text-muted-foreground">Active Metrics</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-accent mb-1">75</div>
                        <div className="text-sm text-muted-foreground">Avg BioBoost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-destructive mb-1">94.2%</div>
                        <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Primate Picks Section */}
      <section id="picks" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Primate Picks of the Week
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Our gorilla has analyzed the biological data. These are the plays that make him go bananas.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">12-3</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">78%</div>
                <div className="text-sm text-muted-foreground">Hit Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive">+24.7u</div>
                <div className="text-sm text-muted-foreground">Profit</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <PlayerPickCard player={player} />
              </motion.div>
            ))}
          </div>

          {/* Premium CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mt-16"
          >
            <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Unlock Premium Gorilla Intelligence
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get access to all BioMetric insights, real-time alerts, and exclusive primate predictions.
                </p>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105 transition-all animate-pulse-glow"
                  data-testid="button-go-premium"
                >
                  🦍 Go Premium - $19.99/mo
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Juice Watch Alerts Section */}
      <section id="alerts" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Juice Watch Alerts
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get notified when a player's BioBoost spikes. Our gorilla goes bananas when the metrics align.
            </p>
          </motion.div>

          <JuiceWatchAlerts alerts={alerts} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  🦍
                </div>
                <span className="text-xl font-bold text-foreground">GuerillaGenics</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Primal intelligence meets sports analytics. Bet smarter with biometric insights.
              </p>
              <p className="text-xs text-muted-foreground">
                Made with 🦍 in the jungle
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#picks" className="hover:text-foreground transition-colors">BioMetrics</a></li>
                <li><a href="#picks" className="hover:text-foreground transition-colors">Primate Picks</a></li>
                <li><a href="#alerts" className="hover:text-foreground transition-colors">Juice Watch</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Ethics</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Transparency</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Responsible Gaming</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Jungle Newsletter</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Get weekly gorilla insights and exclusive picks.
              </p>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="rounded-r-none"
                  data-testid="input-newsletter-email"
                />
                <Button className="bg-primary text-primary-foreground rounded-l-none" data-testid="button-newsletter-join">
                  Join
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />
          
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 GuerillaGenics. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Responsible Gaming Disclaimer */}
          <Card className="mt-6 bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                🚨 <strong>Responsible Gaming:</strong> All biometric data is public, opt-in, or anonymized. 
                BioBoost scores are for entertainment purposes only. Gamble responsibly and within your means. 
                If you have a gambling problem, seek help at{" "}
                <a href="#" className="text-primary hover:underline">ncpgambling.org</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </footer>
    </div>
  );
}
