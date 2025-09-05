import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
  return httpServer;
}
