import { nflDataService } from './nfl-data';
import { livePlayerService } from './live-player-service';
import { storage } from '../storage';

export class LiveOddsService {
  private lastOddsRefresh: Date | null = null;
  private cachedOdds: any[] = [];
  private cachedPlayerProps: any[] = [];
  private oddsValidityMs = 2 * 60 * 1000; // 2 minutes for odds

  async refreshLiveOdds(forceRefresh: boolean = false): Promise<{ gameOdds: any[], playerProps: any[] }> {
    const now = new Date();
    
    // Check if we need to refresh odds
    if (!forceRefresh && 
        this.lastOddsRefresh && 
        (now.getTime() - this.lastOddsRefresh.getTime()) < this.oddsValidityMs) {
      console.log('🎰 Using cached live odds');
      return {
        gameOdds: this.cachedOdds,
        playerProps: this.cachedPlayerProps
      };
    }

    try {
      console.log('💰 Fetching fresh live betting odds...');
      
      // Fetch multiple odds feeds simultaneously
      const [gameOdds, liveInGameOdds, playerProps, enhancedProps] = await Promise.allSettled([
        nflDataService.fetchOdds(),
        nflDataService.fetchLiveInGameOdds(),
        nflDataService.fetchPlayerProps(),
        nflDataService.fetchEnhancedPlayerProps()
      ]);

      // Combine all odds data
      const allGameOdds = [
        ...(gameOdds.status === 'fulfilled' ? gameOdds.value : []),
        ...(liveInGameOdds.status === 'fulfilled' ? liveInGameOdds.value : [])
      ];
      
      const allPlayerProps = [
        ...(playerProps.status === 'fulfilled' ? playerProps.value : []),
        ...(enhancedProps.status === 'fulfilled' ? enhancedProps.value : [])
      ];

      // Update cache
      this.cachedOdds = allGameOdds;
      this.cachedPlayerProps = allPlayerProps;
      this.lastOddsRefresh = now;

      console.log(`✅ Refreshed odds: ${allGameOdds.length} games, ${allPlayerProps.length} prop markets`);
      
      return {
        gameOdds: allGameOdds,
        playerProps: allPlayerProps
      };

    } catch (error) {
      console.error('Error refreshing live odds:', error);
      
      // Return cached data if available
      return {
        gameOdds: this.cachedOdds,
        playerProps: this.cachedPlayerProps
      };
    }
  }

  async integrateOddsWithPlayers(): Promise<any[]> {
    try {
      // Get fresh player data and odds
      const [players, oddsData] = await Promise.all([
        livePlayerService.refreshPlayerData(),
        this.refreshLiveOdds()
      ]);

      if (players.length === 0) {
        console.warn('No players found for odds integration');
        return [];
      }

      if (oddsData.playerProps.length === 0) {
        console.warn('No player props found, returning players without odds');
        return players;
      }

      // Enhance players with live odds
      const enhancedPlayers = nflDataService.parseAndEnhancePlayerOdds(
        oddsData.playerProps, 
        players
      );

      // Generate betting alerts for good value plays
      await this.generateBettingAlerts(enhancedPlayers);

      console.log(`🎯 Enhanced ${enhancedPlayers.length} players with live betting odds`);
      return enhancedPlayers.length > 0 ? enhancedPlayers : players;

    } catch (error) {
      console.error('Error integrating odds with players:', error);
      
      // Fallback to players without odds
      return await livePlayerService.refreshPlayerData();
    }
  }

  private async generateBettingAlerts(players: any[]) {
    for (const player of players) {
      try {
        // Alert for high-value betting opportunities
        if (player.recommendedBets && player.recommendedBets.length > 0) {
          const bestBet = player.recommendedBets.reduce((best: any, current: any) => 
            current.edge > best.edge ? current : best
          );
          
          if (bestBet.edge >= 8) {
            await storage.createAlert({
              playerName: player.name,
              team: player.team,
              metricType: 'Betting Value',
              previousValue: 0,
              currentValue: bestBet.edge,
              commentary: `💰 HIGH VALUE BET ALERT! ${player.name} ${bestBet.market} ${bestBet.line > 0 ? 'Over' : 'Under'} ${Math.abs(bestBet.line)} at ${bestBet.odds > 0 ? '+' : ''}${bestBet.odds} (${bestBet.edge}% edge)`
            });
          }
        }

        // Alert for BioBoost vs Market discrepancies
        if (player.bioBoostScore >= 85 && player.liveOdds && Object.keys(player.liveOdds).length > 0) {
          await storage.createAlert({
            playerName: player.name,
            team: player.team,
            metricType: 'BioBoost vs Market',
            previousValue: 50,
            currentValue: player.bioBoostScore,
            commentary: `🦍 MARKET INEFFICIENCY! ${player.name} has ${player.bioBoostScore} BioBoost but market may be undervaluing. Check live odds!`
          });
        }

      } catch (alertError) {
        console.error(`Error generating betting alert for ${player.name}:`, alertError);
      }
    }
  }

  async getBestBettingOpportunities(limit: number = 10): Promise<any[]> {
    try {
      const enhancedPlayers = await this.integrateOddsWithPlayers();
      
      // Filter players with betting recommendations
      const bettingOpportunities = enhancedPlayers
        .filter(p => p.recommendedBets && p.recommendedBets.length > 0)
        .flatMap(p => p.recommendedBets.map((bet: any) => ({
          ...bet,
          player: {
            name: p.name,
            team: p.team,
            position: p.position,
            bioBoostScore: p.bioBoostScore
          }
        })))
        .sort((a, b) => b.edge - a.edge)
        .slice(0, limit);

      return bettingOpportunities;
    } catch (error) {
      console.error('Error getting betting opportunities:', error);
      return [];
    }
  }

  async getGameOdds(): Promise<any[]> {
    const oddsData = await this.refreshLiveOdds();
    return oddsData.gameOdds;
  }

  getOddsStatus() {
    return {
      lastRefresh: this.lastOddsRefresh,
      gamesWithOdds: this.cachedOdds.length,
      playerPropsAvailable: this.cachedPlayerProps.length,
      cacheValid: this.lastOddsRefresh ? 
        (Date.now() - this.lastOddsRefresh.getTime()) < this.oddsValidityMs : false
    };
  }
}

export const liveOddsService = new LiveOddsService();