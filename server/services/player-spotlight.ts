import axios from 'axios';

interface PlayerSpotlight {
  id: string;
  name: string;
  position: string;
  role: string; // QB1, WR1, RB1, TE1
  team: string;
  headshot: string;
  usageNotes: string;
  dfsValue: 'Elite' | 'Mid' | 'Sleeper';
  salary: {
    draftkings?: number;
    fanduel?: number;
  };
  slateEligibility: string[];
  projectedPoints: number;
  targetShare?: number;
  carryShare?: number;
  redZoneUsage?: number;
  bioBoostScore?: number;
}

interface TeamPlayers {
  teamId: string;
  teamName: string;
  abbreviation: string;
  players: PlayerSpotlight[];
}

export class PlayerSpotlightService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 20 * 60 * 1000; // 20 minutes
  private sleeperBaseUrl = 'https://api.sleeper.app/v1';

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

  // Get featured offensive players for a specific team
  async getFeaturedOffensivePlayers(teamAbbr: string): Promise<PlayerSpotlight[]> {
    const cacheKey = `featured-players-${teamAbbr}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Get all NFL players from Sleeper
      const allPlayers = await this.fetchSleeperPlayers();
      
      // Filter for the specific team and offensive positions only
      const teamPlayers = this.filterOffensivePlayers(allPlayers, teamAbbr);
      
      // Get top players by position
      const featuredPlayers = this.selectFeaturedPlayers(teamPlayers);
      
      // Enhance with DFS data and usage notes
      const enhancedPlayers = await this.enhancePlayersWithDFSData(featuredPlayers);
      
      this.setCachedData(cacheKey, enhancedPlayers);
      return enhancedPlayers;
      
    } catch (error) {
      console.error(`Error fetching featured players for ${teamAbbr}:`, error);
      return [];
    }
  }

  // Get featured players for multiple teams (for matchups)
  async getFeaturedPlayersForMatchup(homeTeam: string, awayTeam: string): Promise<{
    home: PlayerSpotlight[];
    away: PlayerSpotlight[];
  }> {
    const [homePlayers, awayPlayers] = await Promise.all([
      this.getFeaturedOffensivePlayers(homeTeam),
      this.getFeaturedOffensivePlayers(awayTeam)
    ]);

    return {
      home: homePlayers,
      away: awayPlayers
    };
  }

  // Fetch all NFL players from Sleeper API
  private async fetchSleeperPlayers(): Promise<any> {
    const cacheKey = 'sleeper-all-players';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.sleeperBaseUrl}/players/nfl`, {
        timeout: 15000
      });
      
      this.setCachedData(cacheKey, response.data);
      console.log('✅ Fetched all NFL players from Sleeper API');
      return response.data;
      
    } catch (error) {
      console.error('Error fetching Sleeper players:', error);
      
      // Return cached data if available
      const fallback = this.cache.get(cacheKey);
      if (fallback) {
        console.log('⚠️ Using fallback Sleeper player data');
        return fallback.data;
      }
      
      return {};
    }
  }

  // Filter for offensive players only (QB, RB, WR, TE)
  private filterOffensivePlayers(allPlayers: any, teamAbbr: string): any[] {
    const offensivePositions = ['QB', 'RB', 'WR', 'TE'];
    const players = [];

    for (const playerId in allPlayers) {
      const player = allPlayers[playerId];
      
      if (player && 
          player.team === teamAbbr && 
          offensivePositions.includes(player.position) &&
          player.active) {
        players.push({
          ...player,
          sleeperId: playerId
        });
      }
    }
    
    return players;
  }

  // Select featured players by position (2-4 per team)
  private selectFeaturedPlayers(teamPlayers: any[]): any[] {
    const featured = [];
    
    // Position priorities and limits
    const positionLimits = {
      'QB': 1, // Starting QB only
      'RB': 2, // RB1 and RB2
      'WR': 3, // Top 3 WRs
      'TE': 1  // TE1 only
    };

    // Sort players by fantasy relevance (rough estimation)
    const sortedPlayers = teamPlayers.sort((a, b) => {
      // Prioritize by position importance and years_exp
      const positionPriority = { 'QB': 4, 'RB': 3, 'WR': 2, 'TE': 1 };
      const aPriority = positionPriority[a.position] || 0;
      const bPriority = positionPriority[b.position] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then by experience (assuming more exp = more relevant)
      const aExp = a.years_exp || 0;
      const bExp = b.years_exp || 0;
      return bExp - aExp;
    });

    // Select featured players by position
    const positionCounts: { [key: string]: number } = {};
    
    for (const player of sortedPlayers) {
      const position = player.position;
      const currentCount = positionCounts[position] || 0;
      const maxForPosition = positionLimits[position] || 0;
      
      if (currentCount < maxForPosition) {
        featured.push(player);
        positionCounts[position] = currentCount + 1;
      }
    }
    
    return featured;
  }

  // Enhance players with DFS data and usage notes
  private async enhancePlayersWithDFSData(players: any[]): Promise<PlayerSpotlight[]> {
    const enhanced: PlayerSpotlight[] = [];
    
    for (const player of players) {
      try {
        const spotlight: PlayerSpotlight = {
          id: player.sleeperId,
          name: `${player.first_name} ${player.last_name}`,
          position: player.position,
          role: this.determineRole(player),
          team: player.team,
          headshot: this.getPlayerHeadshot(player),
          usageNotes: this.generateUsageNotes(player),
          dfsValue: this.calculateDFSValue(player),
          salary: await this.fetchDFSSalaries(player),
          slateEligibility: this.determineSlateEligibility(player),
          projectedPoints: this.calculateProjectedPoints(player),
          targetShare: this.calculateTargetShare(player),
          carryShare: this.calculateCarryShare(player),
          redZoneUsage: this.calculateRedZoneUsage(player),
          bioBoostScore: this.calculatePlayerBioBoost(player)
        };
        
        enhanced.push(spotlight);
      } catch (error) {
        console.warn(`Error enhancing player ${player.full_name}:`, error);
      }
    }
    
    return enhanced;
  }

  // Determine player role (QB1, WR1, etc.)
  private determineRole(player: any): string {
    const position = player.position;
    const depthChart = player.depth_chart_order || 1;
    
    switch (position) {
      case 'QB':
        return depthChart === 1 ? 'QB1' : 'QB2';
      case 'RB':
        return depthChart === 1 ? 'RB1' : 'RB2';
      case 'WR':
        if (depthChart === 1) return 'WR1';
        if (depthChart === 2) return 'WR2';
        return 'WR3';
      case 'TE':
        return depthChart === 1 ? 'TE1' : 'TE2';
      default:
        return position;
    }
  }

  // Get player headshot URL
  private getPlayerHeadshot(player: any): string {
    // Sleeper provides player IDs for headshots
    if (player.sleeperId) {
      return `https://sleepercdn.com/content/nfl/players/thumb/${player.sleeperId}.jpg`;
    }
    
    // Fallback to a default avatar
    return `https://sleepercdn.com/images/v2/icons/player_default.webp`;
  }

  // Generate usage notes based on player data
  private generateUsageNotes(player: any): string {
    const position = player.position;
    const role = this.determineRole(player);
    
    switch (position) {
      case 'QB':
        return role === 'QB1' 
          ? 'Primary passer, goal-line rush upside' 
          : 'Backup with limited fantasy appeal';
      
      case 'RB':
        if (role === 'RB1') {
          return 'Workhorse back, high carry volume, red zone touches';
        } else {
          return 'Change-of-pace back, passing down specialist';
        }
      
      case 'WR':
        if (role === 'WR1') {
          return 'Alpha receiver, high target share, red zone looks';
        } else if (role === 'WR2') {
          return 'Secondary target, big-play potential';
        } else {
          return 'Slot receiver, PPR value, touchdown dependent';
        }
      
      case 'TE':
        return role === 'TE1'
          ? 'Primary receiving threat, red zone target'
          : 'Blocking specialist, limited targets';
      
      default:
        return 'Depth player, situational usage';
    }
  }

  // Calculate DFS value tier
  private calculateDFSValue(player: any): 'Elite' | 'Mid' | 'Sleeper' {
    const role = this.determineRole(player);
    const experience = player.years_exp || 0;
    
    // Elite tier
    if ((role === 'QB1' || role === 'RB1' || role === 'WR1') && experience >= 3) {
      return 'Elite';
    }
    
    // Sleeper tier
    if (role.includes('2') || role.includes('3') || experience <= 1) {
      return 'Sleeper';
    }
    
    // Mid tier (default)
    return 'Mid';
  }

  // Fetch DFS salaries (mock implementation - would integrate with actual DFS APIs)
  private async fetchDFSSalaries(player: any): Promise<{ draftkings?: number; fanduel?: number }> {
    // Mock salary data based on position and role
    const position = player.position;
    const role = this.determineRole(player);
    
    const salaryRanges = {
      'QB1': { dk: [7500, 9000], fd: [8000, 9500] },
      'QB2': { dk: [5000, 6500], fd: [5500, 7000] },
      'RB1': { dk: [7000, 8500], fd: [7500, 9000] },
      'RB2': { dk: [4500, 6500], fd: [5000, 7000] },
      'WR1': { dk: [6500, 8000], fd: [7000, 8500] },
      'WR2': { dk: [5000, 7000], fd: [5500, 7500] },
      'WR3': { dk: [4000, 6000], fd: [4500, 6500] },
      'TE1': { dk: [4500, 6500], fd: [5000, 7000] },
      'TE2': { dk: [3500, 5000], fd: [4000, 5500] }
    };
    
    const ranges = salaryRanges[role] || { dk: [4000, 6000], fd: [4500, 6500] };
    
    return {
      draftkings: Math.floor(Math.random() * (ranges.dk[1] - ranges.dk[0])) + ranges.dk[0],
      fanduel: Math.floor(Math.random() * (ranges.fd[1] - ranges.fd[0])) + ranges.fd[0]
    };
  }

  // Determine slate eligibility
  private determineSlateEligibility(player: any): string[] {
    const eligibility = ['Main Slate']; // All players eligible for main slate
    
    // Add prime-time eligibility for star players
    const role = this.determineRole(player);
    if (role.includes('1')) {
      eligibility.push('Prime-Time');
    }
    
    // All players eligible for showdown
    eligibility.push('Showdown');
    
    return eligibility;
  }

  // Calculate projected fantasy points
  private calculateProjectedPoints(player: any): number {
    const position = player.position;
    const role = this.determineRole(player);
    
    const baseProjections = {
      'QB1': 20, 'QB2': 12,
      'RB1': 16, 'RB2': 10,
      'WR1': 14, 'WR2': 10, 'WR3': 7,
      'TE1': 11, 'TE2': 6
    };
    
    const base = baseProjections[role] || 8;
    const variance = base * 0.2; // 20% variance
    
    return Math.round((base + (Math.random() - 0.5) * variance) * 10) / 10;
  }

  // Calculate target share for pass catchers
  private calculateTargetShare(player: any): number | undefined {
    if (!['WR', 'TE'].includes(player.position)) return undefined;
    
    const role = this.determineRole(player);
    const targetShares = {
      'WR1': 25, 'WR2': 18, 'WR3': 12,
      'TE1': 15, 'TE2': 8
    };
    
    const base = targetShares[role] || 10;
    return Math.round(base + (Math.random() - 0.5) * 5);
  }

  // Calculate carry share for RBs
  private calculateCarryShare(player: any): number | undefined {
    if (player.position !== 'RB') return undefined;
    
    const role = this.determineRole(player);
    const carryShares = {
      'RB1': 65,
      'RB2': 25
    };
    
    const base = carryShares[role] || 15;
    return Math.round(base + (Math.random() - 0.5) * 10);
  }

  // Calculate red zone usage
  private calculateRedZoneUsage(player: any): number {
    const role = this.determineRole(player);
    const position = player.position;
    
    let base = 0;
    if (role.includes('1')) {
      base = position === 'RB' ? 45 : position === 'TE' ? 25 : 20;
    } else {
      base = position === 'RB' ? 20 : 10;
    }
    
    return Math.round(base + (Math.random() - 0.5) * 15);
  }

  // Calculate simple BioBoost for players
  private calculatePlayerBioBoost(player: any): number {
    const age = this.calculateAge(player.birth_date) || 26;
    const experience = player.years_exp || 0;
    const position = player.position;
    
    let bioBoost = 70;
    
    // Age factor
    if (age < 25) bioBoost += 10;
    else if (age > 30) bioBoost -= 10;
    
    // Experience factor
    if (experience >= 5) bioBoost += 5;
    else if (experience <= 1) bioBoost -= 5;
    
    // Position factor
    if (['QB', 'RB'].includes(position)) bioBoost += 5;
    
    // Add some randomness
    bioBoost += Math.floor(Math.random() * 20) - 10;
    
    return Math.min(100, Math.max(0, bioBoost));
  }

  private calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Get service status
  getServiceStatus(): any {
    return {
      cacheSize: this.cache.size,
      cacheTimeout: this.cacheTimeout / 1000 / 60, // minutes
      lastUpdate: new Date().toISOString(),
      apiEndpoint: this.sleeperBaseUrl
    };
  }
}