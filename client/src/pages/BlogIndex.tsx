import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';
import JsonLd, { organizationSchema } from '@/components/JsonLd';
import { Calendar, Clock, Search, Tag, ArrowRight, BookOpen, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  published_at: string;
  author: string;
  tags: string[];
  wordCount: number;
}

export default function BlogIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: blogData, isLoading } = useQuery({
    queryKey: ['/api/blog', { limit: 20 }],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['/api/blog/tags/list'],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const posts = blogData?.posts || [];
  
  // Filter posts based on search and tag
  const filteredPosts = posts.filter((post: BlogPost) => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === null || 
      post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
    
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (wordCount: number) => {
    return Math.ceil(wordCount / 200); // 200 WPM average
  };

  if (isLoading) {
    return (
      <>
        <SEO
          title="DFS & NFL Betting Blog"
          description="Expert analysis, strategy guides, and weekly insights for NFL DFS and sports betting. Learn from the GuerillaGenics research team."
        />
        
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-green-950 dark:via-gray-950 dark:to-yellow-900">
          <div className="container mx-auto px-4 py-12">
            <div className="space-y-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-48 animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="DFS & NFL Betting Blog"
        description="Expert analysis, strategy guides, and weekly insights for NFL DFS and sports betting. Learn advanced strategies from the GuerillaGenics research team."
        keywords="NFL DFS blog, fantasy football strategy, sports betting analysis, DFS tips, NFL picks analysis"
      />
      
      <JsonLd data={organizationSchema()} />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-green-950 dark:via-gray-950 dark:to-yellow-900">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                📚
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-green-600 to-yellow-500 bg-clip-text text-transparent">
                Jungle Intelligence Hub
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Expert analysis, proven strategies, and weekly insights to dominate NFL DFS and sports betting.
              </p>
            </div>
          </motion.section>

          {/* Search and Filter Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-12"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-lg"
                  data-testid="blog-search"
                />
              </div>

              {/* Tag Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedTag === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  data-testid="tag-filter-all"
                >
                  All Posts
                </Button>
                {tags.slice(0, 8).map((tag: any) => (
                  <Button
                    key={tag.tag}
                    variant={selectedTag === tag.tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(tag.tag)}
                    data-testid={`tag-filter-${tag.tag.toLowerCase()}`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.tag} ({tag.count})
                  </Button>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Blog Posts Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="max-w-6xl mx-auto">
              {filteredPosts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || selectedTag 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Blog posts are coming soon! Check back for expert analysis and strategies.'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {filteredPosts.map((post: BlogPost, index: number) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <Link href={`/blog/${post.slug}`}>
                          <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                            {post.cover_image && (
                              <div className="aspect-video overflow-hidden rounded-t-lg">
                                <img
                                  src={post.cover_image}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            
                            <CardHeader>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.published_at)}</span>
                                <Clock className="w-4 h-4 ml-2" />
                                <span>{getReadingTime(post.wordCount)} min read</span>
                              </div>
                              
                              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </CardTitle>
                            </CardHeader>
                            
                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground line-clamp-3">
                                {post.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>{post.author}</span>
                                </div>
                                
                                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.section>

          {/* CTA Section */}
          {posts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-16 text-center"
            >
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-green-600/5 border-primary/20">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-4">Ready to Apply These Strategies?</h2>
                  <p className="text-muted-foreground mb-6">
                    Get our weekly picks and put this analysis to work with real NFL games.
                  </p>
                  
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                    onClick={() => window.location.href = '/weekly-picks'}
                    data-testid="blog-cta-picks"
                  >
                    View This Week's Picks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </div>
      </div>
    </>
  );
}