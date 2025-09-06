import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import DiscordCTA from '@/components/DiscordCTA';
import SEO from '@/components/SEO';
import JsonLd, { reviewSchema } from '@/components/JsonLd';
import { Star, Users, MessageSquare, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Testimonials() {
  const { data: testimonials = [] } = useQuery({
    queryKey: ['/api/testimonials'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/testimonials/stats/summary'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Generate review schema for SEO
  const reviewData = testimonials.length > 0 ? reviewSchema(
    testimonials.map((t: any) => ({
      author: t.name,
      rating: t.rating || 5,
      text: t.quote,
      date: t.created_at
    }))
  ) : null;

  return (
    <>
      <SEO
        title="Customer Reviews & Testimonials"
        description="See what our community says about GuerillaGenics. Real reviews from DFS players who've improved their game with our NFL analytics and weekly picks."
        keywords="GuerillaGenics reviews, DFS testimonials, NFL betting reviews, customer feedback, fantasy football analytics reviews"
      />
      
      {reviewData && <JsonLd data={reviewData} />}

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-green-950 dark:via-gray-950 dark:to-yellow-900">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🦍
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-green-600 to-yellow-500 bg-clip-text text-transparent">
                Jungle Success Stories
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Real feedback from DFS players who've leveled up their game with GuerillaGenics. 
                Join the pack and start winning consistently.
              </p>

              {/* Stats Row */}
              {stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex justify-center gap-8 mt-8"
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-3xl font-bold text-yellow-500">
                      {stats.averageRating}
                      <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.fiveStarCount}</div>
                    <div className="text-sm text-muted-foreground">5-Star Reviews</div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Main Testimonial Carousel */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-16"
          >
            <TestimonialCarousel 
              autoAdvance={true}
              interval={6000}
              showControls={true}
              className="max-w-4xl mx-auto"
            />
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Proven Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our BioBoost system has helped thousands of players improve their DFS performance and bankroll growth.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Active Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join our Discord community where members share strategies, celebrate wins, and support each other.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-6 h-6 text-yellow-600" />
                  </div>
                  <CardTitle className="text-lg">Expert Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Weekly picks backed by scientific BioBoost analysis and real-time Juice Watch alerts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.section>

          {/* Discord CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="mb-16"
          >
            <div className="max-w-2xl mx-auto">
              <DiscordCTA variant="card" className="w-full" />
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-green-600/5 border-primary/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Ready to Join the Pack?</h2>
                <p className="text-muted-foreground mb-6">
                  Start your journey to consistent DFS profits with our proven BioBoost system and expert weekly picks.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                    onClick={() => window.open(import.meta.env.VITE_SUBSTACK_PUBLICATION, '_blank')}
                    data-testid="testimonials-subscribe"
                  >
                    Get Weekly Picks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.location.href = '/weekly-picks'}
                    data-testid="testimonials-free-picks"
                  >
                    View Free Picks
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-4">
                  2 free picks per week • No credit card required • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </motion.section>
        </div>
      </div>
    </>
  );
}