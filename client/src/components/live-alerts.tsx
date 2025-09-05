import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, TrendingUp, Cloud, Activity } from "lucide-react";

interface LiveAlert {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  timestamp: string;
  type: "bioboost" | "line_move" | "weather" | "injury";
}

interface LiveAlertsProps {
  alerts: LiveAlert[];
}

export default function LiveAlerts({ alerts }: LiveAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "bioboost":
        return <Activity className="w-4 h-4 text-green-400" />;
      case "line_move":
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case "weather":
        return <Cloud className="w-4 h-4 text-blue-400" />;
      case "injury":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case "bioboost":
        return "bg-green-600 hover:bg-green-700";
      case "line_move":
        return "bg-yellow-600 hover:bg-yellow-700";
      case "weather":
        return "bg-blue-600 hover:bg-blue-700";
      case "injury":
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="bg-background/20 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🚨 Juice Watch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🧘</div>
            <p className="text-muted-foreground">All quiet in the jungle...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Live alerts will appear here as they happen
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/20 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            🚨 Juice Watch
          </CardTitle>
          <Badge variant="outline" className="border-green-500 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            <AnimatePresence>
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 bg-background/30 rounded-lg border border-primary/10 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-xl">{alert.emoji}</span>
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground text-sm">
                          {alert.title}
                        </h4>
                        <Badge 
                          className={`text-xs ml-2 ${getAlertBadgeColor(alert.type)}`}
                        >
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-2">
                        {alert.detail}
                      </p>
                      
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}