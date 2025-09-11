import { type Request, Response, NextFunction } from "express";
import { storage } from "../storage";

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    isSubscribed: boolean;
    subscriptionStatus: string;
  };
}

/**
 * Middleware to verify premium subscription access for Gematria features
 * Checks user subscription status from database before allowing access to premium endpoints
 */
export const requirePremiumSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract user identifier from request
    // Priority: Authorization header > x-user-id header > query param
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'] as string;
    const userIdQuery = req.query.userId as string;
    
    let userId: string | number | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract user ID from bearer token (simplified approach)
      userId = authHeader.substring(7);
    } else if (userIdHeader) {
      userId = userIdHeader;
    } else if (userIdQuery) {
      userId = userIdQuery;
    }
    
    if (!userId) {
      res.status(401).json({ 
        error: "Authentication required",
        message: "Premium Gematria features require user authentication. Please provide user credentials.",
        premiumFeature: true
      });
      return;
    }

    // Get user from database
    let user;
    try {
      if (typeof userId === 'string' && isNaN(Number(userId))) {
        // Try to find user by username if userId is not a number
        const users = await storage.getAllUsers();
        user = users.find(u => u.username === userId);
      } else {
        // Try to find user by ID
        const users = await storage.getAllUsers();
        user = users.find(u => u.id === Number(userId));
      }
    } catch (error) {
      console.error('🔐 Database error during subscription check:', error);
      res.status(500).json({ 
        error: "Database error",
        message: "Unable to verify subscription status"
      });
      return;
    }

    if (!user) {
      res.status(401).json({ 
        error: "User not found",
        message: "Invalid user credentials for premium access"
      });
      return;
    }

    // Check subscription status
    const hasActiveSubscription = user.isSubscribed && 
      (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing');
    
    // Check subscription expiry if applicable
    let isSubscriptionValid = hasActiveSubscription;
    if (user.subscriptionEndDate) {
      isSubscriptionValid = hasActiveSubscription && new Date(user.subscriptionEndDate) > new Date();
    }

    if (!isSubscriptionValid) {
      res.status(403).json({ 
        error: "Premium subscription required",
        message: "🦍 Gematria analysis requires active Jungle Access subscription. Upgrade to unlock premium features.",
        premiumFeature: true,
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        isSubscribed: user.isSubscribed || false,
        upgradeUrl: "/upgrade",
        feature: "Gematria Analysis"
      });
      return;
    }

    // Add user info to request for downstream use
    req.user = {
      id: user.id,
      username: user.username,
      isSubscribed: user.isSubscribed,
      subscriptionStatus: user.subscriptionStatus
    };

    console.log(`🔢 Premium access granted to user ${user.username} (ID: ${user.id}) for Gematria features`);
    next();
    
  } catch (error) {
    console.error('🔐 Subscription verification error:', error);
    res.status(500).json({ 
      error: "Verification failed",
      message: "Unable to verify premium subscription status"
    });
  }
};

/**
 * Middleware specifically for development/demo purposes
 * Logs access attempts but allows through with warning
 */
export const requirePremiumSubscriptionDev = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('🚧 DEV MODE: Gematria endpoint accessed without strict subscription check');
  console.log('🚧 In production, this would require active subscription');
  
  // Add mock user for development
  req.user = {
    id: 1,
    username: 'dev-user',
    isSubscribed: true,
    subscriptionStatus: 'active'
  };
  
  next();
};