import React from 'react';
import { QentrahCalendar, CalendarEvent } from '../calendar';
import { QentrahKanban, KanbanColumn, KanbanCard } from '../kanban';
import { QentrahTableWithViews } from '../grid';
import type { ViewConfig } from '../types';

export interface Client {
  id: string;
  name: string;
  pipelineStage: string;
  priority: 'low' | 'medium' | 'high';
  email?: string;
  phone?: string;
  company?: string;
  lastContact?: string;
  nextMeeting?: string;
}

export interface ClientViewsProps {
  clients: Client[];
  view: 'table' | 'board' | 'calendar';
  viewConfig?: ViewConfig;
  onViewConfigChange?: (config: ViewConfig) => void;
  onClientUpdate?: (clientId: string, updates: Partial<Client>) => void;
  onClientClick?: (client: Client) => void;
}

/**
 * ClientViews - Example integration for Clients domain.
 * Demonstrates how to use QentrahCalendar, QentrahKanban,
 * and QentrahTableWithViews for client management.
 */
export function ClientViews({
  clients,
  view,
  viewConfig,
  onViewConfigChange,
  onClientUpdate,
  onClientClick,
}: ClientViewsProps) {
  // Transform clients to calendar events (meetings)
  const calendarEvents: CalendarEvent[] = clients
    .filter((c) => c.nextMeeting)
    .map((client) => ({
      id: client.id,
      title: `Meeting: ${client.name}`,
      start: new Date(client.nextMeeting!),
      end: new Date(client.nextMeeting!),
      color: getPriorityColor(client.priority),
      description: client.company,
    }));

  // Transform clients to kanban columns (pipeline stages)
  const pipelineStages = ['new', 'qualified', 'proposal', 'negotiation', 'closed'];
  const kanbanColumns: KanbanColumn[] = pipelineStages.map((stage) => ({
    id: stage,
    title: stage.charAt(0).toUpperCase() + stage.slice(1),
    color: getStageColor(stage),
    cards: clients.filter((c) => c.pipelineStage === stage).map(clientToCard),
  }));

  // Table columns
  const tableColumns = [
    { headerName: 'Name', field: 'name' as const, flex: 1 },
    { headerName: 'Company', field: 'company' as const, width: 150 },
    { headerName: 'Stage', field: 'pipelineStage' as const, width: 120 },
    { headerName: 'Priority', field: 'priority' as const, width: 100 },
    { headerName: 'Last Contact', field: 'lastContact' as const, width: 130 },
  ];

  const handleCardMove = (cardId: string, fromColumnId: string, toColumnId: string) => {
    onClientUpdate?.(cardId, { pipelineStage: toColumnId });
  };

  switch (view) {
    case 'calendar':
      return (
        <QentrahCalendar
          events={calendarEvents}
          onEventClick={(event) => onClientClick?.(clients.find((c) => c.id === event.id)!)}
        />
      );
    case 'board':
      return (
        <QentrahKanban
          columns={kanbanColumns}
          onCardMove={handleCardMove}
          onCardClick={(card) => onClientClick?.(clients.find((c) => c.id === card.id)!)}
          showColumnColors
        />
      );
    case 'table':
    default:
      return (
        <QentrahTableWithViews
          rows={clients}
          columns={tableColumns}
          viewConfig={viewConfig}
          onViewConfigChange={onViewConfigChange}
          onRowClicked={(e: any) => onClientClick?.(e.data)}
        />
      );
  }
}

function clientToCard(client: Client): KanbanCard {
  return {
    id: client.id,
    title: client.name,
    description: client.company,
    priority: client.priority,
    labels: [client.pipelineStage],
  };
}

function getPriorityColor(priority: Client['priority']): string {
  switch (priority) {
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

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    new: '#6b7280',
    qualified: '#3b82f6',
    proposal: '#f59e0b',
    negotiation: '#ef4444',
    closed: '#22c55e',
  };
  return colors[stage] || '#6b7280';
}
