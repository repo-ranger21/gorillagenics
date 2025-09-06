import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell,
  TrendingUp,
  TrendingDown,
  Cloud,
  Activity,
  Zap,
  Clock,
  Filter,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface JuiceAlert {
  id: string;
  type: "line_movement" | "injury" | "weather" | "volume" | "sharp_money";
  title: string;
  description: string;
  team?: string;
  player?: string;
  oldValue?: string;
  newValue?: string;
  urgency: "low" | "medium" | "high";
  timestamp: string;
  impact: string;
  emoji: string;
}

export default function Alerts() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUrgency, setSelectedUrgency] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/alerts', { type: selectedType, urgency: selectedUrgency }],
    refetchInterval: autoRefresh ? 15000 : false, // Refresh every 15 seconds if enabled
  });

  const alertTypes = [
    { value: "all", label: "All Alerts", icon: Bell, count: alerts.length },
    { value: "line_movement", label: "Line Movement", icon: TrendingUp, count: alerts.filter((a: JuiceAlert) => a.type === "line_movement").length },
    { value: "injury", label: "Injuries", icon: Activity, count: alerts.filter((a: JuiceAlert) => a.type === "injury").length },
    { value: "weather", label: "Weather", icon: Cloud, count: alerts.filter((a: JuiceAlert) => a.type === "weather").length },
    { value: "sharp_money", label: "Sharp Money", icon: Zap, count: alerts.filter((a: JuiceAlert) => a.type === "sharp_money").length }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-banana text-black';
      case 'low': return 'bg-vine text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertBorderColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-50/50';
      case 'medium': return 'border-l-banana bg-banana/5';
      case 'low': return 'border-l-vine bg-vine/5';
      default: return 'border-l-gray-300 bg-gray-50/50';
    }
  };

  const filteredAlerts = alerts.filter((alert: JuiceAlert) => {
    const matchesType = selectedType === "all" || alert.type === selectedType;
    const matchesUrgency = selectedUrgency === "all" || alert.urgency === selectedUrgency;
    return matchesType && matchesUrgency;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🔔</div>
          <div className="text-xl font-semibold text-jungle mb-2">Loading Juice Watch...</div>
          <div className="text-muted-foreground">Monitoring line movements and market shifts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-jungle to-vine border-b border-jungle/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Bell className="w-8 h-8 text-banana" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Juice Watch Alerts</h1>
                  <p className="text-banana text-lg">Real-time line movements and betting intelligence</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-vine animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white/80 text-sm">
                  {autoRefresh ? 'Live Updates' : 'Paused'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {autoRefresh ? 'Pause' : 'Resume'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="refresh-alerts"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Alert Type Filters */}
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          {alertTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.value;
            
            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isActive ? 'ring-2 ring-jungle bg-jungle/5' : ''
                }`}
                onClick={() => setSelectedType(type.value)}
                data-testid={`filter-${type.value}`}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-jungle' : 'text-muted-foreground'}`} />
                  <div className={`font-medium text-sm ${isActive ? 'text-jungle' : ''}`}>
                    {type.label}
                  </div>
                  <div className="text-2xl font-bold text-jungle mt-1">{type.count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium">Filter by urgency:</span>
          <div className="flex gap-2">
            {["all", "high", "medium", "low"].map((urgency) => (
              <Button
                key={urgency}
                variant={selectedUrgency === urgency ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedUrgency(urgency)}
                className={selectedUrgency === urgency ? "bg-jungle text-white" : ""}
                data-testid={`urgency-${urgency}`}
              >
                {urgency === "all" ? "All" : urgency.charAt(0).toUpperCase() + urgency.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Alerts Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.map((alert: JuiceAlert, index: number) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                data-testid={`alert-${alert.id}`}
              >
                <Card className={`border-l-4 ${getAlertBorderColor(alert.urgency)} hover:shadow-lg transition-all duration-200`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{alert.emoji}</div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg text-jungle">{alert.title}</h3>
                            <p className="text-muted-foreground mt-1">{alert.description}</p>
                            
                            {alert.oldValue && alert.newValue && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  From: {alert.oldValue}
                                </Badge>
                                <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                <Badge variant="outline" className="text-xs">
                                  To: {alert.newValue}
                                </Badge>
                              </div>
                            )}
                            
                            <div className="text-sm text-jungle font-medium mt-2">
                              📊 Impact: {alert.impact}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getUrgencyColor(alert.urgency)}>
                              {alert.urgency.toUpperCase()}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        {(alert.team || alert.player) && (
                          <div className="flex items-center gap-2 mt-3">
                            {alert.team && (
                              <Badge variant="outline" className="bg-jungle/10 text-jungle">
                                {alert.team}
                              </Badge>
                            )}
                            {alert.player && (
                              <Badge variant="outline" className="bg-vine/10 text-vine">
                                {alert.player}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🍌</div>
            <div className="text-xl font-semibold text-jungle mb-2">No Alerts Found</div>
            <div className="text-muted-foreground">
              {selectedType === "all" && selectedUrgency === "all" 
                ? "The jungle is quiet right now — no significant movements detected"
                : "Try adjusting your filters to see more alerts"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}