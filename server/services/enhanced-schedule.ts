import axios from 'axios';

interface ScheduleCache {
  data: any;
  timestamp: number;
}

interface LiveGame {
  id: string;
  week: number;
  date: string;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    record: string;
  };
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    record: string;
  };
  venue: string;
  broadcast: string | null;
  odds?: {
    spread: number;
    total: number;
    moneyline: { home: number; away: number };
  };
}

export class EnhancedScheduleService {
  private cache = new Map<string, ScheduleCache>();
  private cacheTimeout = 15 * 60 * 1000; // 15 minutes

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

  // Auto-detect current NFL week with Tuesday rollover at 12:00 AM ET
  getCurrentNFLWeek(): number {
    const now = new Date();
    const seasonStart = new Date('2024-09-05'); // NFL 2024 season start (Thursday Week 1)
    
    // Convert to ET for Tuesday rollover logic
    const etNow = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    // If it's before Tuesday midnight ET, use previous week
    const dayOfWeek = etNow.getDay();
    const hour = etNow.getHours();
    
    let adjustedDate = new Date(etNow);
    if (dayOfWeek < 2) {
      // Before Tuesday (Sunday = 0, Monday = 1), use previous week
      adjustedDate.setDate(adjustedDate.getDate() - 7);
    }
    
    const diffTime = adjustedDate.getTime() - seasonStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(18, Math.max(1, Math.ceil(diffDays / 7)));
    
    return currentWeek;
  }

  // Get next week for slate preparation
  getNextWeek(): number {
    const currentWeek = this.getCurrentNFLWeek();
    return Math.min(18, currentWeek + 1);
  }

  // Check if we should show next week's slate (Tuesday after games)
  shouldShowNextWeek(): boolean {
    const etNow = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    const dayOfWeek = etNow.getDay();
    
    // Show next week starting Tuesday at midnight ET
    return dayOfWeek >= 2;
  }

  // Get live NFL schedule from ESPN
  async fetchLiveSchedule(week?: number): Promise<LiveGame[]> {
    const targetWeek = week || this.getCurrentNFLWeek();
    const cacheKey = `live-schedule-week-${targetWeek}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const year = 2024;
      
      // ESPN NFL scoreboard API
      const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=${targetWeek}&year=${year}`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'GuerillaGenics/1.0'
        }
      });
      
      if (!response.ok && response.status !== 200) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = response.data;
      const games: LiveGame[] = data.events?.map((event: any) => {
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
        const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
        
        return {
          id: event.id,
          week: targetWeek,
          date: event.date,
          status: competition.status.type.name,
          homeTeam: {
            id: homeTeam.team.id,
            name: homeTeam.team.displayName,
            abbreviation: homeTeam.team.abbreviation,
            logo: homeTeam.team.logo,
            score: parseInt(homeTeam.score) || 0,
            record: homeTeam.records?.[0]?.summary || '0-0'
          },
          awayTeam: {
            id: awayTeam.team.id,
            name: awayTeam.team.displayName,
            abbreviation: awayTeam.team.abbreviation,
            logo: awayTeam.team.logo,
            score: parseInt(awayTeam.score) || 0,
            record: awayTeam.records?.[0]?.summary || '0-0'
          },
          venue: competition.venue?.fullName || 'TBD',
          broadcast: event.competitions[0]?.broadcasts?.[0]?.names?.join(', ') || null
        };
      }) || [];
      
      this.setCachedData(cacheKey, games);
      console.log(`✅ Fetched live schedule for Week ${targetWeek}: ${games.length} games`);
      return games;
      
    } catch (error) {
      console.error('Error fetching live schedule:', error);
      
      // Fallback to cached data if available
      const fallbackData = this.cache.get(cacheKey);
      if (fallbackData) {
        console.log(`⚠️ Using fallback cached schedule data for Week ${targetWeek}`);
        return fallbackData.data;
      }
      
      // Ultimate fallback - return empty array
      console.warn(`❌ No schedule data available for Week ${targetWeek}`);
      return [];
    }
  }

  // Get schedule with odds integration
  async fetchScheduleWithOdds(week?: number): Promise<LiveGame[]> {
    const schedule = await this.fetchLiveSchedule(week);
    
    // If odds API key is available, fetch odds
    if (process.env.ODDS_API_KEY) {
      try {
        const odds = await this.fetchOddsForGames(schedule);
        return this.mergeScheduleWithOdds(schedule, odds);
      } catch (error) {
        console.warn('Could not fetch odds, returning schedule without odds:', error.message);
      }
    }
    
    return schedule;
  }

  // Fetch odds from The Odds API
  private async fetchOddsForGames(games: LiveGame[]): Promise<any[]> {
    if (!process.env.ODDS_API_KEY) {
      return [];
    }

    try {
      const response = await axios.get(
        'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds',
        {
          params: {
            regions: 'us',
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            bookmakers: 'draftkings,fanduel,betmgm',
            apiKey: process.env.ODDS_API_KEY
          },
          timeout: 8000
        }
      );
      
      console.log(`✅ Fetched odds for ${response.data?.length || 0} NFL games`);
      return response.data || [];
    } catch (error) {
      console.warn('Error fetching odds:', error.message);
      return [];
    }
  }

  // Merge schedule data with odds
  private mergeScheduleWithOdds(schedule: LiveGame[], odds: any[]): LiveGame[] {
    return schedule.map(game => {
      // Find matching odds by team names
      const gameOdds = odds.find(o => 
        (o.home_team?.toLowerCase().includes(game.homeTeam.name.toLowerCase()) ||
         o.away_team?.toLowerCase().includes(game.awayTeam.name.toLowerCase())) ||
        (o.home_team?.toLowerCase().includes(game.homeTeam.abbreviation.toLowerCase()) ||
         o.away_team?.toLowerCase().includes(game.awayTeam.abbreviation.toLowerCase()))
      );

      if (gameOdds && gameOdds.bookmakers?.length > 0) {
        const bookmaker = gameOdds.bookmakers[0]; // Use first bookmaker (DraftKings preferred)
        
        // Extract spread, total, and moneyline
        const spreadMarket = bookmaker.markets?.find((m: any) => m.key === 'spreads');
        const totalMarket = bookmaker.markets?.find((m: any) => m.key === 'totals');
        const h2hMarket = bookmaker.markets?.find((m: any) => m.key === 'h2h');
        
        let spread = 0;
        let total = 0;
        let moneyline = { home: 0, away: 0 };
        
        if (spreadMarket?.outcomes) {
          const homeSpread = spreadMarket.outcomes.find((o: any) => 
            o.name.toLowerCase().includes(game.homeTeam.name.toLowerCase())
          );
          if (homeSpread?.point) {
            spread = homeSpread.point;
          }
        }
        
        if (totalMarket?.outcomes?.[0]?.point) {
          total = totalMarket.outcomes[0].point;
        }
        
        if (h2hMarket?.outcomes) {
          const homeML = h2hMarket.outcomes.find((o: any) => 
            o.name.toLowerCase().includes(game.homeTeam.name.toLowerCase())
          );
          const awayML = h2hMarket.outcomes.find((o: any) => 
            o.name.toLowerCase().includes(game.awayTeam.name.toLowerCase())
          );
          
          moneyline = {
            home: homeML?.price || 0,
            away: awayML?.price || 0
          };
        }
        
        return {
          ...game,
          odds: { spread, total, moneyline }
        };
      }
      
      return game;
    });
  }

  // Get games by slate type
  getGamesBySlate(games: LiveGame[], slateType: 'main' | 'primetime' | 'all' = 'all'): LiveGame[] {
    if (slateType === 'all') return games;
    
    return games.filter(game => {
      const gameDate = new Date(game.date);
      const hour = gameDate.getHours();
      const dayOfWeek = gameDate.getDay();
      
      if (slateType === 'main') {
        // Sunday 1pm-4pm ET games
        return dayOfWeek === 0 && hour >= 13 && hour <= 16;
      } else if (slateType === 'primetime') {
        // SNF, MNF, TNF
        return (dayOfWeek === 0 && hour >= 20) || // SNF
               (dayOfWeek === 1 && hour >= 20) || // MNF  
               (dayOfWeek === 4 && hour >= 20);   // TNF
      }
      
      return false;
    });
  }

  // Get upcoming games (next 7 days)
  getUpcomingGames(games: LiveGame[]): LiveGame[] {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return games.filter(game => {
      const gameDate = new Date(game.date);
      return gameDate >= now && gameDate <= nextWeek;
    });
  }

  // Check if rollover should happen (Tuesday midnight ET)
  isRolloverTime(): boolean {
    const etNow = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    const dayOfWeek = etNow.getDay();
    const hour = etNow.getHours();
    
    return dayOfWeek === 2 && hour === 0; // Tuesday at midnight ET
  }

  // Get schedule status info
  getScheduleStatus(): any {
    const currentWeek = this.getCurrentNFLWeek();
    const nextWeek = this.getNextWeek();
    const showNextWeek = this.shouldShowNextWeek();
    const isRollover = this.isRolloverTime();
    
    return {
      currentWeek,
      nextWeek,
      showNextWeek,
      isRollover,
      season: 2024,
      cacheSize: this.cache.size,
      lastUpdate: new Date().toISOString()
    };
  }
}