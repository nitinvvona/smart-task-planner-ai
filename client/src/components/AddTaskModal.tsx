import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface AddTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  phases: { id: string; name: string }[];
  tasks: Task[];
  currentPhase?: string;
}

export function AddTaskModal({
  open,
  onOpenChange,
  onAddTask,
  phases,
  tasks,
  currentPhase,
}: AddTaskModalProps) {
  const [taskData, setTaskData] = useState<Omit<Task, "id">>({
    name: "",
    description: "",
    priority: "medium",
    estimatedHours: 1,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "not_started",
    dependencies: [],
    phase: currentPhase || "",
  });

  const handleChange = (field: keyof Omit<Task, "id">, value: any) => {
    setTaskData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.name.trim()) {
      toast.error("Task name is required");
      return;
    }
    
    onAddTask(taskData);
    toast.success("Task created successfully");
    onOpenChange(false);
    
    // Reset form
    setTaskData({
      name: "",
      description: "",
      priority: "medium",
      estimatedHours: 1,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not_started",
      dependencies: [],
      phase: currentPhase || "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="modal-add-task">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-xl">
            <PlusCircle className="h-5 w-5" />
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-name" className="required">Task Name</Label>
            <Input
              id="task-name"
              value={taskData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter task name"
              required
              data-testid="input-task-name"
            />
          </div>

          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={taskData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter task description"
              rows={3}
              data-testid="textarea-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={taskData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger id="task-priority" data-testid="select-task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="task-hours">Estimated Hours</Label>
              <Input
                id="task-hours"
                type="number"
                min="0.5"
                step="0.5"
                value={taskData.estimatedHours}
                onChange={(e) => handleChange("estimatedHours", parseFloat(e.target.value))}
                data-testid="input-task-hours"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-deadline">Deadline</Label>
              <Input
                id="task-deadline"
                type="date"
                value={taskData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                data-testid="input-task-deadline"
              />
            </div>

            <div>
              <Label htmlFor="task-phase">Phase</Label>
              <Select
                value={taskData.phase}
                onValueChange={(value) => handleChange("phase", value)}
              >
                <SelectTrigger id="task-phase" data-testid="select-task-phase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="task-dependencies">Dependencies</Label>
            <Select
              value={taskData.dependencies?.join(",")}
              onValueChange={(value) => handleChange("dependencies", value ? value.split(",") : [])}
            >
              <SelectTrigger id="task-dependencies" data-testid="select-task-dependencies">
                <SelectValue placeholder="Select dependencies" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-add-task"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-create-task"
            >
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}