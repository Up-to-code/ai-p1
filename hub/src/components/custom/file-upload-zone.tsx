import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  label: string;
  description?: string;
  className?: string;
}

export function FileUploadZone({ label, description, className }: FileUploadZoneProps) {
  const t = useTranslations("Onboarding.common");
  
  return (
    <div className="space-y-2 w-full">
      <div className="text-sm font-medium text-text-primary">{label}</div>
      <div 
        className={cn(
          "border-2 border-dashed border-border/60 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface/80 transition-all cursor-pointer group",
          className
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            console.log(`Uploaded ${files.length} files via drag and drop.`);
          }
        }}
      >
        <div className="w-10 h-10 rounded-full bg-background border border-border/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-none">
          <UploadCloud className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">{t("uploadOrDrag")}</p>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
    </div>
  );
}
