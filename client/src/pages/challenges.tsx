import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChallengeBoard from "@/components/challenge-board";
import { ArrowLeft, Trophy, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-primary/10 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Community Challenges</h1>
                  <p className="text-muted-foreground">Compete with fellow gorillas and climb the leaderboard</p>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              <Users className="w-3 h-3 mr-1" />
              Social Beta
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
          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 dark:from-purple-950 dark:to-pink-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Trophy className="w-5 h-5" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(Math.random() * 15) + 8}
                </div>
                <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                  Join the competition now
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:from-green-950 dark:to-emerald-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Users className="w-5 h-5" />
                  Total Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {(Math.floor(Math.random() * 500) + 1200).toLocaleString()}
                </div>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  Gorillas competing worldwide
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 dark:from-orange-950 dark:to-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Zap className="w-5 h-5" />
                  Total Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {(Math.floor(Math.random() * 50000) + 25000).toLocaleString()}
                </div>
                <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                  Jungle coins up for grabs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Challenge Board Component */}
          <ChallengeBoard />

          {/* Community Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Challenge Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">How Challenges Work</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Join challenges that match your skill level</li>
                      <li>• Place qualifying bets during the challenge period</li>
                      <li>• Earn points based on wins, accuracy, and ROI</li>
                      <li>• Climb the leaderboard to win prizes</li>
                      <li>• Follow top performers and learn from the best</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Community Rules</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Respect fellow gorillas in the community</li>
                      <li>• No sharing of insider information</li>
                      <li>• Responsible betting practices only</li>
                      <li>• Report suspicious or cheating behavior</li>
                      <li>• Have fun and learn from each other!</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground text-center">
                    🦍 Remember: This is a community-driven feature for educational and entertainment purposes. 
                    All challenges are simulated and no real money changes hands. 
                    Please bet responsibly in real-world scenarios.
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