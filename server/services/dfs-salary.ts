import axios from 'axios';

interface DFSSalary {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  draftkings?: number;
  fanduel?: number;
  superdraft?: number;
  valueTier: 'Elite' | 'Mid' | 'Sleeper';
  slateEligibility: string[];
  valueRating: number; // 1-10 scale
}

interface SlateInfo {
  type: 'main' | 'primetime' | 'showdown';
  name: string;
  startTime: string;
  games: string[];
  playerCount: number;
}

export class DFSSalaryService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes

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

  // Get DFS salaries for featured players
  async getDFSSalariesForPlayers(playerIds: string[]): Promise<DFSSalary[]> {
    const cacheKey = `dfs-salaries-${playerIds.join('-')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const salaries: DFSSalary[] = [];
      
      // For now, generate realistic salary data
      // In production, this would integrate with DraftKings/FanDuel APIs
      for (const playerId of playerIds) {
        const salary = await this.generateRealisticSalary(playerId);
        if (salary) {
          salaries.push(salary);
        }
      }
      
      this.setCachedData(cacheKey, salaries);
      return salaries;
      
    } catch (error) {
      console.error('Error fetching DFS salaries:', error);
      return [];
    }
  }

  // Generate realistic salary data based on position and role
  private async generateRealisticSalary(playerId: string): Promise<DFSSalary | null> {
    try {
      // Mock player data - would come from player service in production
      const playerData = this.getMockPlayerData(playerId);
      if (!playerData) return null;

      const salaryData = this.calculateSalaryByPosition(playerData);
      
      return {
        playerId,
        playerName: playerData.name,
        position: playerData.position,
        team: playerData.team,
        draftkings: salaryData.dk,
        fanduel: salaryData.fd,
        superdraft: salaryData.sd,
        valueTier: this.determineValueTier(salaryData, playerData),
        slateEligibility: this.determineSlateEligibility(playerData),
        valueRating: this.calculateValueRating(salaryData, playerData)
      };
      
    } catch (error) {
      console.error(`Error generating salary for player ${playerId}:`, error);
      return null;
    }
  }

  // Calculate salaries based on position and tier
  private calculateSalaryByPosition(player: any): { dk: number; fd: number; sd: number } {
    const position = player.position;
    const tier = player.tier || 'mid'; // elite, mid, sleeper
    
    const salaryRanges = {
      QB: {
        elite: { dk: [8500, 9200], fd: [9000, 9800], sd: [14000, 16000] },
        mid: { dk: [7000, 8400], fd: [7500, 8900], sd: [11000, 13900] },
        sleeper: { dk: [5500, 6900], fd: [6000, 7400], sd: [8000, 10900] }
      },
      RB: {
        elite: { dk: [8000, 8800], fd: [8500, 9300], sd: [13000, 15000] },
        mid: { dk: [6500, 7900], fd: [7000, 8400], sd: [10000, 12900] },
        sleeper: { dk: [4500, 6400], fd: [5000, 6900], sd: [7000, 9900] }
      },
      WR: {
        elite: { dk: [7500, 8300], fd: [8000, 8800], sd: [12000, 14000] },
        mid: { dk: [5500, 7400], fd: [6000, 7900], sd: [9000, 11900] },
        sleeper: { dk: [4000, 5400], fd: [4500, 5900], sd: [6000, 8900] }
      },
      TE: {
        elite: { dk: [6000, 6800], fd: [6500, 7300], sd: [10000, 12000] },
        mid: { dk: [4500, 5900], fd: [5000, 6400], sd: [7500, 9900] },
        sleeper: { dk: [3500, 4400], fd: [4000, 4900], sd: [5500, 7400] }
      }
    };

    const ranges = salaryRanges[position]?.[tier] || salaryRanges.WR.mid;
    
    return {
      dk: this.randomInRange(ranges.dk),
      fd: this.randomInRange(ranges.fd),
      sd: this.randomInRange(ranges.sd)
    };
  }

  private randomInRange(range: number[]): number {
    const [min, max] = range;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Mock player data - in production would come from player service
  private getMockPlayerData(playerId: string): any {
    const mockPlayers = {
      'josh-allen': { name: 'Josh Allen', position: 'QB', team: 'BUF', tier: 'elite' },
      'saquon-barkley': { name: 'Saquon Barkley', position: 'RB', team: 'PHI', tier: 'elite' },
      'ceedee-lamb': { name: 'CeeDee Lamb', position: 'WR', team: 'DAL', tier: 'elite' },
      'travis-kelce': { name: 'Travis Kelce', position: 'TE', team: 'KC', tier: 'elite' },
      'derrick-henry': { name: 'Derrick Henry', position: 'RB', team: 'BAL', tier: 'mid' }
    };
    
    return mockPlayers[playerId] || null;
  }

  // Determine value tier based on salary and projected performance
  private determineValueTier(salary: any, player: any): 'Elite' | 'Mid' | 'Sleeper' {
    const position = player.position;
    const dkSalary = salary.dk;
    
    // Elite tier thresholds
    const eliteThresholds = { QB: 8500, RB: 8000, WR: 7500, TE: 6000 };
    const sleeperThresholds = { QB: 6500, RB: 6000, WR: 5000, TE: 4000 };
    
    if (dkSalary >= eliteThresholds[position]) return 'Elite';
    if (dkSalary <= sleeperThresholds[position]) return 'Sleeper';
    return 'Mid';
  }

  // Determine slate eligibility
  private determineSlateEligibility(player: any): string[] {
    const eligibility = ['Main Slate'];
    
    // Elite players eligible for all slates
    if (player.tier === 'elite') {
      eligibility.push('Prime-Time', 'Showdown');
    } else {
      eligibility.push('Showdown'); // All players eligible for showdown
    }
    
    return eligibility;
  }

  // Calculate value rating (1-10)
  private calculateValueRating(salary: any, player: any): number {
    // Mock calculation based on salary vs expected performance
    const position = player.position;
    const tier = player.tier;
    const dkSalary = salary.dk;
    
    // Base rating by tier
    let baseRating = tier === 'elite' ? 8.5 : tier === 'mid' ? 6.5 : 4.5;
    
    // Adjust for salary efficiency
    const salaryEfficiency = this.calculateSalaryEfficiency(dkSalary, position);
    baseRating += salaryEfficiency;
    
    // Add some variance
    const variance = (Math.random() - 0.5) * 1.5;
    
    return Math.min(10, Math.max(1, Math.round((baseRating + variance) * 10) / 10));
  }

  private calculateSalaryEfficiency(salary: number, position: string): number {
    // Mock efficiency calculation
    const avgSalaries = { QB: 7500, RB: 6500, WR: 6000, TE: 5000 };
    const avgSalary = avgSalaries[position] || 6000;
    
    // Lower salary = higher efficiency (more value)
    const efficiency = (avgSalary - salary) / avgSalary;
    return efficiency * 2; // Scale to -2 to +2 range
  }

  // Get current slate information
  async getCurrentSlates(): Promise<SlateInfo[]> {
    const cacheKey = 'current-slates';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const slates: SlateInfo[] = [
        {
          type: 'main',
          name: 'Main Slate',
          startTime: '1:00 PM ET',
          games: ['DAL@NYG', 'PHI@WAS', 'BUF@MIA'],
          playerCount: 150
        },
        {
          type: 'primetime',
          name: 'Prime-Time',
          startTime: '8:20 PM ET',
          games: ['KC@LV'],
          playerCount: 40
        },
        {
          type: 'showdown',
          name: 'Showdown',
          startTime: '1:00 PM ET',
          games: ['DAL@NYG'],
          playerCount: 12
        }
      ];
      
      this.setCachedData(cacheKey, slates);
      return slates;
      
    } catch (error) {
      console.error('Error fetching current slates:', error);
      return [];
    }
  }

  // Get salary trends (mock data)
  async getSalaryTrends(playerId: string): Promise<any> {
    try {
      return {
        playerId,
        trends: {
          draftkings: {
            current: 7800,
            weekAgo: 7600,
            change: '+$200',
            direction: 'up'
          },
          fanduel: {
            current: 8200,
            weekAgo: 8000,
            change: '+$200',
            direction: 'up'
          }
        },
        ownership: {
          projected: 18.5,
          lastWeek: 16.2,
          change: '+2.3%'
        },
        valueScore: 8.2
      };
    } catch (error) {
      console.error('Error fetching salary trends:', error);
      return null;
    }
  }

  // Get value plays by slate
  async getValuePlaysBySlate(slateType: string): Promise<DFSSalary[]> {
    const cacheKey = `value-plays-${slateType}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Mock value plays - would be calculated from actual data
      const allSalaries = await this.getDFSSalariesForPlayers([
        'josh-allen', 'saquon-barkley', 'ceedee-lamb', 'travis-kelce', 'derrick-henry'
      ]);
      
      // Filter by slate eligibility and sort by value rating
      const valuePlays = allSalaries
        .filter(player => player.slateEligibility.includes(this.slateTypeToName(slateType)))
        .sort((a, b) => b.valueRating - a.valueRating)
        .slice(0, 5);
      
      this.setCachedData(cacheKey, valuePlays);
      return valuePlays;
      
    } catch (error) {
      console.error('Error fetching value plays:', error);
      return [];
    }
  }

  private slateTypeToName(slateType: string): string {
    const mapping = {
      'main': 'Main Slate',
      'primetime': 'Prime-Time',
      'showdown': 'Showdown'
    };
    return mapping[slateType] || 'Main Slate';
  }

  // Get service status
  getServiceStatus(): any {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout / 1000 / 60, // minutes
      lastUpdate: new Date().toISOString(),
      supportedSites: ['DraftKings', 'FanDuel', 'SuperDraft']
    };
  }
}