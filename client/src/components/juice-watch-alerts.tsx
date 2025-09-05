import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@shared/schema";
import { useState } from "react";

interface JuiceWatchAlertsProps {
  alerts: Alert[];
}

export default function JuiceWatchAlerts({ alerts }: JuiceWatchAlertsProps) {
  const [juiceWatchEnabled, setJuiceWatchEnabled] = useState(true);
  const [gorillaIntensity, setGorillaIntensity] = useState("alpha");
  const [satiricalMode, setSatiricalMode] = useState(false);
  const [soundEffects, setSoundEffects] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const getMetricColor = (metricType: string) => {
    switch (metricType.toLowerCase()) {
      case "sleep":
        return "border-sleep";
      case "testosterone":
      case "t-index":
        return "border-testosterone";
      case "cortisol":
        return "border-cortisol";
      case "hydration":
        return "border-hydration";
      case "recovery":
        return "border-recovery";
      default:
        return "border-primary";
    }
  };

  const getMetricTextColor = (metricType: string) => {
    switch (metricType.toLowerCase()) {
      case "sleep":
        return "text-sleep";
      case "testosterone":
      case "t-index":
        return "text-testosterone";
      case "cortisol":
        return "text-cortisol";
      case "hydration":
        return "text-hydration";
      case "recovery":
        return "text-recovery";
      default:
        return "text-primary";
    }
  };

  const formatTimeAgo = (timestamp: Date | string | null) => {
    if (!timestamp) return "Just now";
    
    // Convert string timestamp to Date object if needed
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Just now";
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Alert Configuration */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-card border border-border">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-card-foreground mb-8">Alert Configuration</h3>
            
            <div className="space-y-8">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-card-foreground">Enable Juice Watch</h4>
                  <p className="text-sm text-muted-foreground">Real-time BioMetric alerts</p>
                </div>
                <Switch 
                  checked={juiceWatchEnabled}
                  onCheckedChange={setJuiceWatchEnabled}
                  data-testid="switch-juice-watch"
                />
              </div>

              {/* Gorilla Intensity */}
              <div>
                <h4 className="font-semibold text-card-foreground mb-4">Gorilla Intensity Level</h4>
                <RadioGroup 
                  value={gorillaIntensity} 
                  onValueChange={setGorillaIntensity}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="zen" id="zen" data-testid="radio-zen" />
                    <Label htmlFor="zen" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <span className="text-2xl">😌</span>
                      <div>
                        <div className="font-medium">Zen Gorilla</div>
                        <div className="text-sm text-muted-foreground">Subtle notifications, key insights only</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="alpha" id="alpha" data-testid="radio-alpha" />
                    <Label htmlFor="alpha" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <span className="text-2xl">🦍</span>
                      <div>
                        <div className="font-medium">Alpha Ape</div>
                        <div className="text-sm text-muted-foreground">Active alerts with moderate gorilla reactions</div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="bananas" id="bananas" data-testid="radio-bananas" />
                    <Label htmlFor="bananas" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <span className="text-2xl">🍌</span>
                      <div>
                        <div className="font-medium">Full Bananas</div>
                        <div className="text-sm text-muted-foreground">Maximum gorilla chaos, every metric spike</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-card-foreground">Satirical Mode</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">BETA</span>
                    <Checkbox 
                      checked={satiricalMode}
                      onCheckedChange={(checked) => setSatiricalMode(checked === true)}
                      data-testid="checkbox-satirical-mode"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gorilla Sound Effects</span>
                  <Checkbox 
                    checked={soundEffects}
                    onCheckedChange={(checked) => setSoundEffects(checked === true)}
                    data-testid="checkbox-sound-effects"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Push Notifications</span>
                  <Checkbox 
                    checked={pushNotifications}
                    onCheckedChange={(checked) => setPushNotifications(checked === true)}
                    data-testid="checkbox-push-notifications"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weekly Digest</span>
                  <Checkbox 
                    checked={weeklyDigest}
                    onCheckedChange={(checked) => setWeeklyDigest(checked === true)}
                    data-testid="checkbox-weekly-digest"
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-save-preferences"
              >
                Save Alert Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Alerts Feed */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-card border border-border">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-card-foreground">Live Alerts Feed</h3>
              <div className="flex items-center space-x-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 bg-destructive rounded-full"
                />
                <span className="text-destructive font-semibold">LIVE</span>
              </div>
            </div>

            <div className="space-y-6" data-testid="alerts-feed">
              {alerts.map((alert, index) => (
                <motion.div
                  key={`alert-${alert.id}-${alert.playerName}-${alert.metricType}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className={`border-l-4 ${getMetricColor(alert.metricType)} pl-4 py-2`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-card-foreground">
                      {alert.playerName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {alert.team} • {formatTimeAgo(alert.timestamp)}
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className={`font-medium ${getMetricTextColor(alert.metricType)}`}>
                      {alert.metricType}: 
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {alert.previousValue}→{alert.currentValue}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {alert.commentary}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Alert Summary */}
            <Separator className="my-8" />
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Today's Alert Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary" data-testid="alerts-sent-count">23</div>
                  <div className="text-sm text-muted-foreground">Alerts Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent" data-testid="hit-rate">18</div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-destructive" data-testid="profit">+5.2u</div>
                  <div className="text-sm text-muted-foreground">Profit</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Notification */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="lg:col-span-2"
      >
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 animate-pulse-glow">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Gorilla Achievement Unlocked!
              </h3>
              <p className="text-muted-foreground mb-4">
                You've followed 15 BioBoost alerts this week. Unlock premium gorilla insights and exclusive jungle access!
              </p>
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-claim-reward"
              >
                🎖️ Claim Reward
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
