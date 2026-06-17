import type { BillingPlan, BillingPlanId } from "./api/billing";

export type BillingLocale = "en" | "ar";

export function billingDateLabel(value?: number, locale: BillingLocale = "en") {
  if (!value) return "Not active yet";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function subscriptionTone(status?: string) {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "past_due") return "danger" as const;
  return "neutral" as const;
}

export function billingPriceLabel(plan: BillingPlan, locale: BillingLocale) {
  if (plan.amount === null) return "Custom";
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.amount);
}

function planLabel(planId: BillingPlanId, locale: BillingLocale): string {
  const labels: Record<BillingPlanId, { en: string; ar: string }> = {
    good_monthly: { en: "Good plan", ar: "خطة Good" },
    good_yearly: { en: "Good plan (annual)", ar: "خطة Good (سنوية)" },
    better_monthly: { en: "Better plan", ar: "خطة Better" },
    better_yearly: { en: "Better plan (annual)", ar: "خطة Better (سنوية)" },
    custom_monthly: { en: "Custom plan", ar: "خطة مخصصة" },
    custom_yearly: { en: "Custom plan (annual)", ar: "خطة مخصصة (سنوية)" },
  };
  return labels[planId]?.[locale] ?? "Plan";
}

function planIncluded(planId: BillingPlanId, locale: BillingLocale): string[] {
  const isGood = planId.startsWith("good");
  const isBetter = planId.startsWith("better");
  const isCustom = planId.startsWith("custom");

  if (locale === "ar") {
    if (isGood) return ["مساحة المشاريع والأصول والعملاء", "مرحلة إعداد مجانية", "دعم الأدوار الأساسية", "تكاملات محدودة"];
    if (isBetter) return ["كل مزايا Good", "وكلاء الذكاء الاصطناعي وسير العمل", "3 بطاقات رصيد ذكاء اصطناعي", "دعم ذو أولوية"];
    return ["بطاقات رصيد مخصصة", "تكاملات خاصة", "تهيئة مخصصة", "دعم مخصص"];
  }

  if (isGood) return ["Project, asset, and client workspace", "Free setup phase included", "Core organization roles", "Limited apps and integrations"];
  if (isBetter) return ["Everything in Good", "AI agents and workflows", "3 included AI credit cards", "Priority support"];
  return ["Custom AI credit cards", "Custom integrations", "Custom organization setup", "Dedicated onboarding"];
}

export function billingScreenCopy(locale: BillingLocale, planId: BillingPlanId) {
  const planLabel_ = planLabel(planId, locale);
  const included = planIncluded(planId, locale);
  const isContactSales = planId.startsWith("custom");

  return locale === "ar"
    ? {
        eyebrow: "الفوترة",
        title: "اشتراك كانترا",
        subtitle: isContactSales
          ? "تواصل مع فريق المبيعات لتخصيص باقتك."
          : "أكمل إعداد اشتراكك من مساحة العمل.",
        plan: planLabel_,
        monthly: "شهرياً",
        yearly: "سنوياً",
        activeUntil: "نشط حتى",
        status: "الحالة",
        latest: "آخر دفعة",
        pay: isContactSales ? "تحدث مع المبيعات" : "متابعة الإعداد",
        starting: "جاري إنشاء الدفع...",
        secure: isContactSales
          ? "يمكنك تخصيص الخطة وفقاً لاحتياجات فريقك."
          : "ادفع بأمان عبر بوابة الدفع.",
        included,
      }
    : {
        eyebrow: "Billing",
        title: "Qentrah subscription",
        subtitle: isContactSales
          ? "Talk to our sales team to customize your plan."
          : "Complete your subscription setup from your workspace.",
        plan: planLabel_,
        monthly: "per month",
        yearly: "per year",
        activeUntil: "Active until",
        status: "Status",
        latest: "Latest payment",
        pay: isContactSales ? "Talk to sales" : "Continue setup",
        starting: "Creating checkout...",
        secure: isContactSales
          ? "You can customize the plan based on your team's needs."
          : "Pay securely through the payment gateway.",
        included,
      };
}

export function paymentReturnCopy(locale: string, isSuccess: boolean) {
  return locale === "ar"
    ? {
        eyebrow: "الدفع",
        successTitle: isSuccess ? "تم تفعيل الاشتراك" : "تأكيد الدفع",
        failTitle: "تعذر إكمال الدفع",
        successDesc: isSuccess
          ? "تم تأكيد دفعتك وتفعيل فترة الاشتراك."
          : "تم الدفع بنجاح. سيتم تحديث الاشتراك تلقائياً.",
        failDesc: "لم يتم تفعيل الاشتراك. تحقق من تفاصيل الدفع أو حاول مرة أخرى.",
        dashboard: "فتح لوحة التحكم",
        retry: "إعادة المحاولة",
        reference: "مرجع الدفع",
        payment: "حالة الدفع",
      }
    : {
        eyebrow: "Payment",
        successTitle: isSuccess ? "Subscription activated" : "Confirming payment",
        failTitle: "Payment was not completed",
        successDesc: isSuccess
          ? "Your payment was confirmed and your subscription is active."
          : "Payment was successful. The subscription will update automatically.",
        failDesc: "The subscription was not activated. Check the payment details or try again.",
        dashboard: "Open dashboard",
        retry: "Retry payment",
        reference: "Payment reference",
        payment: "Payment status",
      };
}

export function paymentReturnText(
  isSuccess: boolean,
  copy: ReturnType<typeof paymentReturnCopy>,
) {
  return {
    title: isSuccess ? copy.successTitle : copy.failTitle,
    description: isSuccess ? copy.successDesc : copy.failDesc,
  };
}
