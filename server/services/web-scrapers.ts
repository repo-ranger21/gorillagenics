import axios from 'axios';
import * as cheerio from 'cheerio';

export interface InjuryStatus {
  playerName: string;
  team: string;
  position: string;
  status: 'Questionable' | 'Doubtful' | 'Out' | 'IR' | 'Healthy';
  injury: string;
  estimatedReturn?: string;
  injuryRecoveryDays: number;
}

export interface DFSLine {
  playerName: string;
  position: string;
  team: string;
  salary: number;
  projectedPoints: number;
  ownership: number;
  value: number;
}

export interface PlayerProp {
  playerName: string;
  market: string; // 'passing_yards', 'rushing_yards', 'receptions', etc.
  line: number;
  overOdds: number;
  underOdds: number;
  sportsbook: string;
}

export interface BiometricCue {
  playerName: string;
  platform: 'facebook' | 'instagram' | 'twitter';
  postText: string;
  extractedMetrics: {
    sleepHours?: number;
    recoveryPercent?: number;
    hydrationLevel?: string;
    mood?: string;
  };
  confidence: number;
  timestamp: Date;
}

export class WebScrapingService {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  // NFL.com injury report scraper
  async scrapeNFLInjuries(): Promise<InjuryStatus[]> {
    try {
      const response = await axios.get('https://www.nfl.com/injuries/', {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const injuries: InjuryStatus[] = [];

      // Parse injury table - adjust selectors based on actual NFL.com structure
      $('.injury-report-table tbody tr').each((_, element) => {
        const row = $(element);
        const playerName = row.find('.player-name').text().trim();
        const team = row.find('.team-abbr').text().trim();
        const position = row.find('.position').text().trim();
        const status = row.find('.injury-status').text().trim() as InjuryStatus['status'];
        const injury = row.find('.injury-type').text().trim();

        if (playerName && team && status) {
          const injuryRecoveryDays = this.calculateRecoveryDays(status, injury);
          
          injuries.push({
            playerName,
            team,
            position,
            status,
            injury,
            injuryRecoveryDays
          });
        }
      });

      console.log(`🏥 Scraped ${injuries.length} injury reports from NFL.com`);
      return injuries;
    } catch (error) {
      console.error('Error scraping NFL injuries:', error);
      return this.getMockInjuries(); // Fallback to mock data
    }
  }

  // Pro Football Reference historical data scraper
  async scrapePFRHistoricalData(playerId: string): Promise<any> {
    try {
      const response = await axios.get(`https://www.pro-football-reference.com/players/${playerId.charAt(0)}/${playerId}.htm`, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Extract career stats and injury history
      const careerStats = {};
      const injuryHistory = [];

      // Parse career stats table
      $('#stats tbody tr').each((_, element) => {
        const row = $(element);
        const year = row.find('[data-stat="year_id"]').text();
        const games = row.find('[data-stat="g"]').text();
        // Add more stats as needed
      });

      return { careerStats, injuryHistory };
    } catch (error) {
      console.error('Error scraping PFR data:', error);
      return null;
    }
  }

  // DraftKings DFS lines scraper  
  async scrapeDraftKingsLines(): Promise<DFSLine[]> {
    try {
      // Note: This would require more sophisticated scraping with headless browser
      // for dynamic content. For now, using mock structure.
      
      const response = await axios.get('https://sportsbook.draftkings.com/leagues/football/nfl', {
        headers: { 
          'User-Agent': this.userAgent,
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 10000
      });

      // Would parse JSON response from API endpoints discovered via browser dev tools
      const lines: DFSLine[] = [];
      
      console.log(`💰 Scraped ${lines.length} DFS lines from DraftKings`);
      return lines;
    } catch (error) {
      console.error('Error scraping DraftKings:', error);
      return this.getMockDFSLines();
    }
  }

  // FanDuel player props scraper
  async scrapeFanDuelProps(): Promise<PlayerProp[]> {
    try {
      const response = await axios.get('https://sportsbook.fanduel.com/navigation/nfl', {
        headers: { 
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      const props: PlayerProp[] = [];
      
      // Would parse FanDuel's API response structure
      // Extract player props from JSON data
      
      console.log(`📊 Scraped ${props.length} player props from FanDuel`);
      return props;
    } catch (error) {
      console.error('Error scraping FanDuel:', error);
      return this.getMockPlayerProps();
    }
  }

  // Facebook API integration for biometric cues
  async fetchFacebookBiometricCues(accessToken?: string): Promise<BiometricCue[]> {
    if (!accessToken) {
      console.warn('Facebook access token not provided - using mock biometric cues');
      return this.getMockBiometricCues();
    }

    try {
      // Search for verified NFL player accounts
      const playerAccounts = await this.findNFLPlayerAccounts(accessToken);
      const biometricCues: BiometricCue[] = [];

      for (const account of playerAccounts) {
        const posts = await this.fetchRecentPosts(account.id, accessToken);
        
        for (const post of posts) {
          const extractedMetrics = this.extractBiometricData(post.message || '');
          
          if (Object.keys(extractedMetrics).length > 0) {
            biometricCues.push({
              playerName: account.name,
              platform: 'facebook',
              postText: post.message,
              extractedMetrics,
              confidence: this.calculateExtractionConfidence(extractedMetrics),
              timestamp: new Date(post.created_time)
            });
          }
        }
      }

      console.log(`📱 Extracted ${biometricCues.length} biometric cues from Facebook`);
      return biometricCues;
    } catch (error) {
      console.error('Error fetching Facebook data:', error);
      return this.getMockBiometricCues();
    }
  }

  private async findNFLPlayerAccounts(accessToken: string): Promise<any[]> {
    // Would search for verified NFL player accounts
    // For now returning mock structure
    return [];
  }

  private async fetchRecentPosts(accountId: string, accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v18.0/${accountId}/posts`,
        {
          params: {
            access_token: accessToken,
            fields: 'message,created_time,story',
            limit: 10
          }
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching Facebook posts:', error);
      return [];
    }
  }

  private extractBiometricData(text: string): any {
    const metrics: any = {};
    
    // Regex patterns for common biometric mentions
    const sleepPattern = /(?:slept|sleep|sleeping)\s*(?:for)?\s*(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i;
    const recoveryPattern = /(?:recovery|recovered?)\s*(?:at)?\s*(\d+)%?/i;
    const hydrationPattern = /(?:hydrated?|hydration|water)\s*(?:level)?\s*(?:at)?\s*(\d+)%?/i;
    const moodPattern = /(?:feeling|mood)\s*(great|good|tired|exhausted|energized|pumped)/i;

    const sleepMatch = text.match(sleepPattern);
    if (sleepMatch) metrics.sleepHours = parseFloat(sleepMatch[1]);

    const recoveryMatch = text.match(recoveryPattern);
    if (recoveryMatch) metrics.recoveryPercent = parseInt(recoveryMatch[1]);

    const hydrationMatch = text.match(hydrationPattern);
    if (hydrationMatch) metrics.hydrationLevel = hydrationMatch[1];

    const moodMatch = text.match(moodPattern);
    if (moodMatch) metrics.mood = moodMatch[1].toLowerCase();

    return metrics;
  }

  private calculateExtractionConfidence(metrics: any): number {
    const metricCount = Object.keys(metrics).length;
    return Math.min(metricCount * 25, 100); // 25% confidence per metric, max 100%
  }

  private calculateRecoveryDays(status: string, injury: string): number {
    // Estimate recovery days based on injury type and status
    const baseRecoveryDays: { [key: string]: number } = {
      'Out': 7,
      'Doubtful': 5,
      'Questionable': 2,
      'IR': 30,
      'Healthy': 0
    };

    const injuryModifiers: { [key: string]: number } = {
      'knee': 1.5,
      'ankle': 1.2,
      'hamstring': 1.3,
      'concussion': 2.0,
      'shoulder': 1.4,
      'back': 1.6,
      'foot': 1.3
    };

    let baseDays = baseRecoveryDays[status] || 3;
    
    // Apply injury-specific modifier
    for (const [injuryType, modifier] of Object.entries(injuryModifiers)) {
      if (injury.toLowerCase().includes(injuryType)) {
        baseDays *= modifier;
        break;
      }
    }

    return Math.round(baseDays);
  }

  // Mock data fallbacks
  private getMockInjuries(): InjuryStatus[] {
    return [
      {
        playerName: 'Lamar Jackson',
        team: 'BAL',
        position: 'QB',
        status: 'Questionable',
        injury: 'Back',
        injuryRecoveryDays: 3
      },
      {
        playerName: 'Christian McCaffrey',
        team: 'SF',
        position: 'RB',
        status: 'Out',
        injury: 'Knee',
        injuryRecoveryDays: 10
      }
    ];
  }

  private getMockDFSLines(): DFSLine[] {
    return [
      {
        playerName: 'Josh Allen',
        position: 'QB',
        team: 'BUF',
        salary: 8200,
        projectedPoints: 22.5,
        ownership: 18.2,
        value: 2.74
      }
    ];
  }

  private getMockPlayerProps(): PlayerProp[] {
    return [
      {
        playerName: 'Travis Kelce',
        market: 'receiving_yards',
        line: 65.5,
        overOdds: -110,
        underOdds: -110,
        sportsbook: 'FanDuel'
      }
    ];
  }

  private getMockBiometricCues(): BiometricCue[] {
    return [
      {
        playerName: 'Patrick Mahomes',
        platform: 'facebook',
        postText: 'Got a great 8 hours of sleep last night, feeling 100% recovered and ready for Sunday!',
        extractedMetrics: {
          sleepHours: 8,
          recoveryPercent: 100,
          mood: 'great'
        },
        confidence: 75,
        timestamp: new Date()
      }
    ];
  }
}

export const webScrapingService = new WebScrapingService();