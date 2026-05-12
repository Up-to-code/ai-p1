import { useTranslations } from "next-intl";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  label: React.ReactNode;
  description?: string;
  className?: string;
}

export function FileUploadZone({ label, description, className }: FileUploadZoneProps) {
  const t = useTranslations("Onboarding.common");
  
  return (
    <div className="space-y-3 w-full">
      <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</div>
      <div 
        className={cn(
          "border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-white/[0.01] hover:bg-zinc-100 dark:hover:bg-white/[0.03] transition-all cursor-pointer group",
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
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-2">{t("uploadOrDrag")}</p>
        {description && <p className="text-[10px] font-bold text-zinc-400 max-w-sm">{description}</p>}
      </div>
    </div>
  );
}
