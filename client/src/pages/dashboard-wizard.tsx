import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Player } from "@shared/schema";

// Import wizard components
import WizardStepper from "@/components/wizard-stepper";
import FeaturedPickCard from "@/components/featured-pick-card";
import BioBoostBreakdown from "@/components/bioboost-breakdown";
import BettingContext from "@/components/betting-context";
import NewsletterModal from "@/components/newsletter-modal";

export default function DashboardWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [featuredPlayers, setFeaturedPlayers] = useState<Player[]>([]);

  const totalSteps = 4;

  // Fetch players data
  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  // Select featured players (top 3 by BioBoost score)
  useEffect(() => {
    if (players && players.length > 0) {
      const topPlayers = [...players]
        .sort((a, b) => b.bioBoostScore - a.bioBoostScore)
        .slice(0, 3);
      setFeaturedPlayers(topPlayers);
      
      // Auto-select the top player
      if (!selectedPlayer && topPlayers.length > 0) {
        setSelectedPlayer(topPlayers[0]);
      }
    }
  }, [players, selectedPlayer]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show newsletter modal
      setShowNewsletter(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  const renderStepContent = () => {
    if (!selectedPlayer) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🦍</div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Loading Gorilla Intelligence...
          </h3>
          <p className="text-muted-foreground">
            Analyzing player data and BioBoost metrics
          </p>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="featured-picks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                🎯 Featured DFS Picks
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our gorilla algorithm has identified the top performers based on advanced BioBoost metrics. 
                Select your favorite pick to dive deeper into the analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPlayers.map((player, index) => (
                <FeaturedPickCard
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayer?.id === player.id}
                  onSelect={() => handlePlayerSelect(player)}
                  index={index}
                />
              ))}
            </div>

            {selectedPlayer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 text-center"
              >
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 max-w-2xl mx-auto">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-2">
                      🦍 Gorilla's Pick: {selectedPlayer.name}
                    </h3>
                    <p className="text-muted-foreground">
                      Selected for analysis. Ready to dive deep into the BioBoost breakdown?
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="bioboost-breakdown"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                🧬 BioBoost Breakdown
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Deep dive into {selectedPlayer.name}'s biometric performance metrics and see why 
                our algorithm recommends this pick.
              </p>
            </div>

            <BioBoostBreakdown player={selectedPlayer} />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="betting-context"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                📊 Betting Context
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Market analysis, line movement, and environmental factors that could impact 
                {selectedPlayer.name}'s performance.
              </p>
            </div>

            <BettingContext player={selectedPlayer} />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="pick-confirmation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                🔒 Lock Your Pick
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ready to place your bet? Here's your final pick summary and next steps.
              </p>
            </div>

            {/* Pick Summary */}
            <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-8">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🦍
                </motion.div>

                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {selectedPlayer.name} - {selectedPlayer.recommendedPick}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Bet Type</div>
                    <div className="font-bold text-foreground">{selectedPlayer.betType}</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Line</div>
                    <div className="font-bold text-foreground">{selectedPlayer.betLine}</div>
                  </div>
                  <div className="text-center p-4 bg-background/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">BioBoost</div>
                    <div className="font-bold text-primary">{selectedPlayer.bioBoostScore}/100</div>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-lg font-semibold text-foreground mb-2">
                    Confidence Level: {selectedPlayer.confidence}%
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "{selectedPlayer.commentary}"
                  </p>
                </div>

                {/* Placeholder Lock Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mb-4"
                  data-testid="lock-pick-button"
                >
                  🔒 Lock This Pick (Coming Soon)
                </Button>

                <p className="text-xs text-muted-foreground">
                  This is a demo. Actual betting functionality not implemented.
                </p>
              </CardContent>
            </Card>

            {/* Newsletter CTA */}
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-foreground mb-4">
                  💌 Want Daily Picks Like This?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our premium newsletter and get gorilla-powered DFS picks delivered daily. 
                  Advanced analytics, exclusive insights, and satirical commentary included.
                </p>
                <Button
                  onClick={() => setShowNewsletter(true)}
                  className="bg-accent hover:bg-accent/90 text-lg px-8 py-4"
                  data-testid="open-newsletter-button"
                >
                  📮 Subscribe for $10/month
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🦍
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Loading Gorilla Intelligence
          </h2>
          <p className="text-muted-foreground">
            Analyzing player data and biometric metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🦍
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  GuerillaGenics
                </h1>
                <p className="text-sm text-muted-foreground">
                  DFS Dashboard Wizard
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Bet Smarter. Go Primal.
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Wizard Stepper */}
        <WizardStepper
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStepClick={handleStepClick}
          isLastStep={currentStep === totalSteps - 1}
          nextButtonText={currentStep === totalSteps - 1 ? "Newsletter" : "Next"}
        />

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {renderStepContent()}
          </div>
        </AnimatePresence>
      </main>

      {/* Newsletter Modal */}
      <NewsletterModal
        isOpen={showNewsletter}
        onClose={() => setShowNewsletter(false)}
        playerName={selectedPlayer?.name}
      />
    </div>
  );
}