import type { AgUiConversationTurn } from "./types";

function projectCreateTurn(input: string): AgUiConversationTurn {
  const hasPrice = /\d/.test(input);
  return {
    objective: "create_project",
    targetZone: "projects",
    action: {
      id: "create_project",
      title: "إنشاء مشروع",
      zone: "projects",
      fields: ["name", "owner", "workspace", "budget", "timeline", "resources"],
    },
    draft: {
      actionId: "create_project",
      title: "مشروع تشغيل العملاء",
      description: "مشروع تشغيلي متوسط الحجم مع أصول عمل وروابط فريق قابلة للتنفيذ.",
      fields: {
        name: "مشروع تشغيل العملاء",
        owner: "فريق العمليات",
        workspace: "مساحة العملاء",
        budget: hasPrice ? "85,000 ر.س" : "",
        timeline: "6 أسابيع",
        resources: "دليل تشغيل، قائمة فحص، قالب متابعة",
      },
      missingFields: hasPrice ? [] : ["budget", "timeline", "description"],
      zone: "projects",
      state: hasPrice ? "ready" : "collecting",
    },
    executionState: hasPrice ? "ready" : "collecting",
    assistantText: hasPrice
      ? "جمعت المسودة الأولية للمشروع. راجع البطاقة التالية، وإذا كانت مناسبة أستطيع تجهيز الإنشاء مباشرة."
      : "بدأت تكوين المشروع، لكن ما زلت أحتاج السعر المستهدف قبل أن أجهز بطاقة الموافقة.",
    followupQuestion: hasPrice ? undefined : "ما السعر المستهدف لهذا المشروع؟",
    cards: hasPrice
      ? [
          {
            id: "project-draft",
            componentId: "project_create_draft",
            props: {
              name: "مشروع تشغيل العملاء",
              owner: "فريق العمليات",
              workspace: "مساحة العملاء",
              budget: "85,000 ر.س",
              timeline: "6 أسابيع",
              resources: "دليل تشغيل، قائمة فحص، قالب متابعة",
              summary: "مشروع تشغيلي متوسط الحجم مع أصول عمل وروابط فريق قابلة للتنفيذ.",
            },
          },
          {
            id: "constraints",
            componentId: "constraint_summary",
            props: { constraints: ["عمليات", "فريق العملاء", "6 أسابيع", "ميزانية 85,000 ر.س"] },
          },
        ]
      : [
          {
            id: "missing",
            componentId: "field_request_list",
            props: { fields: ["الميزانية المستهدفة", "الجدول الزمني", "وصف مختصر للمشروع"] },
          },
          {
            id: "followup",
            componentId: "missing_data_prompt",
            props: { prompt: "اذكر الميزانية والجدول الزمني والوصف، وسأكمل المسودة فوراً." },
          },
        ],
  };
}

function publishOfferTurn(): AgUiConversationTurn {
  return {
    objective: "publish_offer",
    targetZone: "offers",
    action: {
      id: "publish_offer",
      title: "نشر عرض",
      zone: "offers",
      fields: ["project", "asset", "audience", "price", "notes"],
    },
    draft: {
      actionId: "publish_offer",
      title: "عرض إطلاق أصول الربوة",
      description: "مسودة نشر عرض قبل إرساله إلى السوق أو الوسطاء.",
      fields: {
        project: "مساكن الربوة",
        asset: "A-12",
        audience: "وسطاء البيع السكني",
        price: "1,920,000 ر.س",
      },
      missingFields: [],
      zone: "offers",
      state: "ready",
    },
    executionState: "ready",
    assistantText: "هذا مسار نشر العرض كما سيظهر قبل دفعه إلى السوق.",
    cards: [
      {
        id: "offer-publish",
        componentId: "offer_publish_draft",
        props: {
          title: "عرض إطلاق أصول الربوة",
          project: "مساكن الربوة",
          asset: "A-12",
          audience: "وسطاء البيع السكني",
          price: "1,920,000 ر.س",
          notes: "دفعة أولى 10% مع مرونة جدولة الحجز خلال أول أسبوعين.",
        },
      },
    ],
  };
}

function sendOfferTurn(): AgUiConversationTurn {
  return {
    objective: "send_offer",
    targetZone: "offers",
    action: {
      id: "send_offer",
      title: "إرسال عرض",
      zone: "offers",
      fields: ["recipient", "project", "asset", "message", "action"],
    },
    draft: {
      actionId: "send_offer",
      title: "إرسال عرض لأصل A-12",
      description: "إرسال عرض مخصص إلى وسيط أو جهة تطوير.",
      fields: {
        recipient: "شركة مسار الأولى",
        project: "مساكن الربوة",
        asset: "A-12",
      },
      missingFields: [],
      zone: "offers",
      state: "ready",
    },
    executionState: "ready",
    assistantText: "جهزت مسودة الإرسال وربطتها بالمشروع والأصل والجهة المستلمة.",
    cards: [
      {
        id: "offer-send",
        componentId: "offer_send_draft",
        props: {
          recipient: "شركة مسار الأولى",
          project: "مساكن الربوة",
          asset: "A-12",
          message: "أرسل لك أصل جاهز للتنفيذ ضمن إطلاق الربوة مع عمولة مرنة.",
          action: "انتظار موافقة الاستلام أو اقتراح موعد معاينة",
        },
      },
      {
        id: "thread-update",
        componentId: "thread_update",
        props: {
          subject: "خيط إرسال العرض التجريبي",
          sender: "فريق التطوير",
          recipient: "شركة مسار الأولى",
          project: "مساكن الربوة",
          asset: "A-12",
          status: "ينتظر الإرسال",
          update: "سيتم فتح الخيط بعد الموافقة",
        },
      },
    ],
  };
}

function latestUpdateTurn(): AgUiConversationTurn {
  return {
    objective: "latest_update",
    targetZone: "projects",
    action: {
      id: "latest_update",
      title: "آخر تحديث",
      zone: "projects",
      fields: ["entity"],
    },
    executionState: "completed",
    assistantText: "هذه أحدث صورة تشغيلية متاحة للمشروع والوسيط المرتبط به.",
    cards: [
      {
        id: "latest",
        componentId: "latest_update",
        props: {
          entity: "مشروع واجهة الياسمين",
          headline: "ارتفع الاهتمام على أصول الفئة العائلية بنسبة 18% هذا الأسبوع.",
          details: [
            "وسيطا بيع دخلا مرحلة المتابعة النهائية",
            "آخر حجز مرتبط بالأصل B-14",
            "تم تحديث سعر الإطلاق للدفعة الثانية",
          ],
        },
      },
      {
        id: "person",
        componentId: "person_relation",
        props: {
          name: "سارة العتيبي",
          role: "وسيط مشروع",
          summary: "تقود المتابعة على أصول العائلات الصغيرة وتغلق أسرع من المتوسط.",
          relation: "وسيط مرتبط بالمشروع على مستوى الأصل",
          project: "واجهة الياسمين",
          asset: "B-14",
          badges: ["verified", "vip"],
        },
      },
    ],
  };
}

function marketTurn(): AgUiConversationTurn {
  return {
    objective: "search_market",
    targetZone: "market",
    action: {
      id: "search_market",
      title: "تحليل السوق",
      zone: "market",
      fields: ["city", "area", "budget"],
    },
    executionState: "completed",
    assistantText:
      "حللت اتجاهات السوق بصورة تجريبية، وهذه البطاقة توضح أين ترتفع السرعة وأي مزيج أصول يبدو أفضل.",
    cards: [
      {
        id: "market-insight",
        componentId: "market_insight",
        props: {
          title: "أفضل منتج مقترح في شمال الرياض",
          body: "الوحدات ذات 3 غرف و3 حمامات تحقق طلباً أسرع من الفلل الكبيرة ضمن شريحة 1.7 - 2.2 مليون.",
          metrics: [
            { label: "متوسط سرعة البيع", value: "42 يوم" },
            { label: "نطاق السعر", value: "1.7M - 2.2M" },
            { label: "أفضل مساحة", value: "185 - 225م²" },
            { label: "عمق الطلب", value: "مرتفع" },
          ],
        },
      },
      {
        id: "area-heat",
        componentId: "area_heat",
        props: {
          city: "الرياض",
          area: "الملقا",
          heat: "hot",
          summary: "الطلب يرتفع على الشقق العائلية المتوسطة مع تسعير حازم وطرح سريع.",
        },
      },
    ],
  };
}

/**
 * WHY:   Package consumers need a tiny reference resolver that demonstrates how agent intent can map to structured AG UI turns.
 * WHAT:  Returns canned AG UI turns for a handful of Arabic assistant intents used in local demos and docs.
 * HOW:   Detects intent with simple keyword matching and returns the matching example turn shape.
 */
export function resolveAgUiTurn(input: string): AgUiConversationTurn {
  if (input.includes("إنشاء") && input.includes("مشروع")) {
    return projectCreateTurn(input);
  }
  if (input.includes("نشر") && input.includes("عرض")) {
    return publishOfferTurn();
  }
  if ((input.includes("إرسال") || input.includes("ارسل")) && input.includes("عرض")) {
    return sendOfferTurn();
  }
  if (input.includes("آخر") || input.includes("تحديث")) {
    return latestUpdateTurn();
  }
  return marketTurn();
}
