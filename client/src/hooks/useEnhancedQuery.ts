import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { cache, oddsCache, picksCache, playersCache, scheduleCache } from '@/utils/cache';

interface EnhancedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  cacheKey?: string;
  fallbackData?: T;
  onCacheHit?: (data: T) => void;
  onCacheMiss?: () => void;
  maxCacheAge?: number;
}

interface EnhancedQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  isCached: boolean;
  cacheAge?: number;
  refetch: () => void;
  clearCache: () => void;
}

// Enhanced query hook with automatic caching and fallback handling
export function useEnhancedQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: EnhancedQueryOptions<T> = {}
): EnhancedQueryResult<T> {
  const [isCached, setIsCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<number>();
  
  const normalizedKey = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
  const cacheKey = options.cacheKey || normalizedKey;

  // Check for cached data on mount
  useEffect(() => {
    const cachedData = cache.get<T>(cacheKey, { maxAge: options.maxCacheAge });
    const age = cache.getAge(cacheKey);
    
    if (cachedData && age !== null) {
      setIsCached(true);
      setCacheAge(age);
      options.onCacheHit?.(cachedData);
    } else {
      setIsCached(false);
      setCacheAge(undefined);
      options.onCacheMiss?.();
    }
  }, [cacheKey]);

  const {
    data,
    isLoading,
    error,
    refetch: originalRefetch,
    isStale
  } = useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      try {
        const result = await queryFn();
        
        // Cache successful results
        if (result) {
          cache.set(cacheKey, result, { maxAge: options.maxCacheAge });
          setIsCached(false); // Fresh data, not cached
          setCacheAge(undefined);
        }
        
        return result;
      } catch (error) {
        // On error, try to return cached data
        const cachedData = cache.get<T>(cacheKey, { maxAge: options.maxCacheAge });
        if (cachedData) {
          console.log(`🦍 Using cached data for ${cacheKey} due to fetch error`);
          const age = cache.getAge(cacheKey);
          setIsCached(true);
          setCacheAge(age || undefined);
          return cachedData;
        }
        
        // If no cached data, rethrow error
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if we have cached data
      const cachedData = cache.get<T>(cacheKey, { maxAge: options.maxCacheAge });
      if (cachedData) return false;
      
      // Otherwise retry up to 2 times
      return failureCount < 2;
    },
    ...options
  });

  const refetch = () => {
    setIsCached(false);
    setCacheAge(undefined);
    originalRefetch();
  };

  const clearCache = () => {
    cache.remove(cacheKey);
    setIsCached(false);
    setCacheAge(undefined);
  };

  return {
    data,
    isLoading,
    error,
    isStale,
    isCached,
    cacheAge,
    refetch,
    clearCache
  };
}

// Specialized hooks for GuerillaGenics data types
export function useOddsQuery(queryKey: string | string[], queryFn: () => Promise<any>) {
  return useEnhancedQuery(queryKey, queryFn, {
    cacheKey: 'lastOdds',
    maxCacheAge: 15 * 60 * 1000, // 15 minutes
    onCacheHit: (data) => console.log('🦍 Using cached odds data'),
    onCacheMiss: () => console.log('🦍 Fetching fresh odds data')
  });
}

export function usePicksQuery(queryKey: string | string[], queryFn: () => Promise<any>) {
  return useEnhancedQuery(queryKey, queryFn, {
    cacheKey: 'lastPicks',
    maxCacheAge: 60 * 60 * 1000, // 1 hour
    onCacheHit: (data) => console.log('🦍 Using cached picks data'),
    onCacheMiss: () => console.log('🦍 Fetching fresh picks data')
  });
}

export function usePlayersQuery(queryKey: string | string[], queryFn: () => Promise<any>) {
  return useEnhancedQuery(queryKey, queryFn, {
    cacheKey: 'lastPlayers',
    maxCacheAge: 30 * 60 * 1000, // 30 minutes
    onCacheHit: (data) => console.log('🦍 Using cached players data'),
    onCacheMiss: () => console.log('🦍 Fetching fresh players data')
  });
}

export function useScheduleQuery(queryKey: string | string[], queryFn: () => Promise<any>) {
  return useEnhancedQuery(queryKey, queryFn, {
    cacheKey: 'lastSchedule',
    maxCacheAge: 60 * 60 * 1000, // 1 hour
    onCacheHit: (data) => console.log('🦍 Using cached schedule data'),
    onCacheMiss: () => console.log('🦍 Fetching fresh schedule data')
  });
}

// Network status detection hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('🦍 Back online!');
      setIsOnline(true);
      if (wasOffline) {
        // Trigger data refresh when coming back online
        window.location.reload();
      }
    };

    const handleOffline = () => {
      console.log('🦍 Gone offline!');
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

export default useEnhancedQuery;