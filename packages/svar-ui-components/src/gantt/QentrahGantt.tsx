import React from 'react';
import { QentrahThemeProvider } from '../theme';

export type GanttScale = 'day' | 'week' | 'month' | 'sprint';

export interface GanttTask {
  id: string;
  title: string;
  start: Date;
  end: Date;
  progress?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignees?: string[];
  dependencies?: string[];
  color?: string;
  metadata?: Record<string, any>;
}

export interface GanttLink {
  id: string;
  source: string;
  target: string;
  type?: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

export interface GanttColumn {
  id: string;
  title: string;
  width?: number;
}

export interface QentrahGanttProps {
  tasks: GanttTask[];
  links?: GanttLink[];
  scale?: GanttScale;
  columns?: GanttColumn[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onTaskClick?: (task: GanttTask) => void;
  onLinkCreate?: (link: GanttLink) => void;
  onLinkDelete?: (linkId: string) => void;
  onScaleChange?: (scale: GanttScale) => void;
  className?: string;
  showCriticalPath?: boolean;
}

/**
 * QentrahGantt - Wrapper for @svar-ui/react-gantt with Qentrah theming.
 * 
 * This component provides a unified gantt chart interface for project scheduling.
 * Currently uses a placeholder implementation - will be integrated with
 * @svar-ui/react-gantt in the full implementation.
 */
export function QentrahGantt({
  tasks = [],
  links = [],
  scale = 'week',
  columns = [
    { id: 'title', title: 'Task', width: 250 },
    { id: 'assignee', title: 'Assignee', width: 150 },
    { id: 'progress', title: 'Progress', width: 100 },
  ],
  onTaskUpdate,
  onTaskClick,
  onLinkCreate,
  onLinkDelete,
  onScaleChange,
  className = '',
  showCriticalPath = false,
}: QentrahGanttProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#3b82f6';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTaskDuration = (task: GanttTask) => {
    const diff = task.end.getTime() - task.start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <QentrahThemeProvider>
      <div className={`w-full h-full bg-background flex flex-col ${className}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Project Timeline</h2>
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'sprint'] as GanttScale[]).map((s) => (
              <button
                key={s}
                onClick={() => onScaleChange?.(s)}
                className={`px-3 py-1 rounded capitalize ${
                  scale === s ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          {/* Task list sidebar */}
          <div className="w-80 border-r overflow-y-auto">
            <div className="grid grid-cols-3 gap-2 p-3 bg-muted font-semibold text-sm">
              {columns.map((col) => (
                <div key={col.id} style={{ width: col.width }}>
                  {col.title}
                </div>
              ))}
            </div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="grid grid-cols-3 gap-2 p-3 border-b hover:bg-muted cursor-pointer"
                onClick={() => onTaskClick?.(task)}
              >
                <div className="truncate">{task.title}</div>
                <div className="text-sm text-muted-foreground">
                  {task.assignees?.slice(0, 2).join(', ') || '-'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {task.progress !== undefined ? `${task.progress}%` : '-'}
                </div>
              </div>
            ))}
          </div>
          {/* Timeline view */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[1200px] p-4">
              {/* Timeline header */}
              <div className="flex mb-4 text-sm text-muted-foreground">
                {Array.from({ length: 14 }).map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  return (
                    <div key={i} className="w-20 text-center border-r">
                      {formatDate(date)}
                    </div>
                  );
                })}
              </div>
              {/* Task bars */}
              <div className="space-y-2">
                {tasks.map((task) => {
                  const duration = getTaskDuration(task);
                  const startOffset = Math.floor(
                    (task.start.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={task.id} className="h-8 relative">
                      <div
                        className="absolute h-6 rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 text-white text-xs truncate"
                        style={{
                          left: `${Math.max(0, startOffset) * 80}px`,
                          width: `${duration * 80}px`,
                          backgroundColor: task.color || getPriorityColor(task.priority),
                        }}
                        onClick={() => onTaskClick?.(task)}
                      >
                        {task.title}
                        {task.progress !== undefined && (
                          <span className="ml-2">{task.progress}%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </QentrahThemeProvider>
  );
}
