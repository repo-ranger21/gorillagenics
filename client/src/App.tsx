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

function Router() {
  return (
    <>
      <NavMenu />
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
