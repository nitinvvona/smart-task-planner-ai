import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterPanelProps {
  trigger?: React.ReactNode;
}

export function FilterPanel({ trigger }: FilterPanelProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const statuses = ["All", "Not Started", "In Progress", "Completed", "Overdue"];
  const priorities = ["High", "Medium", "Low"];

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline" data-testid="button-open-filters">Filters</Button>}
      </SheetTrigger>
      <SheetContent data-testid="panel-filters">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <div>
            <Label className="mb-3 block font-semibold">Status</Label>
            <div className="space-y-2">
              {statuses.map((status) => (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedStatuses.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                    data-testid={`checkbox-status-${status.toLowerCase().replace(' ', '-')}`}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block font-semibold">Priority</Label>
            <div className="flex gap-2">
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={`rounded-lg px-4 py-2 text-sm transition-all ${
                    selectedPriorities.includes(priority)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover-elevate"
                  }`}
                  data-testid={`button-priority-${priority.toLowerCase()}`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="date-from" className="mb-2 block font-semibold">Date Range</Label>
            <div className="space-y-2">
              <Input type="date" id="date-from" data-testid="input-date-from" />
              <Input type="date" id="date-to" data-testid="input-date-to" />
            </div>
          </div>

          <div>
            <Label htmlFor="search-task" className="mb-2 block font-semibold">Search within plan</Label>
            <Input
              id="search-task"
              placeholder="Search tasks..."
              data-testid="input-search-task"
            />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={clearFilters}
            data-testid="button-clear-filters"
          >
            Clear all filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
