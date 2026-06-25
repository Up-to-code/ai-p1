import { Building2, CalendarDays, CheckCircle2, FileText, KeyRound, LinkIcon, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import type { PermissionResource } from "../../settings-view-model";

export function workAreaIcon(resource: PermissionResource) {
  const icons: Record<PermissionResource, typeof Users> = {
    organization: Building2,
    team: Users,
    member: Users,
    project: Building2,
    client: Users,
    task: CheckCircle2,
    calendar: CalendarDays,
    media: FileText,
    visibility: ShieldCheck,
    integration: LinkIcon,
    apiKey: KeyRound,
    oauthApp: LinkIcon,
    role: UserRoundCog,
  };

  return icons[resource];
}
