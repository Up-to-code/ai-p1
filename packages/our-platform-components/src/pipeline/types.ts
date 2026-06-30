import type { ReactNode } from "react";

export interface StageDefinition {
  key: string;
  name: string;
  color: string;
  icon?: ReactNode;
  order?: number;
  createdAt?: number;
  isNew?: boolean;
}

export interface CardItem {
  id: string;
  stageKey: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  avatar?: string;
  avatarFallback?: string;
  avatars?: Array<{ src?: string; fallback: string; name?: string }>;
  tags?: Array<{ label: string; color?: string; bg?: string }>;
  checklist?: { total: number; completed: number };
  commentsCount?: number;
  mentionsCount?: number;
  meta?: Array<{ icon?: ReactNode; label: string; value?: string }>;
  data: Record<string, unknown>;
}

export interface CardAction {
  key: string;
  icon: ReactNode;
  label: string;
  onClick: (item: CardItem) => void;
  variant?: "default" | "danger";
  show?: (item: CardItem) => boolean;
}

export interface CardSlotConfig {
  position: "header" | "body" | "footer";
  render: (item: CardItem, stage: StageDefinition) => ReactNode;
}

export interface PipelineViewConfig {
  type: "pipeline";
  columnWidth?: number;
  showBarColor?: boolean;
  showCount?: boolean;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  renderColumnHeader?: (stage: StageDefinition, count: number) => ReactNode;
  renderCard?: (item: CardItem, stage: StageDefinition) => ReactNode;
  renderColumnFooter?: (stage: StageDefinition) => ReactNode;
  draggable?: boolean;
  allowInlineCreate?: boolean;
  inlineCreatePrimaryPlaceholder?: string;
  inlineCreateSecondaryPlaceholder?: string;
  inlineCreatePrimaryLabel?: string;
  onCardMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onInlineCreate?: (stageKey: string, data: { name: string; contact?: string }) => void;
  onStageRename?: (stageKey: string, newName: string) => void;
  onStageDelete?: (stageKey: string) => void;
  onCardClick?: (item: CardItem) => void;
  onCardDelete?: (item: CardItem) => void;
  onAddStage?: () => void;
  renderEmpty?: (stage: StageDefinition) => ReactNode;
}
