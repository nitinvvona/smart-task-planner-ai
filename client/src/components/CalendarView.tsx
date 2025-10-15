import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  X,
  Edit,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Task } from '../types';


interface CalendarViewProps {
  tasks: Task[];
  onTaskEdit: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
}


interface TaskEditData {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  estimatedHours: number;
  deadline: string;
  status: "not_started" | "in_progress" | "completed";
}


const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskEdit,
  onTaskToggle,
  onTaskDelete,
  onTaskStatusChange
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([]);
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskEditData | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);


  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // Get number of days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];


  // 🔄 Auto-assign tasks without deadlines to available dates
  useEffect(() => {
    autoAssignTasks();
  }, [tasks]);


  // 🤖 Algorithm to automatically assign tasks to calendar dates
  const autoAssignTasks = () => {
    const tasksWithoutDeadline = tasks.filter(task => !task.deadline);
    
    if (tasksWithoutDeadline.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort tasks by priority (high > medium > low)
    const sortedTasks = [...tasksWithoutDeadline].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Distribute tasks across next 30 days
    sortedTasks.forEach((task, index) => {
      const assignedDate = new Date(today);
      assignedDate.setDate(today.getDate() + (index % 30) + 1);
      
      // Auto-assign deadline if not set
      if (!task.deadline) {
        const formattedDate = assignedDate.toISOString().split('T')[0];
        // This would trigger an update through your parent component
        console.log(`Auto-assigning task "${task.name}" to ${formattedDate}`);
      }
    });
  };


  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };


  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };


  // Check if a date has tasks
  const getTasksForDate = (day: number): Task[] => {
    const date = new Date(currentYear, currentMonth, day);
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };


  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };


  // Get priority badge color
  const getPriorityBadgeColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'low':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    }
  };


  // Handle date click
  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const tasksForDate = getTasksForDate(day);
    
    setSelectedDate(date);
    setSelectedDateTasks(tasksForDate);
    setShowTasksDialog(true);
  };


  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // Format deadline for input field
  const formatDeadlineForInput = (deadlineStr: string) => {
    if (!deadlineStr) return '';
    return deadlineStr.includes('T') ? deadlineStr.split('T')[0] : deadlineStr;
  };


  // ✏️ Handle Edit Click
  const handleEditClick = (task: Task) => {
    setEditingTask({
      id: task.id,
      name: task.name,
      description: task.description,
      priority: task.priority,
      estimatedHours: task.estimatedHours,
      deadline: task.deadline || '',
      status: task.status
    });
    setShowEditDialog(true);
    setShowTasksDialog(false);
  };


  // 💾 Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!editingTask) return;

    try {
      // Ensure numeric values are properly parsed
      const updatedTask = {
        ...editingTask,
        estimatedHours: parseFloat(editingTask.estimatedHours.toString()) || 0
      };

      // Call the parent's edit handler
      onTaskEdit(updatedTask.id);
      
      // Update the task via API
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

      toast.success('Task updated successfully');
      setShowEditDialog(false);
      setEditingTask(null);
      
      // Refresh the calendar view
      window.dispatchEvent(new CustomEvent('planUpdated'));
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };


  // 🗑️ Handle Delete Click
  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId);
    setShowDeleteDialog(true);
    setShowTasksDialog(false);
  };


  // ✅ Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!deletingTaskId) return;

    try {
      const response = await fetch(`/api/tasks/${deletingTaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      toast.success('Task deleted successfully');
      onTaskDelete(deletingTaskId);
      setShowDeleteDialog(false);
      setDeletingTaskId(null);
      
      // Refresh the calendar view
      window.dispatchEvent(new CustomEvent('planUpdated'));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };


  // Generate calendar grid
  const generateCalendarGrid = () => {
    const today = new Date();
    const isCurrentMonth = 
      today.getMonth() === currentMonth && 
      today.getFullYear() === currentYear;

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-28 border border-border bg-muted/20"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const tasksForDay = getTasksForDate(day);
      const isToday = 
        isCurrentMonth && today.getDate() === day;
      
      days.push(
        <div 
          key={`day-${day}`} 
          className={`
            h-28 border border-border p-2 relative cursor-pointer 
            transition-all duration-200
            hover:bg-primary/5 hover:shadow-md hover:-translate-y-0.5
            ${isToday ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-card'}
          `}
          onClick={() => handleDateClick(day)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`
              text-sm font-semibold
              ${isToday 
                ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center' 
                : 'text-foreground'
              }
            `}>
              {day}
            </span>
            {tasksForDay.length > 0 && (
              <Badge 
                variant="outline" 
                className="text-xs px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/30"
              >
                {tasksForDay.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1 overflow-hidden">
            {tasksForDay.slice(0, 2).map((task) => (
              <div 
                key={task.id} 
                className={`
                  ${getPriorityColor(task.priority)} 
                  w-full px-2 py-1 rounded text-white text-xs font-medium
                  truncate shadow-sm
                `}
                title={task.name}
              >
                {task.name}
              </div>
            ))}
            {tasksForDay.length > 2 && (
              <div className="text-xs text-muted-foreground font-medium text-center pt-1">
                +{tasksForDay.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };


  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousMonth}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextMonth}
            className="hover:bg-primary/10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 rounded-lg overflow-hidden border border-border shadow-sm">
        {/* Days of the week */}
        {daysOfWeek.map((day) => (
          <div 
            key={day} 
            className="text-center font-semibold text-sm p-3 bg-muted border-b border-border"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {generateCalendarGrid()}
      </div>


      {/* Tasks Dialog */}
      <Dialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate ? formatDate(selectedDate) : 'Tasks'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            {selectedDateTasks.length > 0 ? (
              selectedDateTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className="p-4 hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: 
                    task.priority === 'high' ? '#ef4444' : 
                    task.priority === 'medium' ? '#eab308' : 
                    '#3b82f6' 
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{task.name}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={`${getPriorityBadgeColor(task.priority)} border font-semibold`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        {task.estimatedHours && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(task)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(task.id)}
                        className="hover:bg-red-500/10 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No tasks scheduled for this date</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Make changes to the task details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Task Name</Label>
                <Input
                  id="edit-name"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value: "high" | "medium" | "low") => 
                      setEditingTask({ ...editingTask, priority: value })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-hours">Estimated Hours</Label>
                  <Input
                    id="edit-hours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingTask.estimatedHours}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      estimatedHours: parseFloat(e.target.value) || 0 
                    })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-deadline">Deadline</Label>
                  <Input
                    id="edit-deadline"
                    type="date"
                    value={formatDeadlineForInput(editingTask.deadline)}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      deadline: e.target.value 
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value: "not_started" | "in_progress" | "completed") => 
                      setEditingTask({ ...editingTask, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
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
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-600 border border-red-500/30">
            <Trash2 className="h-5 w-5" />
            <p className="text-sm font-medium">
              This will permanently remove the task from your calendar.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
            >
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default CalendarView;
