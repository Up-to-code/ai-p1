import { useEffect } from "react";
import { markAppPerformance } from "@/lib/utils/performance";

export function useDashboardPerformanceMarkers(args: {
  workspaceStatus: string;
  organizationId?: string;
}) {
  useEffect(() => {
    markAppPerformance("shell:ready", { workspaceStatus: args.workspaceStatus });
  }, [args.workspaceStatus]);

  useEffect(() => {
    if (args.workspaceStatus === "ready") {
      markAppPerformance("workspace:ready", {
        organizationId: args.organizationId,
      });
    }
  }, [args.organizationId, args.workspaceStatus]);
}
