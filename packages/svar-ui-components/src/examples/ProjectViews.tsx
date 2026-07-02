import React from 'react';
import { QentrahCalendar, CalendarEvent } from '../calendar';
import { QentrahKanban, KanbanColumn, KanbanCard } from '../kanban';
import { QentrahGantt, GanttTask, GanttLink } from '../gantt';
import { QentrahTableWithViews } from '../grid';
import type { ViewConfig } from '../types';

export interface ProjectTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  startDate: string;
  dueDate: string;
  progress?: number;
  description?: string;
}

export interface ProjectViewsProps {
  tasks: ProjectTask[];
  view: 'table' | 'board' | 'calendar' | 'gantt';
  viewConfig?: ViewConfig;
  onViewConfigChange?: (config: ViewConfig) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => void;
  onTaskClick?: (task: ProjectTask) => void;
}

/**
 * ProjectViews - Example integration for Projects domain.
 * Demonstrates how to use QentrahCalendar, QentrahKanban, QentrahGantt,
 * and QentrahTableWithViews for project task management.
 */
export function ProjectViews({
  tasks,
  view,
  viewConfig,
  onViewConfigChange,
  onTaskUpdate,
  onTaskClick,
}: ProjectViewsProps) {
  // Transform tasks to calendar events
  const calendarEvents: CalendarEvent[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.startDate),
    end: new Date(task.dueDate),
    color: getPriorityColor(task.priority),
    description: task.description,
  }));

  // Transform tasks to kanban columns
  const kanbanColumns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: '#6b7280',
      cards: tasks.filter((t) => t.status === 'todo').map(taskToCard),
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: '#3b82f6',
      cards: tasks.filter((t) => t.status === 'in_progress').map(taskToCard),
    },
    {
      id: 'review',
      title: 'Review',
      color: '#f59e0b',
      cards: tasks.filter((t) => t.status === 'review').map(taskToCard),
    },
    {
      id: 'done',
      title: 'Done',
      color: '#22c55e',
      cards: tasks.filter((t) => t.status === 'done').map(taskToCard),
    },
  ];

  // Transform tasks to gantt tasks
  const ganttTasks: GanttTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: new Date(task.startDate),
    end: new Date(task.dueDate),
    progress: task.progress,
    priority: task.priority,
    assignees: task.assigneeId ? [task.assigneeId] : [],
  }));

  // Table columns
  const tableColumns = [
    { headerName: 'Task', field: 'title' as const, flex: 1 },
    { headerName: 'Status', field: 'status' as const, width: 120 },
    { headerName: 'Priority', field: 'priority' as const, width: 100 },
    { headerName: 'Due Date', field: 'dueDate' as const, width: 120 },
  ];

  const handleCardMove = (cardId: string, fromColumnId: string, toColumnId: string) => {
    const statusMap: Record<string, ProjectTask['status']> = {
      todo: 'todo',
      in_progress: 'in_progress',
      review: 'review',
      done: 'done',
    };
    onTaskUpdate?.(cardId, { status: statusMap[toColumnId] });
  };

  const handleCardUpdate = (cardId: string, updates: Partial<KanbanCard>) => {
    const taskUpdates: Partial<ProjectTask> = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.dueDate && { dueDate: updates.dueDate.toISOString() }),
    };
    onTaskUpdate?.(cardId, taskUpdates);
  };

  switch (view) {
    case 'calendar':
      return (
        <QentrahCalendar
          events={calendarEvents}
          onEventClick={(event) => onTaskClick?.(tasks.find((t) => t.id === event.id)!)}
          onEventUpdate={(event) => {
            const task = tasks.find((t) => t.id === event.id);
            if (task) {
              onTaskUpdate?.(task.id, {
                startDate: event.start.toISOString(),
                dueDate: event.end.toISOString(),
              });
            }
          }}
        />
      );
    case 'board':
      return (
        <QentrahKanban
          columns={kanbanColumns}
          onCardMove={handleCardMove}
          onCardClick={(card) => onTaskClick?.(tasks.find((t) => t.id === card.id)!)}
          onCardUpdate={handleCardUpdate}
          showColumnColors
        />
      );
    case 'gantt':
      return (
        <QentrahGantt
          tasks={ganttTasks}
          onTaskUpdate={(taskId, updates) => onTaskUpdate?.(taskId, updates)}
          onTaskClick={(task) => onTaskClick?.(tasks.find((t) => t.id === task.id)!)}
        />
      );
    case 'table':
    default:
      return (
        <QentrahTableWithViews
          rows={tasks}
          columns={tableColumns}
          viewConfig={viewConfig}
          onViewConfigChange={onViewConfigChange}
          onRowClicked={(e: any) => onTaskClick?.(e.data)}
        />
      );
  }
}

function taskToCard(task: ProjectTask): KanbanCard {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: new Date(task.dueDate),
    assignees: task.assigneeId ? [task.assigneeId] : [],
  };
}

function getPriorityColor(priority: ProjectTask['priority']): string {
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
}
