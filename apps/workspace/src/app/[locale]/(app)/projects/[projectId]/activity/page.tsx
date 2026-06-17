export default function ProjectActivityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-lg font-black">Activity History</h2>
      <p className="mt-1 text-sm text-muted-foreground">Audit log of changes to this project.</p>
      <div className="mt-8 rounded-3xl border border-dashed border-border p-12 text-center dark:border-white/10">
        <p className="text-sm font-semibold text-muted-foreground">Activity Log Feed goes here.</p>
      </div>
    </div>
  );
}
