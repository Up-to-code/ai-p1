"use client";

import { Blocks, Database, Trash2 } from "lucide-react";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import type { ActivityEvent } from "@/domains/activity";
import { useActivityStore } from "@/domains/activity";
import { DeleteRecordDialog, EmptyWorkspace, SearchBox, StatusPill } from "@/components/shared/crud-ui";
import { useState } from "react";

export function ComponentsGalleryScreen() {
  const events = useActivityStore((state) => state.events);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const columns: AppDataTableColumn<ActivityEvent>[] = [
    { key: "actor", header: "Actor" },
    { key: "action", header: "Action" },
    { key: "status", header: "Status", render: (event) => <StatusPill label={event.status} tone={event.status === "approved" ? "success" : "warning"} /> },
  ];

  return (
    <AppPageShell>
      <AppPageHeader eyebrow="Reusable interface kit" title="UI Components." actions={<AppPrimaryButton><Blocks className="me-2 h-3.5 w-3.5" />Componentized</AppPrimaryButton>} />
      <AppStatsGrid stats={[{ label: "Shared Blocks", value: "08", icon: Blocks }, { label: "Stores", value: "08", icon: Database }, { label: "Dialogs", value: "04", icon: Trash2 }, { label: "Tables", value: "Core", dotClassName: "bg-emerald-500" }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AppSection title="Status Pills"><div className="flex flex-wrap gap-2"><StatusPill label="Approved" tone="success" /><StatusPill label="Pending" tone="warning" /><StatusPill label="Blocked" tone="danger" /><StatusPill label="Draft" /></div></AppSection>
        <AppSection title="Search And Actions"><div className="flex flex-wrap items-center gap-3"><SearchBox value={search} onChange={setSearch} /><Button variant="destructive" onClick={() => setDialogOpen(true)} className="rounded-xl text-[10px] font-black uppercase tracking-widest">Open Delete Dialog</Button></div></AppSection>
      </div>
      <AppDataTable columns={columns} data={events} getRowKey={(event) => event.id} />
      <EmptyWorkspace icon={Blocks} title="Empty State" description="Reusable no-data surface for lists, filters, and missing detail records." />
      <DeleteRecordDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Reusable dialog" description="This is the shared delete confirmation component used by CRUD screens." onConfirm={() => setDialogOpen(false)} />
    </AppPageShell>
  );
}
