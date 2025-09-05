import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nflDataService } from "./services/nfl-data";
import { dataScheduler } from "./services/data-scheduler";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for GuerillaGenics platform

  // Get all players with BioBoost data
  app.get("/api/players", async (req, res) => {
    try {
      const players = await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Get single player by ID
  app.get("/api/players/:id", async (req, res) => {
    try {
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

  const httpServer = createServer(app);
  
  // Start data scheduler in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🦍 Starting GuerillaGenics data scheduler in development mode...');
    // Uncomment to auto-start scheduler: dataScheduler.start();
  }
  
  return httpServer;
}
