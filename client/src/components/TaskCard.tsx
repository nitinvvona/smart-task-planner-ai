import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Info, GripVertical, Clock, Calendar, ChevronDown, AlertCircle, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TaskCardProps {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  deadline?: string;
  status: "not_started" | "in_progress" | "completed";
  dependencies?: string[];
  allTasks?: { id: string; name: string }[];
  onToggle?: () => void;
  onEdit?: (task: TaskUpdateData) => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  onSelect?: (id: string, isSelected: boolean) => void;
  isSelected?: boolean;
}

interface TaskUpdateData {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  deadline?: string;
  status: "not_started" | "in_progress" | "completed";
  dependencies?: string[];
}

const priorityColors = {
  high: "bg-red-500/10 text-red-600 border-red-500/30",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const priorityAccents = {
  high: "border-l-red-500",
  medium: "border-l-yellow-500",
  low: "border-l-blue-500",
};

// Function to calculate days left until deadline
const getDaysLeft = (deadlineStr: string) => {
  if (!deadlineStr) return 0;
  const deadline = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format deadline with countdown
const formatDeadlineWithCountdown = (deadlineStr: string) => {
  if (!deadlineStr) return 'No deadline';
  
  const daysLeft = getDaysLeft(deadlineStr);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = new Date(deadlineStr).toLocaleDateString('en-US', options);
  
  if (daysLeft === 0) {
    return `${formattedDate} • Today`;
  } else {
    return `${formattedDate} • ${Math.abs(daysLeft)}d ${daysLeft < 0 ? 'ago' : 'left'}`;
  }
};

// Helper function to format deadline for input field
const formatDeadlineForInput = (deadlineStr?: string) => {
  if (!deadlineStr) return '';
  return deadlineStr.includes('T') ? deadlineStr.split('T')[0] : deadlineStr;
};

export function TaskCard({
  id,
  name,
  description,
  priority,
  estimatedHours,
  deadline,
  status,
  dependencies = [],
  allTasks = [],
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
  onSelect,
  isSelected = false,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<TaskUpdateData>({
    id,
    name,
    description,
    priority,
    estimatedHours,
    deadline: deadline || '',
    status,
    dependencies,
  });
  
  // Update editFormData when props change
  useEffect(() => {
    setEditFormData({
      id,
      name,
      description,
      priority,
      estimatedHours,
      deadline: deadline || '',
      status,
      dependencies,
    });
  }, [id, name, description, priority, estimatedHours, deadline, status, dependencies]);
  
  const isCompleted = status === "completed";
  const daysLeft = deadline ? getDaysLeft(deadline) : 0;
  const deadlineClass = daysLeft < 0 ? "text-red-600" : daysLeft <= 2 ? "text-yellow-600" : "";

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = () => {
    if (onEdit) {
      const updatedTask = {
        ...editFormData,
        estimatedHours: Number(editFormData.estimatedHours) || 0,
        deadline: editFormData.deadline || undefined
      };
      onEdit(updatedTask);
      toast.success("Task updated successfully");
    }
    setShowEditDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete();
      toast.success("Task deleted", {
        action: {
          label: "Undo",
          onClick: () => toast.info("Undo functionality would be implemented here"),
        },
      });
    }
    setShowDeleteDialog(false);
  };

  const handleTitleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div
        className={`
          group relative flex items-start gap-4 rounded-xl border-l-4 border-y border-r
          ${priorityAccents[priority]} 
          bg-card p-5 transition-all duration-200
          hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}
          ${isCompleted ? 'opacity-60' : ''}
        `}
        data-testid={`card-task-${id}`}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-5 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <GripVertical className="h-5 w-5 cursor-move text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(id, checked === true)}
              className="h-5 w-5"
              data-testid={`checkbox-select-${id}`}
            />
          )}
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggle}
            className="h-5 w-5"
            data-testid={`checkbox-task-${id}`}
          />
        </div>

        <div className="flex-1 space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div 
                className="flex items-center gap-2 cursor-pointer group/title" 
                onClick={handleTitleClick}
                data-testid={`title-container-${id}`}
              >
                <h4
                  className={`
                    text-lg font-bold tracking-tight leading-tight
                    transition-all duration-200
                    ${isCompleted 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground group-hover/title:text-primary group-hover/title:translate-x-1"
                    }
                  `}
                  data-testid={`text-task-name-${id}`}
                >
                  {name}
                </h4>
                <div className={`
                  transition-all duration-200 
                  ${isExpanded ? 'rotate-180' : ''} 
                  group-hover/title:text-primary
                `}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {!isExpanded && description && (
                <p className="mt-2 text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 italic">
                  {description.substring(0, 100)}...
                </p>
              )}

              {/* Metadata badges */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge 
                  className={`${priorityColors[priority]} border font-semibold no-default-hover-elevate no-default-active-elevate`} 
                  data-testid={`badge-priority-${id}`}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {priority.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs flex items-center gap-1.5" data-testid={`badge-time-${id}`}>
                  <Clock className="h-3.5 w-3.5" />
                  {estimatedHours}h
                </Badge>
                {deadline ? (
                  <Badge 
                    variant="outline" 
                    className={`text-xs flex items-center gap-1.5 ${deadlineClass}`} 
                    data-testid={`badge-deadline-${id}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDeadlineWithCountdown(deadline)}
                  </Badge>
                ) : (
                  <Badge 
                    variant="outline" 
                    className="text-xs flex items-center gap-1.5 text-muted-foreground/60" 
                    data-testid={`badge-deadline-${id}`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    No deadline set
                  </Badge>
                )}
                {dependencies.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1.5" data-testid={`badge-dependencies-${id}`}>
                        <Info className="h-3.5 w-3.5" />
                        {dependencies.length} deps
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Depends on: {dependencies.join(", ")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-36" data-testid={`select-status-${id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="hover:bg-primary/10 hover:text-primary"
                data-testid={`button-edit-${id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="hover:bg-red-500/10 hover:text-red-600"
                data-testid={`button-delete-${id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ✨ SIMPLE PARAGRAPH DESCRIPTION */}
          {isExpanded && description && (
            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {description}
              </p>
            </div>
          )}
          
          {isExpanded && dependencies.length > 0 && (
            <div className="mt-3 rounded-lg border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <h5 className="text-sm font-bold text-orange-900 dark:text-orange-100">Dependencies</h5>
              </div>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Complete these first: {dependencies.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                data-testid="input-task-name"
                className="text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                data-testid="textarea-description"
                className="min-h-[120px] text-sm"
                placeholder="Describe what needs to be done in simple steps..."
              />
              <p className="text-xs text-muted-foreground">
                Tip: Separate steps with periods or new lines for better readability
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={editFormData.priority}
                  onValueChange={(value: "high" | "medium" | "low") => 
                    setEditFormData({ ...editFormData, priority: value })
                  }
                >
                  <SelectTrigger id="priority" data-testid="select-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={editFormData.estimatedHours}
                  onChange={(e) => setEditFormData({ 
                    ...editFormData, 
                    estimatedHours: parseFloat(e.target.value) || 0 
                  })}
                  data-testid="input-estimated-hours"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formatDeadlineForInput(editFormData.deadline)}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  deadline: e.target.value 
                })}
                data-testid="input-deadline"
                placeholder="Set a deadline..."
              />
              <p className="text-xs text-muted-foreground">
                Leave empty if you don't need a deadline for this task
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: "not_started" | "in_progress" | "completed") => 
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger id="status" data-testid="select-edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} data-testid="button-save-edit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">This will permanently remove the task from your plan.</p>
          </div>
          {dependencies.length > 0 && (
            <div className="rounded-md bg-warning/10 p-3 text-warning">
              <p className="text-sm font-medium">Warning: Other tasks depend on this one</p>
              <p className="text-sm">Deleting this task may affect the workflow of dependent tasks.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} data-testid="button-confirm-delete">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
