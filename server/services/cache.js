// Caching Service with TTLs
export class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = {
      odds: 60 * 1000,        // 1 minute for odds
      schedule: 15 * 60 * 1000, // 15 minutes for schedule
      players: 6 * 60 * 60 * 1000, // 6 hours for players
      picks: 60 * 1000,       // 1 minute for picks
      health: 30 * 1000,      // 30 seconds for health
      gematria: 60 * 1000     // 1 minute for Gematria analysis
    };
  }

  set(key, value, type = 'default') {
    const ttl = this.ttls[type] || 5 * 60 * 1000; // 5 min default
    const expiry = Date.now() + ttl;

    this.cache.set(key, {
      value,
      expiry,
      type,
      createdAt: Date.now()
    });

    // Auto-cleanup expired entries periodically
    this.scheduleCleanup();
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    const stats = {
      total: this.cache.size,
      byType: {},
      memory: 0
    };

    for (const [key, entry] of this.cache.entries()) {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      // Rough memory estimation
      stats.memory += JSON.stringify(entry).length;
    }

    return stats;
  }

  scheduleCleanup() {
    // Clean up expired entries every 5 minutes
    if (!this.cleanupTimer) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  // Generate cache keys
  static keys = {
    currentWeek: () => 'current_week',
    weekSchedule: (week, season = 2025) => `schedule_${season}_${week}`,
    gameOdds: (week) => `odds_week_${week}`,
    teamOffense: (teamId) => `offense_${teamId}`,
    gamePicks: (week) => `picks_week_${week}`,
    health: () => 'health_status'
  };
}