import { useState, useEffect } from 'react';
import { getSubscriptionStatus } from '@/utils/stripeClient';

interface SubscriptionStatus {
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionEndDate?: string;
  loading: boolean;
  error?: string;
}

export function useSubscription(userId?: number): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    subscriptionStatus: 'inactive',
    loading: true,
  });

  useEffect(() => {
    if (!userId) {
      setStatus({
        isSubscribed: false,
        subscriptionStatus: 'inactive',
        loading: false,
      });
      return;
    }

    async function fetchStatus() {
      try {
        setStatus(prev => ({ ...prev, loading: true }));
        const result = await getSubscriptionStatus(userId);
        setStatus({
          isSubscribed: result.isSubscribed || false,
          subscriptionStatus: result.subscriptionStatus || 'inactive',
          subscriptionEndDate: result.subscriptionEndDate,
          loading: false,
        });
      } catch (error) {
        console.error('🦍 Error fetching subscription status:', error);
        setStatus({
          isSubscribed: false,
          subscriptionStatus: 'inactive',
          loading: false,
          error: 'Failed to load subscription status',
        });
      }
    }

    fetchStatus();
  }, [userId]);

  return status;
}

// Helper function for quick access checks
export function useIsSubscribed(userId?: number): boolean {
  const { isSubscribed } = useSubscription(userId);
  return isSubscribed;
}