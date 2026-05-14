import { PartnerAppForm } from "@/components/forms/PartnerAppForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAppPage() {
  return (
    <div>
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to Apps
      </Link>
      
      <div className="mb-8 border-b border-border pb-8">
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Create application
        </h1>
      </div>
      
      <div className="max-w-6xl">
        <PartnerAppForm />
      </div>
    </div>
  );
}
