import axios from 'axios';
import { Player, Alert } from '@shared/schema';

interface ESPNPlayer {
  id: string;
  displayName: string;
  position: {
    abbreviation: string;
  };
  team: {
    abbreviation: string;
  };
  statistics?: any[];
}

interface ESPNTeam {
  id: string;
  displayName: string;
  abbreviation: string;
  record: {
    items: Array<{
      summary: string;
    }>;
  };
}

interface ESPNGame {
  id: string;
  date: string;
  competitions: Array<{
    competitors: Array<{
      team: ESPNTeam;
      homeAway: string;
    }>;
  }>;
}

interface OddsAPIResponse {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

export class NFLDataService {
  private espnBaseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  private espnCoreUrl = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl';
  private oddsApiKey = process.env.ODDS_API_KEY;
  private oddsBaseUrl = 'https://api.the-odds-api.com/v4';
  
  // NFL team mappings
  private teamMappings = new Map([
    ['ARI', { espnId: '22', name: 'Arizona Cardinals' }],
    ['ATL', { espnId: '1', name: 'Atlanta Falcons' }],
    ['BAL', { espnId: '33', name: 'Baltimore Ravens' }],
    ['BUF', { espnId: '2', name: 'Buffalo Bills' }],
    ['CAR', { espnId: '29', name: 'Carolina Panthers' }],
    ['CHI', { espnId: '3', name: 'Chicago Bears' }],
    ['CIN', { espnId: '4', name: 'Cincinnati Bengals' }],
    ['CLE', { espnId: '5', name: 'Cleveland Browns' }],
    ['DAL', { espnId: '6', name: 'Dallas Cowboys' }],
    ['DEN', { espnId: '7', name: 'Denver Broncos' }],
    ['DET', { espnId: '8', name: 'Detroit Lions' }],
    ['GB', { espnId: '9', name: 'Green Bay Packers' }],
    ['HOU', { espnId: '34', name: 'Houston Texans' }],
    ['IND', { espnId: '11', name: 'Indianapolis Colts' }],
    ['JAX', { espnId: '30', name: 'Jacksonville Jaguars' }],
    ['KC', { espnId: '12', name: 'Kansas City Chiefs' }],
    ['LV', { espnId: '13', name: 'Las Vegas Raiders' }],
    ['LAC', { espnId: '24', name: 'Los Angeles Chargers' }],
    ['LAR', { espnId: '14', name: 'Los Angeles Rams' }],
    ['MIA', { espnId: '15', name: 'Miami Dolphins' }],
    ['MIN', { espnId: '16', name: 'Minnesota Vikings' }],
    ['NE', { espnId: '17', name: 'New England Patriots' }],
    ['NO', { espnId: '18', name: 'New Orleans Saints' }],
    ['NYG', { espnId: '19', name: 'New York Giants' }],
    ['NYJ', { espnId: '20', name: 'New York Jets' }],
    ['PHI', { espnId: '21', name: 'Philadelphia Eagles' }],
    ['PIT', { espnId: '23', name: 'Pittsburgh Steelers' }],
    ['SF', { espnId: '25', name: 'San Francisco 49ers' }],
    ['SEA', { espnId: '26', name: 'Seattle Seahawks' }],
    ['TB', { espnId: '27', name: 'Tampa Bay Buccaneers' }],
    ['TEN', { espnId: '10', name: 'Tennessee Titans' }],
    ['WSH', { espnId: '28', name: 'Washington Commanders' }]
  ]);

  async fetchCurrentWeekGames(): Promise<ESPNGame[]> {
    try {
      const response = await axios.get(`${this.espnBaseUrl}/scoreboard`);
      return response.data.events || [];
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  async fetchPlayerStats(playerId: string, season: number = 2024): Promise<any> {
    try {
      const response = await axios.get(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${season}/athletes/${playerId}/statistics/0`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching player stats for ${playerId}:`, error);
      return null;
    }
  }

  async fetchTeamRoster(teamId: string): Promise<ESPNPlayer[]> {
    try {
      const response = await axios.get(
        `${this.espnCoreUrl}/seasons/2024/teams/${teamId}/athletes`
      );
      return response.data.items || [];
    } catch (error) {
      console.error(`Error fetching roster for team ${teamId}:`, error);
      return [];
    }
  }

  async fetchAllNFLPlayers(limit: number = 50): Promise<any[]> {
    try {
      const players: any[] = [];
      const currentWeekGames = await this.fetchCurrentWeekGames();
      
      // Get players from current week's games
      for (const game of currentWeekGames.slice(0, 8)) { // Limit games to avoid rate limits
        const competitors = game.competitions?.[0]?.competitors || [];
        
        for (const competitor of competitors) {
          const teamEspnId = competitor.team?.id;
          if (teamEspnId) {
            try {
              const roster = await this.fetchTeamRoster(teamEspnId);
              
              // Process top players from each position
              const positionLimits = { 'QB': 2, 'RB': 3, 'WR': 4, 'TE': 2, 'K': 1 };
              const positionCounts: { [key: string]: number } = {};
              
              for (const playerRef of roster) {
                if (players.length >= limit) break;
                
                try {
                  // Fetch detailed player data
                  const playerResponse = await axios.get(playerRef.$ref);
                  const player = playerResponse.data;
                  
                  if (player && player.position?.abbreviation) {
                    const pos = player.position.abbreviation;
                    const currentCount = positionCounts[pos] || 0;
                    const maxForPosition = positionLimits[pos] || 1;
                    
                    if (currentCount < maxForPosition) {
                      // Calculate enhanced player data
                      const enhancedPlayer = await this.createEnhancedPlayer(player, competitor.team);
                      players.push(enhancedPlayer);
                      positionCounts[pos] = currentCount + 1;
                    }
                  }
                  
                  // Rate limiting
                  await this.sleep(100);
                } catch (playerError) {
                  console.warn('Error fetching individual player:', playerError);
                }
              }
            } catch (teamError) {
              console.warn(`Error fetching roster for team ${teamEspnId}:`, teamError);
            }
          }
          
          // Rate limiting between teams
          await this.sleep(500);
        }
      }
      
      console.log(`✅ Fetched ${players.length} real NFL players from ESPN API`);
      return players;
    } catch (error) {
      console.error('Error fetching NFL players:', error);
      return [];
    }
  }

  private async createEnhancedPlayer(espnPlayer: any, team: any): Promise<any> {
    try {
      // Extract basic player info
      const playerId = this.generatePlayerId(espnPlayer.displayName);
      const position = espnPlayer.position?.abbreviation || 'Unknown';
      const teamAbbr = team.abbreviation || 'UNK';
      
      // Get current stats if available
      let stats = null;
      try {
        if (espnPlayer.id) {
          stats = await this.fetchPlayerStats(espnPlayer.id.toString());
        }
      } catch (statsError) {
        console.warn('Could not fetch stats for player:', espnPlayer.displayName);
      }
      
      // Generate opponent matchup
      const opponent = await this.findOpponent(teamAbbr);
      const matchup = `${teamAbbr} ${Math.random() > 0.5 ? '@' : 'vs'} ${opponent}`;
      
      // Calculate BioBoost with real data
      const bioBoostData = this.calculateEnhancedBioBoost(espnPlayer, stats, position);
      
      // Generate betting line based on position and stats
      const bettingData = this.generateBettingLine(position, stats, bioBoostData.bioBoost);
      
      return {
        id: playerId,
        name: espnPlayer.displayName,
        position: position,
        team: teamAbbr,
        matchup: matchup,
        sleepScore: bioBoostData.sleepScore,
        testosteroneProxy: bioBoostData.testosteroneProxy,
        cortisolProxy: bioBoostData.cortisolProxy,
        hydrationLevel: bioBoostData.hydrationLevel,
        injuryRecoveryDays: bioBoostData.injuryRecoveryDays,
        bioBoostScore: bioBoostData.bioBoost,
        recommendedPick: bettingData.pick,
        betLine: bettingData.line,
        betType: bettingData.type,
        confidence: bettingData.confidence,
        gameTime: this.generateGameTime(),
        commentary: this.generateCommentary(bioBoostData.bioBoost, bettingData.pick),
        espnId: espnPlayer.id,
        realStats: stats
      };
    } catch (error) {
      console.error('Error creating enhanced player:', error);
      return null;
    }
  }

  private calculateEnhancedBioBoost(player: any, stats: any, position: string) {
    // Age-based testosterone calculation
    const age = this.calculateAge(player.dateOfBirth) || 26;
    let testosteroneBase = age < 24 ? 85 : age < 28 ? 80 : age < 32 ? 75 : 70;
    
    // Position bonuses for physicality
    const physicalPositions = ['RB', 'LB', 'DE', 'DT', 'OL'];
    if (physicalPositions.includes(position)) testosteroneBase += 10;
    
    // Height/weight factors for testosterone proxy
    const height = player.height || 72; // inches
    const weight = player.weight || 200; // pounds
    const bmi = (weight / (height * height)) * 703;
    if (bmi >= 25 && bmi <= 30) testosteroneBase += 5; // Optimal BMI range for athletes
    
    // Recent performance impact on confidence/testosterone
    if (stats && stats.passing?.passingYards > 300) testosteroneBase += 8;
    if (stats && stats.rushing?.rushingYards > 100) testosteroneBase += 10;
    if (stats && stats.receiving?.receivingYards > 100) testosteroneBase += 7;
    
    // Sleep score (simulated with some real factors)
    let sleepScore = 70 + Math.floor(Math.random() * 25);
    if (age < 25) sleepScore += 5; // Younger players typically sleep better
    
    // Cortisol (stress) - lower is better
    let cortisol = 30 + Math.floor(Math.random() * 40);
    if (stats && stats.errors > 2) cortisol += 15; // More errors = more stress
    
    // Hydration (simulated)
    const hydration = 75 + Math.floor(Math.random() * 25);
    
    // Injury recovery (simulated, would integrate with injury reports)
    const injuryRecovery = Math.floor(Math.random() * 7);
    
    // Final BioBoost calculation
    const bioBoost = Math.round(
      sleepScore * 0.30 +
      testosteroneBase * 0.40 +
      (100 - cortisol) * 0.15 +
      hydration * 0.10 +
      Math.max(100 - injuryRecovery * 5, 0) * 0.05
    );
    
    return {
      sleepScore,
      testosteroneProxy: Math.min(testosteroneBase, 100),
      cortisolProxy: cortisol,
      hydrationLevel: hydration,
      injuryRecoveryDays: injuryRecovery,
      bioBoost: Math.min(Math.max(bioBoost, 0), 100)
    };
  }

  private generateBettingLine(position: string, stats: any, bioBoost: number) {
    const lines: { [key: string]: { type: string, baseRange: [number, number] } } = {
      'QB': { type: 'Passing Yards', baseRange: [220, 320] },
      'RB': { type: 'Rushing Yards', baseRange: [60, 120] },
      'WR': { type: 'Receiving Yards', baseRange: [45, 95] },
      'TE': { type: 'Receiving Yards', baseRange: [35, 75] },
      'K': { type: 'Made FGs', baseRange: [1, 3] }
    };
    
    const lineData = lines[position] || { type: 'Fantasy Points', baseRange: [8, 16] };
    const [min, max] = lineData.baseRange;
    
    // Adjust line based on BioBoost
    const bioBoostFactor = bioBoost / 100;
    const adjustment = (max - min) * (bioBoostFactor - 0.5) * 0.4; // +/- 20% based on BioBoost
    const baseLine = min + (max - min) * 0.6; // Start at 60% of range
    const finalLine = baseLine + adjustment;
    
    // Generate recommendation
    let pick = 'HOLD';
    let confidence = 50;
    
    if (bioBoost >= 80) {
      pick = bioBoost >= 90 ? 'STRONG BUY' : 'BUY';
      confidence = 75 + Math.floor(Math.random() * 20);
    } else if (bioBoost <= 45) {
      pick = 'AVOID';
      confidence = 65 + Math.floor(Math.random() * 15);
    } else {
      confidence = 50 + Math.floor(Math.random() * 20);
    }
    
    return {
      line: Math.round(finalLine * 2) / 2, // Round to nearest 0.5
      type: lineData.type,
      pick,
      confidence
    };
  }

  private async findOpponent(teamAbbr: string): Promise<string> {
    // Simplified opponent finding - would enhance with schedule API
    const teams = Array.from(this.teamMappings.keys()).filter(t => t !== teamAbbr);
    return teams[Math.floor(Math.random() * teams.length)];
  }

  private generateGameTime(): string {
    const times = ['1:00 PM ET', '4:25 PM ET', '8:20 PM ET', '1:00 PM ET', '4:05 PM ET'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private generateCommentary(bioBoost: number, pick: string): string {
    if (bioBoost >= 90 && pick === 'STRONG BUY') {
      return '🦍 Alpha gorilla energy detected! Prime jungle domination expected.';
    } else if (bioBoost >= 80) {
      return '🍌 Strong BioBoost metrics. Expect above-average primal performance.';
    } else if (bioBoost <= 45) {
      return '😴 Low energy readings. Gorilla recommends caution in the jungle.';
    } else if (pick === 'AVOID') {
      return '⚠️ Mixed signals from the jungle. Proceed with gorilla-level caution.';
    }
    return 'Steady gorilla performance expected. Standard jungle protocols apply.';
  }

  private generatePlayerId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  private calculateAge(dateOfBirth: string): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchInjuryReport(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.espnBaseUrl}/news`);
      const injuryNews = response.data.articles?.filter((article: any) => 
        article.headline?.toLowerCase().includes('injury') ||
        article.headline?.toLowerCase().includes('injured') ||
        article.headline?.toLowerCase().includes('hurt')
      ) || [];
      return injuryNews;
    } catch (error) {
      console.error('Error fetching injury reports:', error);
      return [];
    }
  }

  async fetchOdds(): Promise<OddsAPIResponse[]> {
    if (!this.oddsApiKey) {
      console.warn('Odds API key not configured');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.oddsBaseUrl}/sports/americanfootball_nfl/odds`,
        {
          params: {
            regions: 'us',
            markets: 'h2h,spreads,totals,alternate_spreads,alternate_totals',
            oddsFormat: 'american',
            bookmakers: 'draftkings,fanduel,betmgm,caesars,pointsbet',
            apiKey: this.oddsApiKey
          }
        }
      );
      console.log(`✅ Fetched live odds for ${response.data?.length || 0} NFL games`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching odds:', error);
      return [];
    }
  }

  async fetchLiveInGameOdds(): Promise<OddsAPIResponse[]> {
    if (!this.oddsApiKey) {
      console.warn('Odds API key not configured');
      return [];
    }

    try {
      // Get current week games that are live or upcoming
      const games = await this.getCurrentWeekGames();
      const liveGameIds = games.slice(0, 5).map(g => g.id);
      
      if (liveGameIds.length === 0) {
        console.log('No live games found for in-game odds');
        return [];
      }
      
      const response = await axios.get(
        `${this.oddsBaseUrl}/sports/americanfootball_nfl/odds`,
        {
          params: {
            regions: 'us',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            bookmakers: 'draftkings,fanduel,betmgm',
            eventIds: liveGameIds.join(','),
            apiKey: this.oddsApiKey
          }
        }
      );
      
      console.log(`✅ Fetched in-game odds for ${response.data?.length || 0} live NFL games`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching live in-game odds:', error);
      return [];
    }
  }

  async fetchPlayerProps(): Promise<OddsAPIResponse[]> {
    if (!this.oddsApiKey) {
      console.warn('Odds API key not configured');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.oddsBaseUrl}/sports/americanfootball_nfl/odds`,
        {
          params: {
            regions: 'us',
            markets: 'player_pass_yds,player_rush_yds,player_receptions,player_pass_tds,player_rush_tds,player_receiving_yds,player_anytime_td',
            oddsFormat: 'american',
            bookmakers: 'draftkings,fanduel,betmgm,caesars',
            apiKey: this.oddsApiKey
          }
        }
      );
      console.log(`✅ Fetched ${response.data?.length || 0} games with player props`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching player props:', error);
      return [];
    }
  }

  async fetchEnhancedPlayerProps(): Promise<any[]> {
    if (!this.oddsApiKey) {
      console.warn('Odds API key not configured');
      return [];
    }

    try {
      // Get current week games for context
      const games = await this.getCurrentWeekGames();
      const gameIds = games.slice(0, 6).map(g => g.id);
      
      const allProps = [];
      
      // Fetch different prop markets in batches to avoid rate limits
      const marketBatches = [
        'player_pass_yds,player_pass_tds,player_pass_completions',
        'player_rush_yds,player_rush_tds,player_rush_attempts', 
        'player_receptions,player_receiving_yds,player_anytime_td'
      ];
      
      for (const markets of marketBatches) {
        try {
          const response = await axios.get(
            `${this.oddsBaseUrl}/sports/americanfootball_nfl/odds`,
            {
              params: {
                regions: 'us',
                markets,
                oddsFormat: 'american',
                bookmakers: 'draftkings,fanduel,betmgm',
                eventIds: gameIds.slice(0, 3).join(','),
                apiKey: this.oddsApiKey
              }
            }
          );
          
          if (response.data && Array.isArray(response.data)) {
            allProps.push(...response.data);
          }
          
          // Rate limiting between requests
          await this.sleep(300);
        } catch (marketError) {
          console.warn(`Error fetching markets ${markets}:`, marketError.message);
        }
      }
      
      console.log(`✅ Fetched ${allProps.length} enhanced player props from live odds API`);
      return allProps;
    } catch (error) {
      console.error('Error fetching enhanced player props:', error);
      return [];
    }
  }

  parseAndEnhancePlayerOdds(oddsData: any[], players: any[]): any[] {
    const enhancedPlayers = players.map(player => ({ ...player, liveOdds: {} }));
    
    for (const game of oddsData) {
      if (!game.bookmakers || !Array.isArray(game.bookmakers)) continue;
      
      for (const bookmaker of game.bookmakers) {
        if (!bookmaker.markets || !Array.isArray(bookmaker.markets)) continue;
        
        for (const market of bookmaker.markets) {
          if (!market.outcomes || !Array.isArray(market.outcomes)) continue;
          
          for (const outcome of market.outcomes) {
            // Match player by name (fuzzy matching)
            const matchingPlayer = enhancedPlayers.find(p => 
              outcome.description && 
                this.fuzzyPlayerMatch(p.name, outcome.description)
            );
            
            if (matchingPlayer) {
              const marketKey = market.key.replace('player_', '');
              
              if (!matchingPlayer.liveOdds[marketKey]) {
                matchingPlayer.liveOdds[marketKey] = {};
              }
              
              if (!matchingPlayer.liveOdds[marketKey][bookmaker.key]) {
                matchingPlayer.liveOdds[marketKey][bookmaker.key] = [];
              }
              
              matchingPlayer.liveOdds[marketKey][bookmaker.key].push({
                line: outcome.point || null,
                odds: outcome.price,
                name: outcome.name,
                updated: new Date().toISOString()
              });
              
              // Calculate BioBoost vs Market edge
              const oddsValue = this.calculateOddsValue(matchingPlayer.bioBoostScore, {
                odds: outcome.price,
                line: outcome.point
              });
              
              if (oddsValue && oddsValue.edge > 5) {
                matchingPlayer.recommendedBets = matchingPlayer.recommendedBets || [];
                matchingPlayer.recommendedBets.push({
                  market: marketKey,
                  bookmaker: bookmaker.key,
                  line: outcome.point,
                  odds: outcome.price,
                  edge: oddsValue.edge,
                  confidence: Math.min(95, matchingPlayer.bioBoostScore + oddsValue.edge)
                });
              }
            }
          }
        }
      }
    }
    
    return enhancedPlayers.filter(p => Object.keys(p.liveOdds).length > 0 || p.recommendedBets?.length > 0);
  }

  private fuzzyPlayerMatch(playerName: string, description: string): boolean {
    const cleanName = playerName.toLowerCase().replace(/[^a-z\s]/g, '');
    const cleanDesc = description.toLowerCase().replace(/[^a-z\s]/g, '');
    
    const nameParts = cleanName.split(' ');
    return nameParts.some(part => 
      part.length > 2 && cleanDesc.includes(part)
    );
  }

  private calculateOddsValue(bioBoost: number, marketData: any): any {
    if (!marketData || !marketData.odds) return null;
    
    // Convert American odds to implied probability
    const getImpliedProb = (americanOdds: number) => {
      if (americanOdds > 0) {
        return 100 / (americanOdds + 100);
      } else {
        return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
      }
    };
    
    // BioBoost to expected probability
    const bioBoostProb = Math.max(0.4, Math.min(0.85, bioBoost / 100));
    const impliedProb = getImpliedProb(marketData.odds);
    const edge = (bioBoostProb - impliedProb) * 100;
    
    return edge > 3 ? {
      edge: Math.round(edge * 10) / 10,
      impliedProb: Math.round(impliedProb * 100),
      bioBoostProb: Math.round(bioBoostProb * 100)
    } : null;
  }

  // Calculate BioBoost score based on available metrics
  calculateBioBoost(playerData: any): number {
    // Mock biometric calculations - would integrate real data sources
    const sleepScore = this.generateMockSleepScore(playerData);
    const testosteroneProxy = this.calculateTestosteroneProxy(playerData);
    const cortisolProxy = this.calculateCortisolProxy(playerData);
    const hydrationLevel = this.generateMockHydration();
    const injuryRecovery = this.calculateInjuryRecovery(playerData);

    // Weighted BioBoost calculation
    const bioBoost = Math.round(
      sleepScore * 0.30 +
      testosteroneProxy * 0.40 +
      cortisolProxy * 0.15 +
      hydrationLevel * 0.10 +
      injuryRecovery * 0.05
    );

    return Math.min(Math.max(bioBoost, 0), 100);
  }

  private generateMockSleepScore(playerData: any): number {
    // Would integrate with wearable data APIs
    return Math.floor(Math.random() * 40) + 60; // 60-100
  }

  private calculateTestosteroneProxy(playerData: any): number {
    // Calculate based on recent performance, age, position
    const baseScore = 75;
    const ageBonus = playerData.age < 28 ? 10 : playerData.age > 32 ? -10 : 0;
    const positionBonus = ['RB', 'LB', 'DE'].includes(playerData.position) ? 10 : 0;
    
    return Math.min(Math.max(baseScore + ageBonus + positionBonus + Math.floor(Math.random() * 20) - 10, 0), 100);
  }

  private calculateCortisolProxy(playerData: any): number {
    // Lower is better for cortisol (stress indicator)
    return Math.floor(Math.random() * 60) + 20; // 20-80
  }

  private generateMockHydration(): number {
    return Math.floor(Math.random() * 30) + 70; // 70-100
  }

  private calculateInjuryRecovery(playerData: any): number {
    // Would check injury reports and recovery timelines
    return Math.floor(Math.random() * 50) + 50; // 50-100
  }

  // Generate alerts based on metric changes
  generateAlerts(previousData: any[], currentData: any[]): Alert[] {
    const alerts: Alert[] = [];
    // Implementation would compare previous vs current metrics
    // and generate alerts for significant changes
    return alerts;
  }
}

export const nflDataService = new NFLDataService();