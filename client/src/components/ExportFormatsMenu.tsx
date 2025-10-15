import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

// Define Task and Plan interfaces locally since @/types/plan isn't available
interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  estimatedHours?: number;
  dependencies?: string[];
}

interface Plan {
  id: string;
  title: string;
  description?: string;
  category: string;
  createdAt: string;
  tasks: Task[];
  phases?: Array<{
    phaseId: string;
    name: string;
    tasks: Task[];
  }>;
}

interface ExportFormatsMenuProps {
  plan?: Plan;
  onPDFExport: () => void;
}

export function ExportFormatsMenu({ plan, onPDFExport }: ExportFormatsMenuProps) {
  const exportAsCSV = () => {
    if (!plan) {
      toast.error("No plan data available for export");
      return;
    }

    try {
      // Create CSV header
      const headers = ["Task Name", "Description", "Status", "Priority", "Deadline", "Estimated Hours"];
      
      // Create CSV rows
      const rows = plan.tasks.map((task: Task) => [
        task.name,
        task.description || "",
        task.status,
        task.priority,
        task.deadline ? new Date(task.deadline).toLocaleDateString() : "",
        task.estimatedHours || ""
      ]);
      
      // Combine header and rows
      const csvContent = [
        headers.join(","),
        ...rows.map((row: Array<string | number | boolean>) => 
          row.map((cell: string | number | boolean) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
      ].join("\n");
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${plan.title.replace(/\s+/g, "_")}_tasks.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("CSV export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const exportAsJSON = () => {
    if (!plan) {
      toast.error("No plan data available for export");
      return;
    }

    try {
      // Create a simplified version of the plan for export
      const exportData = {
        title: plan.title,
        description: plan.description,
        category: plan.category,
        createdAt: plan.createdAt,
        tasks: plan.tasks.map((task: Task) => ({
          id: task.id,
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          deadline: task.deadline,
          estimatedHours: task.estimatedHours,
          dependencies: task.dependencies
        }))
      };
      
      // Convert to JSON string
      const jsonContent = JSON.stringify(exportData, null, 2);
      
      // Create and download the file
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${plan.title.replace(/\s+/g, "_")}_plan.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("JSON exported successfully");
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error("Failed to export JSON");
    }
  };

  const exportAsMarkdown = () => {
    if (!plan) {
      toast.error("No plan data available for export");
      return;
    }

    try {
      // Create markdown content
      let mdContent = `# ${plan.title}\n\n`;
      
      if (plan.description) {
        mdContent += `${plan.description}\n\n`;
      }
      
      mdContent += `**Category:** ${plan.category}\n`;
      mdContent += `**Created:** ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
      
      // Add tasks section
      mdContent += `## Tasks\n\n`;
      
      // Group tasks by status
      const tasksByStatus = {
        not_started: plan.tasks.filter(t => t.status === "not_started"),
        in_progress: plan.tasks.filter(t => t.status === "in_progress"),
        completed: plan.tasks.filter(t => t.status === "completed")
      };
      
      // Add tasks by status
      for (const [status, tasks] of Object.entries(tasksByStatus)) {
        if (tasks.length > 0) {
          mdContent += `### ${status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}\n\n`;
          
          tasks.forEach(task => {
            mdContent += `- **${task.name}** (Priority: ${task.priority})`;
            if (task.deadline) {
              mdContent += ` - Due: ${new Date(task.deadline).toLocaleDateString()}`;
            }
            mdContent += "\n";
            
            if (task.description) {
              mdContent += `  ${task.description}\n`;
            }
            
            if (task.estimatedHours) {
              mdContent += `  Estimated Hours: ${task.estimatedHours}\n`;
            }
            
            mdContent += "\n";
          });
        }
      }
      
      // Create and download the file
      const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${plan.title.replace(/\s+/g, "_")}_plan.md`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Markdown exported successfully");
    } catch (error) {
      console.error("Markdown export error:", error);
      toast.error("Failed to export Markdown");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onPDFExport}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMarkdown}>
          Export as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}