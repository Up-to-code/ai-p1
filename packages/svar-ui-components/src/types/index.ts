// Shared types for SVAR UI components

export type ViewType = 'table' | 'board' | 'calendar' | 'gantt' | 'filemanager';

export interface FilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}

export interface ColumnConfig {
  id: string;
  label: string;
  width?: number;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ViewConfig {
  type: ViewType;
  label: string;
  filters: FilterRule[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  groupBy?: string;
  columns: ColumnConfig[];
  density: 'compact' | 'normal';
}
