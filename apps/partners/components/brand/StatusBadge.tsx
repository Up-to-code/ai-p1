import type { PartnerAppStatus } from "@/server/partnerApps";
import { getStatusLabel, getStatusTone } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: PartnerAppStatus }) {
  return <Badge variant={getStatusTone(status)}>{getStatusLabel(status)}</Badge>;
}
