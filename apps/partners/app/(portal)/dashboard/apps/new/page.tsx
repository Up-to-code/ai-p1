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
        <p className="text-xs font-bold uppercase text-primary">Partner program</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">
          Create application
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Use public clients with PKCE for browser-based integrations and confidential clients for trusted server apps.
        </p>
      </div>
      
      <div className="max-w-6xl">
        <PartnerAppForm />
      </div>
    </div>
  );
}
