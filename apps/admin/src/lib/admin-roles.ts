import { adminSecurityConfig } from "./security";

export type AdminRole = "platform_admin" | "security_reviewer" | "support_operator" | "audit_viewer";

export type AdminRoleDefinition = {
  id: AdminRole;
  label: string;
  arabicLabel: string;
  description: string;
  arabicDescription: string;
  permissions: string[];
  mutationAccess: boolean;
};

export const adminRoleDefinitions: AdminRoleDefinition[] = [
  {
    id: "platform_admin",
    label: "Platform admin",
    arabicLabel: "مدير المنصة",
    description: "Full admin console access. Assigned only by operator-controlled env or DB changes.",
    arabicDescription: "وصول كامل للوحة الإدارة. يعيّن فقط عبر env أو DB تحت تحكم المشغل.",
    permissions: ["read:any", "review:partner_apps", "revoke:sessions", "suspend:resources", "audit:export"],
    mutationAccess: true,
  },
  {
    id: "security_reviewer",
    label: "Security reviewer",
    arabicLabel: "مراجع الأمان",
    description: "Can inspect posture, partner app evidence, OAuth risk, webhooks, and audit logs.",
    arabicDescription: "يمكنه فحص حالة الأمان وأدلة تطبيقات الشركاء ومخاطر OAuth وwebhooks وسجلات التدقيق.",
    permissions: ["read:security", "read:partner_apps", "read:audit_logs"],
    mutationAccess: false,
  },
  {
    id: "support_operator",
    label: "Support operator",
    arabicLabel: "مشغل الدعم",
    description: "Can inspect organizations, users, and operational records without platform-admin assignment rights.",
    arabicDescription: "يمكنه فحص المؤسسات والمستخدمين والسجلات التشغيلية دون حق تعيين مدير منصة.",
    permissions: ["read:organizations", "read:users", "read:workspace_data"],
    mutationAccess: false,
  },
  {
    id: "audit_viewer",
    label: "Audit viewer",
    arabicLabel: "عارض التدقيق",
    description: "Read-only audit and evidence access for compliance review.",
    arabicDescription: "وصول قراءة فقط للتدقيق والأدلة للمراجعة والامتثال.",
    permissions: ["read:audit_logs", "read:security"],
    mutationAccess: false,
  },
];

function parseEmails(value: string | undefined) {
  return Array.from(new Set((value ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean)));
}

export function resolveAdminRoles(email: string | null | undefined, env: Record<string, string | undefined> = process.env): AdminRole[] {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return [];

  const security = adminSecurityConfig(env);
  if (security.platformAdminEmails.includes(normalized)) return ["platform_admin"];

  const roleEntries: Array<[AdminRole, string | undefined]> = [
    ["security_reviewer", env.PLATFORM_SECURITY_REVIEWER_EMAILS],
    ["support_operator", env.PLATFORM_SUPPORT_OPERATOR_EMAILS],
    ["audit_viewer", env.PLATFORM_AUDIT_VIEWER_EMAILS],
  ];

  return roleEntries.flatMap(([role, emails]) => (parseEmails(emails).includes(normalized) ? [role] : []));
}

export function canUseAdminConsole(roles: AdminRole[]) {
  return roles.length > 0;
}

export function canMutateAdminResources(roles: AdminRole[]) {
  return roles.includes("platform_admin");
}

export function adminRoleLabel(role: AdminRole, locale: "en" | "ar") {
  const definition = adminRoleDefinitions.find((candidate) => candidate.id === role);
  if (!definition) return role;
  return locale === "ar" ? definition.arabicLabel : definition.label;
}
