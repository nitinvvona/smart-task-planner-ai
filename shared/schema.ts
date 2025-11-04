import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Plans table
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  category: text("category"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plan_id: varchar("plan_id").notNull().references(() => plans.id),
  name: text("name").notNull(),
  description: text("description"),
  priority: text("priority").notNull(), // e.g., 'high', 'medium', 'low'
  estimated_hours: numeric("estimated_hours", { precision: 5, scale: 2 }),
  deadline: timestamp("deadline"),
  status: text("status").notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  dependencies: text("dependencies").array(), // array of task ids
  phase: text("phase"), // phase name for grouping tasks
});

// Insert schemas
export const insertPlanSchema = createInsertSchema(plans).pick({
  title: true,
  category: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  plan_id: true,
  name: true,
  description: true,
  priority: true,
  estimated_hours: true,
  deadline: true,
  status: true,
  dependencies: true,
  phase: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
