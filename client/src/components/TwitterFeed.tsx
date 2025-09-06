import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Twitter, ExternalLink, RefreshCw } from 'lucide-react';
import { useIntersectionObserver } from '@/utils/hydration';

interface TwitterFeedProps {
  className?: string;
  height?: string;
  lazy?: boolean;
}

export default function TwitterFeed({ 
  className = '', 
  height = '400px',
  lazy = true 
}: TwitterFeedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer for lazy loading
  const { hasIntersected } = useIntersectionObserver(
    containerRef,
    { threshold: 0.1, rootMargin: '100px' },
    lazy
  );

  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || 'GuerillaGenics';
  const shouldLoad = lazy ? hasIntersected : true;

  useEffect(() => {
    if (!shouldLoad || isLoaded) return;

    // Load Twitter widget script
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.onload = () => {
      console.log('🦍 Twitter widgets loaded');
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.warn('🦍 Failed to load Twitter widgets');
      setHasError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      try {
        document.head.removeChild(script);
      } catch (e) {
        // Script may already be removed
      }
    };
  }, [shouldLoad, isLoaded]);

  const handleOpenTwitter = () => {
    window.open(`https://twitter.com/${twitterHandle}`, '_blank', 'noopener,noreferrer');
  };

  const handleRefresh = () => {
    setIsLoaded(false);
    setHasError(false);
    
    // Force reload Twitter widgets
    if (window.twttr?.widgets) {
      window.twttr.widgets.load();
      setIsLoaded(true);
    }
  };

  if (hasError) {
    return (
      <Card className={className} ref={containerRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            @{twitterHandle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-muted-foreground">
              <Twitter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Unable to load Twitter feed</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenTwitter}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} ref={containerRef}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Twitter className="w-5 h-5 text-[#1DA1F2]" />
            @{twitterHandle}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenTwitter}
            className="text-muted-foreground hover:text-[#1DA1F2]"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {shouldLoad ? (
          <div className="space-y-4">
            {/* Reserve space to prevent layout shift */}
            <div 
              style={{ minHeight: height }}
              className="relative overflow-hidden"
            >
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              )}
              
              {/* Twitter Timeline Embed */}
              <a
                className="twitter-timeline"
                data-height={height}
                data-theme="light"
                data-chrome="noheader nofooter noborders transparent"
                data-tweet-limit="5"
                href={`https://twitter.com/${twitterHandle}?ref_src=twsrc%5Etfw`}
              >
                Tweets by @{twitterHandle}
              </a>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Latest jungle updates</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenTwitter}
                className="h-auto p-1 text-xs"
              >
                Follow @{twitterHandle}
              </Button>
            </div>
          </div>
        ) : (
          // Placeholder while waiting for intersection
          <div 
            style={{ height }}
            className="flex items-center justify-center bg-muted/30 rounded-lg"
          >
            <div className="text-center text-muted-foreground">
              <Twitter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Twitter feed loading...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Extend window type for Twitter widgets
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: () => void;
      };
    };
  }
}