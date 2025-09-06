import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  avatar_url?: string;
  handle?: string;
  rating?: number;
  created_at?: string;
}

interface TestimonialCarouselProps {
  autoAdvance?: boolean;
  interval?: number;
  showControls?: boolean;
  className?: string;
}

// Mock testimonials (will be replaced with API data)
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alex R.',
    quote: 'The BioBoost edge paid my pizza tab three Sundays in a row. Best $10 I ever spent.',
    rating: 5,
    handle: '@alexr_dfs'
  },
  {
    id: '2',
    name: 'Sarah M.',
    quote: 'Finally, DFS picks that actually explain WHY. The jungle intel is pure gold.',
    rating: 5,
    handle: '@sarahdfs'
  },
  {
    id: '3',
    name: 'Mike T.',
    quote: 'Juice Watch alerts saved me from a terrible Thursday night stack. GuerillaGenics knows the game.',
    rating: 5,
    handle: '@mike_stacks'
  },
  {
    id: '4',
    name: 'Jessica K.',
    quote: 'From amateur to profitable in 6 weeks. The gorilla intel is legit.',
    rating: 5,
    handle: '@jess_dfs_pro'
  },
  {
    id: '5',
    name: 'David L.',
    quote: 'Best DFS research tool I\'ve used. The BioBoost scores are money.',
    rating: 5,
    handle: '@david_lineups'
  }
];

export default function TestimonialCarousel({
  autoAdvance = true,
  interval = 5000,
  showControls = true,
  className = ''
}: TestimonialCarouselProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load testimonials from API
  useEffect(() => {
    loadTestimonials();
  }, []);

  // Auto-advance functionality
  useEffect(() => {
    if (!autoAdvance || isPaused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoAdvance, interval, isPaused, testimonials.length]);

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/testimonials');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setTestimonials(data);
        }
      }
    } catch (error) {
      console.warn('🦍 Failed to load testimonials, using defaults:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse mx-auto" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse" />
            </div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (testimonials.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Quote className="w-8 h-8 mx-auto mb-4 opacity-50" />
          <p>No testimonials available</p>
        </CardContent>
      </Card>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <Card 
      className={`${className} relative overflow-hidden bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-950 dark:to-yellow-900`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Quote icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <Quote className="w-8 h-8 text-primary/30" />
          </motion.div>

          {/* Testimonial content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="space-y-4"
            >
              {/* Quote */}
              <blockquote className="text-lg font-medium text-foreground leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Rating */}
              {currentTestimonial.rating && (
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < currentTestimonial.rating!
                          ? 'text-yellow-500 fill-current'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Author */}
              <div className="space-y-2">
                <div className="font-semibold text-foreground">
                  {currentTestimonial.name}
                </div>
                {currentTestimonial.handle && (
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.handle}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'bg-primary scale-125'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Navigation controls */}
        {showControls && testimonials.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevTestimonial}
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTestimonial}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Pause indicator */}
        {isPaused && autoAdvance && (
          <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Paused
          </div>
        )}
      </CardContent>
    </Card>
  );
}