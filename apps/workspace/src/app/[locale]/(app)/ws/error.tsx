"use client";

export default function WsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <p className="text-sm text-muted-foreground">Something went wrong loading this view.</p>
      <p className="text-xs text-muted-foreground/60">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90"
      >
        Try again
      </button>
    </div>
  );
}
