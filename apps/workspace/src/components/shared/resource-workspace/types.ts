import type { ReactNode } from "react";

export type ResourceWorkspaceView = {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  color?: string;
  actions?: ResourceWorkspaceViewAction[];
};

export type ResourceWorkspaceViewAction = {
  id: string;
  label: string;
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
  destructive?: boolean;
};

export type ResourceWorkspaceAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

export type ResourceViewCatalogSection = "popular" | "more" | "embed";

export type ResourceViewCatalogItem = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
  section?: ResourceViewCatalogSection;
  disabled?: boolean;
};

export type ResourceWorkspaceConfig = {
  resourceId: string;
  title: string;
  count?: ReactNode;
  views: ResourceWorkspaceView[];
  activeViewId: string;
  actions?: ResourceWorkspaceAction[];
  viewCatalog?: ResourceViewCatalogItem[];
  onAddView?: (view: ResourceViewCatalogItem) => void | Promise<void>;
  onViewSelect?: (viewId: string) => void;
};
