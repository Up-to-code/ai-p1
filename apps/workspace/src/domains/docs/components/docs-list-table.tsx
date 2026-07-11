"use client";

import { FileText, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type DocsListItem = {
  id: string;
  type: "folder" | "doc";
  name: string;
  updatedAt: number;
  itemCount: number | null;
};

function formatUpdatedAt(value: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function DocsListTable({
  items,
  onOpen,
}: {
  items: DocsListItem[];
  onOpen: (item: DocsListItem) => void;
}) {
  return (
    <div className="mx-6 my-4 overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-80">Name</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-24 text-center">Items</TableHead>
              <TableHead className="w-40">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const Icon = item.type === "folder" ? Folder : FileText;
              return (
                <TableRow
                  key={item.id}
                  tabIndex={0}
                  onClick={() => onOpen(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpen(item);
                    }
                  }}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="truncate font-medium text-foreground">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="h-5 capitalize tracking-normal">{item.type === "folder" ? "Folder" : "Document"}</Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">{item.itemCount ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatUpdatedAt(item.updatedAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
