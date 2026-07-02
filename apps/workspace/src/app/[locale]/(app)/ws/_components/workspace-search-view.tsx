"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export function WorkspaceSearchView() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="px-6 py-4 border-b bg-background">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search workspace..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
