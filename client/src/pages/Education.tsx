import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  BookOpen,
  Search,
  Target,
  TrendingUp,
  Shield,
  Brain,
  Calculator,
  Users,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

interface GlossaryTerm {
  term: string;
  definition: string;
  category: "betting" | "dfs" | "bioboost" | "general";
  example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "BioBoost Score",
    definition: "GuerillaGenics proprietary algorithm that combines biometric factors (sleep, testosterone, cortisol, hydration, injury recovery) to predict player performance.",
    category: "bioboost",
    example: "A BioBoost score of 85+ indicates peak physiological readiness for optimal performance."
  },
  {
    term: "Point Spread",
    definition: "The predicted margin of victory for the favored team, designed to create equal betting action on both sides.",
    category: "betting",
    example: "If the Chiefs are -7.5 vs Raiders, Kansas City must win by 8+ points to cover the spread."
  },
  {
    term: "Over/Under (Total)",
    definition: "A bet on whether the combined score of both teams will be over or under a specific number.",
    category: "betting",
    example: "If the total is 47.5, you bet whether both teams will score more or less than 47.5 combined points."
  },
  {
    term: "ggScore",
    definition: "GuerillaGenics DFS rating that evaluates player value based on salary, matchup, and projected performance.",
    category: "dfs",
    example: "A ggScore of 9.0+ indicates exceptional DFS value with high ceiling potential."
  },
  {
    term: "Juice (Vig)",
    definition: "The commission charged by sportsbooks, typically -110 on standard bets (bet $110 to win $100).",
    category: "betting",
    example: "Shopping for better juice can save serious money over time - find -105 instead of -110."
  },
  {
    term: "Sharp Money",
    definition: "Bets placed by professional or highly skilled bettors, often causing line movements.",
    category: "betting",
    example: "When sharp money hits the Under, the total often drops quickly across multiple sportsbooks."
  },
  {
    term: "Ownership Projection",
    definition: "Estimated percentage of DFS lineups that will include a specific player.",
    category: "dfs",
    example: "High ownership (30%+) means the player is 'chalky' - popular but potentially overvalued."
  },
  {
    term: "Cortisol Proxy",
    definition: "Stress hormone indicator in BioBoost algorithm, derived from sleep quality and recovery metrics.",
    category: "bioboost",
    example: "Lower cortisol proxy scores indicate better stress management and performance readiness."
  }
];

const strategyModules = [
  {
    title: "NFL Spread Betting Fundamentals",
    category: "betting",
    icon: Target,
    description: "Master the basics of point spread betting with proven strategies",
    topics: [
      "Understanding line movement and why it matters",
      "Key numbers in NFL betting (3, 7, 10, 14)",
      "Home field advantage and weather impacts",
      "Injury reports and lineup changes"
    ]
  },
  {
    title: "DFS GPP Strategy",
    category: "dfs",
    icon: TrendingUp,
    description: "Tournament strategies for large field competitions",
    topics: [
      "Roster construction and correlation",
      "Contrarian plays and ownership leverage",
      "Stacking strategies (QB/WR, game stacks)",
      "Bankroll management for tournaments"
    ]
  },
  {
    title: "BioBoost Analysis Deep Dive",
    category: "bioboost",
    icon: Brain,
    description: "Understanding the science behind performance prediction",
    topics: [
      "How sleep quality affects athletic performance",
      "Testosterone and power output correlation",
      "Recovery metrics and injury prevention",
      "Environmental factors and adaptation"
    ]
  },
  {
    title: "Bankroll Management",
    category: "general",
    icon: Shield,
    description: "Protect your bankroll with proper money management",
    topics: [
      "Unit sizing and bet allocation",
      "Kelly Criterion applications",
      "Tracking ROI and win rates",
      "Avoiding tilt and emotional betting"
    ]
  }
];

export default function Education() {
  const [activeTab, setActiveTab] = useState("glossary");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTerms = glossaryTerms.filter((term) => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredModules = strategyModules.filter((module) => {
    return selectedCategory === "all" || module.category === selectedCategory;
  });

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
                <BookOpen className="w-8 h-8 text-banana" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Betting Education</h1>
                <p className="text-banana text-lg">Master DFS and NFL betting with GuerillaGenics intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50">
            <TabsTrigger 
              value="glossary" 
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="glossary-tab"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Glossary
            </TabsTrigger>
            <TabsTrigger 
              value="strategy"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="strategy-tab"
            >
              <Brain className="w-4 h-4 mr-2" />
              Strategy
            </TabsTrigger>
            <TabsTrigger 
              value="responsible"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="responsible-tab"
            >
              <Shield className="w-4 h-4 mr-2" />
              Responsible Betting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="glossary" className="space-y-6 mt-6">
            <GlossarySection 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredTerms={filteredTerms}
            />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-6 mt-6">
            <StrategySection 
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredModules={filteredModules}
            />
          </TabsContent>

          <TabsContent value="responsible" className="space-y-6 mt-6">
            <ResponsibleBettingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function GlossarySection({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  filteredTerms 
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredTerms: GlossaryTerm[];
}) {
  const categories = [
    { value: "all", label: "All Terms" },
    { value: "betting", label: "Betting" },
    { value: "dfs", label: "DFS" },
    { value: "bioboost", label: "BioBoost" },
    { value: "general", label: "General" }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-jungle" />
            Search Glossary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="glossary-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={selectedCategory === category.value ? "bg-jungle text-white" : ""}
                  data-testid={`category-${category.value}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glossary Terms */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTerms.map((term, index) => (
          <motion.div
            key={term.term}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            data-testid={`term-${term.term.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Card className="hover:shadow-lg transition-all duration-200 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-jungle">{term.term}</CardTitle>
                  <Badge variant="outline" className={
                    term.category === "betting" ? "bg-blue-50 text-blue-600" :
                    term.category === "dfs" ? "bg-green-50 text-green-600" :
                    term.category === "bioboost" ? "bg-purple-50 text-purple-600" :
                    "bg-gray-50 text-gray-600"
                  }>
                    {term.category.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {term.definition}
                </p>
                {term.example && (
                  <div className="p-3 bg-banana/10 rounded-lg border-l-4 border-banana">
                    <div className="text-xs font-medium text-banana mb-1">🦍 Example</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {term.example}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <div className="text-xl font-semibold text-jungle mb-2">No Terms Found</div>
          <div className="text-muted-foreground">Try adjusting your search or category filter</div>
        </div>
      )}
    </div>
  );
}

function StrategySection({ 
  selectedCategory, 
  setSelectedCategory, 
  filteredModules 
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredModules: any[];
}) {
  const categories = [
    { value: "all", label: "All Strategies" },
    { value: "betting", label: "Betting" },
    { value: "dfs", label: "DFS" },
    { value: "bioboost", label: "BioBoost" },
    { value: "general", label: "General" }
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.value}
            variant={selectedCategory === category.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.value)}
            className={selectedCategory === category.value ? "bg-jungle text-white" : ""}
            data-testid={`strategy-category-${category.value}`}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Strategy Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredModules.map((module, index) => {
          const Icon = module.icon;
          
          return (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`module-${module.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card className="hover:shadow-lg transition-all duration-200 h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-jungle/10 rounded-lg">
                      <Icon className="w-6 h-6 text-jungle" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-jungle mb-2">Topics Covered:</h4>
                    <ul className="space-y-1">
                      {module.topics.map((topic: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-jungle mt-1">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full bg-jungle hover:bg-jungle/90">
                    Start Learning
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ResponsibleBettingSection() {
  const responsibleGuidelines = [
    {
      title: "Set Limits and Stick to Them",
      description: "Never bet more than you can afford to lose. Set daily, weekly, and monthly limits.",
      icon: Shield,
      tips: [
        "Decide your betting budget before you start",
        "Never chase losses with bigger bets",
        "Take breaks when you're on a losing streak",
        "Consider your betting money as entertainment expense"
      ]
    },
    {
      title: "Recognize Warning Signs",
      description: "Know when betting is becoming a problem and seek help if needed.",
      icon: Users,
      tips: [
        "Betting more than you planned",
        "Thinking about betting constantly",
        "Neglecting responsibilities for betting",
        "Lying about your betting activity"
      ]
    },
    {
      title: "Use Tools and Resources",
      description: "Take advantage of responsible gambling tools and support resources.",
      icon: Calculator,
      tips: [
        "Set deposit limits with your sportsbook",
        "Use self-exclusion tools when needed",
        "Track your betting history and ROI",
        "Contact problem gambling helplines if needed"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-jungle mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-jungle mb-2">Bet Responsibly</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              GuerillaGenics promotes responsible betting. Sports betting should be fun and entertaining, 
              not a way to make money or solve financial problems. Always bet within your means and 
              seek help if gambling becomes a problem.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {responsibleGuidelines.map((guideline, index) => {
          const Icon = guideline.icon;
          
          return (
            <motion.div
              key={guideline.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="text-center">
                    <div className="p-3 bg-jungle/10 rounded-lg w-fit mx-auto mb-3">
                      <Icon className="w-8 h-8 text-jungle" />
                    </div>
                    <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{guideline.description}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {guideline.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-jungle mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-jungle" />
            Get Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-jungle mb-2">Problem Gambling Helplines:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• National Council on Problem Gambling: 1-800-522-4700</li>
                <li>• Gamblers Anonymous: www.gamblersanonymous.org</li>
                <li>• SAMHSA Helpline: 1-800-662-4357</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-jungle mb-2">Self-Help Tools:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Deposit limits on sportsbooks</li>
                <li>• Self-exclusion programs</li>
                <li>• Spending tracking apps</li>
                <li>• Time limit reminders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}