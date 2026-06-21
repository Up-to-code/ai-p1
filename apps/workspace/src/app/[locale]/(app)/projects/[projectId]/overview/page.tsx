"use client";

import { use } from "react";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";

export default function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${projectId}/edit`);
  }, [projectId, router]);

  return (
    <div className="flex h-48 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
    </div>
  );
}
