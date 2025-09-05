import { type User, type InsertUser, type Player, type Alert, type BioMetric } from "@shared/schema";
import { players, alerts, bioMetrics } from "@/data/mock-data";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Player operations
  getAllPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: Omit<Player, 'id'>): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;

  // Alert operations
  getAllAlerts(): Promise<Alert[]>;
  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert>;

  // BioMetric operations
  getAllBioMetrics(): Promise<BioMetric[]>;
  createBioMetric(bioMetric: Omit<BioMetric, 'id'>): Promise<BioMetric>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private players: Player[];
  private alerts: Alert[];
  private bioMetrics: BioMetric[];

  constructor() {
    this.users = new Map();
    this.players = [...players];
    this.alerts = [...alerts];
    this.bioMetrics = [...bioMetrics];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Player operations
  async getAllPlayers(): Promise<Player[]> {
    return this.players;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.find(p => p.id === id);
  }

  async createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      ...player
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const index = this.players.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    this.players[index] = { ...this.players[index], ...updates };
    return this.players[index];
  }

  // Alert operations
  async getAllAlerts(): Promise<Alert[]> {
    return this.alerts;
  }

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    const newAlert: Alert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date(),
      ...alert
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  // BioMetric operations
  async getAllBioMetrics(): Promise<BioMetric[]> {
    return this.bioMetrics;
  }

  async createBioMetric(bioMetric: Omit<BioMetric, 'id'>): Promise<BioMetric> {
    const newBioMetric: BioMetric = {
      id: `biometric-${Date.now()}`,
      ...bioMetric
    };
    this.bioMetrics.push(newBioMetric);
    return newBioMetric;
  }
}

export const storage = new MemStorage();
