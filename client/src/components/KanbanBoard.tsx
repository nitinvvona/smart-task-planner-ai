import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Clock, 
  Calendar, 
  MoreVertical,
  Edit2,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface Task {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  deadline: string;
  status: "not_started" | "in_progress" | "completed";
  dependencies?: string[];
  phase?: string;
}

interface KanbanColumn {
  id: "not_started" | "in_progress" | "completed";
  title: string;
  tasks: Task[];
  color: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskToggle?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onAddTask?: (status: string) => void;
}

export function KanbanBoard({
  tasks = [],
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onAddTask,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // Group tasks by status with color coding
  const columns: KanbanColumn[] = [
    {
      id: "not_started",
      title: "To Do",
      tasks: tasks.filter((task) => task.status === "not_started"),
      color: "border-t-gray-500"
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: tasks.filter((task) => task.status === "in_progress"),
      color: "border-t-blue-500"
    },
    {
      id: "completed",
      title: "Done",
      tasks: tasks.filter((task) => task.status === "completed"),
      color: "border-t-green-500"
    },
  ];

  const handleDragStart = (e: React.DragEvent, taskId: string, sourceStatus: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("sourceStatus", sourceStatus);
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const sourceStatus = e.dataTransfer.getData("sourceStatus");
    
    if (sourceStatus !== targetStatus && taskId) {
      onTaskStatusChange(taskId, targetStatus);
      toast.success("Task moved successfully");
    }
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete && onTaskDelete) {
      onTaskDelete(taskToDelete);
      toast.success("Task deleted successfully");
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`
              rounded-xl bg-muted/20 border-t-4 ${column.color}
              transition-all duration-200
              ${draggedTask ? 'bg-muted/40' : ''}
            `}
            data-testid={`kanban-column-${column.id}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border/50 bg-card/50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {column.title}
                </h3>
                <Badge variant="secondary" className="font-semibold">
                  {column.tasks.length}
                </Badge>
              </div>
            </div>

            {/* Tasks Area */}
            <div className="p-4 space-y-3 min-h-[400px] max-h-[calc(100vh-300px)] overflow-y-auto">
              {column.tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <p className="text-sm">No tasks yet</p>
                  <p className="text-xs mt-1">Drag tasks here or click below to add</p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, task.status)}
                    onDragEnd={handleDragEnd}
                    className={`
                      p-4 cursor-grab active:cursor-grabbing
                      transition-all duration-200
                      hover:shadow-lg hover:-translate-y-1
                      border-l-4 ${
                        task.priority === 'high' ? 'border-l-red-500' :
                        task.priority === 'medium' ? 'border-l-yellow-500' :
                        'border-l-blue-500'
                      }
                      ${draggedTask === task.id ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-sm leading-tight flex-1">
                        {task.name}
                      </h4>
                      
                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => onTaskEdit?.(task.id)}
                            className="cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(task.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Task Description */}
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Task Metadata */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge 
                        className={`${getPriorityColor(task.priority)} border text-xs font-semibold`}
                      >
                        {task.priority.toUpperCase()}
                      </Badge>
                      
                      {task.estimatedHours && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimatedHours}h
                        </div>
                      )}
                      
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.deadline)}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}

              {/* Add Task Button */}
              <Button
                variant="outline"
                className="w-full border-dashed hover:border-primary hover:text-primary"
                onClick={() => onAddTask?.(column.id)}
                data-testid={`button-add-task-${column.id}`}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
