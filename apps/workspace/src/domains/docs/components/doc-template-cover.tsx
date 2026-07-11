import { cn } from "@/lib/utils";

const COVER_POSITIONS: Record<string, string> = {
  blank: "0% 0%",
  sdd: "50% 0%",
  api: "100% 0%",
  guide: "0% 100%",
  adr: "50% 100%",
  plan: "100% 100%",
};

export function DocTemplateCover({ templateId, className }: { templateId: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block bg-[#f8f4ec] bg-no-repeat", className)}
      style={{
        backgroundImage: "url('/images/docs/template-covers.jpg')",
        backgroundPosition: COVER_POSITIONS[templateId] ?? COVER_POSITIONS.blank,
        backgroundSize: "300% 200%",
      }}
    />
  );
}
