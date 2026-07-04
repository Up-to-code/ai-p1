"use client";

import { Search, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { TheoryRecord } from "../theories.types";
import { TheoryCard } from "./theory-card";

interface TheoriesListProps {
  theories: TheoryRecord[] | undefined;
  isLoading: boolean;
  onUseInChat?: (theory: TheoryRecord) => void;
}

export function TheoriesList({
  theories,
  isLoading,
  onUseInChat,
}: TheoriesListProps) {
  const [search, setSearch] = useState("");

  const filtered = theories?.filter((t) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      t.title.toLowerCase().includes(needle) ||
      t.content.toLowerCase().includes(needle) ||
      (t.category?.toLowerCase().includes(needle) ?? false) ||
      (t.tags?.some((tag) => tag.toLowerCase().includes(needle)) ?? false)
    );
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-muted/50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search theories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((theory) => (
            <TheoryCard
              key={theory.id}
              theory={theory}
              onUseInChat={onUseInChat}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="mb-2 h-8 w-8 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-sm font-medium text-muted-foreground">
            {search ? "No theories match your search" : "No theories yet"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Theories from AI chats appear here automatically
          </p>
        </div>
      )}
    </div>
  );
}
