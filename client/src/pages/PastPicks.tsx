import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, 
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Filter,
  Calendar
} from "lucide-react";
import { Link } from "wouter";

interface PastPick {
  id: string;
  week: number;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  pickedTeam: string;
  pickedSpread: number;
  actualSpread: number;
  pickedTotal: number;
  actualTotal: number;
  outcome: "win" | "loss" | "push";
  bioBoostAccuracy: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  commentary: string;
  date: string;
  finalScore: string;
}

export default function PastPicks() {
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [searchTeam, setSearchTeam] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");

  const { data: pastPicks = [], isLoading } = useQuery({
    queryKey: ['/api/past-picks', { week: selectedWeek, team: searchTeam, outcome: outcomeFilter }],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win': return <CheckCircle className="w-4 h-4 text-vine" />;
      case 'loss': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'push': return <TrendingUp className="w-4 h-4 text-banana" />;
      default: return null;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'win': return 'bg-vine/10 text-vine border-vine';
      case 'loss': return 'bg-red-50 text-red-600 border-red-200';
      case 'push': return 'bg-banana/10 text-banana border-banana';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const filteredPicks = pastPicks.filter((pick: PastPick) => {
    const matchesTeam = searchTeam === "" || 
      pick.homeTeam.toLowerCase().includes(searchTeam.toLowerCase()) ||
      pick.awayTeam.toLowerCase().includes(searchTeam.toLowerCase());
    
    const matchesOutcome = outcomeFilter === "all" || pick.outcome === outcomeFilter;
    
    return matchesTeam && matchesOutcome;
  });

  const summaryStats = {
    totalPicks: filteredPicks.length,
    wins: filteredPicks.filter((p: PastPick) => p.outcome === 'win').length,
    losses: filteredPicks.filter((p: PastPick) => p.outcome === 'loss').length,
    pushes: filteredPicks.filter((p: PastPick) => p.outcome === 'push').length,
    winRate: filteredPicks.length > 0 ? (filteredPicks.filter((p: PastPick) => p.outcome === 'win').length / filteredPicks.length * 100).toFixed(1) : "0",
    avgBioBoost: filteredPicks.length > 0 ? (filteredPicks.reduce((sum: number, p: PastPick) => sum + p.bioBoostAccuracy, 0) / filteredPicks.length).toFixed(1) : "0"
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <div className="text-xl font-semibold text-jungle mb-2">Loading Pick Archive...</div>
          <div className="text-muted-foreground">Digging through the banana vault</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-jungle to-vine border-b border-jungle/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="w-8 h-8 text-banana" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Past Picks Archive</h1>
                <p className="text-banana text-lg">Historical performance and outcome tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-jungle" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Week</label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger data-testid="week-filter">
                    <SelectValue placeholder="All Weeks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weeks</SelectItem>
                    {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Team</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    value={searchTeam}
                    onChange={(e) => setSearchTeam(e.target.value)}
                    className="pl-10"
                    data-testid="team-search"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Outcome</label>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger data-testid="outcome-filter">
                    <SelectValue placeholder="All Outcomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="win">Wins</SelectItem>
                    <SelectItem value="loss">Losses</SelectItem>
                    <SelectItem value="push">Pushes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedWeek("all");
                    setSearchTeam("");
                    setOutcomeFilter("all");
                  }}
                  className="w-full"
                  data-testid="clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-jungle">{summaryStats.totalPicks}</div>
              <div className="text-sm text-muted-foreground">Total Picks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-vine">{summaryStats.wins}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{summaryStats.losses}</div>
              <div className="text-sm text-muted-foreground">Losses</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-jungle">{summaryStats.winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-banana">{summaryStats.avgBioBoost}%</div>
              <div className="text-sm text-muted-foreground">Avg BioBoost</div>
            </CardContent>
          </Card>
        </div>

        {/* Past Picks Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPicks.map((pick: PastPick, index: number) => (
            <motion.div
              key={pick.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              data-testid={`past-pick-${pick.id}`}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{pick.awayTeam} @ {pick.homeTeam}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Week {pick.week} • {new Date(pick.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={`border ${getOutcomeColor(pick.outcome)}`}>
                      {getOutcomeIcon(pick.outcome)}
                      <span className="ml-1 capitalize">{pick.outcome}</span>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Pick Details */}
                  <div className="p-3 bg-jungle/5 rounded-lg">
                    <div className="text-sm font-medium text-jungle mb-2">
                      🦍 Picked: {pick.pickedTeam}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Spread:</span>
                        <span className="ml-1 font-medium">
                          {pick.pickedSpread > 0 ? '+' : ''}{pick.pickedSpread}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-1 font-medium">O/U {pick.pickedTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">Final Result</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Score:</span>
                        <span className="font-medium">{pick.finalScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>BioBoost Accuracy:</span>
                        <span className={`font-medium ${
                          pick.bioBoostAccuracy >= 80 ? 'text-vine' :
                          pick.bioBoostAccuracy >= 60 ? 'text-banana' : 'text-red-500'
                        }`}>
                          {pick.bioBoostAccuracy}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Commentary */}
                  <div className="p-3 bg-banana/5 rounded-lg border-l-4 border-banana">
                    <div className="text-xs">
                      <div className="font-medium text-banana mb-1">Original Commentary</div>
                      <p className="text-muted-foreground leading-relaxed">{pick.commentary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPicks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍌</div>
            <div className="text-xl font-semibold text-jungle mb-2">No Picks Found</div>
            <div className="text-muted-foreground">Try adjusting your filters or search terms</div>
          </div>
        )}
      </div>
    </div>
  );
}