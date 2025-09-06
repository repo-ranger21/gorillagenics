const express = require('express');
const router = express.Router();

// Mock testimonials data (in production, use database)
const testimonials = [
  {
    id: '1',
    name: 'Alex R.',
    quote: 'The BioBoost edge paid my pizza tab three Sundays in a row. Best $10 I ever spent.',
    avatar_url: null,
    handle: '@alexr_dfs',
    rating: 5,
    active: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2', 
    name: 'Sarah M.',
    quote: 'Finally, DFS picks that actually explain WHY. The jungle intel is pure gold.',
    avatar_url: null,
    handle: '@sarahdfs',
    rating: 5,
    active: true,
    created_at: '2024-01-20T14:30:00Z'
  },
  {
    id: '3',
    name: 'Mike T.',
    quote: 'Juice Watch alerts saved me from a terrible Thursday night stack. GuerillaGenics knows the game.',
    avatar_url: null,
    handle: '@mike_stacks',
    rating: 5,
    active: true,
    created_at: '2024-02-01T09:15:00Z'
  },
  {
    id: '4',
    name: 'Jessica K.',
    quote: 'From amateur to profitable in 6 weeks. The gorilla intel is legit.',
    avatar_url: null,
    handle: '@jess_dfs_pro', 
    rating: 5,
    active: true,
    created_at: '2024-02-10T16:45:00Z'
  },
  {
    id: '5',
    name: 'David L.',
    quote: 'Best DFS research tool I\'ve used. The BioBoost scores are money.',
    avatar_url: null,
    handle: '@david_lineups',
    rating: 5,
    active: true,
    created_at: '2024-02-15T11:20:00Z'
  },
  {
    id: '6',
    name: 'Rachel P.',
    quote: 'The weekly picks hit at 68% last month. My bankroll is officially in gorilla mode.',
    avatar_url: null,
    handle: '@rachel_dfs',
    rating: 5,
    active: true,
    created_at: '2024-02-20T13:10:00Z'
  },
  {
    id: '7',
    name: 'Tom W.',
    quote: 'Love the Discord community. Everyone helps each other, no gatekeeping.',
    avatar_url: null,
    handle: '@tomw_stacks',
    rating: 5,
    active: true,
    created_at: '2024-02-25T08:30:00Z'
  },
  {
    id: '8',
    name: 'Lisa H.',
    quote: 'The BioBoost system is genius. Sleep scores actually matter for QB performance!',
    avatar_url: null,
    handle: '@lisa_analytics',
    rating: 5,
    active: true,
    created_at: '2024-03-01T15:00:00Z'
  }
];

// GET /api/testimonials - Get all active testimonials
router.get('/', (req, res) => {
  try {
    const { limit = 10, random = false } = req.query;
    
    // Filter active testimonials
    let activeTestimonials = testimonials.filter(t => t.active);
    
    // Randomize if requested
    if (random === 'true') {
      activeTestimonials = activeTestimonials
        .sort(() => Math.random() - 0.5)
        .slice(0, parseInt(limit));
    } else {
      // Sort by creation date (newest first) and limit
      activeTestimonials = activeTestimonials
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, parseInt(limit));
    }
    
    console.log(`📣 Served ${activeTestimonials.length} testimonials`);
    
    res.json(activeTestimonials);
    
  } catch (error) {
    console.error('Testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// GET /api/testimonials/:id - Get specific testimonial
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = testimonials.find(t => t.id === id && t.active);
    
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    res.json(testimonial);
    
  } catch (error) {
    console.error('Testimonial fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// GET /api/testimonials/stats/summary - Get testimonial statistics
router.get('/stats/summary', (req, res) => {
  try {
    const activeTestimonials = testimonials.filter(t => t.active);
    const totalRating = activeTestimonials.reduce((sum, t) => sum + (t.rating || 5), 0);
    const averageRating = totalRating / activeTestimonials.length;
    
    const stats = {
      total: activeTestimonials.length,
      averageRating: Math.round(averageRating * 10) / 10,
      fiveStarCount: activeTestimonials.filter(t => t.rating === 5).length,
      withHandles: activeTestimonials.filter(t => t.handle).length,
      mostRecent: activeTestimonials
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Testimonial stats error:', error);
    res.status(500).json({ error: 'Failed to get testimonial stats' });
  }
});

// POST /api/testimonials - Add new testimonial (admin only in production)
router.post('/', (req, res) => {
  // In production, add proper authentication
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const { name, quote, avatar_url, handle, rating = 5 } = req.body;
    
    if (!name || !quote) {
      return res.status(400).json({ error: 'Name and quote are required' });
    }
    
    const newTestimonial = {
      id: Date.now().toString(),
      name: name.trim(),
      quote: quote.trim(),
      avatar_url: avatar_url || null,
      handle: handle || null,
      rating: Math.max(1, Math.min(5, rating)),
      active: true,
      created_at: new Date().toISOString()
    };
    
    testimonials.push(newTestimonial);
    
    console.log(`✨ New testimonial added: ${name}`);
    
    res.status(201).json(newTestimonial);
    
  } catch (error) {
    console.error('Add testimonial error:', error);
    res.status(500).json({ error: 'Failed to add testimonial' });
  }
});

// PUT /api/testimonials/:id - Update testimonial (admin only)
router.put('/:id', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const testimonialIndex = testimonials.findIndex(t => t.id === id);
    
    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    // Update testimonial
    testimonials[testimonialIndex] = {
      ...testimonials[testimonialIndex],
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    };
    
    console.log(`📝 Updated testimonial: ${id}`);
    
    res.json(testimonials[testimonialIndex]);
    
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// DELETE /api/testimonials/:id - Delete testimonial (admin only)
router.delete('/:id', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  try {
    const { id } = req.params;
    
    const testimonialIndex = testimonials.findIndex(t => t.id === id);
    
    if (testimonialIndex === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    // Soft delete by setting active to false
    testimonials[testimonialIndex].active = false;
    testimonials[testimonialIndex].deleted_at = new Date().toISOString();
    
    console.log(`🗑️ Deleted testimonial: ${id}`);
    
    res.json({ success: true, message: 'Testimonial deleted' });
    
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;