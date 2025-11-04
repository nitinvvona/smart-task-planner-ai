import { type User, type InsertUser, type Plan, type Task, type InsertPlan, type InsertTask } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getPlans(userId: string): Promise<Plan[]>;
  getPlan(id: string): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan & { user_id: string }): Promise<Plan>;
  deletePlan(id: string): Promise<void>;
  getTasksForPlan(planId: string): Promise<Task[]>;
  createTask(task: Omit<Task, 'id'>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  getTask(id: string): Promise<Task | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private plans: Map<string, Plan> = new Map();
  private tasks: Map<string, Task> = new Map();

  constructor() {
    this.users = new Map();
    // In MemStorage constructor, after this.users = new Map();
    const defaultUserId = 'default-user-id';
    this.users.set(defaultUserId, { id: defaultUserId, username: 'default', password: 'default' });
    // No example plans - only user-generated plans will be stored
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

  async getPlans(userId: string): Promise<Plan[]> {
    return Array.from(this.plans.values()).filter(p => p.user_id === userId);
  }
  
  async getPlan(id: string): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async createPlan(insertPlan: InsertPlan & { user_id: string }): Promise<Plan> {
    const id = randomUUID();
    const plan: Plan = {
      ...insertPlan,
      id,
      category: insertPlan.category ?? null,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.plans.set(id, plan);
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    this.plans.delete(id);
    // Delete associated tasks
    const associatedTasks = Array.from(this.tasks.values()).filter(t => t.plan_id === id);
    for (const task of associatedTasks) {
      this.tasks.delete(task.id);
    }
  }

  async getTasksForPlan(planId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.plan_id === planId);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      description: insertTask.description ?? null,
      estimated_hours: insertTask.estimated_hours ?? null,
      deadline: insertTask.deadline ?? null,
      dependencies: insertTask.dependencies ?? null,
      phase: insertTask.phase ?? null,
      status: insertTask.status ?? 'not_started'
    };
    this.tasks.set(id, task);
    return task;
  }
  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
}

import { PostgresStorage } from "./pg-storage";

export const storage = process.env.DATABASE_URL 
  ? new PostgresStorage() 
  : new MemStorage();
