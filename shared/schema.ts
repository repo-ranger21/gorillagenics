import { pgTable, text, varchar, integer, real, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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
