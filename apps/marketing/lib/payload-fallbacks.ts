import type {
  PayloadBlogPost,
  PayloadFAQ,
  PayloadLegalPage,
  PayloadPricingPlan,
  PayloadTeamMember,
} from "./payload-api";

export function fallbackFAQs(locale: string): PayloadFAQ[] {
  const isAr = locale === "ar";
  return [
    {
      id: 1,
      question: isAr ? "ما هي كانترا؟" : "What is Qentrah?",
      answer: isAr
        ? {
            root: {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "كانترا هي منصة مساحة عمل ذكية للفرق والشركات.",
                },
              ],
            },
          }
        : {
            root: {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Qentrah is an intelligent workspace platform for teams and businesses.",
                },
              ],
            },
          },
      sortOrder: 1,
    },
    {
      id: 2,
      question: isAr ? "كيف أبدأ使用ها؟" : "How do I get started?",
      answer: isAr
        ? {
            root: {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "سجّل حساباً مجانياً وابدأ في إعداد مساحة عملك خلال دقائق.",
                },
              ],
            },
          }
        : {
            root: {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Sign up for a free account and set up your workspace in minutes.",
                },
              ],
            },
          },
      sortOrder: 2,
    },
  ];
}

export function fallbackPricingPlans(_locale: string): PayloadPricingPlan[] {
  return [
    {
      id: 1,
      name: "Starter",
      planId: "starter_monthly",
      amount: 99,
      currency: "USD",
      periodDays: 30,
      features: null,
      highlighted: false,
      checkoutMode: "provider",
    },
    {
      id: 2,
      name: "Better",
      planId: "better_monthly",
      amount: 899,
      currency: "SAR",
      periodDays: 30,
      features: null,
      highlighted: true,
      checkoutMode: "provider",
    },
    {
      id: 3,
      name: "Custom",
      planId: "custom_monthly",
      amount: null,
      currency: "SAR",
      periodDays: 30,
      features: null,
      highlighted: false,
      checkoutMode: "contact_sales",
    },
  ];
}

export function fallbackTeamMembers(_locale: string): PayloadTeamMember[] {
  return [];
}

export function fallbackLegalPage(
  slug: string,
  locale: string,
): PayloadLegalPage | null {
  const isAr = locale === "ar";
  const pages: Record<
    string,
    { title: string; body: Record<string, unknown> }
  > = {
    privacy: {
      title: isAr ? "سياسة الخصوصية" : "Privacy Policy",
      body: isAr
        ? {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "سياسة الخصوصية لكانترا" }],
            },
          }
        : {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "Qentrah Privacy Policy" }],
            },
          },
    },
    terms: {
      title: isAr ? "شروط الخدمة" : "Terms of Service",
      body: isAr
        ? {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "شروط الخدمة لكانترا" }],
            },
          }
        : {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "Qentrah Terms of Service" }],
            },
          },
    },
    legal: {
      title: isAr ? "إشعار قانوني" : "Legal Notice",
      body: isAr
        ? {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "إشعار قانوني لكانترا" }],
            },
          }
        : {
            root: {
              type: "paragraph",
              children: [{ type: "text", text: "Qentrah Legal Notice" }],
            },
          },
    },
  };
  const page = pages[slug];
  if (!page) return null;
  return {
    id: 0,
    slug,
    title: page.title,
    body: page.body,
  };
}

export function fallbackBlogPosts(_locale: string): PayloadBlogPost[] {
  return [];
}
