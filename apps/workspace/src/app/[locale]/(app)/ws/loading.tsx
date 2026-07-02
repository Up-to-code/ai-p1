export default function WsLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-text-primary border-t-transparent" />
        <p className="text-sm text-text-secondary">Loading workspace...</p>
      </div>
    </div>
  );
}
