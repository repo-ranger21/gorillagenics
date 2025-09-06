
export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD ? 'https://guerillagenics.app' : '',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
} as const;

export const BETTING_LIMITS = {
  MIN_BET: 10,
  MAX_BET_PERCENTAGE: 0.1, // 10% of bankroll
  CONFIDENCE_THRESHOLD: 65,
  HIGH_CONFIDENCE_THRESHOLD: 85,
} as const;

export const NFL_CONFIG = {
  SEASON_YEAR: 2024,
  REGULAR_SEASON_WEEKS: 18,
  PLAYOFF_WEEKS: 5,
  ROSTER_SIZE: 53,
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_TIMEOUT: 5000,
  MODAL_DELAY: 2000,
  POLLING_INTERVAL: 30000, // 30 seconds
} as const;

export const BIOBOOST_WEIGHTS = {
  SLEEP: 0.25,
  TESTOSTERONE: 0.20,
  CORTISOL: 0.15,
  HYDRATION: 0.15,
  RECOVERY: 0.15,
  INJURY: 0.10,
} as const;
