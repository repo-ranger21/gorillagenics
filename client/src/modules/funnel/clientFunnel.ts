// GuerillaGenics conversion funnel client utilities

export type FunnelStage = 'awareness' | 'engagement' | 'conversion';

export interface FunnelData {
  stage: FunnelStage;
  firstSeenISO: string;
  freePicksViewed: number;
  weeklyReset: string; // ISO date for weekly reset
  dismissedModal: boolean;
  dismissedBanner: boolean;
}

export interface AnalyticsEvent {
  eventType: 'view_pick' | 'unlock_click' | 'subscribe_click' | 'modal_open' | 'modal_dismiss' | 'banner_click' | 'free_pick_claim';
  meta?: Record<string, any>;
  timestamp: string;
}

const STORAGE_KEY = 'gg:funnel';
const FREE_PICKS_PER_WEEK = 2;

// Get current funnel data from localStorage
export function getFunnelData(): FunnelData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First visit - initialize funnel
      const newData: FunnelData = {
        stage: 'awareness',
        firstSeenISO: new Date().toISOString(),
        freePicksViewed: 0,
        weeklyReset: getNextWeekReset(),
        dismissedModal: false,
        dismissedBanner: false
      };
      setFunnelData(newData);
      return newData;
    }

    const data: FunnelData = JSON.parse(stored);
    
    // Check if we need to reset weekly counters (every Tuesday)
    if (new Date() > new Date(data.weeklyReset)) {
      data.freePicksViewed = 0;
      data.weeklyReset = getNextWeekReset();
      data.dismissedModal = false; // Allow modal to show again for new week
      setFunnelData(data);
    }

    return data;
  } catch (error) {
    console.warn('🦍 Failed to parse funnel data:', error);
    // Return default without recursion
    const defaultData: FunnelData = {
      stage: 'awareness',
      firstSeenISO: new Date().toISOString(),
      freePicksViewed: 0,
      weeklyReset: getNextWeekReset(),
      dismissedModal: false,
      dismissedBanner: false
    };
    setFunnelData(defaultData);
    return defaultData;
  }
}

// Update funnel data in localStorage
export function setFunnelData(data: Partial<FunnelData>): void {
  try {
    let current: FunnelData;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      current = stored ? JSON.parse(stored) : {
        stage: 'awareness',
        firstSeenISO: new Date().toISOString(),
        freePicksViewed: 0,
        weeklyReset: getNextWeekReset(),
        dismissedModal: false,
        dismissedBanner: false
      };
    } catch {
      current = {
        stage: 'awareness',
        firstSeenISO: new Date().toISOString(),
        freePicksViewed: 0,
        weeklyReset: getNextWeekReset(),
        dismissedModal: false,
        dismissedBanner: false
      };
    }
    
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('🦍 Failed to save funnel data:', error);
  }
}

// Get next Tuesday reset date
function getNextWeekReset(): string {
  const now = new Date();
  const nextTuesday = new Date(now);
  
  // Find next Tuesday (day 2, 0=Sunday)
  const daysUntilTuesday = (2 - now.getDay() + 7) % 7;
  if (daysUntilTuesday === 0 && now.getHours() < 3) {
    // If it's Tuesday before 3 AM, don't advance
    nextTuesday.setDate(now.getDate());
  } else {
    nextTuesday.setDate(now.getDate() + daysUntilTuesday);
  }
  
  nextTuesday.setHours(3, 0, 0, 0); // 3 AM Tuesday reset
  return nextTuesday.toISOString();
}

// Check if user is subscribed (mock for now)
export function isSubscribed(): boolean {
  // TODO: Integrate with actual subscription status
  return localStorage.getItem('gg:subscribed') === 'true';
}

// Check if a pick should be locked based on index and free picks used
export function isPickLocked(pickIndex: number): boolean {
  if (isSubscribed()) return false;
  
  const funnel = getFunnelData();
  return pickIndex >= FREE_PICKS_PER_WEEK || funnel.freePicksViewed >= FREE_PICKS_PER_WEEK;
}

// Check if we can view another free pick
export function canViewFreePick(): boolean {
  if (isSubscribed()) return true;
  
  const funnel = getFunnelData();
  return funnel.freePicksViewed < FREE_PICKS_PER_WEEK;
}

// Grant a free pick view
export function grantFreePick(): boolean {
  if (!canViewFreePick()) return false;
  
  const funnel = getFunnelData();
  setFunnelData({
    freePicksViewed: funnel.freePicksViewed + 1,
    stage: funnel.stage === 'awareness' ? 'engagement' : funnel.stage
  });
  
  trackEvent('free_pick_claim', { 
    pickNumber: funnel.freePicksViewed + 1,
    totalUsed: funnel.freePicksViewed + 1 
  });
  
  return true;
}

// Check if should show first pick free modal
export function shouldShowFreePickModal(): boolean {
  if (isSubscribed()) return false;
  
  const funnel = getFunnelData();
  return !funnel.dismissedModal && funnel.freePicksViewed === 0;
}

// Check if should show unlock banner
export function shouldShowUnlockBanner(): boolean {
  if (isSubscribed()) return false;
  
  const funnel = getFunnelData();
  return !funnel.dismissedBanner && funnel.freePicksViewed > 0;
}

// Dismiss modal for current week
export function dismissModal(): void {
  setFunnelData({ dismissedModal: true });
  trackEvent('modal_dismiss');
}

// Dismiss banner (permanently until subscription)
export function dismissBanner(): void {
  setFunnelData({ dismissedBanner: true });
}

// Track analytics event
export async function trackEvent(eventType: AnalyticsEvent['eventType'], meta?: Record<string, any>): Promise<void> {
  // Respect Do Not Track
  if (navigator.doNotTrack === '1') {
    return;
  }

  const event: AnalyticsEvent = {
    eventType,
    meta,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    
    console.log(`🦍 Tracked event: ${eventType}`, meta);
  } catch (error) {
    console.warn('🦍 Failed to track event:', error);
  }
}

// Get funnel stage
export function getFunnelStage(): FunnelStage {
  return getFunnelData().stage;
}

// Update funnel stage
export function updateFunnelStage(stage: FunnelStage): void {
  setFunnelData({ stage });
  trackEvent('view_pick', { stage });
}

// Get free picks remaining
export function getFreePicksRemaining(): number {
  if (isSubscribed()) return Infinity;
  
  const funnel = getFunnelData();
  return Math.max(0, FREE_PICKS_PER_WEEK - funnel.freePicksViewed);
}

// Get days since first visit
export function getDaysSinceFirstVisit(): number {
  const funnel = getFunnelData();
  const firstSeen = new Date(funnel.firstSeenISO);
  const now = new Date();
  return Math.floor((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24));
}

// Mock subscription functions (to be replaced with real implementation)
export function mockSubscribe(): void {
  localStorage.setItem('gg:subscribed', 'true');
  setFunnelData({ stage: 'conversion' });
  trackEvent('subscribe_click', { 
    daysSinceFirstVisit: getDaysSinceFirstVisit(),
    freePicksUsed: getFunnelData().freePicksViewed 
  });
}

export function mockUnsubscribe(): void {
  localStorage.removeItem('gg:subscribed');
  setFunnelData({ stage: 'awareness', dismissedBanner: false });
}