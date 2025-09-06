// GuerillaGenics progressive hydration utilities

import { useState, useEffect, useRef } from 'react';

// Hook for progressive data loading with skeleton states
export function useProgressiveData<T>(
  fetchFn: () => Promise<T>,
  options: {
    cacheKey?: string;
    fallbackData?: T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    staleTime?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(options.fallbackData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    if (fetchAttempted.current) return;
    fetchAttempted.current = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchFn();
        setData(result);
        setIsStale(false);
        options.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load data');
        setError(error);
        setIsStale(true);
        options.onError?.(error);
        console.warn('🦍 Progressive data loading failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if data is stale based on staleTime
  useEffect(() => {
    if (!options.staleTime || !data) return;

    const staleTimer = setTimeout(() => {
      setIsStale(true);
    }, options.staleTime);

    return () => clearTimeout(staleTimer);
  }, [data, options.staleTime]);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fetchFn();
      setData(result);
      setIsStale(false);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refetch data');
      setError(error);
      setIsStale(true);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    isStale,
    refetch,
    hasData: data !== null
  };
}

// Hook for intersection observer-based lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {},
  enabled = true
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [enabled, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
}

// Hook for managing hydration priorities
export function useHydrationPriority() {
  const [isShellHydrated, setIsShellHydrated] = useState(false);
  const [canHydrateSecondary, setCanHydrateSecondary] = useState(false);
  const [canHydrateTertiary, setCanHydrateTertiary] = useState(false);

  useEffect(() => {
    // Mark shell as hydrated immediately
    setIsShellHydrated(true);

    // Allow secondary hydration after a short delay
    const secondaryTimer = setTimeout(() => {
      setCanHydrateSecondary(true);
    }, 100);

    // Allow tertiary hydration after longer delay
    const tertiaryTimer = setTimeout(() => {
      setCanHydrateTertiary(true);
    }, 500);

    return () => {
      clearTimeout(secondaryTimer);
      clearTimeout(tertiaryTimer);
    };
  }, []);

  return {
    isShellHydrated,
    canHydrateSecondary,
    canHydrateTertiary
  };
}

// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  return async () => {
    const start = performance.now();
    
    try {
      const result = fn();
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(`🦍 Performance measurement failed for ${name}:`, error);
    } finally {
      const end = performance.now();
      const duration = end - start;
      
      console.log(`🦍 ${name} took ${duration.toFixed(2)}ms`);
      
      // Report to performance API if available
      if ('performance' in window && 'measure' in performance) {
        try {
          performance.mark(`${name}-start`);
          performance.mark(`${name}-end`);
          performance.measure(name, `${name}-start`, `${name}-end`);
        } catch (e) {
          // Ignore performance API errors
        }
      }
    }
  };
}

// Layout shift prevention utilities
export function reserveSpace(width: number | string, height: number | string) {
  return {
    minWidth: typeof width === 'number' ? `${width}px` : width,
    minHeight: typeof height === 'number' ? `${height}px` : height,
    display: 'block'
  };
}

// Hydration coordination class
export class HydrationCoordinator {
  private phases = new Map<string, boolean>();
  private listeners = new Map<string, Array<() => void>>();

  markPhaseComplete(phase: string) {
    this.phases.set(phase, true);
    console.log(`🦍 Hydration phase complete: ${phase}`);
    
    // Notify listeners
    const phaseListeners = this.listeners.get(phase) || [];
    phaseListeners.forEach(listener => listener());
  }

  isPhaseComplete(phase: string): boolean {
    return this.phases.get(phase) || false;
  }

  onPhaseComplete(phase: string, callback: () => void) {
    if (!this.listeners.has(phase)) {
      this.listeners.set(phase, []);
    }
    this.listeners.get(phase)!.push(callback);

    // If phase is already complete, call immediately
    if (this.isPhaseComplete(phase)) {
      callback();
    }
  }

  getCompletedPhases(): string[] {
    return Array.from(this.phases.keys()).filter(phase => this.phases.get(phase));
  }

  getStats() {
    return {
      totalPhases: this.phases.size,
      completedPhases: this.getCompletedPhases().length,
      phases: Object.fromEntries(this.phases)
    };
  }
}

// Global hydration coordinator instance
export const hydrationCoordinator = new HydrationCoordinator();

// Predefined hydration phases for GuerillaGenics
export const HYDRATION_PHASES = {
  SHELL: 'shell',
  NAVIGATION: 'navigation',
  PICKS: 'picks',
  ODDS: 'odds',
  PLAYERS: 'players',
  ALERTS: 'alerts',
  SECONDARY_CONTENT: 'secondary-content'
} as const;

// Initialize hydration phases
export function initializeHydration() {
  console.log('🦍 Initializing progressive hydration...');
  
  // Mark shell as immediately ready
  hydrationCoordinator.markPhaseComplete(HYDRATION_PHASES.SHELL);
  
  // Navigation should be ready quickly
  setTimeout(() => {
    hydrationCoordinator.markPhaseComplete(HYDRATION_PHASES.NAVIGATION);
  }, 50);
}

export default {
  useProgressiveData,
  useIntersectionObserver,
  useHydrationPriority,
  measurePerformance,
  reserveSpace,
  hydrationCoordinator,
  HYDRATION_PHASES,
  initializeHydration
};