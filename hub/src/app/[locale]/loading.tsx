import { Triangle } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-none animate-pulse">
        <Triangle className="h-5 w-5 fill-current" />
      </div>
    </div>
  );
}
