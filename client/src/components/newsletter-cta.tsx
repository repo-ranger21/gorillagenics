import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Star, Zap } from "lucide-react";

export default function NewsletterCTA() {
  const handleSubscribe = () => {
    // In production, this would integrate with Substack API
    // For now, open Substack in new tab
    window.open("https://substack.com", "_blank");
  };

  return (
    <Card className="bg-gradient-to-br from-yellow-500/20 to-primary/20 backdrop-blur-sm border-yellow-500/30">
      <CardHeader className="pb-4">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-4xl mb-3"
          >
            🦍
          </motion.div>
          
          <CardTitle className="text-xl font-bold text-yellow-400 mb-2">
            Join the Jungle Elite
          </CardTitle>
          
          <div className="flex items-center justify-center gap-2 mb-3">
            <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">
              <Star className="w-3 h-3 mr-1" />
              Premium
            </Badge>
            <Badge className="bg-green-600 hover:bg-green-700 text-white">
              $10/month
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-foreground">Daily DFS picks with BioBoost analysis</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-foreground">Exclusive line movement alerts</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-foreground">Advanced metrics & contrarian plays</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <span className="text-foreground">Gorilla's satirical market commentary</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Button
            onClick={handleSubscribe}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3"
            data-testid="newsletter-subscribe-button"
          >
            <Mail className="w-4 h-4 mr-2" />
            Subscribe to Substack
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
        
        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="p-3 bg-background/30 rounded-lg border border-primary/10"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold">4.9/5</span>
          </div>
          <p className="text-xs text-muted-foreground italic">
            "Up 47% ROI this season thanks to the gorilla's picks!"
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            — Mike "BananaKing" Chen
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}