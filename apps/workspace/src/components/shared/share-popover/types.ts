export interface ShareUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer" | "commenter";
}

export interface SharePopoverProps {
  url: string;
  users: ShareUser[];
  generalAccess: "invited" | "link";
  onInvite?: (email: string, permission: string) => void | Promise<void>;
  onGeneralAccessChange?: (access: "invited" | "link") => void | Promise<void>;
  onCopyLink?: () => void | Promise<void>;
  onCreateInviteLink?: (role: string) => void | Promise<void>;
  onCreateMcp?: (input: { name: string; permission: string }) => void | Promise<void>;
  inviteDisabled?: boolean;
  linkAccessDisabled?: boolean;
  inviting?: boolean;
  updatingLinkAccess?: boolean;
  allowInvite?: boolean;
  showMcpSection?: boolean;
  canCreateMcp?: boolean;
}

export type SharePermissionLevel = "owner" | "editor" | "viewer" | "commenter";
export type ShareGeneralAccess = "invited" | "link";
