type CreatedByRecord = {
  createdByUserId?: string;
};

type PartnerConnectionRecord = {
  _id: string;
  authorizedByUserId?: string;
  partnersClientId: string;
  status: string;
  updatedAt: number;
};

type InviteRecord = {
  createdByUserId?: string;
  usedByUserId?: string;
};

type PendingProjectRecord = {
  _id: string;
  name: string;
  status: string;
  updatedAt: number;
};

type ApiKeyRecord = {
  _id: string;
  name: string;
  status: string;
  updatedAt: number;
};

function isString(value: string | undefined): value is string {
  return typeof value === "string";
}

export function adminOrganizationMemberIds(records: {
  projects: CreatedByRecord[];
  assets: CreatedByRecord[];
  clients: CreatedByRecord[];
  tasks: CreatedByRecord[];
  calendar: CreatedByRecord[];
  media: CreatedByRecord[];
  apiKeys: CreatedByRecord[];
  mcpConnections: CreatedByRecord[];
  partnerConnections: PartnerConnectionRecord[];
  invites: InviteRecord[];
}) {
  return Array.from(new Set([
    ...records.projects.map((record) => record.createdByUserId),
    ...records.assets.map((record) => record.createdByUserId),
    ...records.clients.map((record) => record.createdByUserId),
    ...records.tasks.map((record) => record.createdByUserId),
    ...records.calendar.map((record) => record.createdByUserId),
    ...records.media.map((record) => record.createdByUserId),
    ...records.apiKeys.map((record) => record.createdByUserId),
    ...records.mcpConnections.map((record) => record.createdByUserId),
    ...records.partnerConnections.map((record) => record.authorizedByUserId),
    ...records.invites.map((record) => record.createdByUserId),
    ...records.invites.flatMap((record) => record.usedByUserId ? [record.usedByUserId] : []),
  ].filter(isString))).slice(0, 12);
}

export function adminOrganizationNotifications(records: {
  projects: PendingProjectRecord[];
  partnerConnections: PartnerConnectionRecord[];
  apiKeys: ApiKeyRecord[];
}) {
  return [
    ...records.projects.filter((record) => record.status === "pending").map((record) => ({
      id: `${record._id}:pending-project`,
      tone: "warning",
      title: "Project pending review",
      description: record.name,
      href: `/workspace-data/${record._id}`,
      createdAt: record.updatedAt,
    })),
    ...records.partnerConnections.filter((record) => record.status === "paused" || record.status === "revoked").map((record) => ({
      id: `${record._id}:partner-connection`,
      tone: record.status === "revoked" ? "danger" : "warning",
      title: "Partner connection needs attention",
      description: `${record.partnersClientId} is ${record.status}.`,
      href: `/partner-connections/${record._id}`,
      createdAt: record.updatedAt,
    })),
    ...records.apiKeys.filter((record) => record.status === "revoked").map((record) => ({
      id: `${record._id}:api-key`,
      tone: "danger",
      title: "API key revoked",
      description: record.name,
      href: `/api-keys/${record._id}`,
      createdAt: record.updatedAt,
    })),
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
}
