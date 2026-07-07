"use client";

import { useTranslations } from "next-intl";
import { QentrahTable, type QentrahColumnDef } from "@qentrah/ui";
import type { TaskRecord, TaskStatus } from "../../tasks.types";

interface TaskTableViewProps {
  tasks: TaskRecord[];
}

export function TaskTableView({ tasks }: TaskTableViewProps) {
  const t = useTranslations("Tasks");

  const columns: QentrahColumnDef<TaskRecord>[] = [
    {
      headerName: "Task",
      field: "title",
      flex: 1.5,
      minWidth: 200,
      cellRenderer: (p: any) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{p.data?.title}</p>
          {p.data?.description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{p.data.description}</p>
          )}
        </div>
      ),
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      valueFormatter: (p: any) => {
        const statusMap: Record<TaskStatus, string> = {
          todo: t("statuses.todo"),
          inProgress: t("statuses.inProgress"),
          waiting: t("statuses.waiting"),
          done: t("statuses.done"),
          canceled: "Canceled",
        };
        return statusMap[p.value as TaskStatus] || p.value;
      },
    },
    {
      headerName: "Priority",
      field: "priority",
      width: 100,
      valueFormatter: (p: any) => p.value || "\u2014",
    },
    {
      headerName: "Due Date",
      field: "dueDate",
      width: 120,
      valueFormatter: (p: any) => {
        if (!p.value) return "\u2014";
        return new Date(p.value).toLocaleDateString();
      },
    },
  ];

  return (
    <div className="h-full p-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden h-full">
        <QentrahTable
          rows={tasks}
          columns={columns}
          density="compact"
          height="100%"
          rowSelection="single"
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
