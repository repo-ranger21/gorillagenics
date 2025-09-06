const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Mock blog posts data (in production, use database or file system)
const blogPosts = [
  {
    id: '1',
    slug: 'dfs-value-picks-week-1',
    title: 'Week 1 DFS Value Picks: Sleepers & Stacks',
    excerpt: 'Uncover the hidden gems for Week 1 DFS slates. Our BioBoost analysis reveals surprising value plays that could make or break your lineups.',
    body_md: `# Week 1 DFS Value Picks: Sleepers & Stacks

The NFL season is back, and so are the opportunities to cash big in DFS. Our BioBoost analysis has uncovered some serious value plays for Week 1 that the field is sleeping on.

## Top Value QB

**Geno Smith ($6,200 DK)** - Don't sleep on Seattle's signal-caller. His BioBoost score is through the roof thanks to excellent sleep metrics and low cortisol levels. The Seahawks offense is poised to surprise.

## Running Back Gems

- **Kenneth Walker III ($5,800 DK)** - Elite hydration levels suggest he's primed for a big workload
- **Rachaad White ($5,400 DK)** - Tampa's new lead back with sky-high testosterone proxy scores

## Wide Receiver Values

The WR position is loaded with value this week...

*[Content continues...]*`,
    cover_image: '/images/blog/week-1-values.jpg',
    published_at: '2024-09-03T10:00:00Z',
    author: 'GuerillaGenics Research Team',
    tags: ['DFS', 'Week 1', 'Value Picks', 'NFL'],
    status: 'published'
  },
  {
    id: '2',
    slug: 'bankroll-management-dfs-beginners',
    title: 'Bankroll Management for DFS Beginners',
    excerpt: 'Master the fundamentals of bankroll management to survive and thrive in DFS. Learn the 5% rule, tournament vs. cash game allocation, and more.',
    body_md: `# Bankroll Management for DFS Beginners

Starting your DFS journey? The #1 mistake beginners make isn't bad picks - it's poor bankroll management. Here's how to protect your investment while maximizing upside.

## The 5% Rule

Never risk more than 5% of your total bankroll on any single contest. This simple rule has saved countless players from going busto.

## Tournament vs. Cash Games

Split your bankroll:
- 70% Cash games (50/50s, Double-ups)
- 30% Tournaments (GPPs, Millionaire Makers)

## Building Your Roll

*[Content continues...]*`,
    cover_image: '/images/blog/bankroll-basics.jpg',
    published_at: '2024-08-28T14:30:00Z',
    author: 'GuerillaGenics Research Team',
    tags: ['Bankroll', 'Beginners', 'Strategy', 'DFS'],
    status: 'published'
  },
  {
    id: '3',
    slug: 'bioboost-system-explained',
    title: 'The BioBoost System: Science Meets DFS',
    excerpt: 'Deep dive into our proprietary BioBoost scoring system. Learn how sleep patterns, cortisol levels, and hydration impact player performance.',
    body_md: `# The BioBoost System: Science Meets DFS

What if player performance wasn't just about talent and matchups? What if biological factors could predict breakout games before they happen?

## The Science Behind BioBoost

Our BioBoost system analyzes five key biometric indicators:

### 1. Sleep Score (30% weight)
Quality sleep directly correlates with reaction time, decision-making, and injury prevention.

### 2. Testosterone Proxy (40% weight)
Higher T-levels predict aggression, confidence, and explosive plays.

### 3. Cortisol Proxy (15% weight)
Lower stress hormones mean better focus under pressure.

### 4. Hydration Level (10% weight)
Proper hydration prevents late-game fatigue and cramping.

### 5. Injury Recovery (5% weight)
How well a player's body is recovering from previous games.

*[Content continues...]*`,
    cover_image: '/images/blog/bioboost-science.jpg',
    published_at: '2024-08-15T09:00:00Z',
    author: 'Dr. Sarah Chen, Sports Science Consultant',
    tags: ['BioBoost', 'Science', 'Analytics', 'NFL'],
    status: 'published'
  }
];

// GET /api/blog - Get all blog posts
router.get('/', (req, res) => {
  try {
    const { limit = 10, offset = 0, tag, author, status = 'published' } = req.query;
    
    let posts = blogPosts.filter(post => post.status === status);
    
    // Filter by tag if specified
    if (tag) {
      posts = posts.filter(post => 
        post.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      );
    }
    
    // Filter by author if specified
    if (author) {
      posts = posts.filter(post => 
        post.author.toLowerCase().includes(author.toLowerCase())
      );
    }
    
    // Sort by publication date (newest first)
    posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
    
    // Apply pagination
    const paginatedPosts = posts.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    
    // Return summary data (no full body)
    const summaryPosts = paginatedPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      published_at: post.published_at,
      author: post.author,
      tags: post.tags,
      wordCount: post.body_md ? post.body_md.length : 0
    }));
    
    console.log(`📖 Served ${summaryPosts.length} blog posts`);
    
    res.json({
      posts: summaryPosts,
      total: posts.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < posts.length
    });
    
  } catch (error) {
    console.error('Blog posts error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/blog/:slug - Get specific blog post
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = blogPosts.find(p => p.slug === slug && p.status === 'published');
    
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    // Add reading time estimate (words per minute)
    const wordCount = post.body_md ? post.body_md.split(' ').length : 0;
    const readingTime = Math.ceil(wordCount / 200); // 200 WPM average
    
    const fullPost = {
      ...post,
      wordCount,
      readingTime,
      related: getRelatedPosts(post, 3)
    };
    
    console.log(`📄 Served blog post: ${slug}`);
    
    res.json(fullPost);
    
  } catch (error) {
    console.error('Blog post fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// GET /api/blog/tags/list - Get all tags
router.get('/tags/list', (req, res) => {
  try {
    const allTags = blogPosts
      .filter(post => post.status === 'published')
      .flatMap(post => post.tags || []);
    
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
    
    res.json(sortedTags);
    
  } catch (error) {
    console.error('Blog tags error:', error);
    res.status(500).json({ error: 'Failed to fetch blog tags' });
  }
});

// GET /api/blog/authors/list - Get all authors
router.get('/authors/list', (req, res) => {
  try {
    const authors = [...new Set(blogPosts
      .filter(post => post.status === 'published')
      .map(post => post.author)
    )];
    
    const authorStats = authors.map(author => ({
      name: author,
      postCount: blogPosts.filter(p => p.author === author && p.status === 'published').length
    }));
    
    res.json(authorStats);
    
  } catch (error) {
    console.error('Blog authors error:', error);
    res.status(500).json({ error: 'Failed to fetch blog authors' });
  }
});

// Helper function to get related posts
function getRelatedPosts(currentPost, limit = 3) {
  const related = blogPosts
    .filter(post => 
      post.id !== currentPost.id && 
      post.status === 'published' &&
      post.tags?.some(tag => currentPost.tags?.includes(tag))
    )
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, limit)
    .map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      cover_image: post.cover_image,
      published_at: post.published_at,
      author: post.author
    }));
  
  return related;
}

// POST /api/blog - Create new blog post (admin only)
router.post('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const { title, excerpt, body_md, cover_image, author, tags, status = 'draft' } = req.body;
    
    if (!title || !excerpt || !body_md) {
      return res.status(400).json({ error: 'Title, excerpt, and body are required' });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Check for duplicate slug
    if (blogPosts.find(p => p.slug === slug)) {
      return res.status(400).json({ error: 'A post with this title already exists' });
    }
    
    const newPost = {
      id: Date.now().toString(),
      slug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      body_md: body_md.trim(),
      cover_image: cover_image || null,
      published_at: status === 'published' ? new Date().toISOString() : null,
      author: author || 'GuerillaGenics Research Team',
      tags: tags || [],
      status
    };
    
    blogPosts.push(newPost);
    
    console.log(`✍️ New blog post created: ${title}`);
    
    res.status(201).json(newPost);
    
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

module.exports = router;