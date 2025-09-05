import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepClick: (step: number) => void;
  isLastStep?: boolean;
  nextButtonText?: string;
  previousButtonText?: string;
}

const STEP_LABELS = [
  "Featured Picks",
  "BioBoost Breakdown", 
  "Betting Context",
  "Lock Your Pick"
];

export default function WizardStepper({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onStepClick,
  isLastStep = false,
  nextButtonText = "Next",
  previousButtonText = "Previous"
}: WizardStepperProps) {
  return (
    <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-primary">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-6">
        {Array.from({ length: totalSteps }, (_, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onClick={() => onStepClick(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                index <= currentStep
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground"
              }`}
              animate={{
                scale: index === currentStep ? 1.1 : 1,
                boxShadow: index === currentStep 
                  ? "0 0 20px rgba(var(--primary), 0.4)" 
                  : "none"
              }}
              transition={{ duration: 0.3 }}
            >
              {index < currentStep ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ✓
                </motion.span>
              ) : (
                index + 1
              )}
            </motion.div>
            <span className={`text-xs font-medium text-center max-w-20 ${
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            }`}>
              {STEP_LABELS[index]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="min-w-24"
          data-testid="wizard-previous-button"
        >
          ← {previousButtonText}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {STEP_LABELS[currentStep]}
          </span>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-lg"
          >
            🦍
          </motion.div>
        </div>

        <Button
          onClick={onNext}
          className="min-w-24 bg-primary hover:bg-primary/90"
          data-testid="wizard-next-button"
        >
          {isLastStep ? "🔒 Lock Pick" : `${nextButtonText} →`}
        </Button>
      </div>
    </Card>
  );
}