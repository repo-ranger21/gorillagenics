import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import notificationService from "@/services/notificationService";
import { Bell, BellOff, Settings, TestTube, Shield, Smartphone } from "lucide-react";

export default function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    juiceWatch: true,
    lineMovements: true,
    playerUpdates: true,
    weeklyDigest: true,
    criticalOnly: false
  });
  
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      setPermission(Notification.permission);
      setIsSubscribed(notificationService.isSubscribed());
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await notificationService.subscribe();
      if (subscription) {
        setIsSubscribed(true);
        setPermission('granted');
        toast({
          title: "🔔 Notifications Enabled",
          description: "You'll now receive Juice Watch alerts and updates from the jungle!",
        });
      } else {
        toast({
          title: "Permission Required",
          description: "Please allow notifications to receive Juice Watch alerts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await notificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
        toast({
          title: "🔕 Notifications Disabled",
          description: "You will no longer receive push notifications.",
        });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to disable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isSubscribed) {
      toast({
        title: "Not Subscribed",
        description: "Please enable notifications first to test them.",
        variant: "destructive",
      });
      return;
    }

    try {
      await notificationService.sendTestNotification();
      
      // Also show a local notification for immediate feedback
      notificationService.showLocalNotification({
        title: '🦍 Test Alert from the Jungle!',
        body: 'This is a test notification. Your Juice Watch alerts are working perfectly!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      
      toast({
        title: "🧪 Test Sent",
        description: "Check for the notification! It should appear any second now.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Failed to send test notification. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    // In production, save settings to server
    toast({
      title: "Settings Updated",
      description: `${setting} notifications ${settings[setting] ? 'disabled' : 'enabled'}.`,
    });
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-primary text-primary-foreground">Allowed</Badge>;
      case 'denied':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (permission === 'denied') return <BellOff className="w-6 h-6 text-destructive" />;
    if (isSubscribed) return <Bell className="w-6 h-6 text-primary" />;
    return <Bell className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isSubscribed ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 2, repeat: isSubscribed ? Infinity : 0 }}
            >
              {getStatusIcon()}
            </motion.div>
            <div>
              <CardTitle className="text-2xl">🔔 Notification Settings</CardTitle>
              <p className="text-muted-foreground">
                Manage your Juice Watch alerts and push notifications
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
            <div>
              <div className="font-semibold text-foreground">Push Notifications</div>
              <div className="text-sm text-muted-foreground">
                Status: {getPermissionBadge()} • {isSubscribed ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            {permission === 'denied' ? (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">
                  Notifications are blocked in your browser
                </div>
                <Button variant="outline" size="sm" disabled>
                  <Shield className="w-4 h-4 mr-2" />
                  Blocked by Browser
                </Button>
              </div>
            ) : isSubscribed ? (
              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="outline"
                data-testid="unsubscribe-notifications-button"
              >
                <BellOff className="w-4 h-4 mr-2" />
                {isLoading ? "Disabling..." : "Disable"}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
                data-testid="subscribe-notifications-button"
              >
                <Bell className="w-4 h-4 mr-2" />
                {isLoading ? "Enabling..." : "Enable Notifications"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Notification */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Send a test notification to make sure everything is working properly.
            </p>
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="w-full"
              data-testid="test-notification-button"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Alert Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="juice-watch" className="font-semibold">
                  🧘 Juice Watch Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  BioBoost changes and performance shifts
                </p>
              </div>
              <Switch
                id="juice-watch"
                checked={settings.juiceWatch}
                onCheckedChange={() => handleSettingChange('juiceWatch')}
                data-testid="juice-watch-toggle"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="line-movements" className="font-semibold">
                  📈 Line Movements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Betting line changes and opportunities
                </p>
              </div>
              <Switch
                id="line-movements"
                checked={settings.lineMovements}
                onCheckedChange={() => handleSettingChange('lineMovements')}
                data-testid="line-movements-toggle"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="player-updates" className="font-semibold">
                  🏈 Player Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Injury reports and roster changes
                </p>
              </div>
              <Switch
                id="player-updates"
                checked={settings.playerUpdates}
                onCheckedChange={() => handleSettingChange('playerUpdates')}
                data-testid="player-updates-toggle"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weekly-digest" className="font-semibold">
                  📮 Weekly Digest
                </Label>
                <p className="text-sm text-muted-foreground">
                  Summary of weekly performance and insights
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleSettingChange('weeklyDigest')}
                data-testid="weekly-digest-toggle"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="critical-only" className="font-semibold">
                  🚨 Critical Alerts Only
                </Label>
                <p className="text-sm text-muted-foreground">
                  Only receive "Full Bananas" level alerts
                </p>
              </div>
              <Switch
                id="critical-only"
                checked={settings.criticalOnly}
                onCheckedChange={() => handleSettingChange('criticalOnly')}
                data-testid="critical-only-toggle"
              />
            </div>
          </div>

          {settings.criticalOnly && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
            >
              <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
                <span>🚨</span>
                Critical Mode Enabled
              </div>
              <p className="text-sm text-muted-foreground">
                You'll only receive notifications for major performance shifts and critical alerts. 
                Regular Juice Watch updates will be suppressed.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Browser Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Browser Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Notification Support:</span>
              <Badge variant={('Notification' in window) ? "default" : "destructive"}>
                {('Notification' in window) ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Worker:</span>
              <Badge variant={('serviceWorker' in navigator) ? "default" : "destructive"}>
                {('serviceWorker' in navigator) ? "Supported" : "Not Supported"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Push Messaging:</span>
              <Badge variant={('PushManager' in window) ? "default" : "destructive"}>
                {('PushManager' in window) ? "Supported" : "Not Supported"}
              </Badge>
            </div>
          </div>
          
          {permission === 'denied' && (
            <div className="mt-4 p-3 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>To enable notifications:</strong> Click the notification icon in your browser's address bar 
                or go to Settings → Privacy and Security → Site Settings → Notifications.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}