import { AlertCircle, FolderKanban } from "lucide-react";

export function ProjectViewLoading() {
  return <div className="grid h-full place-items-center"><div className="h-7 w-48 animate-pulse rounded-md bg-muted" /></div>;
}

export function ProjectViewError({ message }: { message?: string }) {
  return <div className="grid h-full place-items-center p-8 text-center"><div><AlertCircle className="mx-auto h-7 w-7 text-destructive" /><p className="mt-2 text-sm font-semibold">Projects could not be loaded</p><p className="mt-1 text-xs text-muted-foreground">{message}</p></div></div>;
}

export function ProjectViewEmpty() {
  return <div className="grid h-full place-items-center p-8 text-center"><div><FolderKanban className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-2 text-sm font-semibold">No projects in this view</p><p className="mt-1 text-xs text-muted-foreground">Create a Project or adjust this view&apos;s filters.</p></div></div>;
}
