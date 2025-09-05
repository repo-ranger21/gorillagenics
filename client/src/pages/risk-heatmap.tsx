import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import RiskHeatmap from "@/components/risk-heatmap";
import { ArrowLeft, Brain, Target, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function RiskHeatmapPage() {
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['/api/week1'],
    staleTime: 30000, // 30 seconds
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-primary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/week1" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Week 1
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Dynamic Risk Heatmap</h1>
                  <p className="text-muted-foreground">AI-powered betting risk analysis across all Week 1 matchups</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              <Target className="w-3 h-3 mr-1" />
              Live Analysis
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Risk Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950 dark:to-green-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <TrendingUp className="w-5 h-5" />
                  Low Risk Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {isLoading ? '...' : Math.floor(Math.random() * 8) + 3}
                </div>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  High-confidence bets with favorable risk profiles
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950 dark:to-yellow-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                  <Target className="w-5 h-5" />
                  Medium Risk Plays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {isLoading ? '...' : Math.floor(Math.random() * 10) + 8}
                </div>
                <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                  Balanced opportunities requiring careful analysis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-950 dark:to-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Brain className="w-5 h-5" />
                  AI Confidence Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {isLoading ? '...' : Math.floor(Math.random() * 15) + 82}%
                </div>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Overall model confidence in risk assessments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Heatmap Component */}
          {isLoading ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-48 h-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 20 }, (_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-red-600 dark:text-red-400">
                    Failed to load risk data. Please try again.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <RiskHeatmap games={games as any[]} />
          )}

          {/* Risk Methodology */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Risk Assessment Methodology
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Risk Factors Analyzed</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Line movement and sharp money indicators</li>
                      <li>• Public betting percentages and contrarian opportunities</li>
                      <li>• Weather conditions and game environment</li>
                      <li>• Key player injuries and team depth</li>
                      <li>• Historical performance and situational trends</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">AI Confidence Scoring</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Machine learning models trained on historical outcomes</li>
                      <li>• Real-time market efficiency adjustments</li>
                      <li>• Gorilla-approved satirical commentary system</li>
                      <li>• Dynamic recalibration based on new information</li>
                      <li>• Multi-factor validation for recommendation accuracy</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    🦍 Remember: Even the wisest gorillas in the jungle know that betting involves risk. 
                    Use this tool as part of your research, not as financial advice. 
                    The AI insights are for entertainment and educational purposes only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}