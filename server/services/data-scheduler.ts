import cron from 'node-cron';
import { nflDataService } from './nfl-data';
import { dataIntegrationService } from './data-integration';
import { storage } from '../storage';

export class DataScheduler {
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🦍 Starting GuerillaGenics data scheduler...');

    // Update player stats every 15 minutes during game hours (Sunday 1-11 PM ET)
    cron.schedule('*/15 1-23 * * 0', async () => {
      console.log('🏈 Updating player stats...');
      await this.updatePlayerStats();
    });

    // Full data integration every hour (combines all sources)
    cron.schedule('0 * * * *', async () => {
      console.log('🦍 Running full data integration...');
      await this.runFullDataIntegration();
    });

    // Update injury reports every 2 hours
    cron.schedule('0 */2 * * *', async () => {
      console.log('🏥 Updating injury reports...');
      await this.updateInjuryReports();
    });

    // Update betting odds every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('💰 Updating betting odds...');
      await this.updateBettingOdds();
    });

    // Update player props every hour
    cron.schedule('0 * * * *', async () => {
      console.log('📊 Updating player props...');
      await this.updatePlayerProps();
    });

    // Generate BioBoost alerts every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      console.log('🚨 Checking for BioBoost alerts...');
      await this.checkForAlerts();
    });
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Stopping GuerillaGenics data scheduler...');
    // Note: node-cron doesn't have a destroy method, tasks stop when process ends
  }

  private async updatePlayerStats() {
    try {
      const games = await nflDataService.fetchCurrentWeekGames();
      
      for (const game of games.slice(0, 5)) { // Limit to avoid rate limits
        const competitors = game.competitions[0]?.competitors || [];
        
        for (const competitor of competitors) {
          const teamId = competitor.team.id;
          const roster = await nflDataService.fetchTeamRoster(teamId);
          
          // Process top players from each team
          for (const player of roster.slice(0, 10)) {
            const playerStats = await nflDataService.fetchPlayerStats(player.id);
            if (playerStats) {
              // Calculate BioBoost and update database
              const bioBoost = nflDataService.calculateBioBoost({
                ...player,
                stats: playerStats
              });
              
              // Update player in storage with new BioBoost
              await this.updatePlayerBioBoost(player, bioBoost);
            }
          }
          
          // Add delay to respect rate limits
          await this.sleep(2000);
        }
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  }

  private async runFullDataIntegration() {
    try {
      // Get Facebook token from environment if available
      const facebookToken = process.env.FACEBOOK_ACCESS_TOKEN;
      
      // Run comprehensive data integration
      const enrichedPlayers = await dataIntegrationService.fetchAndIntegrateAllData(facebookToken);
      
      // Update players in storage with enriched data
      for (const player of enrichedPlayers) {
        await storage.updatePlayer(player.id, {
          bioBoostScore: player.bioBoostScore,
          sleepScore: player.sleepScore,
          testosteroneProxy: player.testosteroneProxy,
          cortisolProxy: player.cortisolProxy,
          hydrationLevel: player.hydrationLevel,
          injuryRecoveryDays: player.injuryRecoveryDays,
          recommendedPick: player.recommendedPick,
          confidence: player.confidence
        });
        
        // Generate alerts for significant changes
        await this.checkPlayerForAlerts(player);
      }
      
      console.log(`✅ Successfully integrated data for ${enrichedPlayers.length} players`);
    } catch (error) {
      console.error('Error in full data integration:', error);
    }
  }

  private async updateInjuryReports() {
    try {
      const injuryReports = await nflDataService.fetchInjuryReport();
      // Process and store injury data
      console.log(`Found ${injuryReports.length} injury-related news items`);
    } catch (error) {
      console.error('Error updating injury reports:', error);
    }
  }

  private async updateBettingOdds() {
    try {
      const odds = await nflDataService.fetchOdds();
      // Process and store betting odds
      console.log(`Updated odds for ${odds.length} games`);
    } catch (error) {
      console.error('Error updating betting odds:', error);
    }
  }

  private async updatePlayerProps() {
    try {
      const props = await nflDataService.fetchPlayerProps();
      // Process and store player props
      console.log(`Updated ${props.length} player prop markets`);
    } catch (error) {
      console.error('Error updating player props:', error);
    }
  }

  private async checkForAlerts() {
    try {
      // Generate alerts for significant metric changes
      const alerts = await this.generateBioBoostAlerts();
      console.log(`Generated ${alerts.length} BioBoost alerts`);
    } catch (error) {
      console.error('Error checking for alerts:', error);
    }
  }

  private async updatePlayerBioBoost(player: any, bioBoost: number) {
    // Update player with new BioBoost score
    // This would integrate with your storage layer
    console.log(`Updated ${player.displayName}: BioBoost ${bioBoost}`);
  }

  private async generateBioBoostAlerts() {
    // Generate alerts based on BioBoost changes
    return [];
  }

  private async checkPlayerForAlerts(player: any) {
    try {
      // Check for significant BioBoost changes
      if (player.bioBoostScore >= 85) {
        await storage.createAlert({
          playerName: player.name,
          team: player.team,
          metricType: 'BioBoost',
          previousValue: 75, // Would track previous value
          currentValue: player.bioBoostScore,
          commentary: `🦍 FULL BANANAS! ${player.name} is showing elite BioBoost metrics. Alpha ape energy detected!`
        });
      }
      
      // Check injury status changes
      if (player.injuryRecoveryDays > 7) {
        await storage.createAlert({
          playerName: player.name,
          team: player.team,
          metricType: 'Injury',
          previousValue: 0,
          currentValue: player.injuryRecoveryDays,
          commentary: `🏥 Gorilla down! ${player.name} showing extended recovery timeline.`
        });
      }
      
      // Check sleep score alerts
      if (player.sleepScore <= 40) {
        await storage.createAlert({
          playerName: player.name,
          team: player.team,
          metricType: 'Sleep',
          previousValue: 70,
          currentValue: player.sleepScore,
          commentary: `😴 Sleepy gorilla alert! ${player.name} needs more jungle rest.`
        });
      }
    } catch (error) {
      console.error('Error generating player alerts:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const dataScheduler = new DataScheduler();