import React, { useEffect, useState } from 'react';
import { QentrahTable, QentrahTableRef, QentrahColumnDef, QentrahTableDensity } from '@qentrah/ui/qentrah-table';
import type { ViewConfig, ColumnConfig } from '../types';

export interface QentrahTableWithViewsProps<T extends { id: string }> {
  rows: T[];
  columns: QentrahColumnDef<T>[];
  viewConfig?: ViewConfig;
  onViewConfigChange?: (config: ViewConfig) => void;
  density?: QentrahTableDensity;
  className?: string;
  getRowId?: (row: T) => string;
  onCellValueChanged?: any;
  onRowClicked?: any;
  emptyMessage?: string;
  rowSelection?: any;
  getRowHeight?: any;
}

/**
 * QentrahTableWithViews - Wrapper that integrates QentrahTable with view configuration.
 * 
 * This component applies saved view configurations (filters, sorting, columns, density)
 * to the QentrahTable component and persists changes back to the view system.
 */
export function QentrahTableWithViews<T extends { id: string }>({
  rows,
  columns: baseColumns,
  viewConfig,
  onViewConfigChange,
  density: baseDensity = 'normal',
  className,
  getRowId,
  onCellValueChanged,
  onRowClicked,
  emptyMessage,
  rowSelection,
  getRowHeight,
}: QentrahTableWithViewsProps<T>) {
  const tableRef = React.useRef<QentrahTableRef<T>>(null);
  const [filteredRows, setFilteredRows] = useState<T[]>(rows);
  const [sortedRows, setSortedRows] = useState<T[]>(rows);
  const [activeColumns, setActiveColumns] = useState<QentrahColumnDef<T>[]>(baseColumns);

  // Apply view configuration when it changes
  useEffect(() => {
    if (!viewConfig) {
      setFilteredRows(rows);
      setSortedRows(rows);
      setActiveColumns(baseColumns);
      return;
    }

    // Apply filters
    let processed = [...rows];
    if (viewConfig.filters.length > 0) {
      processed = processed.filter((row) => {
        return viewConfig.filters.every((filter) => {
          const value = (row as any)[filter.field];
          switch (filter.operator) {
            case 'equals':
              return value === filter.value;
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
            case 'startsWith':
              return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase());
            case 'endsWith':
              return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase());
            case 'gt':
              return value > filter.value;
            case 'lt':
              return value < filter.value;
            case 'gte':
              return value >= filter.value;
            case 'lte':
              return value <= filter.value;
            default:
              return true;
          }
        });
      });
    }

    // Apply sorting
    if (viewConfig.sortBy) {
      processed.sort((a, b) => {
        const aVal = (a as any)[viewConfig.sortBy];
        const bVal = (b as any)[viewConfig.sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return viewConfig.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    setFilteredRows(processed);
    setSortedRows(processed);

    // Apply column visibility
    if (viewConfig.columns.length > 0) {
      const visibleColumns = baseColumns.filter((col) => {
        const config = viewConfig.columns.find((c) => c.id === col.field);
        return config ? config.visible !== false : true;
      });
      setActiveColumns(visibleColumns);
    }
  }, [rows, viewConfig, baseColumns]);

  // Handle column visibility change
  const handleColumnVisibleChange = (columnId: string, visible: boolean) => {
    if (!viewConfig || !onViewConfigChange) return;

    const updatedColumns = viewConfig.columns.map((col) =>
      col.id === columnId ? { ...col, visible } : col
    );

    onViewConfigChange({
      ...viewConfig,
      columns: updatedColumns,
    });
  };

  // Handle sort change
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    if (!viewConfig || !onViewConfigChange) return;

    onViewConfigChange({
      ...viewConfig,
      sortBy: field,
      sortDirection: direction,
    });
  };

  // Handle density change
  const handleDensityChange = (density: 'compact' | 'normal') => {
    if (!viewConfig || !onViewConfigChange) return;

    onViewConfigChange({
      ...viewConfig,
      density,
    });
  };

  return (
    <QentrahTable<T>
      ref={tableRef}
      rows={sortedRows}
      columns={activeColumns}
      density={viewConfig?.density || baseDensity}
      className={className}
      getRowId={getRowId}
      onCellValueChanged={onCellValueChanged}
      onRowClicked={onRowClicked}
      emptyMessage={emptyMessage}
      rowSelection={rowSelection}
      getRowHeight={getRowHeight}
    />
  );
}
