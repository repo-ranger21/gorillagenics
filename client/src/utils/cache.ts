// GuerillaGenics localStorage cache utility for offline fallbacks

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheConfig {
  maxAge?: number; // milliseconds
  version?: string;
}

const DEFAULT_CONFIG: Required<CacheConfig> = {
  maxAge: 30 * 60 * 1000, // 30 minutes
  version: '1.0.0'
};

class GuerillaGenicsCache {
  private keyPrefix = 'gg:';

  // Store data in localStorage with timestamp and version
  set<T>(key: string, data: T, config: CacheConfig = {}): boolean {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version: finalConfig.version
      };
      
      localStorage.setItem(
        `${this.keyPrefix}${key}`, 
        JSON.stringify(cacheItem)
      );
      
      console.log(`🦍 Cached ${key} in jungle storage`);
      return true;
    } catch (error) {
      console.warn(`🦍 Failed to cache ${key}:`, error);
      return false;
    }
  }

  // Retrieve data from localStorage with freshness check
  get<T>(key: string, config: CacheConfig = {}): T | null {
    try {
      const finalConfig = { ...DEFAULT_CONFIG, ...config };
      const cached = localStorage.getItem(`${this.keyPrefix}${key}`);
      
      if (!cached) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Version check
      if (cacheItem.version !== finalConfig.version) {
        console.log(`🦍 Cache version mismatch for ${key}, clearing`);
        this.remove(key);
        return null;
      }

      // Freshness check
      const age = Date.now() - cacheItem.timestamp;
      if (age > finalConfig.maxAge) {
        console.log(`🦍 Cache expired for ${key} (${Math.round(age / 1000)}s old)`);
        this.remove(key);
        return null;
      }

      console.log(`🦍 Retrieved fresh ${key} from jungle cache`);
      return cacheItem.data;
    } catch (error) {
      console.warn(`🦍 Failed to retrieve ${key} from cache:`, error);
      this.remove(key); // Clear corrupted cache
      return null;
    }
  }

  // Check if cached data exists and is fresh
  has(key: string, config: CacheConfig = {}): boolean {
    return this.get(key, config) !== null;
  }

  // Remove specific cache entry
  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.keyPrefix}${key}`);
      console.log(`🦍 Removed ${key} from jungle cache`);
    } catch (error) {
      console.warn(`🦍 Failed to remove ${key} from cache:`, error);
    }
  }

  // Clear all GuerillaGenics cache
  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.keyPrefix)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🦍 Cleared ${keys.length} items from jungle cache`);
    } catch (error) {
      console.warn('🦍 Failed to clear cache:', error);
    }
  }

  // Get cache statistics
  stats(): { 
    totalItems: number; 
    totalSize: number; 
    items: Array<{ key: string; size: number; age: number; version: string }> 
  } {
    const items: Array<{ key: string; size: number; age: number; version: string }> = [];
    let totalSize = 0;

    try {
      Object.keys(localStorage).forEach(fullKey => {
        if (fullKey.startsWith(this.keyPrefix)) {
          const key = fullKey.replace(this.keyPrefix, '');
          const value = localStorage.getItem(fullKey) || '';
          const size = new Blob([value]).size;
          totalSize += size;

          try {
            const cacheItem = JSON.parse(value);
            const age = Date.now() - (cacheItem.timestamp || 0);
            items.push({
              key,
              size,
              age,
              version: cacheItem.version || 'unknown'
            });
          } catch {
            items.push({
              key,
              size,
              age: 0,
              version: 'corrupted'
            });
          }
        }
      });
    } catch (error) {
      console.warn('🦍 Failed to get cache stats:', error);
    }

    return {
      totalItems: items.length,
      totalSize,
      items: items.sort((a, b) => b.age - a.age)
    };
  }

  // Get cache age in milliseconds
  getAge(key: string): number | null {
    try {
      const cached = localStorage.getItem(`${this.keyPrefix}${key}`);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      return Date.now() - (cacheItem.timestamp || 0);
    } catch {
      return null;
    }
  }

  // Check if browser supports localStorage
  isSupported(): boolean {
    try {
      const test = '__gg_cache_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const cache = new GuerillaGenicsCache();

// Specific cache utilities for GuerillaGenics data types
export const oddsCache = {
  set: (data: any) => cache.set('lastOdds', data, { maxAge: 15 * 60 * 1000 }), // 15 min
  get: () => cache.get('lastOdds', { maxAge: 15 * 60 * 1000 }),
  has: () => cache.has('lastOdds', { maxAge: 15 * 60 * 1000 }),
  remove: () => cache.remove('lastOdds')
};

export const picksCache = {
  set: (data: any) => cache.set('lastPicks', data, { maxAge: 60 * 60 * 1000 }), // 1 hour
  get: () => cache.get('lastPicks', { maxAge: 60 * 60 * 1000 }),
  has: () => cache.has('lastPicks', { maxAge: 60 * 60 * 1000 }),
  remove: () => cache.remove('lastPicks')
};

export const playersCache = {
  set: (data: any) => cache.set('lastPlayers', data, { maxAge: 30 * 60 * 1000 }), // 30 min
  get: () => cache.get('lastPlayers', { maxAge: 30 * 60 * 1000 }),
  has: () => cache.has('lastPlayers', { maxAge: 30 * 60 * 1000 }),
  remove: () => cache.remove('lastPlayers')
};

export const scheduleCache = {
  set: (data: any) => cache.set('lastSchedule', data, { maxAge: 60 * 60 * 1000 }), // 1 hour
  get: () => cache.get('lastSchedule', { maxAge: 60 * 60 * 1000 }),
  has: () => cache.has('lastSchedule', { maxAge: 60 * 60 * 1000 }),
  remove: () => cache.remove('lastSchedule')
};

// Utility functions
export function getCacheStatus() {
  return {
    supported: cache.isSupported(),
    odds: {
      cached: oddsCache.has(),
      age: cache.getAge('lastOdds')
    },
    picks: {
      cached: picksCache.has(),
      age: cache.getAge('lastPicks')
    },
    players: {
      cached: playersCache.has(),
      age: cache.getAge('lastPlayers')
    },
    schedule: {
      cached: scheduleCache.has(),
      age: cache.getAge('lastSchedule')
    }
  };
}

export function clearAllCache() {
  cache.clear();
}

export default cache;