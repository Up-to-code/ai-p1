import type { BillingPlan, BillingPlanId, BillingSubscription } from "./api/billing";
import { PRICE_PER_SEAT, PLAN_CURRENCY } from "./api/billing";

export type BillingLocale = "en" | "ar";

export function billingDateLabel(value?: number, locale: BillingLocale = "en") {
  if (!value) return locale === "ar" ? "غير نشط بعد" : "Not active yet";
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
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 2,
  }).format(plan.amount);
}

export function seatTotalLabel(seats: number, locale: BillingLocale) {
  const total = Math.round(seats * PRICE_PER_SEAT * 100) / 100;
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: PLAN_CURRENCY,
    maximumFractionDigits: 2,
  }).format(total);
}

export function billingScreenCopy(locale: BillingLocale) {
  return locale === "ar"
    ? {
        eyebrow: "الفوترة",
        title: "اشتراك Qentrah",
        subtitle: "أكمل إعداد اشتراكك من مساحة العمل.",
        plan: "Qentrah Workspace",
        monthly: "لكل مستخدم / شهرياً",
        activeUntil: "نشط حتى",
        status: "الحالة",
        latest: "آخر دفعة",
        seats: "المقاعد",
        perSeat: "لكل مستخدم / شهر",
        total: "المجموع الشهري",
        pay: "متابعة الدفع",
        starting: "جاري إنشاء الدفع...",
        guarantee: "ضمان استرداد 30 يوماً · دفع آمن عبر DodoPayments",
        ownerNote: "يدفع مالك المؤسسة نيابةً عن جميع الأعضاء",
        included: [
          "مساحة المشاريع والأصول والعملاء",
          "وكلاء الذكاء الاصطناعي وسير العمل",
          "جميع التطبيقات والتكاملات",
          "دعم ذو أولوية",
          "رصيد AI ضمن الخطة",
          "إضافات مرنة عبر Add-ons",
        ],
      }
    : {
        eyebrow: "Billing",
        title: "Qentrah subscription",
        subtitle: "Complete your subscription setup from your workspace.",
        plan: "Qentrah Workspace",
        monthly: "per user / month",
        activeUntil: "Active until",
        status: "Status",
        latest: "Latest payment",
        seats: "Seats",
        perSeat: "per user / month",
        total: "Monthly total",
        pay: "Continue to checkout",
        starting: "Creating checkout...",
        guarantee: "30-day money-back guarantee · Secure checkout via DodoPayments",
        ownerNote: "Organization owner pays on behalf of all members",
        included: [
          "Project, asset & client workspace",
          "AI agents & workflows",
          "All apps & integrations",
          "Priority support",
          "Included AI credits",
          "Flexible seat add-ons",
        ],
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
