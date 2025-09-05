import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { week1Games } from "./week1Data.js";
import { nflDataService } from "./services/nfl-data";
import { livePlayerService } from "./services/live-player-service";
import { liveOddsService } from "./services/live-odds-service";
import { RecommendationEngine, type UserProfile } from "./services/recommendation-engine";
import { dataScheduler } from "./services/data-scheduler";
import { dataIntegrationService } from "./services/data-integration";
import { webScrapingService } from "./services/web-scrapers";
// @ts-ignore
import { ScheduleEspnAdapter } from "./adapters/scheduleEspn.js";
// @ts-ignore  
import { OddsTheOddsApiAdapter } from "./adapters/oddsTheOddsApi.js";
// @ts-ignore
import { PlayersSleeperAdapter } from "./adapters/playersSleeper.js";
// @ts-ignore
import { PredictionsService } from "./services/predictions.js";
// @ts-ignore
import { CacheService } from "./services/cache.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize live data providers for production-ready Weekly Picks
  const cache = new CacheService();
  const scheduleProvider = new ScheduleEspnAdapter();
  const oddsProvider = new OddsTheOddsApiAdapter(process.env.ODDS_API_KEY);
  const playersProvider = new PlayersSleeperAdapter();
  const predictionsService = new PredictionsService();
  
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

  // Week 1 NFL Games endpoint with BioBoost calculations
  app.get('/api/week1', async (req, res) => {
    try {
      // Import BioBoost calculator and injury calculator
      const { calculateBioBoost, generateRecommendation, generateGorillaCommentary, generateMockGameFactors } = await import('./utils/bioBoostCalculator.js');
      const { generateMockInjuries, calculateTeamInjuryImpact } = await import('./utils/injuryCalculator.js');
      
      // Simulate live odds updates and calculate BioBoost scores
      const gamesWithBioBoost = week1Games.map(game => {
        // Generate mock factors for BioBoost calculation
        const factors = generateMockGameFactors(game.id);
        
        // Generate mock injury data for both teams
        const awayInjuries = generateMockInjuries(game.awayTeam.abbreviation);
        const homeInjuries = generateMockInjuries(game.homeTeam.abbreviation);
        
        // Calculate injury impact and integrate with factors
        const awayInjuryImpact = calculateTeamInjuryImpact(awayInjuries);
        const homeInjuryImpact = calculateTeamInjuryImpact(homeInjuries);
        
        // Adjust BioBoost factors based on injury impact
        const injuryAdjustedFactors = {
          ...factors,
          injuries: {
            keyPlayersOut: Math.floor((awayInjuryImpact.totalImpact + homeInjuryImpact.totalImpact) / 100),
            opponentKeyOut: factors.injuries.opponentKeyOut,
            awayTeamImpact: awayInjuryImpact.totalImpact,
            homeTeamImpact: homeInjuryImpact.totalImpact,
            awayInjuries,
            homeInjuries
          }
        };
        
        // Calculate BioBoost score (0-100) using streamlined logic
        const bioBoostScore = calculateBioBoost(injuryAdjustedFactors);
        
        // Generate recommendation
        const { recommendation, confidence } = generateRecommendation(bioBoostScore, game.overUnder);
        
        // Generate satirical commentary
        const commentary = generateGorillaCommentary(game, bioBoostScore, recommendation);
        
        // Simulate live odds updates
        const liveGame = {
          ...game,
          overUnder: game.overUnder + (Math.random() - 0.5) * 1, // ±0.5 variation
          awayTeam: {
            ...game.awayTeam,
            spreadValue: game.awayTeam.spreadValue + (Math.random() - 0.5) * 0.5 // ±0.25 variation
          },
          homeTeam: {
            ...game.homeTeam,
            spreadValue: game.homeTeam.spreadValue + (Math.random() - 0.5) * 0.5 // ±0.25 variation
          },
          bioBoost: {
            score: bioBoostScore,
            recommendation: recommendation,
            confidence: confidence,
            commentary: commentary,
            factors: {
              injuries: factors.injuries,
              weather: factors.weather,
              lineMove: factors.lineMove,
              restDays: factors.restDays,
              travelMiles: factors.travelMiles
            }
          }
        };
        
        return liveGame;
      });
      
      res.json(gamesWithBioBoost);
    } catch (error) {
      console.error("Error fetching Week 1 games:", error);
      res.status(500).json({ message: "Failed to fetch Week 1 games" });
    }
  });

  // Production-ready Live Data Endpoints for Weekly Picks
  
  // Health check for all providers
  app.get('/api/health', async (req, res) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      providers: { schedule: 'unknown', odds: 'unknown', players: 'unknown' }
    };

    try {
      await scheduleProvider.getCurrentWeek();
      health.providers.schedule = 'ok';
    } catch { health.providers.schedule = 'fail'; }

    try {
      await oddsProvider.getGameOdds([]);
      health.providers.odds = 'ok';
    } catch { health.providers.odds = 'fail'; }

    try {
      await playersProvider.getFeaturedOffense('1');
      health.providers.players = 'ok';
    } catch { health.providers.players = 'fail'; }

    const allOk = Object.values(health.providers).every(s => s === 'ok');
    health.status = allOk ? 'ok' : 'degraded';
    res.status(allOk ? 200 : 503).json(health);
  });

  // Current week detection with ESPN data
  app.get('/api/current-week', async (req, res) => {
    try {
      const cacheKey = `current_week`;
      let weekData = cache.get(cacheKey);
      
      if (!weekData) {
        weekData = await scheduleProvider.getCurrentWeek();
        cache.set(cacheKey, weekData, 'schedule');
      }
      
      res.json(weekData);
    } catch (error) {
      console.error('Current week fetch failed:', error);
      // Fallback calculation
      const seasonStart = new Date('2025-09-04');
      const now = new Date();
      const diffDays = Math.ceil((now - seasonStart) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(18, Math.max(1, Math.floor(diffDays / 7) + 1));
      
      res.json({ 
        currentWeek,
        seasonStart: seasonStart.toISOString(),
        calculatedAt: now.toISOString(),
        fallback: true
      });
    }
  });

  // Live NFL schedule from ESPN
  app.get('/api/week', async (req, res) => {
    try {
      const week = parseInt(req.query.number?.toString() || '1');
      const season = parseInt(req.query.season?.toString() || '2025');
      
      const cacheKey = `schedule_${season}_${week}`;
      let schedule = cache.get(cacheKey);
      
      if (!schedule) {
        schedule = await scheduleProvider.getWeekSchedule(week, season);
        cache.set(cacheKey, schedule, 'schedule');
      }
      
      res.json(schedule);
    } catch (error) {
      console.error('Week schedule fetch failed:', error);
      res.status(500).json({ message: 'Failed to fetch week schedule' });
    }
  });

  // Live betting odds from The Odds API
  app.get('/api/odds', async (req, res) => {
    try {
      const week = parseInt(req.query.week?.toString() || '1');
      
      const cacheKey = `odds_week_${week}`;
      let odds = cache.get(cacheKey);
      
      if (!odds) {
        odds = await oddsProvider.getGameOdds();
        cache.set(cacheKey, odds, 'odds');
      }
      
      res.json(odds);
    } catch (error) {
      console.error('Odds fetch failed:', error);
      res.status(500).json({ message: 'Failed to fetch odds' });
    }
  });

  // Featured offensive players only (QB/RB/WR/TE)
  app.get('/api/players/offense', async (req, res) => {
    try {
      const teamId = req.query.teamId?.toString();
      if (!teamId) {
        return res.status(400).json({ message: 'teamId parameter required' });
      }
      
      const cacheKey = `offense_${teamId}`;
      let offense = cache.get(cacheKey);
      
      if (!offense) {
        offense = await playersProvider.getFeaturedOffense(teamId);
        // Strict validation: ensure no defensive players
        if (offense?.players) {
          offense.players = playersProvider.validateOffensiveOnly(offense.players);
        }
        cache.set(cacheKey, offense, 'players');
      }
      
      res.json(offense);
    } catch (error) {
      console.error('Players fetch failed:', error);
      res.status(500).json({ message: 'Failed to fetch offensive players' });
    }
  });

  // GuerillaGenics predictions with market analysis
  app.get('/api/picks', async (req, res) => {
    try {
      const week = parseInt(req.query.week?.toString() || '1');
      
      const cacheKey = `picks_week_${week}`;
      let picks = cache.get(cacheKey);
      
      if (!picks) {
        // Get live data for predictions
        const schedule = await scheduleProvider.getWeekSchedule(week);
        const odds = await oddsProvider.getGameOdds();
        
        picks = [];
        
        for (const game of schedule) {
          // Match game with odds by team names
          const gameOdds = odds.find(o => 
            (o.homeTeam?.includes(game.homeTeam.name) || 
             o.awayTeam?.includes(game.awayTeam.name)) ||
            (o.homeTeam?.includes(game.homeTeam.abbr) || 
             o.awayTeam?.includes(game.awayTeam.abbr))
          );
          
          if (gameOdds) {
            const homeOffense = await playersProvider.getFeaturedOffense(game.homeTeam.id);
            const awayOffense = await playersProvider.getFeaturedOffense(game.awayTeam.id);
            
            const pick = await predictionsService.generatePick(
              game, 
              gameOdds, 
              [homeOffense, awayOffense]
            );
            
            picks.push({
              ...pick,
              game: {
                id: game.id,
                homeTeam: game.homeTeam,
                awayTeam: game.awayTeam,
                startEt: game.startEt,
                timeSlot: game.timeSlot
              },
              odds: gameOdds,
              offense: { home: homeOffense, away: awayOffense }
            });
          }
        }
        
        cache.set(cacheKey, picks, 'picks');
      }
      
      res.json(picks);
    } catch (error) {
      console.error('Picks generation failed:', error);
      res.status(500).json({ message: 'Failed to generate picks' });
    }
  });

  // Legacy endpoint for backward compatibility
  app.get('/api/weekly-picks/:week', async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      // Redirect to new picks endpoint
      const picksResponse = await fetch(`${req.protocol}://${req.get('host')}/api/picks?week=${week}`);
      const picks = await picksResponse.json();
      res.json(picks);
    } catch (error) {
      console.error('Legacy weekly picks failed:', error);
      res.status(500).json({ message: 'Failed to fetch weekly picks' });
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

  // Live Over/Under Dashboard API endpoints
  app.get("/api/lines", async (req, res) => {
    try {
      // Generate mock Over/Under betting lines with BioBoost integration
      const mockLines = [
        {
          id: "BUF-DAL-PY",
          matchup: "DAL @ BUF",
          market: "Passing Yards",
          line: 277.5,
          recommendation: "Over",
          confidence: 72,
          bioBoost: 86,
          move: 0.5,
          commentary: "Max Juice: Secondary mismatch. Gorilla sees big throws coming!"
        },
        {
          id: "MIA-NYJ-RY",
          matchup: "NYJ @ MIA",
          market: "Rushing Yards",
          line: 89.5,
          recommendation: "Under",
          confidence: 68,
          bioBoost: 73,
          move: -1.0,
          commentary: "Primal instinct: Defense stacked. Run game gets stuffed."
        },
        {
          id: "KC-CIN-TD",
          matchup: "CIN @ KC",
          market: "Total TDs",
          line: 2.5,
          recommendation: "Over",
          confidence: 81,
          bioBoost: 92,
          move: 0.0,
          commentary: "Banana alert! Red zone efficiency through the roof."
        },
        {
          id: "SF-LAR-REC",
          matchup: "LAR @ SF",
          market: "Receptions",
          line: 6.5,
          recommendation: "Under",
          confidence: 64,
          bioBoost: 78,
          move: 0.5,
          commentary: "Gorilla gut check: Target share dropping like coconuts."
        },
        {
          id: "BAL-PIT-PY2",
          matchup: "PIT @ BAL",
          market: "Passing Yards",
          line: 245.5,
          recommendation: "Over",
          confidence: 89,
          bioBoost: 94,
          move: 2.5,
          commentary: "FULL BANANAS! Weather clear, arm strength peaking!"
        },
        {
          id: "GB-MIN-RY2",
          matchup: "MIN @ GB",
          market: "Rushing Yards",
          line: 112.5,
          recommendation: "Under",
          confidence: 71,
          bioBoost: 82,
          move: -0.5,
          commentary: "Cold weather grind. Expect conservative game plan."
        }
      ];
      
      res.json(mockLines);
    } catch (error) {
      console.error("Error fetching lines:", error);
      res.status(500).json({ message: "Failed to fetch lines" });
    }
  });

  app.get("/api/bets/live", async (req, res) => {
    try {
      // Generate mock live alerts for Juice Watch
      const mockAlerts = [
        {
          id: `alert-${Date.now()}-1`,
          emoji: "🦍",
          title: "BioBoost Spike",
          detail: "Josh Allen's hydration levels up 12%; OVER confidence +4%",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
          type: "bioboost"
        },
        {
          id: `alert-${Date.now()}-2`,
          emoji: "📈",
          title: "Line Movement",
          detail: "Lamar Jackson Rushing Yards moved from 65.5 to 68.0",
          timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
          type: "line_move"
        },
        {
          id: `alert-${Date.now()}-3`,
          emoji: "⚡",
          title: "Alpha Ape Alert",
          detail: "Travis Kelce testosterone proxy surged 8% after warm-ups",
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 mins ago
          type: "bioboost"
        },
        {
          id: `alert-${Date.now()}-4`,
          emoji: "🌧️",
          title: "Weather Update",
          detail: "Wind gusts increasing in Buffalo - passing game impact expected",
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
          type: "weather"
        },
        {
          id: `alert-${Date.now()}-5`,
          emoji: "🚨",
          title: "Injury Report",
          detail: "Tyreek Hill listed as questionable with ankle concern",
          timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 mins ago
          type: "injury"
        }
      ];
      
      res.json(mockAlerts);
    } catch (error) {
      console.error("Error fetching live bets:", error);
      res.status(500).json({ message: "Failed to fetch live alerts" });
    }
  });

  app.get("/api/health", async (req, res) => {
    try {
      res.json({
        dfs: "ok",
        bioboost: "ok",
        alerts: "ok",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching health status:", error);
      res.status(500).json({ message: "Health check failed" });
    }
  });

  // Push notification subscription endpoint
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const { subscription } = req.body;
      
      console.log('🔔 Push notification subscription received:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...'
      });
      
      // In production, save subscription to database
      // For now, store in memory (this would be lost on restart)
      if (!storage.pushSubscriptions) {
        storage.pushSubscriptions = new Set();
      }
      storage.pushSubscriptions.add(JSON.stringify(subscription));
      
      res.json({ 
        success: true,
        message: "Successfully subscribed to push notifications" 
      });
    } catch (error) {
      console.error("Error saving push subscription:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to save push subscription" 
      });
    }
  });

  // Push notification unsubscribe endpoint
  app.post("/api/notifications/unsubscribe", async (req, res) => {
    try {
      const { subscription } = req.body;
      
      console.log('🔔 Push notification unsubscribe received');
      
      // Remove subscription from storage
      if (storage.pushSubscriptions && subscription) {
        storage.pushSubscriptions.delete(JSON.stringify(subscription));
      }
      
      res.json({ 
        success: true,
        message: "Successfully unsubscribed from push notifications" 
      });
    } catch (error) {
      console.error("Error removing push subscription:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to remove push subscription" 
      });
    }
  });

  // Test notification endpoint
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { subscription } = req.body;
      
      if (!subscription) {
        return res.status(400).json({ 
          success: false,
          message: "No subscription provided" 
        });
      }
      
      // Send test notification
      const payload = {
        title: '🦍 GuerillaGenics Test Alert',
        body: 'This is a test notification from the jungle! Your alerts are working perfectly.',
        icon: '/favicon.ico',
        url: '/',
        alertType: 'zen_gorilla',
        tag: 'test-notification',
        requireInteraction: false,
        vibrate: [200, 100, 200, 100, 200]
      };
      
      console.log('🔔 Sending test push notification');
      
      // In production, use actual web-push library
      // For demo, just log and return success
      console.log('🔔 Test notification payload:', payload);
      
      res.json({ 
        success: true,
        message: "Test notification sent successfully" 
      });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to send test notification" 
      });
    }
  });

  // Juice Watch alert trigger endpoint (for manual testing)
  app.post("/api/notifications/alert", async (req, res) => {
    try {
      const { playerId, alertType, message } = req.body;
      
      const player = storage.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ 
          success: false,
          message: "Player not found" 
        });
      }
      
      // Create alert notification payload
      const alertMessages = {
        zen_gorilla: 'Player metrics are stable and within normal range',
        alpha_ape: 'Significant BioBoost changes detected - opportunity alert!',
        full_bananas: 'CRITICAL ALERT: Major performance shift detected!'
      };
      
      const alertEmojis = {
        zen_gorilla: '🧘',
        alpha_ape: '⚡',
        full_bananas: '🚨'
      };
      
      const payload = {
        title: `${alertEmojis[alertType]} Juice Watch Alert: ${player.name}`,
        body: message || alertMessages[alertType],
        icon: '/favicon.ico',
        url: `/player/${playerId}`,
        playerId,
        alertType,
        tag: `juice-watch-${playerId}`,
        requireInteraction: alertType === 'full_bananas',
        vibrate: alertType === 'full_bananas' ? [300, 100, 300, 100, 300] : [200, 100, 200]
      };
      
      console.log('🔔 Triggering Juice Watch alert:', {
        player: player.name,
        type: alertType,
        subscriptions: storage.pushSubscriptions?.size || 0
      });
      
      // In production, send to all subscribed users
      // For demo, just log the alert
      console.log('🔔 Alert notification payload:', payload);
      
      res.json({ 
        success: true,
        message: `Juice Watch alert triggered for ${player.name}`,
        payload 
      });
    } catch (error) {
      console.error("Error triggering Juice Watch alert:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to trigger alert" 
      });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for live updates - using separate port to avoid Vite conflicts
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/api/ws',
    perMessageDeflate: false 
  });
  
  wss.on('connection', (ws) => {
    console.log('🔌 GuerillaGenics client connected to WebSocket');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection:established',
      message: 'Connected to GuerillaGenics live feed 🦍'
    }));
    
    // Simulate live updates every 15 seconds for demo
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        // Random odds update
        const mockUpdate = {
          type: 'odds:update',
          payload: {
            id: `update-${Date.now()}`,
            matchup: ['BUF vs DAL', 'MIA vs NYJ', 'KC vs CIN'][Math.floor(Math.random() * 3)],
            market: 'Passing Yards',
            line: Math.floor(Math.random() * 50) + 200,
            move: (Math.random() - 0.5) * 4,
            confidence: Math.floor(Math.random() * 40) + 60
          }
        };
        
        ws.send(JSON.stringify(mockUpdate));
        
        // Random alert every other update
        if (Math.random() > 0.6) {
          const alerts = [
            '🦍 BioBoost spike detected!',
            '⚡ Alpha Ape alert triggered!',
            '📈 Significant line movement!',
            '🌧️ Weather update affecting game!'
          ];
          
          const alertUpdate = {
            type: 'alerts:juice',
            payload: {
              id: `alert-${Date.now()}`,
              emoji: '🦍',
              title: 'Live Update',
              detail: alerts[Math.floor(Math.random() * alerts.length)],
              timestamp: new Date().toISOString(),
              type: 'bioboost'
            }
          };
          
          ws.send(JSON.stringify(alertUpdate));
        }
      }
    }, 15000);
    
    ws.on('close', () => {
      console.log('🔌 GuerillaGenics client disconnected');
      clearInterval(interval);
    });
    
    ws.on('error', (error) => {
      console.error('🔌 GuerillaGenics WebSocket error:', error);
      clearInterval(interval);
    });
  });
  
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
