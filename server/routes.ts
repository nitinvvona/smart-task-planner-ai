import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTaskPlan, suggestTaskImprovements } from "./services/llm";
import { InsertTask } from "../shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // LLM API routes
  app.post('/api/llm/generate-plan', async (req: Request, res: Response) => {
    try {
      const { goal, constraints } = req.body;
      
      if (!goal) {
        return res.status(400).json({ error: 'Goal is required' });
      }
      
      const plan = await generateTaskPlan(goal, constraints);
      res.json({ plan });
    } catch (error) {
      console.error('Error generating plan:', error);
      res.status(500).json({ error: 'Failed to generate plan' });
    }
  });

  app.post('/api/llm/suggest-improvements', async (req: Request, res: Response) => {
    try {
      const { taskDescription } = req.body;
      
      if (!taskDescription) {
        return res.status(400).json({ error: 'Task description is required' });
      }
      
      const suggestions = await suggestTaskImprovements(taskDescription);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error suggesting improvements:', error);
      res.status(500).json({ error: 'Failed to suggest improvements' });
    }
  });

  // CRUD routes for plans
  // GET all plans with accurate task counts
  app.get('/api/plans', async (req: Request, res: Response) => {
    try {
      const userId = 'default-user-id';
      const plans = await storage.getPlans(userId);
      
      const enhancedPlans = await Promise.all(plans.map(async (plan) => {
        const tasks = await storage.getTasksForPlan(plan.id);
        const totalTasks = tasks.length;
        
        // Check for multiple possible status values (case-insensitive)
        const completedTasks = tasks.filter(t => 
          t.status?.toLowerCase() === 'completed'
        ).length;
        
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
        
        // Assign a random color for now
        const colors = ['purple', 'blue', 'cyan', 'yellow'];
        const color = colors[Math.floor(Math.random() * colors.length)] as 'purple' | 'blue' | 'cyan' | 'yellow';
        
        return { 
          ...plan, 
          completedTasks, 
          totalTasks, 
          progress, 
          isCompleted, 
          color 
        };
      }));
      
      res.json(enhancedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  });

  // GET single plan with tasks
  app.get('/api/plans/:id', async (req: Request, res: Response) => {
    try {
      const plan = await storage.getPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }
      
      const tasks = await storage.getTasksForPlan(req.params.id);
      
      // Calculate stats for this plan too
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => 
        t.status?.toLowerCase() === 'completed'
      ).length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
      
      res.json({ 
        ...plan, 
        tasks,
        completedTasks,
        totalTasks,
        progress,
        isCompleted
      });
    } catch (error) {
      console.error('Error fetching plan details:', error);
      res.status(500).json({ error: 'Failed to fetch plan details' });
    }
  });

  // POST create new plan
  app.post('/api/plans', async (req: Request, res: Response) => {
    try {
      const userId = 'default-user-id';
      const { title, category } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const plan = await storage.createPlan({ title, category, user_id: userId });
      
      // Return with initial stats
      res.json({
        ...plan,
        completedTasks: 0,
        totalTasks: 0,
        progress: 0,
        isCompleted: false,
        color: 'purple'
      });
    } catch (error) {
      console.error('Error creating plan:', error);
      res.status(500).json({ error: 'Failed to create plan' });
    }
  });

  // DELETE plan
  app.delete('/api/plans/:id', async (req: Request, res: Response) => {
    try {
      await storage.deletePlan(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting plan:', error);
      res.status(500).json({ error: 'Failed to delete plan' });
    }
  });

  // GET tasks for a plan
  app.get('/api/plans/:id/tasks', async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTasksForPlan(req.params.id);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // PATCH update task (NEW - This is critical for updating task status!)
  app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      const taskId = req.params.id;
      const updates = req.body;
      
      // Update the task
      await storage.updateTask(taskId, updates);
      
      // Get the updated task to return it
      const updatedTask = await storage.getTask(taskId);
      
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  // DELETE task
  app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // POST create new task (NEW - if you need to add tasks from PlanDetail)
  app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
      const taskData = req.body;
      
      if (!taskData.plan_id || !taskData.name) {
        return res.status(400).json({ error: 'plan_id and name are required' });
      }
      
      const insertTask: InsertTask = {
        plan_id: taskData.plan_id,
        name: taskData.name,
        description: taskData.description || 'No description provided',
        priority: ['high', 'medium', 'low'].includes(taskData.priority) ? taskData.priority : 'medium',
        estimated_hours: taskData.estimated_hours?.toString() || '1',
        deadline: taskData.deadline && !isNaN(new Date(taskData.deadline).getTime()) ? new Date(taskData.deadline) : undefined,
        status: taskData.status || 'not_started',
        dependencies: taskData.dependencies || [],
        phase: taskData.phase || 'General',
      };
      
      const newTask = await storage.createTask(insertTask);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // POST generate and save plan (your existing route)
  app.post('/api/generate-and-save-plan', async (req: Request, res: Response) => {
    try {
      const { title, goal, constraints } = req.body;
      if (!title || !goal) {
        return res.status(400).json({ error: 'Title and goal are required' });
      }

      console.log(`Generating plan for goal: "${goal}" with constraints: "${constraints || 'none'}"`);
      
      // Generate the plan using LLM
      const planStr = await generateTaskPlan(goal, constraints);
      console.log(`Received plan string: ${planStr.substring(0, 100)}...`);
      
      let tasksData: any[];
      try {
        tasksData = JSON.parse(planStr);
        if (!Array.isArray(tasksData)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.error('Error parsing plan JSON:', parseError);
        return res.status(500).json({ error: 'Failed to parse plan data from LLM' });
      }

      // Create the plan
      const userId = 'default-user-id';
      const plan = await storage.createPlan({ title, category: constraints, user_id: userId });
      
      const taskMap = new Map<string, string>(); // name to id

      // Create tasks with validation
      for (const t of tasksData) {
        if (!t.name) {
          console.warn('Skipping task with missing name');
          continue;
        }
        
        const insertTask: InsertTask = {
          plan_id: plan.id,
          name: t.name,
          description: t.description || 'No description provided',
          priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
          estimated_hours: t.estimated_hours?.toString() || '1',
          deadline: t.deadline && !isNaN(new Date(t.deadline).getTime()) ? new Date(t.deadline) : undefined,
          status: 'not_started',
          dependencies: undefined,
          phase: t.phase || 'General',
        };
        const newTask = await storage.createTask(insertTask);
        taskMap.set(t.name, newTask.id);
      }

      // Update dependencies
      for (const t of tasksData) {
        if (!t.name) continue;
        
        const taskId = taskMap.get(t.name);
        if (taskId && Array.isArray(t.dependencies)) {
          const depIds = t.dependencies
            .filter((depName: any) => typeof depName === 'string')
            .map((depName: string) => taskMap.get(depName))
            .filter((id: string | undefined) => id !== undefined) as string[];
            
          if (depIds.length > 0) {
            await storage.updateTask(taskId, { dependencies: depIds });
          }
        }
      }

      res.json({ plan });
    } catch (error) {
      console.error('Error generating and saving plan:', error);
      res.status(500).json({ error: 'Failed to generate and save plan' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}