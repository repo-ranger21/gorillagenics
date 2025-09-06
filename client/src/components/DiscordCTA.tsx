import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Users, Zap, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/modules/funnel/clientFunnel';

interface DiscordCTAProps {
  variant?: 'card' | 'banner' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function DiscordCTA({ 
  variant = 'card', 
  size = 'md',
  className = '' 
}: DiscordCTAProps) {
  const discordUrl = import.meta.env.VITE_DISCORD_INVITE_URL || 'https://discord.gg/ZaRJJdQN';

  const handleJoinDiscord = () => {
    trackEvent('banner_click', { 
      action: 'discord_join', 
      variant, 
      source: 'discord_cta' 
    });
    
    window.open(discordUrl, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'button') {
    return (
      <Button
        onClick={handleJoinDiscord}
        className={`
          ${size === 'sm' ? 'px-3 py-2 text-sm' : size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2'}
          bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold transition-colors
          ${className}
        `}
        data-testid="discord-join-button"
      >
        <MessageCircle className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
        Join Discord
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white rounded-lg p-4
          ${className}
        `}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ bounce: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-2 bg-white/10 rounded-lg"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
            <div>
              <div className="font-bold text-lg">Join the Jungle Chat 🦍</div>
              <div className="text-sm opacity-90">Live slate talk, sweat parties, and banana memes</div>
            </div>
          </div>
          <Button
            onClick={handleJoinDiscord}
            variant="secondary"
            className="bg-white text-[#5865F2] hover:bg-gray-100 font-semibold"
            data-testid="discord-banner-join"
          >
            Join Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <Card className={`bg-gradient-to-br from-[#5865F2]/10 to-[#7289DA]/10 border-[#5865F2]/20 ${className}`}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Animated Discord icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 4 
            }}
            className="inline-flex p-3 bg-[#5865F2] rounded-full text-white"
          >
            <MessageCircle className="w-8 h-8" />
          </motion.div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Join the Jungle Chat 🦍
            </h3>
            <p className="text-muted-foreground">
              Live slate talk, sweat parties, and banana memes with fellow DFS gorillas
            </p>
          </div>

          {/* Features */}
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#5865F2]" />
              <span>Active Community</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Live Updates</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-green-500" />
              <span>Free Chat</span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleJoinDiscord}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3"
              data-testid="discord-card-join"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Join the Jungle Chat
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Fine print */}
          <p className="text-xs text-muted-foreground">
            Free forever • No spam • DFS talk only
          </p>
        </div>
      </CardContent>
    </Card>
  );
}