// Sleeper API Adapter - Offensive Players Only (QB/RB/WR/TE)
export class PlayersSleeperAdapter {
  constructor() {
    this.baseUrl = 'https://api.sleeper.app/v1';
    this.offensivePositions = new Set(['QB', 'RB', 'WR', 'TE']);
    this.playerCache = new Map(); // Cache player data
    this.cacheExpiry = 6 * 60 * 60 * 1000; // 6 hours
  }

  async getFeaturedOffense(teamId) {
    try {
      // Check cache first
      const cacheKey = `offense_${teamId}`;
      const cached = this.playerCache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
        return cached.data;
      }

      // Fetch all NFL players
      const playersData = await this.getAllPlayers();
      if (!playersData) return this.getFallbackOffense(teamId);

      // Filter by team and offensive positions
      const teamPlayers = Object.values(playersData).filter(player => 
        player.team === this.mapTeamId(teamId) && 
        player.position && 
        this.offensivePositions.has(player.position) &&
        player.active === true
      );

      // Rank and select top players by position
      const featuredPlayers = this.selectTopOffensivePlayers(teamPlayers);

      const result = {
        teamId,
        players: featuredPlayers,
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.playerCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error(`Failed to fetch offense for team ${teamId}:`, error);
      return this.getFallbackOffense(teamId);
    }
  }

  async getAllPlayers() {
    try {
      const response = await fetch(`${this.baseUrl}/players/nfl`);
      if (!response.ok) throw new Error(`Sleeper API error: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch all players from Sleeper:', error);
      return null;
    }
  }

  selectTopOffensivePlayers(teamPlayers) {
    const playersByPosition = {
      QB: [],
      RB: [],
      WR: [],
      TE: []
    };

    // Group by position
    teamPlayers.forEach(player => {
      if (playersByPosition[player.position]) {
        playersByPosition[player.position].push(player);
      }
    });

    const featured = [];

    // Select QB1 (top quarterback)
    const qbs = playersByPosition.QB
      .sort((a, b) => this.getPlayerRanking(b) - this.getPlayerRanking(a))
      .slice(0, 1);
    
    qbs.forEach(qb => {
      featured.push(this.formatPlayer(qb, 'QB1'));
    });

    // Select RB1/RB2 (top 2 running backs)
    const rbs = playersByPosition.RB
      .sort((a, b) => this.getPlayerRanking(b) - this.getPlayerRanking(a))
      .slice(0, 2);
    
    rbs.forEach((rb, index) => {
      featured.push(this.formatPlayer(rb, `RB${index + 1}`));
    });

    // Select WR1/WR2 (top 2 wide receivers) 
    const wrs = playersByPosition.WR
      .sort((a, b) => this.getPlayerRanking(b) - this.getPlayerRanking(a))
      .slice(0, 2);
    
    wrs.forEach((wr, index) => {
      featured.push(this.formatPlayer(wr, `WR${index + 1}`));
    });

    // Select TE1 (top tight end)
    const tes = playersByPosition.TE
      .sort((a, b) => this.getPlayerRanking(b) - this.getPlayerRanking(a))
      .slice(0, 1);
    
    tes.forEach(te => {
      featured.push(this.formatPlayer(te, 'TE1'));
    });

    return featured.slice(0, 4); // Limit to top 4 offensive players
  }

  getPlayerRanking(player) {
    // Ranking algorithm based on fantasy relevance and recent performance
    let score = 0;
    
    // Fantasy points from last season (if available)
    if (player.fantasy_data_nfl) {
      score += player.fantasy_data_nfl.pts_ppr || 0;
    }
    
    // Position-specific bonuses
    switch (player.position) {
      case 'QB':
        score += player.years_exp > 3 ? 50 : 25; // Experience bonus
        break;
      case 'RB':
        score += player.age < 28 ? 30 : 15; // Youth bonus
        break;
      case 'WR':
        score += player.height_inches > 72 ? 20 : 10; // Size bonus
        break;
      case 'TE':
        score += player.years_exp > 2 ? 25 : 10; // Experience bonus
        break;
    }

    // Injury status penalty
    if (player.injury_status && player.injury_status !== 'Healthy') {
      score -= 25;
    }

    return score;
  }

  formatPlayer(player, roleTag) {
    return {
      id: player.player_id,
      name: `${player.first_name} ${player.last_name}`,
      position: player.position,
      roleTag,
      jerseyNumber: player.number,
      age: player.age,
      experience: player.years_exp,
      height: player.height,
      weight: player.weight,
      headshotUrl: this.getPlayerHeadshot(player.player_id),
      injuryStatus: player.injury_status || 'Healthy'
    };
  }

  getPlayerHeadshot(playerId) {
    // Sleeper doesn't provide headshots directly, use ESPN fallback
    return `https://a.espncdn.com/i/headshots/nfl/players/full/${playerId}.png`;
  }

  mapTeamId(espnTeamId) {
    // Map ESPN team IDs to Sleeper team abbreviations
    const teamMap = {
      '1': 'ATL',
      '2': 'BUF', 
      '3': 'CHI',
      '4': 'CIN',
      '5': 'CLE',
      '6': 'DAL',
      '7': 'DEN',
      '8': 'DET',
      '9': 'GB',
      '10': 'TEN',
      '11': 'IND',
      '12': 'KC',
      '13': 'LV',
      '14': 'LAR',
      '15': 'MIA',
      '16': 'MIN',
      '17': 'NE',
      '18': 'NO',
      '19': 'NYG',
      '20': 'NYJ',
      '21': 'PHI',
      '22': 'ARI',
      '23': 'PIT',
      '24': 'LAC',
      '25': 'SF',
      '26': 'SEA',
      '27': 'TB',
      '28': 'WAS',
      '29': 'CAR',
      '30': 'JAX',
      '33': 'BAL',
      '34': 'HOU'
    };

    return teamMap[espnTeamId?.toString()] || 'UNK';
  }

  getFallbackOffense(teamId) {
    // Fallback data if API fails - return empty but valid structure
    return {
      teamId,
      players: [],
      lastUpdated: new Date().toISOString(),
      fallback: true
    };
  }

  // Strict validation to ensure no defensive players
  validateOffensiveOnly(players) {
    const defensivePositions = new Set([
      'LB', 'CB', 'S', 'DL', 'EDGE', 'DE', 'DT', 'DB', 'K', 'P', 'LS', 'OLB', 'ILB', 'SS', 'FS'
    ]);

    return players.filter(player => {
      if (defensivePositions.has(player.position)) {
        console.warn(`Filtering out defensive player: ${player.name} (${player.position})`);
        return false;
      }
      return this.offensivePositions.has(player.position);
    });
  }
}