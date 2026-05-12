import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Triangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-none mb-8">
          <Triangle className="h-6 w-6 fill-current" />
        </div>

        <p className="text-8xl font-bold text-text-primary tracking-tighter mb-4">404</p>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">Page not found</h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved. Check the URL or head back to the dashboard.
        </p>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" className="h-10 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="h-10 shadow-none">Open Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
