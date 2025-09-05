import { nflDataService } from './nfl-data';
import { storage } from '../storage';
import type { Player } from '@shared/schema';

export class LivePlayerService {
  private lastFetch: Date | null = null;
  private cacheValidityMs = 15 * 60 * 1000; // 15 minutes
  private cachedPlayers: Player[] = [];

  async refreshPlayerData(forceRefresh: boolean = false): Promise<Player[]> {
    const now = new Date();
    
    // Check if we need to refresh
    if (!forceRefresh && 
        this.lastFetch && 
        this.cachedPlayers.length > 0 && 
        (now.getTime() - this.lastFetch.getTime()) < this.cacheValidityMs) {
      console.log('🦍 Using cached NFL player data');
      return this.cachedPlayers;
    }

    try {
      console.log('🔄 Fetching fresh NFL player data from ESPN API...');
      
      // Fetch real NFL players
      const livePlayersData = await nflDataService.fetchAllNFLPlayers(30);
      
      if (livePlayersData.length === 0) {
        console.warn('No live players found, keeping cached data');
        return this.cachedPlayers;
      }

      // Update storage with fresh data
      const updatedPlayers: Player[] = [];
      
      for (const playerData of livePlayersData) {
        if (!playerData) continue;
        
        try {
          // Check if player exists in storage
          const existingPlayer = await storage.getPlayer(playerData.id);
          
          if (existingPlayer) {
            // Update existing player
            const updatedPlayer = await storage.updatePlayer(playerData.id, {
              name: playerData.name,
              position: playerData.position,
              team: playerData.team,
              matchup: playerData.matchup,
              sleepScore: playerData.sleepScore,
              testosteroneProxy: playerData.testosteroneProxy,
              cortisolProxy: playerData.cortisolProxy,
              hydrationLevel: playerData.hydrationLevel,
              injuryRecoveryDays: playerData.injuryRecoveryDays,
              bioBoostScore: playerData.bioBoostScore,
              recommendedPick: playerData.recommendedPick,
              betLine: playerData.betLine,
              betType: playerData.betType,
              confidence: playerData.confidence,
              gameTime: playerData.gameTime,
              commentary: playerData.commentary
            });
            
            if (updatedPlayer) {
              updatedPlayers.push(updatedPlayer);
            }
          } else {
            // Create new player
            const newPlayer = await storage.createPlayer({
              name: playerData.name,
              position: playerData.position,
              team: playerData.team,
              matchup: playerData.matchup,
              sleepScore: playerData.sleepScore,
              testosteroneProxy: playerData.testosteroneProxy,
              cortisolProxy: playerData.cortisolProxy,
              hydrationLevel: playerData.hydrationLevel,
              injuryRecoveryDays: playerData.injuryRecoveryDays,
              bioBoostScore: playerData.bioBoostScore,
              recommendedPick: playerData.recommendedPick,
              betLine: playerData.betLine,
              betType: playerData.betType,
              confidence: playerData.confidence,
              gameTime: playerData.gameTime,
              commentary: playerData.commentary
            });
            
            updatedPlayers.push(newPlayer);
          }
        } catch (playerError) {
          console.error(`Error processing player ${playerData.name}:`, playerError);
        }
      }

      // Generate alerts for significant changes
      await this.generatePlayerAlerts(updatedPlayers);

      // Update cache
      this.cachedPlayers = updatedPlayers;
      this.lastFetch = now;

      console.log(`✅ Successfully refreshed ${updatedPlayers.length} NFL players with live data`);
      return updatedPlayers;

    } catch (error) {
      console.error('Error refreshing player data:', error);
      
      // Return cached data or storage data as fallback
      if (this.cachedPlayers.length > 0) {
        return this.cachedPlayers;
      }
      
      try {
        const fallbackPlayers = await storage.getAllPlayers();
        return fallbackPlayers;
      } catch (storageError) {
        console.error('Storage fallback failed:', storageError);
        return [];
      }
    }
  }

  private async generatePlayerAlerts(players: Player[]) {
    for (const player of players) {
      try {
        // Generate alerts for high BioBoost scores
        if (player.bioBoostScore >= 90) {
          await storage.createAlert({
            playerName: player.name,
            team: player.team,
            metricType: 'BioBoost',
            previousValue: 75,
            currentValue: player.bioBoostScore,
            commentary: `🦍 ALPHA APE ALERT! ${player.name} showing elite BioBoost of ${player.bioBoostScore}. Prime jungle domination incoming!`
          });
        }
        
        // Alert for poor sleep
        if (player.sleepScore <= 50) {
          await storage.createAlert({
            playerName: player.name,
            team: player.team,
            metricType: 'Sleep',
            previousValue: 75,
            currentValue: player.sleepScore,
            commentary: `😴 Sleep deficit detected for ${player.name}. Gorilla recommends rest before jungle warfare.`
          });
        }
        
        // Alert for injury concerns
        if (player.injuryRecoveryDays > 5) {
          await storage.createAlert({
            playerName: player.name,
            team: player.team,
            metricType: 'Injury',
            previousValue: 0,
            currentValue: player.injuryRecoveryDays,
            commentary: `🏥 Injury timeline extended for ${player.name}. ${player.injuryRecoveryDays} days recovery expected.`
          });
        }

        // Alert for strong buy recommendations
        if (player.recommendedPick === 'STRONG BUY' && player.confidence >= 85) {
          await storage.createAlert({
            playerName: player.name,
            team: player.team,
            metricType: 'Recommendation',
            previousValue: 50,
            currentValue: player.confidence,
            commentary: `🍌 STRONG BUY signal for ${player.name}! Confidence at ${player.confidence}%. Go full gorilla!`
          });
        }
        
      } catch (alertError) {
        console.error(`Error generating alert for ${player.name}:`, alertError);
      }
    }
  }

  async getTopPerformers(limit: number = 10): Promise<Player[]> {
    const allPlayers = await this.refreshPlayerData();
    
    return allPlayers
      .sort((a, b) => b.bioBoostScore - a.bioBoostScore)
      .slice(0, limit);
  }

  async getPlayersByTeam(teamAbbr: string): Promise<Player[]> {
    const allPlayers = await this.refreshPlayerData();
    
    return allPlayers.filter(player => 
      player.team.toLowerCase() === teamAbbr.toLowerCase()
    );
  }

  async getStrongBuyPlayers(): Promise<Player[]> {
    const allPlayers = await this.refreshPlayerData();
    
    return allPlayers.filter(player => 
      player.recommendedPick === 'STRONG BUY' || 
      (player.recommendedPick === 'BUY' && player.bioBoostScore >= 85)
    );
  }

  getCacheInfo() {
    return {
      lastFetch: this.lastFetch,
      cachedCount: this.cachedPlayers.length,
      cacheValid: this.lastFetch ? 
        (Date.now() - this.lastFetch.getTime()) < this.cacheValidityMs : false
    };
  }
}

export const livePlayerService = new LivePlayerService();