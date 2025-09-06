import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Users, Gift, Clock, ExternalLink, Share2, CheckCircle } from 'lucide-react';
import { 
  getReferralStats, 
  generateReferralLink, 
  copyReferralLink, 
  formatDaysRemaining,
  type ReferralStats 
} from '@/modules/referrals/referralClient';

export default function ReferralDashboard() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, []);

  const loadReferralStats = async () => {
    setIsLoading(true);
    try {
      const data = await getReferralStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!stats) return;
    
    const success = await copyReferralLink(stats.refCode);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    
    const link = generateReferralLink(stats.refCode);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GuerillaGenics - Get Free Week!',
          text: 'Get smarter NFL picks with the jungle\'s best DFS analytics. Use my link for a free week!',
          url: link
        });
      } catch (error) {
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Referral Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Unable to load referral dashboard</p>
            <Button variant="outline" size="sm" onClick={loadReferralStats} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const referralLink = generateReferralLink(stats.refCode);

  return (
    <Card className="bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-950 dark:to-yellow-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Invite Friends, Get Free Weeks
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Each verified signup gives both of you +7 days of jungle access
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-background border rounded-lg text-sm font-mono break-all">
              {referralLink}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleCopyLink}
                    variant="outline" 
                    size="sm"
                    className="px-3"
                    data-testid="copy-referral-link"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copySuccess ? 'Copied!' : 'Copy link'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Share Button */}
        <Button 
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
          data-testid="share-referral-link"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Referral Link
        </Button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="text-center p-4 bg-background/50 rounded-lg border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-primary">{stats.signups}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Signups
            </div>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-background/50 rounded-lg border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-green-600">{stats.conversions}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </div>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-background/50 rounded-lg border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.rewardsActive}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Gift className="w-3 h-3" />
              Active Rewards
            </div>
          </motion.div>

          <motion.div
            className="text-center p-4 bg-background/50 rounded-lg border"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-2xl font-bold text-blue-600">
              {stats.daysRemaining > 0 ? stats.daysRemaining : 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Days Left
            </div>
          </motion.div>
        </div>

        {/* Active Rewards */}
        {stats.rewardsActive > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Active Rewards</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Referral Bonus</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {formatDaysRemaining(stats.daysRemaining)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-medium text-sm">How it works:</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Share your link with friends</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>They sign up and verify their email</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Both of you get +7 days of full access</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs mt-2 h-auto p-1"
            onClick={() => window.open('/legal/referral-terms', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Terms & Conditions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}