import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql as vercelSql } from '@vercel/postgres';
import { eq } from 'drizzle-orm';
import { users, plans, tasks, type User, type InsertUser, type Plan, type InsertPlan, type Task, type InsertTask } from '@shared/schema';
import { IStorage } from './storage';

const db = drizzle(vercelSql);

export class PostgresStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getPlans(userId: string): Promise<Plan[]> {
    return await db.select().from(plans).where(eq(plans.user_id, userId));
  }

  async getPlan(id: string): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    return result[0];
  }

  async createPlan(plan: InsertPlan & { user_id: string }): Promise<Plan> {
    const result = await db.insert(plans).values(plan).returning();
    return result[0];
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.plan_id, id));
    await db.delete(plans).where(eq(plans.id, id));
  }

  async getTasksForPlan(planId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.plan_id, planId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(task).returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const result = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return result[0];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }
}