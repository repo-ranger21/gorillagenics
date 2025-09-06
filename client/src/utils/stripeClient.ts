import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('🦍 Missing VITE_STRIPE_PUBLISHABLE_KEY');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Helper function to create checkout session and redirect to Stripe
export async function createCheckoutSession(userId?: number) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const { sessionId, url } = await response.json();
    
    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('🦍 Error creating checkout session:', error);
    throw error;
  }
}

// Helper function to check subscription status
export async function getSubscriptionStatus(userId: number) {
  try {
    const response = await fetch(`/api/subscription/status/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('🦍 Error fetching subscription status:', error);
    return { isSubscribed: false, subscriptionStatus: 'inactive' };
  }
}