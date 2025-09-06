import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User,
  Settings,
  Bell,
  Heart,
  Mail,
  Save,
  Upload,
  ExternalLink,
  ArrowLeft,
  Shield
} from "lucide-react";
import { Link } from "wouter";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favoriteTeams: string[];
  substackUrl?: string;
  preferences: {
    emailAlerts: boolean;
    lineMovementAlerts: boolean;
    injuryAlerts: boolean;
    weeklyNewsletter: boolean;
    dfsAlerts: boolean;
    marketingEmails: boolean;
  };
  stats: {
    totalPicks: number;
    winRate: number;
    currentStreak: number;
    favoriteBet: string;
  };
}

const nflTeams = [
  { code: "ARI", name: "Arizona Cardinals", emoji: "🦅" },
  { code: "ATL", name: "Atlanta Falcons", emoji: "🦅" },
  { code: "BAL", name: "Baltimore Ravens", emoji: "🖤" },
  { code: "BUF", name: "Buffalo Bills", emoji: "🦬" },
  { code: "CAR", name: "Carolina Panthers", emoji: "🐾" },
  { code: "CHI", name: "Chicago Bears", emoji: "🐻" },
  { code: "CIN", name: "Cincinnati Bengals", emoji: "🐅" },
  { code: "CLE", name: "Cleveland Browns", emoji: "🟤" },
  { code: "DAL", name: "Dallas Cowboys", emoji: "⭐" },
  { code: "DEN", name: "Denver Broncos", emoji: "🐴" },
  { code: "DET", name: "Detroit Lions", emoji: "🦁" },
  { code: "GB", name: "Green Bay Packers", emoji: "🧀" },
  { code: "HOU", name: "Houston Texans", emoji: "🤠" },
  { code: "IND", name: "Indianapolis Colts", emoji: "🐎" },
  { code: "JAX", name: "Jacksonville Jaguars", emoji: "🐆" },
  { code: "KC", name: "Kansas City Chiefs", emoji: "🔴" },
  { code: "LV", name: "Las Vegas Raiders", emoji: "⚫" },
  { code: "LAC", name: "Los Angeles Chargers", emoji: "⚡" },
  { code: "LAR", name: "Los Angeles Rams", emoji: "🐏" },
  { code: "MIA", name: "Miami Dolphins", emoji: "🐬" },
  { code: "MIN", name: "Minnesota Vikings", emoji: "⚔️" },
  { code: "NE", name: "New England Patriots", emoji: "🇺🇸" },
  { code: "NO", name: "New Orleans Saints", emoji: "⚜️" },
  { code: "NYG", name: "New York Giants", emoji: "🗽" },
  { code: "NYJ", name: "New York Jets", emoji: "✈️" },
  { code: "PHI", name: "Philadelphia Eagles", emoji: "🦅" },
  { code: "PIT", name: "Pittsburgh Steelers", emoji: "🖤" },
  { code: "SF", name: "San Francisco 49ers", emoji: "🌉" },
  { code: "SEA", name: "Seattle Seahawks", emoji: "🌊" },
  { code: "TB", name: "Tampa Bay Buccaneers", emoji: "🏴‍☠️" },
  { code: "TEN", name: "Tennessee Titans", emoji: "🔵" },
  { code: "WAS", name: "Washington Commanders", emoji: "🦬" }
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['/api/user/profile']
  });

  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile || {});

  const handleSave = async () => {
    // Save profile changes
    console.log("Saving profile:", formData);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">👤</div>
          <div className="text-xl font-semibold text-jungle mb-2">Loading Profile...</div>
          <div className="text-muted-foreground">Fetching your gorilla preferences</div>
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
              <Avatar className="w-16 h-16 border-2 border-white/20">
                <AvatarImage src={userProfile?.avatar} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {userProfile?.name?.slice(0, 2).toUpperCase() || "🦍"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold text-white">{userProfile?.name || "Gorilla User"}</h1>
                <p className="text-banana text-lg">Manage your profile and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/50">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="profile-tab"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger 
              value="preferences"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="preferences-tab"
            >
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="teams-tab"
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorite Teams
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-jungle data-[state=active]:text-white"
              data-testid="stats-tab"
            >
              <Shield className="w-4 h-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-6">
            <ProfileSection 
              userProfile={userProfile} 
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <PreferencesSection 
              userProfile={userProfile}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="teams" className="space-y-6 mt-6">
            <FavoriteTeamsSection 
              userProfile={userProfile}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 mt-6">
            <StatsSection userProfile={userProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProfileSection({ 
  userProfile, 
  isEditing, 
  setIsEditing, 
  formData, 
  setFormData, 
  onSave 
}: {
  userProfile: UserProfile;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
  onSave: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-jungle" />
            Personal Information
          </CardTitle>
          {!isEditing ? (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              data-testid="edit-profile"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                data-testid="cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                onClick={onSave}
                className="bg-jungle hover:bg-jungle/90"
                data-testid="save-profile"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={formData.avatar || userProfile?.avatar} />
            <AvatarFallback className="text-xl font-bold bg-jungle/10 text-jungle">
              {(formData.name || userProfile?.name)?.slice(0, 2).toUpperCase() || "🦍"}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Change Avatar
            </Button>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="name-input"
              />
            ) : (
              <div className="p-2 text-sm">{userProfile?.name || "Not set"}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="email-input"
              />
            ) : (
              <div className="p-2 text-sm">{userProfile?.email || "Not set"}</div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="substack">Substack URL (Optional)</Label>
            {isEditing ? (
              <Input
                id="substack"
                placeholder="https://yourname.substack.com"
                value={formData.substackUrl || ""}
                onChange={(e) => setFormData({ ...formData, substackUrl: e.target.value })}
                data-testid="substack-input"
              />
            ) : (
              <div className="p-2 text-sm">
                {userProfile?.substackUrl ? (
                  <a 
                    href={userProfile.substackUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-jungle hover:underline flex items-center gap-2"
                  >
                    {userProfile.substackUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  "Not set"
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreferencesSection({ 
  userProfile, 
  formData, 
  setFormData, 
  onSave 
}: {
  userProfile: UserProfile;
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
  onSave: () => void;
}) {
  const preferences = formData.preferences || userProfile?.preferences || {};

  const updatePreference = (key: string, value: boolean) => {
    setFormData({
      ...formData,
      preferences: {
        ...preferences,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-jungle" />
            Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "emailAlerts", label: "Email Alerts", description: "Receive important alerts via email" },
            { key: "lineMovementAlerts", label: "Line Movement Alerts", description: "Get notified when betting lines move significantly" },
            { key: "injuryAlerts", label: "Injury Alerts", description: "Alerts for player injuries affecting your picks" },
            { key: "dfsAlerts", label: "DFS Alerts", description: "Notifications about DFS value plays and ownership changes" }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{pref.label}</div>
                <div className="text-sm text-muted-foreground">{pref.description}</div>
              </div>
              <Switch
                checked={preferences[pref.key as keyof typeof preferences] || false}
                onCheckedChange={(checked) => updatePreference(pref.key, checked)}
                data-testid={`preference-${pref.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-jungle" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "weeklyNewsletter", label: "Weekly Newsletter", description: "Receive our weekly GuerillaGenics newsletter" },
            { key: "marketingEmails", label: "Marketing Emails", description: "Promotional content and special offers" }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{pref.label}</div>
                <div className="text-sm text-muted-foreground">{pref.description}</div>
              </div>
              <Switch
                checked={preferences[pref.key as keyof typeof preferences] || false}
                onCheckedChange={(checked) => updatePreference(pref.key, checked)}
                data-testid={`preference-${pref.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-jungle hover:bg-jungle/90">
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

function FavoriteTeamsSection({ 
  userProfile, 
  formData, 
  setFormData, 
  onSave 
}: {
  userProfile: UserProfile;
  formData: Partial<UserProfile>;
  setFormData: (data: Partial<UserProfile>) => void;
  onSave: () => void;
}) {
  const favoriteTeams = formData.favoriteTeams || userProfile?.favoriteTeams || [];

  const toggleTeam = (teamCode: string) => {
    const newFavorites = favoriteTeams.includes(teamCode)
      ? favoriteTeams.filter(code => code !== teamCode)
      : [...favoriteTeams, teamCode];
    
    setFormData({
      ...formData,
      favoriteTeams: newFavorites
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-jungle" />
              Favorite NFL Teams
            </CardTitle>
            <Badge variant="outline">{favoriteTeams.length} teams selected</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {nflTeams.map((team) => {
              const isSelected = favoriteTeams.includes(team.code);
              
              return (
                <div
                  key={team.code}
                  onClick={() => toggleTeam(team.code)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-jungle bg-jungle/10 shadow-md' 
                      : 'border-gray-200 hover:border-jungle/50 hover:bg-gray-50'
                  }`}
                  data-testid={`team-${team.code}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{team.emoji}</div>
                    <div>
                      <div className="font-medium text-sm">{team.code}</div>
                      <div className="text-xs text-muted-foreground">{team.name}</div>
                    </div>
                    {isSelected && (
                      <Heart className="w-4 h-4 text-jungle ml-auto fill-current" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onSave} className="bg-jungle hover:bg-jungle/90">
          <Save className="w-4 h-4 mr-2" />
          Save Favorite Teams
        </Button>
      </div>
    </div>
  );
}

function StatsSection({ userProfile }: { userProfile: UserProfile }) {
  const stats = userProfile?.stats || {
    totalPicks: 0,
    winRate: 0,
    currentStreak: 0,
    favoriteBet: "N/A"
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-jungle">{stats.totalPicks}</div>
            <div className="text-sm text-muted-foreground">Total Picks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-vine">{stats.winRate}%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-banana">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-lg font-bold text-jungle">{stats.favoriteBet}</div>
            <div className="text-sm text-muted-foreground">Favorite Bet Type</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-xl font-semibold text-jungle mb-2">Detailed Stats Coming Soon</div>
            <div className="text-muted-foreground">
              We're building comprehensive performance analytics and historical tracking
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}