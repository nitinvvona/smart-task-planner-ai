import React from 'react';
import { Button } from './ui/button';
import { 
  Trash, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Calendar
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BulkOperationsBarProps {
  selectedTaskIds: string[];
  onClearSelection: () => void;
  onBulkDelete: (taskIds: string[]) => void;
  onBulkStatusChange: (taskIds: string[], status: string) => void;
  onBulkPriorityChange: (taskIds: string[], priority: string) => void;
  onBulkDeadlineChange: (taskIds: string[], deadline: string) => void;
}

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedTaskIds,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkPriorityChange,
  onBulkDeadlineChange
}) => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  if (selectedTaskIds.length === 0) {
    return null;
  }

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      onBulkDelete(selectedTaskIds);
      toast.success(`${selectedTaskIds.length} tasks deleted`);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    onBulkStatusChange(selectedTaskIds, status);
    toast.success(`${selectedTaskIds.length} tasks updated to ${status.replace('_', ' ')}`);
  };

  const handleBulkPriorityChange = (priority: string) => {
    onBulkPriorityChange(selectedTaskIds, priority);
    toast.success(`${selectedTaskIds.length} tasks updated to ${priority} priority`);
  };

  const handleBulkDeadlineChange = () => {
    if (date) {
      onBulkDeadlineChange(selectedTaskIds, date.toISOString());
      toast.success(`${selectedTaskIds.length} tasks updated with new deadline`);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 z-50 flex items-center space-x-4">
      <div className="flex items-center space-x-2 pr-4 border-r">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-medium">{selectedTaskIds.length} tasks selected</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>

      <div className="flex items-center space-x-3">
        <Select onValueChange={handleBulkStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Set status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                <span>Not Started</span>
              </div>
            </SelectItem>
            <SelectItem value="in_progress">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>In Progress</span>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                <span>Completed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={handleBulkPriorityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Set priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2" />
                <span>Low</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2" />
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2" />
                <span>High</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Set deadline</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
            <div className="p-3 border-t">
              <Button 
                size="sm" 
                className="w-full" 
                onClick={handleBulkDeadlineChange}
                disabled={!date}
              >
                Apply deadline
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsBar;