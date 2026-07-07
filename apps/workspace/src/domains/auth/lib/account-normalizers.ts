export type AccountContextValue = {
  isPending: boolean;
  isSignedIn: boolean;
  workspace: {
    status: import("../workspace-status").WorkspaceStatus;
    organizationId: string | null;
    isOrganizationPending: boolean;
    isConvexAuthPending: boolean;
    isConvexAuthenticated: boolean;
    isReady: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
    profile: {
      phone: string;
      role: string;
      language: "en" | "ar";
      timezone: string;
      notifications: {
        product: boolean;
        approvals: boolean;
        billing: boolean;
        security: boolean;
      };
    };
  };
  organization: {
    id: string | null;
    name: string;
    legalName?: string | null;
    type?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    logo: string | null;
    slug: string | null;
    status: string;
    brandColor?: string;
    sound?: string;
    initials: string;
  };
};

export const defaultAccountNotifications = {
  product: true,
  approvals: true,
  billing: false,
  security: true,
};

export function accountInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AN"
  );
}
