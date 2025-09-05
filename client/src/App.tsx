import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import DashboardWizard from "@/pages/dashboard-wizard";
import NotificationsPage from "@/pages/notifications";
import Week1 from "@/pages/week1";
import Strategy from "@/pages/strategy";
import RiskHeatmapPage from "@/pages/risk-heatmap";
import ChallengesPage from "@/pages/challenges";
import WeeklyPicks from "@/pages/WeeklyPicks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/wizard" component={DashboardWizard} />
        <Route path="/notifications" component={NotificationsPage} />
        <Route path="/week1" component={Week1} />
        <Route path="/strategy" component={Strategy} />
        <Route path="/risk-heatmap" component={RiskHeatmapPage} />
        <Route path="/challenges" component={ChallengesPage} />
        <Route path="/weekly-picks" component={WeeklyPicks} />
        <Route component={NotFound} />
      </Switch>
    </>
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
