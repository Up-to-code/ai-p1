import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/custom/status-badge";
import { cn } from "@/lib/utils";

type ModuleVariant = "default" | "muted" | "warning" | "danger";
type ModuleDensity = "comfortable" | "compact";
type ModuleLayout = "default" | "split" | "grid";

type ModuleStatus = React.ComponentProps<typeof StatusBadge>["status"];

interface ModuleProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: ModuleStatus;
  statusLabel?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: ModuleVariant;
  density?: ModuleDensity;
  layout?: ModuleLayout;
  className?: string;
  contentClassName?: string;
}

const variantClassName: Record<ModuleVariant, string> = {
  default: "border-border/60 bg-card",
  muted: "border-border/60 bg-surface/70",
  warning: "border-warning/30 bg-warning/5",
  danger: "border-danger/30 bg-danger/5",
};

const densityClassName: Record<ModuleDensity, string> = {
  comfortable: "gap-4 py-4",
  compact: "gap-3 py-3",
};

const contentClassNameByLayout: Record<ModuleLayout, string> = {
  default: "space-y-4",
  split: "grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start",
  grid: "grid gap-3 sm:grid-cols-2",
};

export function Module({
  title,
  description,
  icon,
  status,
  statusLabel,
  actions,
  children,
  footer,
  variant = "default",
  density = "comfortable",
  layout = "default",
  className,
  contentClassName,
}: ModuleProps) {
  return (
    <Card
      className={cn(
        "border shadow-none",
        variantClassName[variant],
        densityClassName[density],
        className
      )}
    >
      <CardHeader className="gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-text-secondary">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-text-primary">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1 leading-5 text-text-secondary">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {(status || actions) && (
          <div className="flex items-center gap-2">
            {status && <StatusBadge status={status} label={statusLabel} />}
            {actions}
          </div>
        )}
      </CardHeader>
      {children && (
        <CardContent
          className={cn(contentClassNameByLayout[layout], contentClassName)}
        >
          {children}
        </CardContent>
      )}
      {footer && (
        <CardFooter className="bg-transparent text-xs text-text-muted">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
