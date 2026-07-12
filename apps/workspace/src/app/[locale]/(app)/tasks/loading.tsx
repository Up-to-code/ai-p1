export default function TasksViewLoading() {
  return (
    <div
      aria-label="Loading task view"
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-3"
    >
      <div className="h-8 w-44 animate-pulse rounded-md bg-muted/60" />
      <div className="min-h-0 flex-1 animate-pulse rounded-lg bg-muted/35" />
    </div>
  );
}
