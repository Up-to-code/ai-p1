export function UsageStatePanel({ message, muted }: { message: string; muted?: string }) {
  return (
    <div className="max-w-3xl rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
      <p className="text-sm font-black text-foreground">{message}</p>
      {muted && <p className="mt-2 text-xs font-medium text-muted-foreground">{muted}</p>}
    </div>
  );
}
