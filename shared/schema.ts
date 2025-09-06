import { pgTable, text, varchar, integer, real, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // Personalization fields
  preferredBetTypes: text("preferred_bet_types"), // JSON array of bet types
  riskTolerance: text("risk_tolerance").default('medium'), // low, medium, high
  favoriteTeams: text("favorite_teams"), // JSON array of team names
  bankrollSize: integer("bankroll_size").default(100), // Default $100
  maxBetSize: integer("max_bet_size").default(10), // Default $10
  winRate: real("win_rate").default(0.5), // Track success rate
  totalBets: integer("total_bets").default(0),
  preferences: text("preferences"), // JSON object for additional preferences
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default('inactive'), // inactive, active, past_due, canceled
  subscriptionEndDate: timestamp("subscription_end_date"),
  isSubscribed: boolean("is_subscribed").default(false),
  // Referral tracking for Stripe Connect future
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  team: text("team").notNull(),
  matchup: text("matchup").notNull(),
  sleepScore: integer("sleep_score").notNull(),
  testosteroneProxy: integer("testosterone_proxy").notNull(),
  cortisolProxy: integer("cortisol_proxy").notNull(),
  hydrationLevel: integer("hydration_level").notNull(),
  injuryRecoveryDays: integer("injury_recovery_days").notNull(),
  bioBoostScore: integer("bio_boost_score").notNull(),
  recommendedPick: text("recommended_pick").notNull(),
  betLine: real("bet_line").notNull(),
  betType: text("bet_type").notNull(),
  confidence: integer("confidence").notNull(),
  gameTime: text("game_time").notNull(),
  commentary: text("commentary"),
  // Live betting odds integration
  liveOdds: text("live_odds"), // JSON string of live odds data
  recommendedBets: text("recommended_bets"), // JSON string of recommended betting opportunities
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey(),
  playerName: text("player_name").notNull(),
  team: text("team").notNull(),
  metricType: text("metric_type").notNull(),
  previousValue: integer("previous_value").notNull(),
  currentValue: integer("current_value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  commentary: text("commentary").notNull(),
});

export const bioMetrics = pgTable("bio_metrics", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  score: integer("score").notNull(),
  historicalImpact: text("historical_impact").notNull(),
  icon: text("icon").notNull(),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

export const insertBioMetricSchema = createInsertSchema(bioMetrics).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type BioMetric = typeof bioMetrics.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertBioMetric = z.infer<typeof insertBioMetricSchema>;
