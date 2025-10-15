import { useState, useEffect } from "react";
import { ChevronRight, Download, Share, Archive } from "lucide-react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ViewToggle } from "@/components/ViewToggle";
import { PhaseAccordion } from "@/components/PhaseAccordion";
import { PDFExportModal } from "@/components/PDFExportModal";
import { AddTaskModal } from "@/components/AddTaskModal";
import { KanbanBoard } from "@/components/KanbanBoard";
import CalendarView from "@/components/CalendarView";
import BulkOperationsBar from "@/components/BulkOperationsBar";
import { ExportFormatsMenu } from "@/components/ExportFormatsMenu";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


// Define types for our data
interface Task {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  deadline: string;
  status: "completed" | "in_progress" | "not_started";
  phase?: string;
}


interface Phase {
  phaseId: string;
  phaseName: string;
  tasks: Task[];
  completedCount: number;
}


interface Plan {
  id: string;
  title: string;
  category: string;
  tasks: Task[];
}


// 🔔 HELPER FUNCTION - Notify dashboard to refresh
const notifyDashboardToRefresh = () => {
  window.dispatchEvent(new CustomEvent('planUpdated'));
};


export default function PlanDetail() {
  const { id } = useParams();
  const [view, setView] = useState<"list" | "kanban" | "calendar">("list");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    searchTerm: "",
    status: [],
    priority: [],
    deadlineFrom: null,
    deadlineTo: null,
  });


  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/plans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan details');
      }
      const planData = await response.json();
      setPlan(planData);
      
      // Organize tasks into phases based on their phase property
      const tasksByPhase: Record<string, Task[]> = {};
      
      // First, group tasks by phase
      planData.tasks.forEach((task: Task) => {
        const phaseName = task.phase || 'Uncategorized';
        if (!tasksByPhase[phaseName]) {
          tasksByPhase[phaseName] = [];
        }
        tasksByPhase[phaseName].push(task);
      });
      
      // Then, convert to our Phase structure
      const phasesList: Phase[] = Object.entries(tasksByPhase).map(([phaseName, tasks]) => {
        const completedCount = tasks.filter(task => task.status === 'completed').length;
        return {
          phaseId: phaseName.toLowerCase().replace(/\s+/g, '-'),
          phaseName,
          tasks,
          completedCount
        };
      });
      
      setPhases(phasesList);
    } catch (error) {
      console.error('Error fetching plan details:', error);
      toast.error('Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchPlanDetails();
    }
  }, [id]);


  useEffect(() => {
    if (plan && phases.length > 0) {
      // Apply filters to tasks
      const filteredPhases = phases.map(phase => {
        const filteredTasks = phase.tasks.filter(task => {
          // Search term filter
          if (filters.searchTerm && !task.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) && 
              !(task.description && task.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))) {
            return false;
          }
          
          // Status filter
          if (filters.status.length > 0 && !filters.status.includes(task.status)) {
            return false;
          }
          
          // Priority filter
          if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
            return false;
          }
          
          // Deadline from filter
          if (filters.deadlineFrom && task.deadline && new Date(task.deadline) < filters.deadlineFrom) {
            return false;
          }
          
          // Deadline to filter
          if (filters.deadlineTo && task.deadline && new Date(task.deadline) > filters.deadlineTo) {
            return false;
          }
          
          return true;
        });
        
        return {
          ...phase,
          tasks: filteredTasks,
          completedCount: filteredTasks.filter(t => t.status === "completed").length
        };
      });
      
      setPhases(filteredPhases);
    }
  }, [filters, plan]);


  // ✅ FIX #1 - Handle task status change with null check
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Optimistically update UI
      const updatedTasks = plan.tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
      );
      
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
        ),
        completedCount: phase.tasks.filter(t => 
          t.id === taskId ? newStatus === 'completed' : t.status === 'completed'
        ).length
      }));
      
      setPhases(updatedPhases);


      // Persist to backend
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });


      if (!response.ok) {
        throw new Error('Failed to update task status');
      }


      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      // Reload to get correct state
      fetchPlanDetails();
    }
  };


  // Handle task toggle (checkbox)
  const handleTaskToggle = async (taskId: string) => {
    const task = plan?.tasks.find(t => t.id === taskId);
    if (!task) return;


    const newStatus = task.status === 'completed' ? 'not_started' : 'completed';
    await handleTaskStatusChange(taskId, newStatus);
  };


  // ✅ FIX #2 - Handle task edit with null check
  const handleTaskEdit = async (updatedTask: Partial<Task> & { id: string }) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Ensure numeric values are properly parsed
      if (typeof updatedTask.estimatedHours !== 'undefined') {
        updatedTask.estimatedHours = parseFloat(updatedTask.estimatedHours.toString()) || 0;
      }
      
      // Optimistically update UI
      const updatedTasks = plan.tasks.map(task => 
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      );
      
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      }));
      
      setPhases(updatedPhases);


      // Persist to backend
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
      });


      if (!response.ok) {
        throw new Error('Failed to update task');
      }


      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      fetchPlanDetails();
    }
  };


  // ✅ FIX #3 - Handle task delete with null check
  const handleTaskDelete = async (taskId: string) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });


      if (!response.ok) {
        throw new Error('Failed to delete task');
      }


      // Update local state
      const updatedTasks = plan.tasks.filter(task => task.id !== taskId);
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.filter(task => task.id !== taskId),
        completedCount: phase.tasks.filter(t => t.id !== taskId && t.status === 'completed').length
      }));
      
      setPhases(updatedPhases);


      // Remove from selection if selected
      if (selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
      }


      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };


  const handleTaskSelect = (taskId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    } else {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
    }
  };


  // ✅ FIX #4 - Handle bulk delete with null check
  const handleBulkDelete = async (taskIds: string[]) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Optimistic UI update
      const updatedTasks = plan.tasks.filter(task => !taskIds.includes(task.id));
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.filter(task => !taskIds.includes(task.id)),
        completedCount: phase.tasks.filter(t => !taskIds.includes(t.id) && t.status === 'completed').length
      }));
      
      setPhases(updatedPhases);


      // Clear selection
      setSelectedTaskIds([]);


      // Send requests to server
      const deletePromises = taskIds.map(taskId => 
        fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success(`${taskIds.length} tasks deleted successfully`);
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast.error('Failed to delete tasks');
      fetchPlanDetails();
    }
  };


  // ✅ FIX #5 - Handle bulk status change with null check
  const handleBulkStatusChange = async (taskIds: string[], status: string) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Optimistic UI update
      const updatedTasks = plan.tasks.map(task =>
        taskIds.includes(task.id) ? { ...task, status: status as Task['status'] } : task
      );
      
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          taskIds.includes(task.id) ? { ...task, status: status as Task['status'] } : task
        ),
        completedCount: phase.tasks.filter(t => 
          taskIds.includes(t.id) ? status === 'completed' : t.status === 'completed'
        ).length
      }));
      
      setPhases(updatedPhases);


      // Send requests to server
      const updatePromises = taskIds.map(taskId => 
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success(`${taskIds.length} tasks updated successfully`);
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Failed to update tasks');
      fetchPlanDetails();
    }
  };


  // ✅ FIX #6 - Handle bulk priority change with null check
  const handleBulkPriorityChange = async (taskIds: string[], priority: string) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Optimistic UI update
      const updatedTasks = plan.tasks.map(task =>
        taskIds.includes(task.id) ? { ...task, priority: priority as Task['priority'] } : task
      );
      
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          taskIds.includes(task.id) ? { ...task, priority: priority as Task['priority'] } : task
        )
      }));
      
      setPhases(updatedPhases);


      // Send requests to server
      const updatePromises = taskIds.map(taskId => 
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ priority }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success(`${taskIds.length} tasks updated successfully`);
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Failed to update tasks');
      fetchPlanDetails();
    }
  };


  // ✅ FIX #7 - Handle bulk deadline change with null check
  const handleBulkDeadlineChange = async (taskIds: string[], deadline: string) => {
    if (!plan) return; // Null check to satisfy TypeScript
    
    try {
      // Optimistic UI update
      const updatedTasks = plan.tasks.map(task =>
        taskIds.includes(task.id) ? { ...task, deadline } : task
      );
      
      setPlan({
        ...plan,
        tasks: updatedTasks
      });


      // Update phases
      const updatedPhases = phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task =>
          taskIds.includes(task.id) ? { ...task, deadline } : task
        )
      }));
      
      setPhases(updatedPhases);


      // Send requests to server
      const updatePromises = taskIds.map(taskId => 
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deadline }),
        })
      );
      
      await Promise.all(updatePromises);
      
      // 🔔 NOTIFY DASHBOARD
      notifyDashboardToRefresh();
      
      toast.success(`${taskIds.length} tasks updated successfully`);
    } catch (error) {
      console.error('Error updating tasks:', error);
      toast.error('Failed to update tasks');
      fetchPlanDetails();
    }
  };


  const completedTasks = phases.reduce((sum, phase) => sum + phase.completedCount, 0);
  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading plan details...</div>;
  }


  if (!plan) {
    return <div className="text-center p-8">Plan not found</div>;
  }


  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground" data-testid="link-breadcrumb-dashboard">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground" data-testid="text-breadcrumb-plan">Plan #{id}</span>
      </nav>


      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-3xl font-bold" data-testid="text-plan-title">
              {plan.title}
            </h1>
            <Badge data-testid="badge-category">{plan.category}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground" data-testid="text-progress-summary">
            {completedTasks} of {totalTasks} tasks completed ({progress}%)
          </p>
        </div>


        <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1"></div>
            <ExportFormatsMenu 
              plan={plan} 
              onPDFExport={() => setPdfModalOpen(true)} 
            />
            <Button variant="outline" data-testid="button-share">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" data-testid="button-archive">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          </div>
      </div>


      <ViewToggle view={view} onViewChange={setView} />


      {view === "list" && (
        <div className="space-y-4">
          {phases.length > 0 ? (
            phases.map((phase) => (
              <PhaseAccordion
                key={phase.phaseId}
                {...phase}
                onTaskToggle={handleTaskToggle}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
                onTaskStatusChange={handleTaskStatusChange}
                onAddTask={(phaseId) => {
                  setCurrentPhase(phaseId);
                  setAddTaskModalOpen(true);
                }}
                onTaskSelect={handleTaskSelect}
                selectedTaskIds={selectedTaskIds}
              />
            ))
          ) : (
            <div className="text-center p-4 border rounded-lg">
              No tasks found for this plan
            </div>
          )}
        </div>
      )}


      {view === "kanban" && (
        <div>
          {phases.length > 0 ? (
            <KanbanBoard
              tasks={plan.tasks}
              onTaskToggle={handleTaskToggle}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskStatusChange={handleTaskStatusChange}
              onAddTask={(status) => {
                setCurrentPhase(status);
                setAddTaskModalOpen(true);
              }}
            />
          ) : (
            <div className="text-center p-4 border rounded-lg">
              No tasks available to display in Kanban view
            </div>
          )}
        </div>
      )}


      {view === "calendar" && (
        <div>
          {phases.length > 0 ? (
            <CalendarView
              tasks={plan.tasks}
              onTaskToggle={handleTaskToggle}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onTaskStatusChange={handleTaskStatusChange}
            />
          ) : (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              No tasks available to display in Calendar view
            </div>
          )}
        </div>
      )}





      <PDFExportModal
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        planName={plan?.title || ""}
        onExport={(options) => console.log("Export PDF with options:", options)}
        plan={plan}
      />


      <AddTaskModal
        open={addTaskModalOpen}
        onOpenChange={setAddTaskModalOpen}
        currentPhase={currentPhase}
        phases={phases.map(phase => ({ id: phase.phaseId, name: phase.phaseName }))}
        tasks={plan.tasks}
        onAddTask={async (taskData) => {
          try {
            // Send to server
            const response = await fetch(`/api/tasks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...taskData,
                plan_id: id
              }),
            });


            if (!response.ok) {
              throw new Error('Failed to create task');
            }


            // Refresh plan data
            await fetchPlanDetails();
            
            // 🔔 NOTIFY DASHBOARD
            notifyDashboardToRefresh();
            
            toast.success('Task created successfully');
          } catch (error) {
            console.error('Error creating task:', error);
            toast.error('Failed to create task');
          }
        }}
      />
      
      <BulkOperationsBar
        selectedTaskIds={selectedTaskIds}
        onClearSelection={() => setSelectedTaskIds([])}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkPriorityChange={handleBulkPriorityChange}
        onBulkDeadlineChange={handleBulkDeadlineChange}
      />
    </div>
  );
}
