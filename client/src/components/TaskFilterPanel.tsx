import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface TaskFilterPanelProps {
  onFilterChange: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  searchTerm: string;
  status: string[];
  priority: string[];
  deadlineFrom: Date | null;
  deadlineTo: Date | null;
}

export function TaskFilterPanel({ onFilterChange }: TaskFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    searchTerm: "",
    status: [],
    priority: [],
    deadlineFrom: null,
    deadlineTo: null,
  });

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    handleFilterChange("status", newStatus);
  };

  const handlePriorityChange = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    handleFilterChange("priority", newPriority);
  };

  const clearFilters = () => {
    const resetFilters = {
      searchTerm: "",
      status: [],
      priority: [],
      deadlineFrom: null,
      deadlineTo: null,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = 
    (filters.searchTerm ? 1 : 0) + 
    filters.status.length + 
    filters.priority.length + 
    (filters.deadlineFrom ? 1 : 0) + 
    (filters.deadlineTo ? 1 : 0);

  return (
    <div className="mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search tasks..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="h-8"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex flex-wrap gap-1">
                {["not_started", "in_progress", "completed"].map((status) => (
                  <Button
                    key={status}
                    variant={filters.status.includes(status) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                    className="h-7 text-xs"
                  >
                    {status.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex flex-wrap gap-1">
                {["low", "medium", "high"].map((priority) => (
                  <Button
                    key={priority}
                    variant={filters.priority.includes(priority) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange(priority)}
                    className="h-7 text-xs"
                  >
                    {priority}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Deadline from</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.deadlineFrom ? (
                        format(filters.deadlineFrom, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.deadlineFrom || undefined}
                      onSelect={(date: Date | undefined) => 
                        handleFilterChange("deadlineFrom", date || null)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Deadline to</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.deadlineTo ? (
                        format(filters.deadlineTo, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.deadlineTo || undefined}
                      onSelect={(date: Date | undefined) => 
                        handleFilterChange("deadlineTo", date || null)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}