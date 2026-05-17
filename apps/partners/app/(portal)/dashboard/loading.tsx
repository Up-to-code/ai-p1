export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
        <div className="relative h-10 w-10 rounded-[6px] border border-border bg-card">
          <div className="absolute left-2 top-2 h-2 w-2 bg-primary animate-pulse" />
          <div className="absolute bottom-2 right-2 h-2 w-2 bg-muted-foreground animate-pulse" />
        </div>
        <p className="font-mono text-xs font-medium text-muted-foreground">loading command deck...</p>
      </div>
    </div>
  );
}
