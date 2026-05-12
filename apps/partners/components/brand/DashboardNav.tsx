import Link from "next/link";
import { dashboardNav } from "@/lib/navigation";

export function DashboardNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {dashboardNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
