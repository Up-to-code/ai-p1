"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PricingPage } from "@/components/pricing/PricingPage";

function BillingPageContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  return <PricingPage initialPlan={planParam} />;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center">Loading...</div>}>
      <BillingPageContent />
    </Suspense>
  );
}
