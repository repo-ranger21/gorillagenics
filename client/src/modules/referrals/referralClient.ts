// GuerillaGenics referral system client utilities

export interface ReferralStats {
  refCode: string;
  invitesSent: number;
  signups: number;
  conversions: number;
  rewardsActive: number;
  daysRemaining: number;
  totalRewards: number;
}

export interface ReferralReward {
  id: string;
  daysGranted: number;
  expiresAt: string;
  source: 'referral' | 'promo';
  isActive: boolean;
}

// Generate or get existing referral code
export async function getOrCreateRefCode(): Promise<string> {
  try {
    const response = await fetch('/api/referrals/code', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get referral code');
    }
    
    const data = await response.json();
    return data.refCode;
  } catch (error) {
    console.warn('🦍 Failed to get referral code:', error);
    
    // Generate a temporary client-side code as fallback
    const tempCode = generateTempRefCode();
    console.log('🦍 Using temporary referral code:', tempCode);
    return tempCode;
  }
}

// Generate temporary referral code (8 character base36)
function generateTempRefCode(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.toUpperCase();
}

// Capture referral from URL parameter
export async function captureRefFromURL(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  if (!refCode) {
    return false;
  }
  
  try {
    // Store referral in localStorage for later conversion
    localStorage.setItem('gg:referralCode', refCode);
    
    // Track the referral click
    const response = await fetch('/api/referrals/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode })
    });
    
    if (response.ok) {
      console.log('🦍 Referral captured:', refCode);
      
      // Clean URL to remove ref parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, document.title, newUrl.toString());
      
      return true;
    }
  } catch (error) {
    console.warn('🦍 Failed to capture referral:', error);
  }
  
  return false;
}

// Handle user signup with referral conversion
export async function onSignup(email: string, userId?: string): Promise<boolean> {
  const refCode = localStorage.getItem('gg:referralCode');
  
  if (!refCode) {
    return false;
  }
  
  try {
    const response = await fetch('/api/referrals/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode, email, userId })
    });
    
    if (response.ok) {
      console.log('🦍 Referral conversion tracked');
      localStorage.removeItem('gg:referralCode'); // Clean up
      return true;
    }
  } catch (error) {
    console.warn('🦍 Failed to track referral conversion:', error);
  }
  
  return false;
}

// Handle email verification (triggers rewards)
export async function onEmailVerify(userId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/referrals/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (response.ok) {
      console.log('🦍 Email verification processed for referral rewards');
      return true;
    }
  } catch (error) {
    console.warn('🦍 Failed to process email verification:', error);
  }
  
  return false;
}

// Get referral statistics
export async function getReferralStats(): Promise<ReferralStats | null> {
  try {
    const response = await fetch('/api/referrals/stats', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to get referral stats');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('🦍 Failed to get referral stats:', error);
    
    // Return mock data for development
    return {
      refCode: await getOrCreateRefCode(),
      invitesSent: 0,
      signups: 0,
      conversions: 0,
      rewardsActive: 0,
      daysRemaining: 0,
      totalRewards: 0
    };
  }
}

// Generate referral link
export function generateReferralLink(refCode: string): string {
  const baseUrl = import.meta.env.VITE_REFERRAL_BASE_URL || window.location.origin;
  return `${baseUrl}/?ref=${refCode}`;
}

// Copy referral link to clipboard
export async function copyReferralLink(refCode: string): Promise<boolean> {
  const link = generateReferralLink(refCode);
  
  try {
    await navigator.clipboard.writeText(link);
    console.log('🦍 Referral link copied to clipboard');
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      console.log('🦍 Referral link copied using fallback method');
      return true;
    } catch (fallbackError) {
      console.warn('🦍 Failed to copy referral link:', fallbackError);
      return false;
    }
  }
}

// Check if user has pending referral rewards
export function hasPendingReferral(): boolean {
  return localStorage.getItem('gg:referralCode') !== null;
}

// Get stored referral code (for pending conversions)
export function getStoredReferralCode(): string | null {
  return localStorage.getItem('gg:referralCode');
}

// Validate referral code format
export function isValidReferralCode(code: string): boolean {
  // 8-character alphanumeric code
  return /^[A-Z0-9]{8}$/i.test(code);
}

// Format days remaining text
export function formatDaysRemaining(days: number): string {
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  if (days < 7) return `${days} days left`;
  
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  
  if (weeks === 1 && remainingDays === 0) return '1 week left';
  if (remainingDays === 0) return `${weeks} weeks left`;
  
  return `${weeks}w ${remainingDays}d left`;
}

// Calculate reward expiry
export function getRewardExpiry(daysGranted: number): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysGranted);
  expiry.setHours(23, 59, 59, 999); // End of day
  return expiry;
}