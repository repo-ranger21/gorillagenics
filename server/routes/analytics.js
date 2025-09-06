const express = require('express');
const router = express.Router();

// Simple in-memory storage for development
// In production, use a proper database
let analyticsEvents = [];
const MAX_EVENTS = 10000; // Limit memory usage

// Rate limiting map
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // Max events per minute per IP

// Helper to get client identifier (IP hash for privacy)
function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return require('crypto').createHash('sha256').update(ip + req.headers['user-agent']).digest('hex').substring(0, 16);
}

// Rate limiting middleware
function rateLimit(req, res, next) {
  const clientId = getClientId(req);
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
  }
  
  const limit = rateLimitMap.get(clientId);
  
  if (now > limit.resetTime) {
    // Reset window
    limit.count = 0;
    limit.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  if (limit.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  limit.count++;
  next();
}

// Clean up old rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [clientId, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(clientId);
    }
  }
}, RATE_LIMIT_WINDOW);

// POST /api/analytics/event - Track analytics event
router.post('/event', rateLimit, (req, res) => {
  try {
    const { eventType, meta, timestamp } = req.body;
    
    // Validate event type
    const validEvents = [
      'view_pick', 'unlock_click', 'subscribe_click', 'modal_open', 
      'modal_dismiss', 'banner_click', 'free_pick_claim', 'referral_click'
    ];
    
    if (!eventType || !validEvents.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    
    // Create analytics event
    const event = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      eventType,
      meta: meta || {},
      timestamp: timestamp || new Date().toISOString(),
      clientId: getClientId(req),
      userAgent: req.headers['user-agent']?.substring(0, 200), // Truncate for privacy
      createdAt: new Date().toISOString()
    };
    
    // Add to events array
    analyticsEvents.push(event);
    
    // Trim events if too many
    if (analyticsEvents.length > MAX_EVENTS) {
      analyticsEvents = analyticsEvents.slice(-MAX_EVENTS);
    }
    
    console.log(`📊 Analytics event: ${eventType}`, meta);
    
    res.json({ success: true, eventId: event.id });
    
  } catch (error) {
    console.error('Analytics event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// GET /api/analytics/events - Get events (admin only, for debugging)
router.get('/events', (req, res) => {
  // In production, add proper authentication
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { eventType, limit = 100, offset = 0 } = req.query;
  
  let events = analyticsEvents;
  
  // Filter by event type if specified
  if (eventType) {
    events = events.filter(e => e.eventType === eventType);
  }
  
  // Sort by timestamp (newest first)
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply pagination
  const paginatedEvents = events.slice(offset, offset + parseInt(limit));
  
  res.json({
    events: paginatedEvents,
    total: events.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// GET /api/analytics/stats - Get analytics summary
router.get('/stats', (req, res) => {
  // In production, add proper authentication
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  const recentEvents = analyticsEvents.filter(e => new Date(e.timestamp) > oneDayAgo);
  const weeklyEvents = analyticsEvents.filter(e => new Date(e.timestamp) > oneWeekAgo);
  
  // Count events by type
  const eventCounts = {};
  const recentCounts = {};
  
  analyticsEvents.forEach(e => {
    eventCounts[e.eventType] = (eventCounts[e.eventType] || 0) + 1;
  });
  
  recentEvents.forEach(e => {
    recentCounts[e.eventType] = (recentCounts[e.eventType] || 0) + 1;
  });
  
  // Count unique clients
  const uniqueClients = new Set(analyticsEvents.map(e => e.clientId)).size;
  const recentUniqueClients = new Set(recentEvents.map(e => e.clientId)).size;
  
  res.json({
    summary: {
      totalEvents: analyticsEvents.length,
      recentEvents: recentEvents.length,
      weeklyEvents: weeklyEvents.length,
      uniqueClients,
      recentUniqueClients
    },
    eventCounts,
    recentCounts,
    generatedAt: new Date().toISOString()
  });
});

// DELETE /api/analytics/events - Clear events (admin only)
router.delete('/events', (req, res) => {
  // In production, add proper authentication
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const oldLength = analyticsEvents.length;
  analyticsEvents = [];
  
  console.log(`🗑️ Cleared ${oldLength} analytics events`);
  
  res.json({ 
    success: true, 
    message: `Cleared ${oldLength} events` 
  });
});

module.exports = router;