import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Clock, Edit2 } from 'lucide-react';

// ✅ Define Task interface directly here
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

interface TimelineViewProps {
  tasks: Task[];
  onTaskEdit: (taskId: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks, onTaskEdit }) => {
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month'>('week');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Sort tasks by deadline
  const sortedTasks = useMemo(() => {
    return [...tasks]
      .filter(task => task.deadline) // Only show tasks with deadlines
      .sort((a, b) => {
        const dateA = new Date(a.deadline!).getTime();
        const dateB = new Date(b.deadline!).getTime();
        return dateA - dateB;
      });
  }, [tasks]);

  // Get date range with proper padding
  const dateRange = useMemo(() => {
    if (sortedTasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }
    
    const dates = sortedTasks.map(task => new Date(task.deadline!).getTime());
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    // Add padding based on zoom level
    const padding = zoomLevel === 'day' ? 7 : zoomLevel === 'week' ? 14 : 30;
    earliestDate.setDate(earliestDate.getDate() - padding);
    latestDate.setDate(latestDate.getDate() + padding);
    
    return { start: earliestDate, end: latestDate };
  }, [sortedTasks, zoomLevel]);

  // Generate timeline markers
  const timelineMarkers = useMemo(() => {
    const markers: { date: Date; label: string; isMainMarker: boolean }[] = [];
    const { start, end } = dateRange;
    let current = new Date(start);
    
    while (current <= end) {
      const isMainMarker = current.getDate() === 1 || 
                          (zoomLevel === 'week' && current.getDay() === 0) ||
                          (zoomLevel === 'day' && true);
      
      const label = zoomLevel === 'day' 
        ? current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : zoomLevel === 'week'
        ? current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      markers.push({ date: new Date(current), label, isMainMarker });
      
      // Increment based on zoom level
      if (zoomLevel === 'day') current.setDate(current.getDate() + 1);
      else if (zoomLevel === 'week') current.setDate(current.getDate() + 7);
      else current.setMonth(current.getMonth() + 1);
    }
    
    return markers;
  }, [dateRange, zoomLevel]);

  // Calculate task position and width
  const getTaskDimensions = (task: Task) => {
    if (!task.deadline) return { left: 0, width: 0 };
    
    const { start, end } = dateRange;
    const totalDuration = end.getTime() - start.getTime();
    const taskDate = new Date(task.deadline);
    
    // Calculate start position
    const taskStart = taskDate.getTime() - (task.estimatedHours * 60 * 60 * 1000) || taskDate.getTime();
    const offset = taskStart - start.getTime();
    const left = (offset / totalDuration) * 100;
    
    // Calculate width based on estimated hours
    const duration = (task.estimatedHours || 8) * 60 * 60 * 1000; // Default 8 hours
    const width = (duration / totalDuration) * 100;
    
    return {
      left: Math.max(0, Math.min(left, 100)),
      width: Math.max(2, Math.min(width, 100 - left))
    };
  };

  // Get priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-50' };
      case 'medium': return { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-50' };
      case 'low': return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-50' };
      default: return { bg: 'bg-gray-500', border: 'border-gray-600', text: 'text-gray-50' };
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 border-green-500';
      case 'in_progress': return 'bg-blue-500/20 border-blue-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (sortedTasks.length === 0) {
    return (
      <div className="w-full">
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Tasks with Deadlines</h3>
          <p className="text-muted-foreground">
            Add deadlines to your tasks to see them in the timeline view
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Timeline View</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} scheduled from{' '}
            {dateRange.start.toLocaleDateString()} to {dateRange.end.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={zoomLevel === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('day')}
          >
            Day
          </Button>
          <Button
            variant={zoomLevel === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('week')}
          >
            Week
          </Button>
          <Button
            variant={zoomLevel === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('month')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Timeline Card */}
      <Card className="p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Timeline Header with Date Markers */}
          <div className="relative mb-6 pb-4 border-b-2 border-border">
            <div className="flex justify-between items-end h-12">
              {timelineMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="flex-1 text-center relative"
                  style={{ minWidth: `${100 / timelineMarkers.length}%` }}
                >
                  {marker.isMainMarker && (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
                      <div className="text-xs font-semibold text-foreground">
                        {marker.label}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="space-y-3">
            {sortedTasks.map((task, taskIndex) => {
              const dimensions = getTaskDimensions(task);
              const colors = getPriorityColor(task.priority);
              const isHovered = hoveredTask === task.id;

              return (
                <div
                  key={task.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  {/* Task Row Background */}
                  <div className={`
                    h-16 rounded-lg transition-all duration-200
                    ${taskIndex % 2 === 0 ? 'bg-muted/30' : 'bg-muted/10'}
                    ${isHovered ? 'bg-primary/5' : ''}
                  `}>
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex">
                      {timelineMarkers.map((marker, i) => (
                        marker.isMainMarker && (
                          <div
                            key={i}
                            className="flex-1 border-r border-border/30"
                            style={{ minWidth: `${100 / timelineMarkers.length}%` }}
                          />
                        )
                      ))}
                    </div>

                    {/* Task Bar */}
                    <div
                      className={`
                        absolute top-2 h-12 rounded-lg 
                        ${colors.bg} ${colors.border} border-2
                        cursor-pointer transition-all duration-200
                        ${isHovered ? 'transform -translate-y-1 shadow-lg scale-105' : 'shadow-md'}
                        flex items-center px-3 gap-2
                      `}
                      style={{
                        left: `${dimensions.left}%`,
                        width: `${dimensions.width}%`,
                        minWidth: '120px'
                      }}
                      onClick={() => onTaskEdit(task.id)}
                    >
                      {/* Task Content */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`flex-1 min-w-0 ${colors.text}`}>
                          <div className="font-semibold text-sm truncate">
                            {task.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs opacity-90">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h
                            <span>•</span>
                            {formatDate(task.deadline!)}
                          </div>
                        </div>
                        <Edit2 className={`h-4 w-4 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      </div>
                    </div>

                    {/* Task Label (on the left) */}
                    <div className="absolute left-0 top-0 h-16 flex items-center -ml-2">
                      <Badge
                        variant="outline"
                        className={`
                          ${getStatusColor(task.status)} 
                          opacity-0 group-hover:opacity-100 transition-opacity
                          text-xs font-medium
                        `}
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute left-0 -bottom-2 z-10 mt-2">
                      <Card className="p-3 shadow-lg border-2 border-primary/20 bg-card min-w-[250px]">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm">{task.name}</h4>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Badge className={`${getPriorityColor(task.priority).bg} text-white text-xs`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedHours}h
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatDate(task.deadline!)}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span className="font-semibold">Priority:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500" />
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimelineView;
