"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDashboardContext } from "../dashboard-context";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import { Users, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ASSIGNEE_COLORS = [
  "var(--q-network-blue)",
  "var(--q-agent-purple)",
  "var(--q-human-green)",
  "var(--q-automation-orange)",
  "var(--q-data-cyan)",
  "var(--q-note)",
];

export function AssigneeWidget() {
  const { projectId, organizationId } = useDashboardContext();
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });

  const memberMap = useMemo(() => {
    const map = new Map<string, { name: string; image?: string | null }>();
    for (const m of members) {
      if (m.user) {
        map.set(m.userId, {
          name: m.user.name || m.user.email,
          image: m.user.image,
        });
      }
    }
    return map;
  }, [members]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of tasks) {
      const assigneeId = task.assigneeUserId || "unassigned";
      counts[assigneeId] = (counts[assigneeId] || 0) + 1;
    }

    return Object.entries(counts).map(([assigneeId, count], idx) => {
      const member = memberMap.get(assigneeId);
      const name = assigneeId === "unassigned" ? "Unassigned" : member?.name || `User ${assigneeId.slice(0, 4)}`;
      const image = member?.image;
      return {
        id: assigneeId,
        name,
        value: count,
        image,
        fill: assigneeId === "unassigned" ? "var(--q-text-muted)" : ASSIGNEE_COLORS[idx % ASSIGNEE_COLORS.length],
      };
    }).sort((a, b) => b.value - a.value);
  }, [tasks, memberMap]);

  const total = tasks.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Users className="h-8 w-8 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground/60">No tasks to display</p>
        <p className="text-xs text-muted-foreground/40 mt-1">Assign tasks to project members</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/40">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Tasks by Assignee
        </span>
      </div>

      <div className="flex-1 flex items-center min-h-0">
        {/* Pie Chart */}
        <div className="w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-xs font-bold text-foreground">{data.name}</p>
                      <p className="text-xs text-muted-foreground">{data.value} tasks</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 overflow-y-auto pl-4 space-y-2 max-h-[140px] scrollbar-none">
          {chartData.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                {item.id !== "unassigned" ? (
                  <Avatar className="h-5 w-5 border border-border">
                    {item.image && <AvatarImage src={item.image} alt={item.name} />}
                    <AvatarFallback className="text-[9px] font-bold">
                      {item.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                <span className="font-semibold text-foreground truncate max-w-[90px]">{item.name}</span>
              </div>
              <span className="font-bold text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
