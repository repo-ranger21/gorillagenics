const express = require('express');
const router = express.Router();

// Simple in-memory storage for development
// In production, use a proper database
let users = [];
let referrals = [];
let rewards = [];
let userCounter = 1;

// Rate limiting
const rateLimitMap = new Map();

// Helper functions
function generateRefCode() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getClientId(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return require('crypto').createHash('sha256').update(ip + req.headers['user-agent']).digest('hex').substring(0, 16);
}

function isValidRefCode(code) {
  return /^[A-Z0-9]{8}$/i.test(code);
}

function rateLimit(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const clientId = getClientId(req);
    const now = Date.now();
    
    if (!rateLimitMap.has(clientId)) {
      rateLimitMap.set(clientId, []);
    }
    
    const requests = rateLimitMap.get(clientId);
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    validRequests.push(now);
    rateLimitMap.set(clientId, validRequests);
    next();
  };
}

// GET /api/referrals/code - Get or create referral code
router.get('/code', (req, res) => {
  try {
    // Mock user ID (in production, get from session/auth)
    const userId = req.session?.userId || 'temp-' + getClientId(req);
    
    // Find existing user
    let user = users.find(u => u.id === userId);
    
    if (!user) {
      // Create new user with referral code
      user = {
        id: userId,
        email: null,
        refCode: generateRefCode(),
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }
    
    console.log(`🔗 Generated/retrieved referral code: ${user.refCode} for user: ${userId}`);
    
    res.json({ refCode: user.refCode });
    
  } catch (error) {
    console.error('Referral code error:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// POST /api/referrals/click - Track referral click
router.post('/click', rateLimit(20), (req, res) => {
  try {
    const { refCode } = req.body;
    
    if (!refCode || !isValidRefCode(refCode)) {
      return res.status(400).json({ error: 'Invalid referral code' });
    }
    
    // Find referrer
    const referrer = users.find(u => u.refCode === refCode);
    
    if (!referrer) {
      return res.status(404).json({ error: 'Referral code not found' });
    }
    
    // Check for existing click from this client
    const clientId = getClientId(req);
    const existingClick = referrals.find(r => 
      r.refCode === refCode && 
      r.clientId === clientId && 
      r.status === 'clicked'
    );
    
    if (existingClick) {
      // Update timestamp
      existingClick.updatedAt = new Date().toISOString();
    } else {
      // Create new referral click
      const referral = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        refCode,
        referrerUserId: referrer.id,
        refereeUserId: null,
        status: 'clicked',
        clientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      referrals.push(referral);
    }
    
    console.log(`🖱️ Referral click tracked: ${refCode}`);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Referral click error:', error);
    res.status(500).json({ error: 'Failed to track referral click' });
  }
});

// POST /api/referrals/convert - Convert referral (user signup)
router.post('/convert', rateLimit(5), (req, res) => {
  try {
    const { refCode, email, userId } = req.body;
    
    if (!refCode || !isValidRefCode(refCode) || !email) {
      return res.status(400).json({ error: 'Invalid referral data' });
    }
    
    // Find referrer
    const referrer = users.find(u => u.refCode === refCode);
    
    if (!referrer) {
      return res.status(404).json({ error: 'Referral code not found' });
    }
    
    // Create or update referee user
    const clientId = getClientId(req);
    let referee = users.find(u => u.email === email);
    
    if (!referee) {
      referee = {
        id: userId || `user-${userCounter++}`,
        email,
        refCode: generateRefCode(),
        createdAt: new Date().toISOString()
      };
      users.push(referee);
    }
    
    // Find existing referral click
    const referral = referrals.find(r => 
      r.refCode === refCode && 
      r.clientId === clientId
    );
    
    if (referral) {
      // Update existing referral
      referral.refereeUserId = referee.id;
      referral.status = 'joined';
      referral.updatedAt = new Date().toISOString();
    } else {
      // Create new referral (direct signup with ref code)
      const newReferral = {
        id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        refCode,
        referrerUserId: referrer.id,
        refereeUserId: referee.id,
        status: 'joined',
        clientId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      referrals.push(newReferral);
    }
    
    console.log(`📝 Referral conversion: ${email} via ${refCode}`);
    
    res.json({ 
      success: true, 
      userId: referee.id,
      message: 'Referral conversion tracked' 
    });
    
  } catch (error) {
    console.error('Referral convert error:', error);
    res.status(500).json({ error: 'Failed to convert referral' });
  }
});

// POST /api/referrals/verify - Verify email (trigger rewards)
router.post('/verify', rateLimit(5), (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // Find user
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find referral where this user is the referee
    const referral = referrals.find(r => 
      r.refereeUserId === userId && 
      r.status === 'joined'
    );
    
    if (!referral) {
      return res.json({ 
        success: true, 
        message: 'No referral to verify',
        rewardsGranted: 0 
      });
    }
    
    // Update referral status
    referral.status = 'verified';
    referral.verifiedAt = new Date().toISOString();
    referral.updatedAt = new Date().toISOString();
    
    // Grant rewards to both referrer and referee
    const rewardExpiry = new Date();
    rewardExpiry.setDate(rewardExpiry.getDate() + 7); // 7 days
    
    // Referrer reward
    const referrerReward = {
      id: `reward-${Date.now()}-ref`,
      userId: referral.referrerUserId,
      daysGranted: 7,
      expiresAt: rewardExpiry.toISOString(),
      source: 'referral',
      referralId: referral.id,
      createdAt: new Date().toISOString()
    };
    
    // Referee reward
    const refereeReward = {
      id: `reward-${Date.now()}-new`,
      userId: referral.refereeUserId,
      daysGranted: 7,
      expiresAt: rewardExpiry.toISOString(),
      source: 'referral',
      referralId: referral.id,
      createdAt: new Date().toISOString()
    };
    
    rewards.push(referrerReward, refereeReward);
    
    // Mark referral as rewarded
    referral.status = 'rewarded';
    
    console.log(`🎁 Referral rewards granted: ${referral.referrerUserId} & ${referral.refereeUserId}`);
    
    res.json({ 
      success: true, 
      message: 'Email verified and rewards granted',
      rewardsGranted: 2
    });
    
  } catch (error) {
    console.error('Referral verify error:', error);
    res.status(500).json({ error: 'Failed to verify referral' });
  }
});

// GET /api/referrals/stats - Get referral statistics
router.get('/stats', (req, res) => {
  try {
    // Mock user ID
    const userId = req.session?.userId || 'temp-' + getClientId(req);
    
    // Find user
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get referrals made by this user
    const userReferrals = referrals.filter(r => r.referrerUserId === userId);
    
    // Get active rewards for this user
    const now = new Date();
    const activeRewards = rewards.filter(r => 
      r.userId === userId && 
      new Date(r.expiresAt) > now
    );
    
    // Calculate stats
    const invitesSent = userReferrals.filter(r => r.status !== 'clicked').length;
    const signups = userReferrals.filter(r => ['joined', 'verified', 'rewarded'].includes(r.status)).length;
    const conversions = userReferrals.filter(r => ['verified', 'rewarded'].includes(r.status)).length;
    
    // Calculate days remaining (max from all active rewards)
    let daysRemaining = 0;
    if (activeRewards.length > 0) {
      const maxExpiry = Math.max(...activeRewards.map(r => new Date(r.expiresAt).getTime()));
      daysRemaining = Math.max(0, Math.ceil((maxExpiry - now.getTime()) / (1000 * 60 * 60 * 24)));
    }
    
    const stats = {
      refCode: user.refCode,
      invitesSent,
      signups,
      conversions,
      rewardsActive: activeRewards.length,
      daysRemaining,
      totalRewards: rewards.filter(r => r.userId === userId).length
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: 'Failed to get referral stats' });
  }
});

// GET /api/referrals/admin/stats - Admin statistics
router.get('/admin/stats', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const now = new Date();
  const activeRewards = rewards.filter(r => new Date(r.expiresAt) > now);
  
  res.json({
    summary: {
      totalUsers: users.length,
      totalReferrals: referrals.length,
      totalRewards: rewards.length,
      activeRewards: activeRewards.length
    },
    referralsByStatus: {
      clicked: referrals.filter(r => r.status === 'clicked').length,
      joined: referrals.filter(r => r.status === 'joined').length,
      verified: referrals.filter(r => r.status === 'verified').length,
      rewarded: referrals.filter(r => r.status === 'rewarded').length
    },
    recentActivity: {
      last24h: {
        referrals: referrals.filter(r => new Date(r.createdAt) > new Date(now - 24 * 60 * 60 * 1000)).length,
        rewards: rewards.filter(r => new Date(r.createdAt) > new Date(now - 24 * 60 * 60 * 1000)).length
      }
    }
  });
});

module.exports = router;