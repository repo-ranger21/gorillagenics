import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { generatePersonalizedStrategy, DEFAULT_PROFILES } from "@/utils/strategyGenerator";
import { TrendingUp, TrendingDown, Target, Shield, Zap, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

export default function Strategy() {
  const [userProfile, setUserProfile] = useState(DEFAULT_PROFILES.balanced);
  const [personalizedStrategy, setPersonalizedStrategy] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('balanced');

  // Fetch Week 1 games for strategy analysis
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ['/api/week1'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Generate personalized strategy when profile or games change
  useEffect(() => {
    if (games.length > 0 && userProfile) {
      const strategy = generatePersonalizedStrategy(userProfile, games);
      setPersonalizedStrategy(strategy);
    }
  }, [games, userProfile]);

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadPresetProfile = (profileName) => {
    setSelectedProfile(profileName);
    setUserProfile(DEFAULT_PROFILES[profileName]);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-400 border-green-400';
      case 'moderate': return 'text-yellow-400 border-yellow-400';
      case 'high': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (gamesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            🦍
          </motion.div>
          <p className="text-xl text-primary">Analyzing the betting jungle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D2E] via-[#0F4A36] to-[#134A3A]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-yellow-400 mb-2">
            🦍 Personalized NFL Strategy
          </h1>
          <p className="text-primary text-lg">
            AI-Powered Betting Strategy Tailored to Your Profile
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Profile Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1"
          >
            <Card className="bg-background/20 backdrop-blur-sm border-border/30">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Your Betting Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preset Profiles */}
                <div>
                  <Label className="text-foreground mb-2 block">Quick Setup</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(DEFAULT_PROFILES).map((profileName) => (
                      <Button
                        key={profileName}
                        variant={selectedProfile === profileName ? "default" : "outline"}
                        size="sm"
                        onClick={() => loadPresetProfile(profileName)}
                        className="capitalize"
                      >
                        {profileName === 'conservative' && <Shield className="w-4 h-4 mr-1" />}
                        {profileName === 'balanced' && <Target className="w-4 h-4 mr-1" />}
                        {profileName === 'aggressive' && <Zap className="w-4 h-4 mr-1" />}
                        {profileName}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Risk Tolerance */}
                <div>
                  <Label className="text-foreground mb-2 block">Risk Tolerance</Label>
                  <Select 
                    value={userProfile.riskTolerance} 
                    onValueChange={(value) => handleProfileChange('riskTolerance', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">🛡️ Conservative</SelectItem>
                      <SelectItem value="medium">⚖️ Moderate</SelectItem>
                      <SelectItem value="aggressive">⚡ Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Betting Style */}
                <div>
                  <Label className="text-foreground mb-2 block">Betting Style</Label>
                  <Select 
                    value={userProfile.bettingStyle} 
                    onValueChange={(value) => handleProfileChange('bettingStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="value">💎 Value Hunter</SelectItem>
                      <SelectItem value="contrarian">🔄 Contrarian</SelectItem>
                      <SelectItem value="sharp">⚡ Sharp</SelectItem>
                      <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bankroll Management */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground mb-2 block">Bankroll ($)</Label>
                    <Input
                      type="number"
                      value={userProfile.bankrollSize}
                      onChange={(e) => handleProfileChange('bankrollSize', Number(e.target.value))}
                      min="100"
                      step="100"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground mb-2 block">Unit Size ($)</Label>
                    <Input
                      type="number"
                      value={userProfile.unitSize}
                      onChange={(e) => handleProfileChange('unitSize', Number(e.target.value))}
                      min="10"
                      step="10"
                    />
                  </div>
                </div>

                {/* Preferred Bet Types */}
                <div>
                  <Label className="text-foreground mb-2 block">Preferred Bet Types</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'spread', label: 'Point Spreads' },
                      { id: 'total', label: 'Over/Under' },
                      { id: 'moneyline', label: 'Moneylines' }
                    ].map((betType) => (
                      <div key={betType.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={betType.id}
                          checked={userProfile.preferredBets.includes(betType.id)}
                          onCheckedChange={(checked) => {
                            const newBets = checked
                              ? [...userProfile.preferredBets, betType.id]
                              : userProfile.preferredBets.filter(b => b !== betType.id);
                            handleProfileChange('preferredBets', newBets);
                          }}
                        />
                        <Label htmlFor={betType.id} className="text-foreground">
                          {betType.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avoidance Factors */}
                <div>
                  <Label className="text-foreground mb-2 block">Avoid These Situations</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'primetime', label: 'Primetime Games' },
                      { id: 'weather', label: 'Bad Weather' },
                      { id: 'travel', label: 'Long Travel' },
                      { id: 'divisional', label: 'Divisional Games' }
                    ].map((factor) => (
                      <div key={factor.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={factor.id}
                          checked={userProfile.avoidanceFactors.includes(factor.id)}
                          onCheckedChange={(checked) => {
                            const newFactors = checked
                              ? [...userProfile.avoidanceFactors, factor.id]
                              : userProfile.avoidanceFactors.filter(f => f !== factor.id);
                            handleProfileChange('avoidanceFactors', newFactors);
                          }}
                        />
                        <Label htmlFor={factor.id} className="text-foreground">
                          {factor.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Strategy Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2"
          >
            {personalizedStrategy ? (
              <div className="space-y-6">
                {/* Strategy Overview */}
                <Card className="bg-background/20 backdrop-blur-sm border-border/30">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Your Personalized Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">
                          {personalizedStrategy.strategies.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Recommended Bets</div>
                      </div>
                      
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className={`text-2xl font-bold ${getRiskColor(personalizedStrategy.riskAssessment.level)}`}>
                          {personalizedStrategy.riskAssessment.level.toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">Risk Level</div>
                      </div>
                      
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">
                          {personalizedStrategy.bankrollManagement.riskPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Bankroll at Risk</div>
                      </div>
                    </div>

                    {/* Bankroll Management Summary */}
                    <div className="p-4 bg-secondary/10 rounded-lg mb-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Bankroll Management
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Units:</span>
                          <span className="ml-2 font-semibold text-foreground">
                            {personalizedStrategy.bankrollManagement.totalUnits.toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Risk:</span>
                          <span className="ml-2 font-semibold text-foreground">
                            ${personalizedStrategy.bankrollManagement.totalRisk.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-primary border-primary">
                          {personalizedStrategy.bankrollManagement.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Bets */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">🎯 Recommended Bets</h3>
                  
                  <AnimatePresence>
                    {personalizedStrategy.strategies.map((strategy, index) => (
                      <motion.div
                        key={strategy.gameId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-background/20 backdrop-blur-sm border-border/30">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-bold text-foreground text-lg">{strategy.matchup}</h4>
                                <Badge variant="outline" className="mt-1">
                                  {strategy.timeSlot}
                                </Badge>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getConfidenceColor(strategy.overallConfidence)}`}>
                                  {strategy.overallConfidence.toFixed(0)}%
                                </div>
                                <div className="text-sm text-muted-foreground">Confidence</div>
                              </div>
                            </div>

                            {/* Recommended Bets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {strategy.bets.map((bet, betIndex) => (
                                <div 
                                  key={betIndex} 
                                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge className="capitalize bg-primary text-primary-foreground">
                                      {bet.type}
                                    </Badge>
                                    <div className={`font-bold ${getConfidenceColor(bet.confidence * 2)}`}>
                                      {bet.side}
                                    </div>
                                  </div>
                                  
                                  {bet.line && (
                                    <div className="text-sm text-muted-foreground mb-1">
                                      Line: {bet.line}
                                    </div>
                                  )}
                                  
                                  <div className="text-xs text-primary/80">
                                    {bet.reasoning}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Strategy Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Risk Level:</span>
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 ${getRiskColor(strategy.riskLevel)}`}
                                >
                                  {strategy.riskLevel.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div>
                                <span className="text-muted-foreground">Expected Value:</span>
                                <span className={`ml-2 font-semibold ${
                                  strategy.expectedValue > 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {strategy.expectedValue > 0 ? '+' : ''}{strategy.expectedValue.toFixed(1)}%
                                </span>
                              </div>
                              
                              <div>
                                <span className="text-muted-foreground">Bet Size:</span>
                                <span className="ml-2 font-semibold text-foreground">
                                  {strategy.bankrollRecommendation.toFixed(1)} units
                                </span>
                              </div>
                            </div>

                            {/* Reasoning */}
                            {strategy.reasoning.length > 0 && (
                              <div className="mt-4 p-3 bg-secondary/10 rounded-lg">
                                <h5 className="font-semibold text-foreground mb-2">🧠 Strategy Reasoning:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {strategy.reasoning.map((reason, reasonIndex) => (
                                    <li key={reasonIndex} className="flex items-start gap-2">
                                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Personalized Tips */}
                {personalizedStrategy.personalizedTips.length > 0 && (
                  <Card className="bg-background/20 backdrop-blur-sm border-border/30">
                    <CardHeader>
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Personalized Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {personalizedStrategy.personalizedTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                            <div className="text-yellow-400 text-sm font-medium">💡</div>
                            <div className="text-sm text-foreground">{tip}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🦍
                </motion.div>
                <p className="text-xl text-primary">Generating your personalized strategy...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}