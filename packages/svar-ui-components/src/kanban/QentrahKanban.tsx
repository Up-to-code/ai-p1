import React from 'react';
import { QentrahThemeProvider } from '../theme';

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
  wipLimit?: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignees?: string[];
  labels?: string[];
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface QentrahKanbanProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  onCardDelete?: (cardId: string) => void;
  onColumnUpdate?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
  showColumnColors?: boolean;
}

/**
 * QentrahKanban - Wrapper for @svar-ui/react-kanban with Qentrah theming.
 * 
 * This component provides a unified kanban board interface across all domains.
 * Currently uses a placeholder implementation - will be integrated with
 * @svar-ui/trial-react-kanban in the full implementation.
 */
export function QentrahKanban({
  columns = [],
  onCardMove,
  onCardUpdate,
  onCardDelete,
  onColumnUpdate,
  onCardClick,
  className = '',
  showColumnColors = true,
}: QentrahKanbanProps) {
  const handleDragStart = (e: React.DragEvent, cardId: string, columnId: string) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('fromColumnId', columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toColumnId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const fromColumnId = e.dataTransfer.getData('fromColumnId');
    
    if (cardId && fromColumnId && onCardMove) {
      onCardMove(cardId, fromColumnId, toColumnId);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <QentrahThemeProvider>
      <div className={`w-full h-full bg-background overflow-x-auto ${className}`}>
        <div className="flex gap-4 p-4 min-h-full">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-card rounded-lg shadow-sm border"
              style={{
                backgroundColor: showColumnColors && column.color ? column.color : undefined,
                borderColor: 'var(--q-border)',
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">{column.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {column.cards.length}
                  {column.wipLimit && ` / ${column.wipLimit}`}
                </span>
              </div>
              <div className="p-3 space-y-3">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id, column.id)}
                    onClick={() => onCardClick?.(card)}
                    className="p-3 bg-background rounded border hover:shadow-md cursor-pointer transition-shadow"
                    style={{ borderColor: 'var(--q-border)' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{card.title}</h4>
                      {card.priority && (
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
                      )}
                    </div>
                    {card.description && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                    {card.labels && card.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {card.labels.map((label) => (
                          <span
                            key={label}
                            className="text-xs px-2 py-0.5 bg-muted rounded-full"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {card.assignees && card.assignees.length > 0 && (
                        <div className="flex -space-x-2">
                          {card.assignees.slice(0, 3).map((assignee, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs border-2 border-background"
                            >
                              {assignee.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {card.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{card.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {card.dueDate && (
                        <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </QentrahThemeProvider>
  );
}
