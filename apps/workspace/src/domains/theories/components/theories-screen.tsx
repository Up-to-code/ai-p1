"use client";

import { useState, useCallback } from "react";
import { useAuthSession } from "@/domains/auth/auth-session";
import { DomainHeader } from "@/components/shared/domain/DomainHeader";
import type { TheoryRecord } from "../theories.types";
import {
  useTheoriesQuery,
  useAllTheoriesQuery,
  usePrivateTheoriesQuery,
} from "../api/theories";
import { TheoriesList } from "./theories-list";

type Filter = "all" | "shared" | "private";

export function TheoriesScreen() {
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? undefined;
  const userId = session.user?.id;
  const [filter, setFilter] = useState<Filter>("all");

  const allQuery = useAllTheoriesQuery(organizationId);
  const sharedQuery = useTheoriesQuery(organizationId);
  const privateQuery = usePrivateTheoriesQuery(organizationId, userId ?? undefined);

  const theories =
    filter === "all"
      ? allQuery.data
      : filter === "shared"
        ? sharedQuery.data
        : privateQuery.data;

  const isLoading = allQuery.isLoading;

  const handleUseInChat = useCallback((theory: TheoryRecord) => {
    window.open(`/ai?theory=${theory.id}`, "_self");
  }, []);

  const filters = [
    { key: "all" as const, label: "All" },
    { key: "shared" as const, label: "Shared" },
    { key: "private" as const, label: "Private" },
  ];

  return (
    <div className="flex h-full flex-col">
      <DomainHeader
        domain="Theories"
        currentSection={filter === "all" ? "All Theories" : filter === "shared" ? "Shared" : "Private"}
        showViewSwitcher={false}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <TheoriesList
            theories={theories}
            isLoading={isLoading}
            onUseInChat={handleUseInChat}
          />
        </div>
      </div>
    </div>
  );
}
