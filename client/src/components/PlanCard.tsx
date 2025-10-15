import { CheckCircle2, Clock, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PlanCardProps {
  id: string;
  title: string;
  completedTasks: number;
  totalTasks: number;
  progress: number;
  color?: "purple" | "blue" | "cyan" | "yellow";
  isCompleted?: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

const colorClasses = {
  purple: {
    gradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    border: "border-purple-500/30 hover:border-purple-500/50",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    progress: "bg-purple-500",
    glow: "shadow-purple-500/20",
  },
  blue: {
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    border: "border-blue-500/30 hover:border-blue-500/50",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    progress: "bg-blue-500",
    glow: "shadow-blue-500/20",
  },
  cyan: {
    gradient: "from-cyan-600/20 via-cyan-500/10 to-transparent",
    border: "border-cyan-500/30 hover:border-cyan-500/50",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    progress: "bg-cyan-500",
    glow: "shadow-cyan-500/20",
  },
  yellow: {
    gradient: "from-yellow-600/20 via-yellow-500/10 to-transparent",
    border: "border-yellow-500/30 hover:border-yellow-500/50",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    progress: "bg-yellow-500",
    glow: "shadow-yellow-500/20",
  },
};

export function PlanCard({
  id,
  title,
  completedTasks,
  totalTasks,
  progress,
  color = "purple",
  isCompleted = false,
  onClick,
  onDelete,
}: PlanCardProps) {
  const colors = colorClasses[color];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className={`group relative overflow-hidden border-2 ${colors.border} bg-gradient-to-br ${colors.gradient} backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${colors.glow} cursor-pointer`}
      onClick={onClick}
      data-testid={`card-plan-${id}`}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="relative p-6 space-y-4">
        {/* Header with title and delete button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight" data-testid={`text-plan-title-${id}`}>
              {title}
            </h3>
            {isCompleted && (
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild onClick={handleDelete}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                data-testid={`button-delete-plan-${id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{title}"? This action cannot be undone and will remove all associated tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">
              {completedTasks}/{totalTasks} tasks
            </span>
          </div>
          {!isCompleted && completedTasks > 0 && (
            <Badge variant="outline" className={colors.badge}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {progress}%
            </Badge>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/50 backdrop-blur-sm">
            <div
              className={`h-full ${colors.progress} transition-all duration-500 ease-out rounded-full shadow-lg`}
              style={{ width: `${progress}%` }}
              data-testid={`progress-bar-${id}`}
            />
          </div>
        </div>

        {/* Footer with completion status */}
        {totalTasks > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {completedTasks === 0
                ? "Not started yet"
                : completedTasks === totalTasks
                ? "All tasks completed! 🎉"
                : `${totalTasks - completedTasks} task${totalTasks - completedTasks === 1 ? '' : 's'} remaining`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}