import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Player } from "@shared/schema";
import notificationService from "@/services/notificationService";
import { Bell, Send, TestTube } from "lucide-react";

export default function JuiceWatchNotificationTrigger() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [alertType, setAlertType] = useState<'zen_gorilla' | 'alpha_ape' | 'full_bananas'>('alpha_ape');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  // Fetch players for selection
  const { data: players } = useQuery<Player[]>({
    queryKey: ['/api/players'],
  });

  const handleTriggerAlert = async () => {
    if (!selectedPlayer) {
      toast({
        title: "Player Required",
        description: "Please select a player to trigger an alert for.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First trigger the server-side alert
      const response = await fetch('/api/notifications/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: selectedPlayer,
          alertType,
          message: customMessage || undefined
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Also show a local notification for immediate feedback
        const player = players?.find(p => p.id === selectedPlayer);
        const alertEmojis = {
          zen_gorilla: '🧘',
          alpha_ape: '⚡',
          full_bananas: '🚨'
        };
        
        notificationService.showLocalNotification({
          title: `${alertEmojis[alertType]} Juice Watch Alert: ${player?.name}`,
          body: customMessage || result.payload?.body || 'BioBoost metrics have changed!',
          icon: '/favicon.ico',
          url: `/player/${selectedPlayer}`,
          tag: `juice-watch-${selectedPlayer}`,
          requireInteraction: alertType === 'full_bananas'
        });

        toast({
          title: "🔔 Alert Triggered",
          description: `Juice Watch alert sent for ${player?.name}`,
        });

        // Reset form
        setCustomMessage('');
      } else {
        throw new Error(result.message || 'Failed to trigger alert');
      }
    } catch (error) {
      console.error('Error triggering alert:', error);
      toast({
        title: "Alert Failed",
        description: "Failed to trigger Juice Watch alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const alertTypeInfo = {
    zen_gorilla: {
      emoji: '🧘',
      label: 'Zen Gorilla',
      description: 'Calm metrics - player stable',
      color: 'text-primary'
    },
    alpha_ape: {
      emoji: '⚡',
      label: 'Alpha Ape',
      description: 'Opportunity detected - significant change',
      color: 'text-accent'
    },
    full_bananas: {
      emoji: '🚨',
      label: 'Full Bananas',
      description: 'CRITICAL - major performance shift',
      color: 'text-destructive'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            🧪 Juice Watch Alert Trigger
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manually trigger Juice Watch notifications for testing and demonstration
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Selection */}
          <div className="space-y-2">
            <Label htmlFor="player-select">Select Player</Label>
            <Select
              value={selectedPlayer}
              onValueChange={setSelectedPlayer}
            >
              <SelectTrigger id="player-select" data-testid="player-select">
                <SelectValue placeholder="Choose a player..." />
              </SelectTrigger>
              <SelectContent>
                {players?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} - {player.position} ({player.team})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alert Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="alert-type">Alert Level</Label>
            <Select
              value={alertType}
              onValueChange={(value: 'zen_gorilla' | 'alpha_ape' | 'full_bananas') => setAlertType(value)}
            >
              <SelectTrigger id="alert-type" data-testid="alert-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(alertTypeInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span>{info.emoji}</span>
                      <span className={info.color}>{info.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Alert Type Info */}
            <div className="p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{alertTypeInfo[alertType].emoji}</span>
                <span className={`font-semibold ${alertTypeInfo[alertType].color}`}>
                  {alertTypeInfo[alertType].label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {alertTypeInfo[alertType].description}
              </p>
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Custom Message (Optional)</Label>
            <Textarea
              id="custom-message"
              placeholder="Enter a custom alert message or leave blank for default..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              data-testid="custom-message-input"
            />
          </div>

          {/* Trigger Button */}
          <Button
            onClick={handleTriggerAlert}
            disabled={isLoading || !selectedPlayer}
            className="w-full bg-primary hover:bg-primary/90"
            data-testid="trigger-alert-button"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Triggering Alert..." : "Trigger Juice Watch Alert"}
          </Button>

          {/* Info Box */}
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <TestTube className="w-4 h-4" />
              Testing & Demo Tool
            </div>
            <p className="text-sm text-muted-foreground">
              This tool simulates real Juice Watch alerts that would normally be triggered automatically 
              when BioBoost metrics change significantly. In production, these alerts would be sent based 
              on actual player data updates and algorithm detection.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}