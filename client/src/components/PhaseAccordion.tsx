import { ChevronDown, PlusCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { TaskCard } from "./TaskCard";

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

interface PhaseAccordionProps {
  phaseId: string;
  phaseName: string;
  tasks: Task[];
  completedCount: number;
  onTaskToggle?: (taskId: string) => void;
  onTaskEdit?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskStatusChange?: (taskId: string, status: string) => void;
  onAddTask?: (phaseId: string) => void;
  onTaskSelect?: (taskId: string, isSelected: boolean) => void;
  selectedTaskIds?: string[];
}

export function PhaseAccordion({
  phaseId,
  phaseName,
  tasks = [], // Add default empty array
  completedCount,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onAddTask,
  onTaskSelect, // Add this
  selectedTaskIds, // Add this
}: PhaseAccordionProps) {
  const completionPercentage = tasks.length > 0 
    ? Math.round((completedCount / tasks.length) * 100) 
    : 0;

  return (
    <Accordion type="single" collapsible defaultValue={phaseId}>
      <AccordionItem value={phaseId} className="border rounded-lg" data-testid={`accordion-phase-${phaseId}`}>
        <AccordionTrigger className="px-6 hover:no-underline hover-elevate">
          <div className="flex w-full items-center justify-between pr-4">
            <div className="flex items-center gap-4">
              <h3 className="font-heading text-lg font-semibold" data-testid={`text-phase-name-${phaseId}`}>
                {phaseName}
              </h3>
              <span className="text-sm text-muted-foreground" data-testid={`text-task-count-${phaseId}`}>
                {completedCount}/{tasks.length} tasks
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium" data-testid={`text-completion-${phaseId}`}>
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <div className="space-y-3 pt-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                {...task}
                onToggle={() => onTaskToggle?.(task.id)}
                onEdit={() => onTaskEdit?.(task.id)}
                onDelete={() => onTaskDelete?.(task.id)}
                onStatusChange={(status) => onTaskStatusChange?.(task.id, status)}
                onSelect={onTaskSelect}
                isSelected={selectedTaskIds?.includes(task.id)}
              />
            ))}
            <Button 
              variant="outline" 
              className="w-full mt-2 border-dashed" 
              onClick={() => onAddTask?.(phaseId)}
              data-testid={`button-add-task-${phaseId}`}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}