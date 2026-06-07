import type { BillingPlan } from "./api/billing";

export type BillingLocale = "en" | "ar";
export type TamaraReturnStatus = "success" | "cancel" | "failure";

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

export function tamaraReturnTone(status: TamaraReturnStatus, paymentStatus?: string) {
  if (status === "success" && paymentStatus === "captured") return "success" as const;
  if (status === "success") return "warning" as const;
  if (status === "cancel") return "neutral" as const;
  return "danger" as const;
}

export function billingPriceLabel(plan: BillingPlan, locale: BillingLocale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.amount);
}

export function billingScreenCopy(locale: BillingLocale, isYearly: boolean) {
  return locale === "ar"
    ? {
        eyebrow: "الفوترة",
        title: "اشتراك كانترا",
        subtitle: isYearly ? "ادفع السنة عبر تمارا بنظام اشتر الآن وادفع لاحقاً. يتم التفعيل بعد تأكيد تمارا." : "الخطة الشهرية لا تستخدم تمارا. أكمل الإعداد الشهري من مساحة العمل.",
        plan: "خطة السعودية",
        monthly: "شهرياً",
        yearly: "سنوياً",
        activeUntil: "نشط حتى",
        status: "الحالة",
        latest: "آخر دفعة",
        pay: isYearly ? "اشتر الآن وادفع لاحقاً مع تمارا" : "متابعة الإعداد",
        starting: "جاري إنشاء الدفع...",
        secure: isYearly ? "يتم الدفع في صفحة تمارا الآمنة، ثم تعود إلى كانترا بعد الانتهاء." : "تمارا متاحة فقط لخيار الدفع السنوي بنظام اشتر الآن وادفع لاحقاً.",
        included: isYearly
          ? ["مساحة المشاريع والأصول والعملاء", "دفع سنوي عبر تمارا", "مرحلة إعداد مجانية", "دعم الأدوار الأساسية"]
          : ["مساحة المشاريع والأصول والعملاء", "مرحلة إعداد مجانية", "دعم الأدوار الأساسية", "تجديد يدوي كل 30 يوم"],
      }
    : {
        eyebrow: "Billing",
        title: "Qentrah subscription",
        subtitle: isYearly ? "Pay the year with Tamara buy now, pay later. Your subscription activates after Tamara confirms payment." : "The monthly plan does not use Tamara. Continue setup from your workspace.",
        plan: "Saudi Arabia plan",
        monthly: "per month",
        yearly: "per year",
        activeUntil: "Active until",
        status: "Status",
        latest: "Latest payment",
        pay: isYearly ? "Buy now, pay later with Tamara" : "Continue setup",
        starting: "Creating checkout...",
        secure: isYearly ? "Payment happens on Tamara's secure checkout, then you return to Qentrah when it is complete." : "Tamara is available only for the annual buy-now-pay-later option.",
        included: isYearly
          ? ["Project, asset, and client workspace", "Annual payment through Tamara", "Free setup phase included", "Core organization roles"]
          : ["Project, asset, and client workspace", "Free setup phase included", "Core organization roles", "Manual renewal every 30 days"],
      };
}

export function tamaraReturnCopy(locale: string, isCaptured: boolean) {
  return locale === "ar"
    ? {
        eyebrow: "تمارا",
        successTitle: isCaptured ? "تم تفعيل الاشتراك" : "نؤكد الدفع",
        cancelTitle: "تم إلغاء الدفع",
        failureTitle: "تعذر إكمال الدفع",
        successDesc: isCaptured
          ? "تم تأكيد دفعتك وتفعيل فترة الاشتراك الشهرية."
          : "وصلت عودة تمارا. سيتم تحديث الاشتراك تلقائياً بعد وصول تأكيد الدفع من تمارا.",
        cancelDesc: "لم يتم تفعيل الاشتراك. يمكنك إعادة المحاولة عندما تكون جاهزاً.",
        failureDesc: "لم يتم تفعيل الاشتراك. تحقق من تفاصيل الدفع أو حاول مرة أخرى.",
        dashboard: "فتح لوحة التحكم",
        retry: "إعادة المحاولة",
        reference: "مرجع الدفع",
        payment: "حالة الدفع",
      }
    : {
        eyebrow: "Tamara",
        successTitle: isCaptured ? "Subscription activated" : "Confirming payment",
        cancelTitle: "Payment canceled",
        failureTitle: "Payment was not completed",
        successDesc: isCaptured
          ? "Your payment was confirmed and the monthly subscription period is active."
          : "Tamara returned you to Qentrah. The subscription will update automatically when Tamara sends the payment confirmation.",
        cancelDesc: "The subscription was not activated. You can retry whenever you are ready.",
        failureDesc: "The subscription was not activated. Check the payment details or try again.",
        dashboard: "Open dashboard",
        retry: "Retry payment",
        reference: "Payment reference",
        payment: "Payment status",
      };
}

export function tamaraReturnText(
  status: TamaraReturnStatus,
  copy: ReturnType<typeof tamaraReturnCopy>,
) {
  return {
    title: status === "success" ? copy.successTitle : status === "cancel" ? copy.cancelTitle : copy.failureTitle,
    description: status === "success" ? copy.successDesc : status === "cancel" ? copy.cancelDesc : copy.failureDesc,
  };
}
