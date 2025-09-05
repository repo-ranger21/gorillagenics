import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Wifi, AlertTriangle } from "lucide-react";
import NewsletterCTA from "./NewsletterCTA";

export default function FallbackContent({ 
  onRetry, 
  lastKnownData = null, 
  error = null,
  className = "" 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alert */}
      <Alert variant="destructive" className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || "Unable to load weekly picks data. Don't worry, we'll get you covered!"}
        </AlertDescription>
      </Alert>

      {/* Main Fallback Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Wifi className="w-6 h-6 text-orange-500" />
                </motion.div>
                <div>
                  <span>Data Swinging In Late!</span>
                  <p className="text-sm text-muted-foreground font-normal">
                    Our gorillas are working hard to fetch the latest picks
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-6xl">🦍</div>
                
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    While we swing through the data trees, here's what you can do:
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={onRetry}
                      className="flex items-center gap-2"
                      data-testid="retry-data-fetch"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.reload()}
                      data-testid="refresh-page"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>

                {/* Status Messages */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span>Checking NFL schedule API...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Loading BioBoost calculations...</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Fetching latest line movements...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cached Data Display */}
          {lastKnownData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-lg">
                    📚 Last Known Picks (Cached)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-blue-700">
                      Here are the most recent picks we have on file:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lastKnownData.slice(0, 4).map((pick, index) => (
                        <div 
                          key={pick.id || index}
                          className="bg-white p-3 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">
                                {pick.away?.team || 'Away'} @ {pick.home?.team || 'Home'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {pick.date} • {pick.time}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-primary">
                                {pick.predicted || 'TBD'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {pick.confidence || 'Medium'} Conf.
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-blue-600 italic text-center">
                      ⚠️ Data may be outdated. Refresh to get latest picks.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tips & Alternatives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 While You Wait...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Quick Tips:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Check our BioBoost calculator</li>
                    <li>• Review Week 1 matchups</li>
                    <li>• Browse injury reports</li>
                    <li>• Study betting trends</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Need Help?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Data usually updates by Tuesday</li>
                    <li>• Try refreshing in a few minutes</li>
                    <li>• Check your internet connection</li>
                    <li>• Contact support if issues persist</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter CTA Sidebar */}
        <div>
          <NewsletterCTA variant="fallback" />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          🦍 <strong>Reminder:</strong> All picks are for educational and entertainment purposes only. 
          GuerillaGenics promotes responsible betting practices. Never bet more than you can afford to lose.
        </div>
      </div>
    </div>
  );
}