import { storage } from '../storage';

interface HistoricalPick {
  id: string;
  week: number;
  season: number;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  pickType: 'spread' | 'total' | 'moneyline';
  pickedTeam?: string;
  pickedSide?: 'over' | 'under';
  pickedLine: number;
  actualResult: number;
  outcome: 'win' | 'loss' | 'push';
  bioBoostScore: number;
  confidence: 'high' | 'medium' | 'low';
  commentary: string;
  timestamp: string;
  finalScore?: string;
  contributorId?: string;
}

interface AccuracyMetrics {
  totalPicks: number;
  wins: number;
  losses: number;
  pushes: number;
  winRate: number;
  overUnderAccuracy: number;
  spreadAccuracy: number;
  bioBoostAccuracy: number;
  highConfidenceWinRate: number;
  averageBioBoost: number;
  streaks: {
    current: { type: 'win' | 'loss'; count: number };
    longest: { type: 'win' | 'loss'; count: number };
  };
}

interface WeeklyPerformance {
  week: number;
  picks: number;
  wins: number;
  winRate: number;
  avgBioBoost: number;
  bestPick?: string;
}

export class PickHistoryService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Add a new pick to history
  async addPickToHistory(pick: Omit<HistoricalPick, 'id' | 'timestamp'>): Promise<string> {
    try {
      const pickId = `pick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const historicalPick: HistoricalPick = {
        ...pick,
        id: pickId,
        timestamp: new Date().toISOString()
      };
      
      // Store in database/storage
      await this.storePick(historicalPick);
      
      // Clear relevant caches
      this.clearCaches(['all-picks', `week-${pick.week}`, 'accuracy-metrics']);
      
      return pickId;
    } catch (error) {
      console.error('Error adding pick to history:', error);
      throw error;
    }
  }

  // Get all historical picks with filtering
  async getHistoricalPicks(filters?: {
    week?: number;
    season?: number;
    team?: string;
    outcome?: 'win' | 'loss' | 'push';
    confidence?: 'high' | 'medium' | 'low';
    limit?: number;
    offset?: number;
  }): Promise<HistoricalPick[]> {
    const cacheKey = `picks-${JSON.stringify(filters || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // For now, return mock historical data
      // In production, this would query the database
      const mockPicks = await this.getMockHistoricalPicks();
      
      let filteredPicks = mockPicks;
      
      if (filters) {
        if (filters.week) {
          filteredPicks = filteredPicks.filter(p => p.week === filters.week);
        }
        if (filters.season) {
          filteredPicks = filteredPicks.filter(p => p.season === filters.season);
        }
        if (filters.team) {
          filteredPicks = filteredPicks.filter(p => 
            p.homeTeam.includes(filters.team!) || 
            p.awayTeam.includes(filters.team!) ||
            p.pickedTeam?.includes(filters.team!)
          );
        }
        if (filters.outcome) {
          filteredPicks = filteredPicks.filter(p => p.outcome === filters.outcome);
        }
        if (filters.confidence) {
          filteredPicks = filteredPicks.filter(p => p.confidence === filters.confidence);
        }
      }
      
      // Apply pagination
      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;
      const paginatedPicks = filteredPicks.slice(offset, offset + limit);
      
      this.setCachedData(cacheKey, paginatedPicks);
      return paginatedPicks;
      
    } catch (error) {
      console.error('Error fetching historical picks:', error);
      return [];
    }
  }

  // Calculate accuracy metrics
  async calculateAccuracyMetrics(filters?: {
    season?: number;
    lastNWeeks?: number;
  }): Promise<AccuracyMetrics> {
    const cacheKey = `accuracy-${JSON.stringify(filters || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const picks = await this.getHistoricalPicks(filters);
      
      const totalPicks = picks.length;
      const wins = picks.filter(p => p.outcome === 'win').length;
      const losses = picks.filter(p => p.outcome === 'loss').length;
      const pushes = picks.filter(p => p.outcome === 'push').length;
      
      const winRate = totalPicks > 0 ? (wins / totalPicks) * 100 : 0;
      
      // Over/Under specific accuracy
      const ouPicks = picks.filter(p => p.pickType === 'total');
      const ouWins = ouPicks.filter(p => p.outcome === 'win').length;
      const overUnderAccuracy = ouPicks.length > 0 ? (ouWins / ouPicks.length) * 100 : 0;
      
      // Spread specific accuracy
      const spreadPicks = picks.filter(p => p.pickType === 'spread');
      const spreadWins = spreadPicks.filter(p => p.outcome === 'win').length;
      const spreadAccuracy = spreadPicks.length > 0 ? (spreadWins / spreadPicks.length) * 100 : 0;
      
      // BioBoost accuracy (high BioBoost picks that won)
      const highBioBoostPicks = picks.filter(p => p.bioBoostScore >= 80);
      const highBioBoostWins = highBioBoostPicks.filter(p => p.outcome === 'win').length;
      const bioBoostAccuracy = highBioBoostPicks.length > 0 ? (highBioBoostWins / highBioBoostPicks.length) * 100 : 0;
      
      // High confidence accuracy
      const highConfidencePicks = picks.filter(p => p.confidence === 'high');
      const highConfidenceWins = highConfidencePicks.filter(p => p.outcome === 'win').length;
      const highConfidenceWinRate = highConfidencePicks.length > 0 ? (highConfidenceWins / highConfidencePicks.length) * 100 : 0;
      
      // Average BioBoost
      const averageBioBoost = totalPicks > 0 ? 
        picks.reduce((sum, p) => sum + p.bioBoostScore, 0) / totalPicks : 0;
      
      // Calculate streaks
      const streaks = this.calculateStreaks(picks);
      
      const metrics: AccuracyMetrics = {
        totalPicks,
        wins,
        losses,
        pushes,
        winRate: Math.round(winRate * 100) / 100,
        overUnderAccuracy: Math.round(overUnderAccuracy * 100) / 100,
        spreadAccuracy: Math.round(spreadAccuracy * 100) / 100,
        bioBoostAccuracy: Math.round(bioBoostAccuracy * 100) / 100,
        highConfidenceWinRate: Math.round(highConfidenceWinRate * 100) / 100,
        averageBioBoost: Math.round(averageBioBoost * 100) / 100,
        streaks
      };
      
      this.setCachedData(cacheKey, metrics);
      return metrics;
      
    } catch (error) {
      console.error('Error calculating accuracy metrics:', error);
      throw error;
    }
  }

  // Get weekly performance breakdown
  async getWeeklyPerformance(season: number = 2024): Promise<WeeklyPerformance[]> {
    const cacheKey = `weekly-performance-${season}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const performance: WeeklyPerformance[] = [];
      
      for (let week = 1; week <= 18; week++) {
        const weekPicks = await this.getHistoricalPicks({ week, season });
        
        if (weekPicks.length > 0) {
          const wins = weekPicks.filter(p => p.outcome === 'win').length;
          const winRate = (wins / weekPicks.length) * 100;
          const avgBioBoost = weekPicks.reduce((sum, p) => sum + p.bioBoostScore, 0) / weekPicks.length;
          
          // Find best pick of the week
          const bestPick = weekPicks
            .filter(p => p.outcome === 'win')
            .sort((a, b) => b.bioBoostScore - a.bioBoostScore)[0];
          
          performance.push({
            week,
            picks: weekPicks.length,
            wins,
            winRate: Math.round(winRate * 100) / 100,
            avgBioBoost: Math.round(avgBioBoost * 100) / 100,
            bestPick: bestPick ? `${bestPick.awayTeam} @ ${bestPick.homeTeam}` : undefined
          });
        }
      }
      
      this.setCachedData(cacheKey, performance);
      return performance;
      
    } catch (error) {
      console.error('Error fetching weekly performance:', error);
      return [];
    }
  }

  // Update pick result when game completes
  async updatePickResult(pickId: string, actualResult: number, finalScore?: string): Promise<void> {
    try {
      const pick = await this.getPickById(pickId);
      if (!pick) {
        throw new Error(`Pick ${pickId} not found`);
      }
      
      // Determine outcome
      let outcome: 'win' | 'loss' | 'push';
      
      if (pick.pickType === 'spread') {
        const coverMargin = actualResult - pick.pickedLine;
        if (Math.abs(coverMargin) <= 0.5) {
          outcome = 'push';
        } else {
          outcome = coverMargin > 0 ? 'win' : 'loss';
        }
      } else if (pick.pickType === 'total') {
        const totalDiff = actualResult - pick.pickedLine;
        if (Math.abs(totalDiff) <= 0.5) {
          outcome = 'push';
        } else {
          const pickedOver = pick.pickedSide === 'over';
          outcome = (pickedOver && totalDiff > 0) || (!pickedOver && totalDiff < 0) ? 'win' : 'loss';
        }
      } else {
        // Moneyline
        outcome = actualResult > 0 ? 'win' : 'loss';
      }
      
      // Update pick in storage
      await this.updatePickInStorage(pickId, {
        actualResult,
        outcome,
        finalScore
      });
      
      // Clear caches
      this.clearCaches(['accuracy-metrics', 'weekly-performance']);
      
    } catch (error) {
      console.error('Error updating pick result:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculateStreaks(picks: HistoricalPick[]): AccuracyMetrics['streaks'] {
    if (picks.length === 0) {
      return {
        current: { type: 'win', count: 0 },
        longest: { type: 'win', count: 0 }
      };
    }
    
    // Sort by timestamp (most recent first)
    const sortedPicks = [...picks].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Calculate current streak
    let currentStreakType = sortedPicks[0].outcome;
    let currentStreakCount = 0;
    
    for (const pick of sortedPicks) {
      if (pick.outcome === currentStreakType && pick.outcome !== 'push') {
        currentStreakCount++;
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    for (const pick of sortedPicks.reverse()) {
      if (pick.outcome === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else if (pick.outcome === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      }
      // Pushes don't break streaks but don't extend them either
    }
    
    const longestStreak = longestWinStreak >= longestLossStreak 
      ? { type: 'win' as const, count: longestWinStreak }
      : { type: 'loss' as const, count: longestLossStreak };
    
    return {
      current: { 
        type: currentStreakType === 'push' ? 'win' : currentStreakType as 'win' | 'loss', 
        count: currentStreakCount 
      },
      longest: longestStreak
    };
  }

  private async getMockHistoricalPicks(): Promise<HistoricalPick[]> {
    // Mock data for development - replace with actual database queries
    return [
      {
        id: 'pick-1',
        week: 17,
        season: 2024,
        gameId: '401547439',
        homeTeam: 'KC',
        awayTeam: 'LV',
        pickType: 'spread',
        pickedTeam: 'KC',
        pickedLine: -9.5,
        actualResult: -18,
        outcome: 'win',
        bioBoostScore: 88,
        confidence: 'high',
        commentary: 'Chiefs dominate division rivals at home with Mahomes leading explosive offense.',
        timestamp: '2024-12-29T18:00:00Z',
        finalScore: 'KC 31, LV 13'
      },
      {
        id: 'pick-2',
        week: 17,
        season: 2024,
        gameId: '401547440',
        homeTeam: 'BUF',
        awayTeam: 'MIA',
        pickType: 'total',
        pickedSide: 'over',
        pickedLine: 48.5,
        actualResult: 52,
        outcome: 'win',
        bioBoostScore: 75,
        confidence: 'medium',
        commentary: 'High-scoring AFC East battle with both QBs playing for playoff seeding.',
        timestamp: '2024-12-29T17:00:00Z',
        finalScore: 'BUF 28, MIA 24'
      }
    ];
  }

  private async storePick(pick: HistoricalPick): Promise<void> {
    // In production, store in database
    console.log('Storing pick:', pick.id);
  }

  private async getPickById(pickId: string): Promise<HistoricalPick | null> {
    // In production, query database
    const mockPicks = await this.getMockHistoricalPicks();
    return mockPicks.find(p => p.id === pickId) || null;
  }

  private async updatePickInStorage(pickId: string, updates: Partial<HistoricalPick>): Promise<void> {
    // In production, update database
    console.log('Updating pick:', pickId, updates);
  }

  private clearCaches(patterns: string[]): void {
    for (const [key] of this.cache) {
      if (patterns.some(pattern => key.includes(pattern))) {
        this.cache.delete(key);
      }
    }
  }

  // Get service status
  getServiceStatus(): any {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout / 1000 / 60, // minutes
      lastUpdate: new Date().toISOString()
    };
  }
}