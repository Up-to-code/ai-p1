"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Loader2 } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { useSpacesQuery } from "../../api/spaces";
import type { Space } from "../../api/spaces";
import { SpaceCreateForm } from "./space-create-form";
import { SpaceSettings } from "./space-settings";
import { SpaceNavItem } from "./space-nav-item";

interface SpaceListProps {
  projectId: string;
  currentSpaceSlug?: string | null;
  onSpaceSelect: (spaceSlug: string | null) => void;
}

export function SpaceList({ projectId, currentSpaceSlug, onSpaceSelect }: SpaceListProps) {
  const t = useTranslations("Projects");
  const session = useAuthSession();
  const orgId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;

  const spaces = useSpacesQuery(orgId, projectId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [settingsSpace, setSettingsSpace] = useState<Space | null>(null);

  const isLoading = spaces === undefined;
  const spaceList = spaces ?? [];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          Spaces
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Global (project-level) item */}
      <SpaceNavItem
        name="Global"
        isSelected={!currentSpaceSlug}
        onClick={() => onSpaceSelect(null)}
      />

      {/* Space items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        spaceList.map((space) => (
          <div key={space.id} className="group relative">
            <SpaceNavItem
              name={space.name}
              icon={space.icon}
              color={space.color}
              isSelected={currentSpaceSlug === space.slug}
              onClick={() => onSpaceSelect(space.slug)}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsSpace(space);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Settings className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ))
      )}

      {/* Create Form Dialog */}
      <SpaceCreateForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        projectId={projectId}
      />

      {/* Settings Dialog */}
      {settingsSpace && (
        <SpaceSettings
          open={Boolean(settingsSpace)}
          onOpenChange={(open) => {
            if (!open) setSettingsSpace(null);
          }}
          space={settingsSpace}
          projectId={projectId}
        />
      )}
    </div>
  );
}
