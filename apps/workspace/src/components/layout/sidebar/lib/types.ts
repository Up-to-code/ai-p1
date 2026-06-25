export type AgentThread = {
  id: string;
  title: string;
  lastMessageAt: number;
};

export type BetterAuthOrganization = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
};
