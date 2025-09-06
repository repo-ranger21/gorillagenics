import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NavMenu from "@/components/NavMenu";
import Landing from "@/pages/landing";
import WeeklyPicks from "@/pages/WeeklyPicks";
import TopFive from "@/pages/TopFive";
import Leaderboard from "@/pages/Leaderboard";
import PastPicks from "@/pages/PastPicks";
import Dashboard from "@/pages/Dashboard";
import Alerts from "@/pages/Alerts";
import Education from "@/pages/Education";
import Profile from "@/pages/Profile";
import Testimonials from "@/pages/Testimonials";
import BlogIndex from "@/pages/BlogIndex";
// Legacy routes
import DashboardLegacy from "@/pages/dashboard";
import DashboardWizard from "@/pages/dashboard-wizard";
import NotificationsPage from "@/pages/notifications";
import Week1 from "@/pages/week1";
import Strategy from "@/pages/strategy";
import RiskHeatmapPage from "@/pages/risk-heatmap";
import ChallengesPage from "@/pages/challenges";
import PredictionPlayground from "@/pages/prediction-playground";
import NotFound from "@/pages/not-found";
import FreePickModal from "@/components/FreePickModal";
import UnlockBanner from "@/components/UnlockBanner";
import { captureRefFromURL } from "@/modules/referrals/referralClient";
import { useEffect, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import LoadingScreen from "@/components/LoadingScreen";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-4">🚨 Something went wrong</h2>
        <p className="text-muted-foreground mb-4">We're sorry, but something unexpected happened.</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function Router() {
  // Capture referral from URL on mount
  useEffect(() => {
    let isMounted = true;
    
    const captureRef = async () => {
      try {
        if (isMounted) {
          await captureRefFromURL();
        }
      } catch (error) {
        console.error('🦍 Failed to capture referral:', error);
      }
    };
    
    captureRef();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <NavMenu />
      
      {/* Global Conversion Components */}
      <UnlockBanner position="top" />
      <FreePickModal />
      
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={Landing} />
          
          {/* New Enhanced Routes */}
          <Route path="/weekly-picks" component={WeeklyPicks} />
          <Route path="/top5" component={TopFive} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/past-picks" component={PastPicks} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/alerts" component={Alerts} />
          <Route path="/education" component={Education} />
          <Route path="/profile" component={Profile} />
          <Route path="/testimonials" component={Testimonials} />
          <Route path="/blog" component={BlogIndex} />
          
          {/* Legacy Routes for Backward Compatibility */}
          <Route path="/dashboard-legacy" component={DashboardLegacy} />
          <Route path="/wizard" component={DashboardWizard} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/week1" component={Week1} />
          <Route path="/strategy" component={Strategy} />
          <Route path="/risk-heatmap" component={RiskHeatmapPage} />
          <Route path="/challenges" component={ChallengesPage} />
          <Route path="/playground" component={PredictionPlayground} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
