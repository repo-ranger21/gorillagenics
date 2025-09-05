import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nflDataService } from "./services/nfl-data";
import { livePlayerService } from "./services/live-player-service";
import { liveOddsService } from "./services/live-odds-service";
import { RecommendationEngine, type UserProfile } from "./services/recommendation-engine";
import { dataScheduler } from "./services/data-scheduler";
import { dataIntegrationService } from "./services/data-integration";
import { webScrapingService } from "./services/web-scrapers";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for GuerillaGenics platform

  // Get all players with BioBoost data and live betting odds
  app.get("/api/players", async (req, res) => {
    try {
      const { refresh, withOdds } = req.query;
      const forceRefresh = refresh === 'true';
      const includeOdds = withOdds === 'true';
      
      let players;
      if (includeOdds) {
        // Get players enhanced with live betting odds
        players = await liveOddsService.integrateOddsWithPlayers();
      } else {
        // Get players without odds integration
        players = await livePlayerService.refreshPlayerData(forceRefresh);
      }
      
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Get single player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
      // First try to refresh live data, then get specific player
      await livePlayerService.refreshPlayerData();
      const player = await storage.getPlayer(req.params.id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  // Get all bio metrics
  app.get("/api/biometrics", async (req, res) => {
    try {
      const bioMetrics = await storage.getAllBioMetrics();
      res.json(bioMetrics);
    } catch (error) {
      console.error("Error fetching bio metrics:", error);
      res.status(500).json({ message: "Failed to fetch bio metrics" });
    }
  });

  // Get juice watch alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Live NFL games and scores
  app.get("/api/nfl/games", async (req, res) => {
    try {
      const games = await nflDataService.fetchCurrentWeekGames();
      res.json(games);
    } catch (error) {
      console.error("Error fetching NFL games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  // Live betting odds
  app.get("/api/nfl/odds", async (req, res) => {
    try {
      const odds = await nflDataService.fetchOdds();
      res.json(odds);
    } catch (error) {
      console.error("Error fetching odds:", error);
      res.status(500).json({ message: "Failed to fetch odds" });
    }
  });

  // Player props and betting lines
  app.get("/api/nfl/player-props", async (req, res) => {
    try {
      const props = await nflDataService.fetchPlayerProps();
      res.json(props);
    } catch (error) {
      console.error("Error fetching player props:", error);
      res.status(500).json({ message: "Failed to fetch player props" });
    }
  });

  // Injury reports
  app.get("/api/nfl/injuries", async (req, res) => {
    try {
      const injuries = await nflDataService.fetchInjuryReport();
      res.json(injuries);
    } catch (error) {
      console.error("Error fetching injury reports:", error);
      res.status(500).json({ message: "Failed to fetch injury reports" });
    }
  });

  // Team roster
  app.get("/api/nfl/teams/:teamId/roster", async (req, res) => {
    try {
      const { teamId } = req.params;
      const roster = await nflDataService.fetchTeamRoster(teamId);
      res.json(roster);
    } catch (error) {
      console.error(`Error fetching roster for team ${req.params.teamId}:`, error);
      res.status(500).json({ message: "Failed to fetch team roster" });
    }
  });

  // Player stats with BioBoost calculation
  app.get("/api/nfl/players/:playerId/stats", async (req, res) => {
    try {
      const { playerId } = req.params;
      const stats = await nflDataService.fetchPlayerStats(playerId);
      if (stats) {
        const bioBoost = nflDataService.calculateBioBoost(stats);
        res.json({ ...stats, bioBoost });
      } else {
        res.status(404).json({ message: "Player stats not found" });
      }
    } catch (error) {
      console.error(`Error fetching stats for player ${req.params.playerId}:`, error);
      res.status(500).json({ message: "Failed to fetch player stats" });
    }
  });

  // Enhanced player data with integrated sources
  app.get("/api/players/enhanced", async (req, res) => {
    try {
      const facebookToken = req.query.facebook_token as string;
      const enrichedPlayers = await dataIntegrationService.fetchAndIntegrateAllData(facebookToken);
      res.json(enrichedPlayers);
    } catch (error) {
      console.error("Error fetching enhanced player data:", error);
      res.status(500).json({ message: "Failed to fetch enhanced player data" });
    }
  });

  // Live injury reports
  app.get("/api/scraping/injuries", async (req, res) => {
    try {
      const injuries = await webScrapingService.scrapeNFLInjuries();
      res.json(injuries);
    } catch (error) {
      console.error("Error scraping injury data:", error);
      res.status(500).json({ message: "Failed to scrape injury data" });
    }
  });

  // DFS lines from DraftKings
  app.get("/api/scraping/dfs-lines", async (req, res) => {
    try {
      const lines = await webScrapingService.scrapeDraftKingsLines();
      res.json(lines);
    } catch (error) {
      console.error("Error scraping DFS lines:", error);
      res.status(500).json({ message: "Failed to scrape DFS lines" });
    }
  });

  // Player props from FanDuel
  app.get("/api/scraping/player-props", async (req, res) => {
    try {
      const props = await webScrapingService.scrapeFanDuelProps();
      res.json(props);
    } catch (error) {
      console.error("Error scraping player props:", error);
      res.status(500).json({ message: "Failed to scrape player props" });
    }
  });

  // Biometric cues from social media
  app.get("/api/scraping/biometric-cues", async (req, res) => {
    try {
      const token = req.query.facebook_token as string;
      const cues = await webScrapingService.fetchFacebookBiometricCues(token);
      res.json(cues);
    } catch (error) {
      console.error("Error fetching biometric cues:", error);
      res.status(500).json({ message: "Failed to fetch biometric cues" });
    }
  });

  // Start/stop data scheduler
  app.post("/api/scheduler/:action", async (req, res) => {
    try {
      const { action } = req.params;
      if (action === "start") {
        dataScheduler.start();
        res.json({ message: "Data scheduler started" });
      } else if (action === "stop") {
        dataScheduler.stop();
        res.json({ message: "Data scheduler stopped" });
      } else {
        res.status(400).json({ message: "Invalid action. Use 'start' or 'stop'" });
      }
    } catch (error) {
      console.error("Error controlling scheduler:", error);
      res.status(500).json({ message: "Failed to control scheduler" });
    }
  });

  // Live player service endpoints
  app.get("/api/players/top-performers", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topPlayers = await livePlayerService.getTopPerformers(limit);
      res.json(topPlayers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  app.get("/api/players/strong-buy", async (req, res) => {
    try {
      const strongBuyPlayers = await livePlayerService.getStrongBuyPlayers();
      res.json(strongBuyPlayers);
    } catch (error) {
      console.error("Error fetching strong buy players:", error);
      res.status(500).json({ message: "Failed to fetch strong buy players" });
    }
  });

  app.get("/api/players/team/:teamAbbr", async (req, res) => {
    try {
      const { teamAbbr } = req.params;
      const teamPlayers = await livePlayerService.getPlayersByTeam(teamAbbr);
      res.json(teamPlayers);
    } catch (error) {
      console.error("Error fetching team players:", error);
      res.status(500).json({ message: "Failed to fetch team players" });
    }
  });

  app.get("/api/live-data/status", async (req, res) => {
    try {
      const cacheInfo = livePlayerService.getCacheInfo();
      res.json({
        status: "active",
        cache: cacheInfo,
        description: "Real NFL player data integration active"
      });
    } catch (error) {
      console.error("Error fetching live data status:", error);
      res.status(500).json({ message: "Failed to fetch status" });
    }
  });

  // Force refresh live data
  app.post("/api/live-data/refresh", async (req, res) => {
    try {
      console.log('🔄 Manual refresh requested for NFL player data');
      const players = await livePlayerService.refreshPlayerData(true);
      res.json({
        message: "Live data refreshed successfully",
        playersUpdated: players.length
      });
    } catch (error) {
      console.error("Error refreshing live data:", error);
      res.status(500).json({ message: "Failed to refresh live data" });
    }
  });

  // Live betting odds endpoints
  app.get("/api/odds/live", async (req, res) => {
    try {
      const { refresh } = req.query;
      const forceRefresh = refresh === 'true';
      const oddsData = await liveOddsService.refreshLiveOdds(forceRefresh);
      res.json(oddsData);
    } catch (error) {
      console.error("Error fetching live odds:", error);
      res.status(500).json({ message: "Failed to fetch live odds" });
    }
  });

  app.get("/api/odds/game-lines", async (req, res) => {
    try {
      const gameOdds = await liveOddsService.getGameOdds();
      res.json(gameOdds);
    } catch (error) {
      console.error("Error fetching game lines:", error);
      res.status(500).json({ message: "Failed to fetch game lines" });
    }
  });

  app.get("/api/odds/best-bets", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const bestBets = await liveOddsService.getBestBettingOpportunities(limit);
      res.json(bestBets);
    } catch (error) {
      console.error("Error fetching best bets:", error);
      res.status(500).json({ message: "Failed to fetch best betting opportunities" });
    }
  });

  app.get("/api/odds/status", async (req, res) => {
    try {
      const oddsStatus = liveOddsService.getOddsStatus();
      res.json({
        status: "active",
        odds: oddsStatus,
        description: "Live betting odds integration active"
      });
    } catch (error) {
      console.error("Error fetching odds status:", error);
      res.status(500).json({ message: "Failed to fetch odds status" });
    }
  });

  app.post("/api/odds/refresh", async (req, res) => {
    try {
      console.log('💰 Manual refresh requested for live betting odds');
      const oddsData = await liveOddsService.refreshLiveOdds(true);
      res.json({
        message: "Live odds refreshed successfully",
        gamesWithOdds: oddsData.gameOdds.length,
        playerPropsAvailable: oddsData.playerProps.length
      });
    } catch (error) {
      console.error("Error refreshing live odds:", error);
      res.status(500).json({ message: "Failed to refresh live odds" });
    }
  });

  // Super Bowl simulation endpoint (future implementation)
  app.get("/api/superbowl", async (req, res) => {
    try {
      // Mock data for now - would implement Monte Carlo simulation
      const simulationResults = [
        { team: "Baltimore Ravens", odds: "+650", winPercent: 17.4, conference: "AFC" },
        { team: "Buffalo Bills", odds: "+700", winPercent: 15.8, conference: "AFC" },
        { team: "Kansas City Chiefs", odds: "+550", winPercent: 19.2, conference: "AFC" },
      ];
      res.json(simulationResults);
    } catch (error) {
      console.error("Error running Super Bowl simulation:", error);
      res.status(500).json({ message: "Failed to run simulation" });
    }
  });

  // Personalized recommendations endpoint
  app.get("/api/recommendations", async (req, res) => {
    try {
      console.log('🎯 Generating personalized betting recommendations...');
      
      // Get current players data
      const players = await livePlayerService.getAllPlayers();
      
      // Sample user profile (in production, this would come from user session/database)
      const sampleProfile: UserProfile = RecommendationEngine.generateSampleUserProfile();
      
      // Generate personalized recommendations
      const recommendations = RecommendationEngine.generatePersonalizedRecommendations(
        players,
        sampleProfile
      );
      
      console.log(`✅ Generated ${recommendations.length} personalized recommendations`);
      
      res.json({
        recommendations,
        userProfile: sampleProfile,
        totalPlayers: players.length,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // User profile endpoint
  app.get("/api/user/profile", async (req, res) => {
    try {
      // In production, get from authenticated user session
      const profile = RecommendationEngine.generateSampleUserProfile();
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile endpoint
  app.put("/api/user/profile", async (req, res) => {
    try {
      const updatedProfile = req.body;
      console.log('👤 Updated user profile:', updatedProfile);
      // In production, save to database and validate
      res.json({ success: true, profile: updatedProfile });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email, paymentMethod } = req.body;
      
      console.log('📧 Newsletter subscription request:', { email });
      
      // In production, integrate with Stripe for payment processing
      // and save subscriber to database
      
      // Simulate subscription processing
      const subscription = {
        id: `sub_${Date.now()}`,
        email,
        status: 'active',
        plan: 'premium',
        amount: 1000, // $10.00 in cents
        currency: 'usd',
        interval: 'month',
        created: new Date().toISOString()
      };
      
      res.json({
        success: true,
        subscription,
        message: "Successfully subscribed to GuerillaGenics Premium!"
      });
    } catch (error) {
      console.error("Error processing subscription:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to process subscription" 
      });
    }
  });

  // Get subscription status endpoint
  app.get("/api/subscription/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      // In production, check database for subscription status
      // For demo, return mock active subscription
      const subscription = {
        id: `sub_${Date.now()}`,
        email,
        status: 'active',
        plan: 'premium',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      res.json({ subscription });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize live data and start scheduler in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🦍 Starting GuerillaGenics data scheduler in development mode...');
    
    // Initialize with live NFL player data
    setTimeout(async () => {
      try {
        console.log('🔄 Initializing live NFL player data...');
        const players = await livePlayerService.refreshPlayerData(true);
        console.log(`✅ Initialized with ${players.length} live NFL players`);
      } catch (error) {
        console.error('❌ Error initializing live player data:', error);
      }
    }, 2000);
    
    // Uncomment to auto-start scheduler: dataScheduler.start();
  }
  
  return httpServer;
}
