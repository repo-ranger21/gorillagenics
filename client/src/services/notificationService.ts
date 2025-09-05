// Notification Service for GuerillaGenics Push Notifications
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  playerId?: string;
  alertType?: 'zen_gorilla' | 'alpha_ape' | 'full_bananas';
  requireInteraction?: boolean;
  vibrate?: number[];
  tag?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private subscription: globalThis.PushSubscription | null = null;
  
  // VAPID public key - in production, this should be generated and stored securely
  private readonly vapidPublicKey = 'BNxSjKrZRfHg7hF0xgKl8E1QJN2F5L3xN7H9D6K4V8uR2T9G5J7M3P1Q8W2E4R6T0Y9U3I5O7A1S2D4F6G8H0J2K4L6M8N0P2Q4R6T8U0W2Y4A6C8E0G2I4K6M8O0Q2S4U6W8Y0A2C4E6G8I0K2M4O6Q8S0U2W4Y6A8C0E2G4I6K8M0O2Q4S6U8W0Y2A4C6E8G0I2K4M6O8Q0S2U4W6Y8A0C2E4G6I8K0M2O4Q6S8U0W2Y4A6C8E0G2I4K6M8O0Q2S4U6';

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        await this.registerServiceWorker();
        await this.getExistingSubscription();
      } else {
        console.warn('🦍 Push notifications not supported in this browser');
      }
    } catch (error) {
      console.error('🦍 Error initializing notification service:', error);
    }
  }

  private async registerServiceWorker(): Promise<void> {
    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('🦍 Service Worker registered successfully:', this.swRegistration.scope);
      
      // Listen for service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        console.log('🦍 Service Worker update found');
      });
    } catch (error) {
      console.error('🦍 Service Worker registration failed:', error);
      throw error;
    }
  }

  private async getExistingSubscription(): Promise<void> {
    try {
      if (this.swRegistration) {
        this.subscription = await this.swRegistration.pushManager.getSubscription();
        if (this.subscription) {
          console.log('🦍 Existing push subscription found');
          // Optionally sync with server
          await this.syncSubscriptionWithServer(this.subscription);
        }
      }
    } catch (error) {
      console.error('🦍 Error getting existing subscription:', error);
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    
    console.log('🦍 Notification permission:', permission);
    return permission;
  }

  public async subscribe(): Promise<globalThis.PushSubscription | null> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('🦍 Notification permission not granted');
        return null;
      }

      if (!this.swRegistration) {
        throw new Error('Service Worker not registered');
      }

      // Convert VAPID key
      const convertedVapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      this.subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log('🦍 Push subscription created:', this.subscription);
      
      // Send subscription to server
      await this.syncSubscriptionWithServer(this.subscription);
      
      return this.subscription;
    } catch (error) {
      console.error('🦍 Error subscribing to push notifications:', error);
      throw error;
    }
  }

  public async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        const result = await this.subscription.unsubscribe();
        if (result) {
          console.log('🦍 Push subscription cancelled');
          this.subscription = null;
          
          // Remove from server
          await this.removeSubscriptionFromServer();
        }
        return result;
      }
      return false;
    } catch (error) {
      console.error('🦍 Error unsubscribing from push notifications:', error);
      throw error;
    }
  }

  public async sendTestNotification(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: this.subscription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      console.log('🦍 Test notification sent');
    } catch (error) {
      console.error('🦍 Error sending test notification:', error);
      throw error;
    }
  }

  public isSubscribed(): boolean {
    return this.subscription !== null;
  }

  public getSubscription(): globalThis.PushSubscription | null {
    return this.subscription;
  }

  private async syncSubscriptionWithServer(subscription: globalThis.PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!)))
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync subscription with server');
      }

      console.log('🦍 Subscription synced with server');
    } catch (error) {
      console.error('🦍 Error syncing subscription with server:', error);
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('🦍 Subscription removed from server');
    } catch (error) {
      console.error('🦍 Error removing subscription from server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Helper method to show local notifications for testing
  public showLocalNotification(payload: NotificationPayload): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        image: payload.image,
        tag: payload.tag || 'guerilla-genics',
        requireInteraction: payload.requireInteraction || false,
        vibrate: payload.vibrate || [200, 100, 200]
      });

      notification.onclick = () => {
        window.focus();
        if (payload.url) {
          window.open(payload.url, '_blank');
        }
        notification.close();
      };

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!payload.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;