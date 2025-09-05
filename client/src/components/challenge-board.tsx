import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, Users, Target, TrendingUp, Star, Crown, 
  Plus, Calendar, DollarSign, Medal, Flame, Zap,
  Eye, MessageCircle, ThumbsUp, Share2
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  creator: {
    id: string;
    name: string;
    avatar: string;
    badge: string;
  };
  type: 'weekly' | 'daily' | 'season' | 'tournament';
  category: 'nfl' | 'general' | 'prop_bets' | 'spreads';
  prize: {
    type: 'bragging_rights' | 'virtual_currency' | 'badges';
    amount: number;
    description: string;
  };
  participants: number;
  maxParticipants?: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  requirements: string[];
  leaderboard: {
    userId: string;
    username: string;
    avatar: string;
    score: number;
    streak: number;
    roi: number;
    badge?: string;
  }[];
  stats: {
    totalBets: number;
    winRate: number;
    avgRoi: number;
    topStreak: number;
  };
}

interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  badges: string[];
  stats: {
    totalChallenges: number;
    challengesWon: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
    totalEarnings: number;
  };
  rank: number;
  following: number;
  followers: number;
}

interface ChallengeBoardProps {
  compact?: boolean;
  className?: string;
}

// Mock data generation
function generateMockChallenges(): Challenge[] {
  const challengeTypes = ['weekly', 'daily', 'season', 'tournament'] as const;
  const categories = ['nfl', 'general', 'prop_bets', 'spreads'] as const;
  const difficulties = ['beginner', 'intermediate', 'expert'] as const;
  const statuses = ['upcoming', 'active', 'completed'] as const;

  const challengeTitles = [
    "Week 1 NFL Underdog Challenge",
    "Perfect Spread Picks Challenge", 
    "Over/Under Master Class",
    "Gorilla's Revenge Tournament",
    "Rookie Predictor Challenge",
    "Alpha Ape Championship",
    "Jungle Justice Showdown",
    "BioBoost Accuracy Test",
    "Prime Time Prophets",
    "Red Zone Royalty"
  ];

  const usernames = [
    "BettingBanana", "AlphaApe47", "GorillaGuru", "JungleJuice", "PrimalPicks",
    "SilverbackSam", "BananaBoost", "GorillaGold", "ApexApe", "JungleMaster",
    "WildBetter", "PrimatePredictor", "GorillaGains", "AlphaPicks", "JungleGenius"
  ];

  return Array.from({ length: 12 }, (_, index) => {
    const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const participants = Math.floor(Math.random() * 200) + 10;
    
    const leaderboard = Array.from({ length: Math.min(10, participants) }, (_, i) => ({
      userId: `user-${i}`,
      username: usernames[Math.floor(Math.random() * usernames.length)],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[i % usernames.length]}`,
      score: Math.floor(Math.random() * 1000) + 100,
      streak: Math.floor(Math.random() * 15),
      roi: (Math.random() - 0.3) * 50,
      badge: Math.random() > 0.7 ? ['🦍', '👑', '🔥', '⭐'][Math.floor(Math.random() * 4)] : undefined
    })).sort((a, b) => b.score - a.score);

    return {
      id: `challenge-${index}`,
      title: challengeTitles[index] || `Challenge ${index + 1}`,
      description: `Test your betting skills in this ${difficulty} level ${type} challenge. Compete against fellow gorillas and climb the leaderboard!`,
      creator: {
        id: `creator-${index}`,
        name: usernames[Math.floor(Math.random() * usernames.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=creator${index}`,
        badge: Math.random() > 0.5 ? '👑' : '🦍'
      },
      type,
      category,
      prize: {
        type: ['bragging_rights', 'virtual_currency', 'badges'][Math.floor(Math.random() * 3)] as any,
        amount: Math.floor(Math.random() * 10000) + 500,
        description: "Winner takes all the jungle glory!"
      },
      participants,
      maxParticipants: type === 'tournament' ? participants + Math.floor(Math.random() * 50) : undefined,
      startDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      difficulty,
      requirements: [
        "Minimum 5 bets required",
        "NFL games only", 
        "Must maintain 60%+ accuracy"
      ],
      leaderboard,
      stats: {
        totalBets: Math.floor(Math.random() * 1000) + 100,
        winRate: Math.random() * 0.4 + 0.4,
        avgRoi: (Math.random() - 0.2) * 25,
        topStreak: Math.floor(Math.random() * 20) + 5
      }
    };
  });
}

function generateMockUser(): User {
  return {
    id: 'current-user',
    username: 'YourGorillaName',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser',
    level: Math.floor(Math.random() * 50) + 1,
    xp: Math.floor(Math.random() * 10000),
    badges: ['🦍', '🎯', '🔥', '⭐'],
    stats: {
      totalChallenges: Math.floor(Math.random() * 50) + 5,
      challengesWon: Math.floor(Math.random() * 15) + 1,
      winRate: Math.random() * 0.4 + 0.4,
      currentStreak: Math.floor(Math.random() * 10),
      bestStreak: Math.floor(Math.random() * 25) + 5,
      totalEarnings: Math.floor(Math.random() * 50000) + 1000
    },
    rank: Math.floor(Math.random() * 1000) + 1,
    following: Math.floor(Math.random() * 100) + 10,
    followers: Math.floor(Math.random() * 500) + 20
  };
}

// Helper functions
const getStatusColor = (status: Challenge['status']) => {
  switch (status) {
    case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return 'text-green-600';
    case 'intermediate': return 'text-yellow-600';
    case 'expert': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

const getCategoryIcon = (category: Challenge['category']) => {
  switch (category) {
    case 'nfl': return '🏈';
    case 'prop_bets': return '🎯';
    case 'spreads': return '📊';
    default: return '🎲';
  }
};

export default function ChallengeBoard({ compact = false, className = "" }: ChallengeBoardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed' | 'leaderboard'>('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    setChallenges(generateMockChallenges());
    setUser(generateMockUser());
  }, []);

  const filteredChallenges = challenges.filter(challenge => 
    activeTab === 'leaderboard' ? true : challenge.status === activeTab
  );

  if (compact) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-primary" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {challenges.slice(0, 3).map((challenge, index) => (
            <div
              key={challenge.id}
              className="flex items-center justify-between p-2 bg-accent/50 rounded text-sm"
              data-testid={`compact-challenge-${index}`}
            >
              <div>
                <div className="font-medium truncate">{challenge.title}</div>
                <div className="text-xs text-muted-foreground">
                  {challenge.participants} participants
                </div>
              </div>
              <Badge className={getStatusColor(challenge.status)}>
                {challenge.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Challenge Board</CardTitle>
                <p className="text-muted-foreground">
                  Compete with fellow gorillas and prove your betting prowess
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" data-testid="create-challenge-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Challenge title" data-testid="challenge-title-input" />
                  <Textarea placeholder="Challenge description" data-testid="challenge-description-input" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Prize amount" type="number" data-testid="challenge-prize-input" />
                    <Input placeholder="Max participants" type="number" data-testid="challenge-max-participants-input" />
                  </div>
                  <Button className="w-full" data-testid="create-challenge-submit">
                    🦍 Launch Challenge
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* User Stats */}
      {user && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{user.username}</h3>
                  <div className="flex gap-1">
                    {user.badges.map((badge, index) => (
                      <span key={index} className="text-lg">{badge}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Level {user.level}</span>
                  <span>Rank #{user.rank}</span>
                  <span>{user.stats.challengesWon}/{user.stats.totalChallenges} Won</span>
                  <span>{(user.stats.winRate * 100).toFixed(1)}% Win Rate</span>
                </div>
                <Progress value={(user.xp % 1000) / 10} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Challenges */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active" data-testid="tab-active">
                <Flame className="w-4 h-4 mr-2" />
                Active ({challenges.filter(c => c.status === 'active').length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming ({challenges.filter(c => c.status === 'upcoming').length})
              </TabsTrigger>
              <TabsTrigger value="completed" data-testid="tab-completed">
                <Medal className="w-4 h-4 mr-2" />
                Completed ({challenges.filter(c => c.status === 'completed').length})
              </TabsTrigger>
              <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
                <Crown className="w-4 h-4 mr-2" />
                Leaderboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab}>
            <TabsContent value="active" className="space-y-4">
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  index={index}
                  onSelect={() => setSelectedChallenge(challenge)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="upcoming" className="space-y-4">
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  index={index}
                  onSelect={() => setSelectedChallenge(challenge)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  index={index}
                  onSelect={() => setSelectedChallenge(challenge)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="leaderboard">
              <GlobalLeaderboard challenges={challenges} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Challenge Detail Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeDetailModal 
            challenge={selectedChallenge} 
            onClose={() => setSelectedChallenge(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ 
  challenge, 
  index, 
  onSelect 
}: { 
  challenge: Challenge; 
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      className="cursor-pointer"
    >
      <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCategoryIcon(challenge.category)}</span>
                <h3 className="text-lg font-semibold">{challenge.title}</h3>
                <Badge className={getStatusColor(challenge.status)}>
                  {challenge.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {challenge.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{challenge.participants} participants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{challenge.prize.amount.toLocaleString()} {challenge.prize.type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10">
                <AvatarImage src={challenge.creator.avatar} />
                <AvatarFallback>{challenge.creator.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-right text-sm">
                <div className="font-medium">{challenge.creator.name}</div>
                <div className="text-xs text-muted-foreground">Creator {challenge.creator.badge}</div>
              </div>
            </div>
          </div>
          
          {/* Mini Leaderboard Preview */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Top Performers</span>
              <div className="flex gap-1">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <ThumbsUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              {challenge.leaderboard.slice(0, 3).map((leader, i) => (
                <div key={leader.userId} className="flex items-center gap-1 text-xs">
                  <span className={i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'}>
                    #{i + 1}
                  </span>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={leader.avatar} />
                    <AvatarFallback>{leader.username.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{leader.username}</span>
                  <span className="text-muted-foreground">({leader.score})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Global Leaderboard Component
function GlobalLeaderboard({ challenges }: { challenges: Challenge[] }) {
  // Aggregate all leaderboard data
  const globalLeaders = challenges
    .flatMap(c => c.leaderboard)
    .reduce((acc, leader) => {
      const existing = acc.find(l => l.userId === leader.userId);
      if (existing) {
        existing.totalScore += leader.score;
        existing.appearances += 1;
        existing.avgScore = existing.totalScore / existing.appearances;
      } else {
        acc.push({
          ...leader,
          totalScore: leader.score,
          appearances: 1,
          avgScore: leader.score
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 20);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-500" />
        Global Leaderboard
      </h3>
      
      {globalLeaders.map((leader, index) => (
        <motion.div
          key={leader.userId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex items-center justify-between p-4 rounded-lg border ${
            index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-accent/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              index === 0 ? 'bg-yellow-500 text-white' :
              index === 1 ? 'bg-gray-400 text-white' :
              index === 2 ? 'bg-orange-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {index < 3 ? (
                index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'
              ) : (
                `#${index + 1}`
              )}
            </div>
            <Avatar className="w-10 h-10">
              <AvatarImage src={leader.avatar} />
              <AvatarFallback>{leader.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{leader.username}</div>
              <div className="text-xs text-muted-foreground">
                {leader.appearances} challenges • {leader.avgScore.toFixed(0)} avg score
              </div>
            </div>
            {leader.badge && (
              <span className="text-lg">{leader.badge}</span>
            )}
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">{leader.totalScore.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Points</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Challenge Detail Modal
function ChallengeDetailModal({ 
  challenge, 
  onClose 
}: { 
  challenge: Challenge; 
  onClose: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-background border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                <h2 className="text-2xl font-bold">{challenge.title}</h2>
                <Badge className={getStatusColor(challenge.status)}>
                  {challenge.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{challenge.description}</p>
            </div>
            <Button variant="ghost" onClick={onClose} data-testid="close-challenge-detail">
              ✕
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{challenge.participants}</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{challenge.prize.amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Prize Pool</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{(challenge.stats.winRate * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Avg Win Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{challenge.stats.topStreak}</div>
                <div className="text-sm text-muted-foreground">Top Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Leaderboard</h3>
            <div className="space-y-2 max-h-60 overflow-auto">
              {challenge.leaderboard.map((leader, index) => (
                <div
                  key={leader.userId}
                  className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={leader.avatar} />
                      <AvatarFallback>{leader.username.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{leader.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {leader.streak} streak • {leader.roi > 0 ? '+' : ''}{leader.roi.toFixed(1)}% ROI
                      </div>
                    </div>
                    {leader.badge && (
                      <span className="text-lg">{leader.badge}</span>
                    )}
                  </div>
                  <div className="font-bold">{leader.score}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button className="flex-1" data-testid="join-challenge-button">
              <Users className="w-4 h-4 mr-2" />
              Join Challenge
            </Button>
            <Button variant="outline" data-testid="share-challenge-button">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" data-testid="follow-creator-button">
              <Star className="w-4 h-4 mr-2" />
              Follow Creator
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { type Challenge, type User };