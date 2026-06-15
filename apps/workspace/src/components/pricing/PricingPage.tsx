"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback, useState, useEffect } from "react";
import { PRICING_PLANS } from "@/convex/billing/dodo";

interface PricingPageProps {
  initialPlan?: string | null;
}

export function PricingPage({ initialPlan }: PricingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("team_monthly");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Set initial plan from URL params
  useEffect(() => {
    if (initialPlan && PRICING_PLANS[initialPlan as keyof typeof PRICING_PLANS]) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  const createCheckout = useAction(api.billing.payments.createCheckout);

  const handleCheckout = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await createCheckout({
        planId: selectedPlan,
        quantity,
        returnUrl: `${window.location.origin}/dashboard`,
      });

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan, quantity, createCheckout]);

  const plan = PRICING_PLANS[selectedPlan as keyof typeof PRICING_PLANS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Pricing for your team
          </h1>
          <p className="text-xl text-slate-300">
            Start free, scale as you grow. Pay per user, month or year.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {Object.entries(PRICING_PLANS)
            .filter(([key]) => key.includes("monthly"))
            .map(([planKey, planData]) => (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`rounded-lg p-8 cursor-pointer transition-all ${
                  selectedPlan === planKey
                    ? "bg-white shadow-2xl transform scale-105"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    selectedPlan === planKey ? "text-slate-900" : "text-white"
                  }`}
                >
                  {planData.name}
                </h3>
                <div
                  className={`text-4xl font-bold mb-4 ${
                    selectedPlan === planKey ? "text-slate-900" : "text-white"
                  }`}
                >
                  ${planData.pricePerUser}
                  <span className="text-lg font-normal">/user/mo</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {planData.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start ${
                        selectedPlan === planKey
                          ? "text-slate-700"
                          : "text-slate-300"
                      }`}
                    >
                      <span className="mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(planKey);
                  }}
                  className={`w-full py-2 rounded-lg font-semibold transition-all ${
                    selectedPlan === planKey
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-500 text-white hover:bg-slate-400"
                  }`}
                >
                  {selectedPlan === planKey ? "Selected" : "Select"}
                </button>
              </div>
            ))}
        </div>

        {/* Quantity & Billing Selector */}
        <div className="bg-slate-700 rounded-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Number of Users
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-full px-4 py-2 rounded-lg bg-slate-600 text-white border border-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Selected Plan
              </label>
              <div className="px-4 py-2 rounded-lg bg-slate-600 text-white">
                {plan?.name || "Select a plan"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Monthly Total
              </label>
              <div className="text-3xl font-bold text-white">
                ${(plan?.pricePerUser || 0 * quantity).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="text-center">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            {isLoading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>

        {/* FAQ */}
        <div className="mt-16 bg-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">Can I change plans?</h3>
              <p className="text-slate-300">
                Yes, upgrade or downgrade anytime. Changes take effect next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Do you offer annual discounts?</h3>
              <p className="text-slate-300">
                Yes! Annual plans save you 1 month. Select yearly options above.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Is there a free trial?</h3>
              <p className="text-slate-300">
                Yes, start free for 14 days. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
