import type { ApiKey, OrganizationApp, OrganizationProfile, TeamMember } from "../store/organization.types";

export const demoOrganization: OrganizationProfile = {
  organizationId: "org_demo_acme",
  name: "Personal workspace",
  legalName: "",
  type: "Developer",
  email: "",
  phone: "",
  website: "",
  address: "",
  updatedAt: 0,
};

export const demoTeam: TeamMember[] = [
  { id: "tm-2", name: "Team Admin", email: "admin@example.com", role: "Admin", status: "Active" },
  { id: "tm-3", name: "Project Manager", email: "manager@example.com", role: "Manager", status: "Active" },
];

export const demoApiKeys: ApiKey[] = [
  { id: "key-1", name: "Production Index Key", token: "pk_live_********************", created: "Apr 20, 2026", scopes: ["Read", "Sync"] },
  { id: "key-2", name: "Staging Test Token", token: "pk_test_********************", created: "May 01, 2026", scopes: ["Read", "Write"] },
];

export const demoApps: OrganizationApp[] = [
  { id: "app-1", name: "REGA Sync Engine", type: "Official", status: "Authorized", date: "Jan 12, 2026" },
  { id: "app-2", name: "Institutional CRM", type: "Internal", status: "Authorized", date: "Mar 04, 2026" },
];
