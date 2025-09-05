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
  private oddsApiKey = process.env.ODDS_API_KEY;
  private oddsBaseUrl = 'https://api.the-odds-api.com/v4';

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
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams/${teamId}/athletes`
      );
      return response.data.items || [];
    } catch (error) {
      console.error(`Error fetching roster for team ${teamId}:`, error);
      return [];
    }
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
            markets: 'h2h,spreads,totals',
            oddsFormat: 'american',
            apiKey: this.oddsApiKey
          }
        }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching odds:', error);
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
            markets: 'player_pass_yds,player_rush_yds,player_receptions',
            oddsFormat: 'american',
            apiKey: this.oddsApiKey
          }
        }
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching player props:', error);
      return [];
    }
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