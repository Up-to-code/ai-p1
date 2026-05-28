"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type WebsiteTemplate = {
  title: string;
  category: string;
  description: string;
  image: string;
  href: string;
  frame: "wide" | "tall" | "square";
};

const websiteCopy = {
  en: {
    eyebrow: "Instant Sales Websites",
    title: "A stunning, ready-to-sell real estate website. Included free.",
    description:
      "Bypass expensive developers and launch an instant, high-converting property website. Choose your launch style, and we instantly connect it to your live inventory, projects, and leads. Start capturing buyer inquiries and closing deals from day one.",
    included: "Stunning sales website included with your subscription",
    open: "Launch this website",
    live: "Live Preview",
    items: [
      {
        title: "Waterfront launch",
        category: "Project launch",
        description: "A premium project website designed for high-value unit releases, local story narratives, and instant lead capture.",
        image: "/images/projects/waterfront.png",
        href: "/contact?template=waterfront-launch",
        frame: "tall",
      },
      {
        title: "Developer portfolio",
        category: "Company website",
        description: "Showcase your complete active development inventory, establish company credibility, and capture investor interest.",
        image: "/images/projects/business-park.png",
        href: "/contact?template=developer-portfolio",
        frame: "wide",
      },
      {
        title: "Residential sales",
        category: "Sales site",
        description: "Engage buyers with intuitive apartment and villa browsing, interactive tour bookings, and instant inquiry flows.",
        image: "/images/projects/residential.png",
        href: "/contact?template=residential-sales",
        frame: "square",
      },
      {
        title: "Commercial leasing",
        category: "Commercial site",
        description: "Present office and retail listings with live availability maps, digital brochures, and direct leasing actions.",
        image: "/images/projects/commercial.png",
        href: "/contact?template=commercial-leasing",
        frame: "wide",
      },
    ],
  },
  ar: {
    eyebrow: "موقع مبيعات فوري",
    title: "موقع عقاري مبهر وجاهز للبيع. مشمول مجاناً.",
    description:
      "تخطى تكاليف المبرمجين الباهظة وأطلق موقعاً عقارياً عالي التحويل فوراً. اختر النمط المفضل لديك، ونحن نربطه لحظياً ببيانات مشاريعك وعقاراتك وعملائك. ابدأ في استقبال طلبات الشراء وإغلاق الصفقات من اليوم الأول.",
    included: "موقع مبيعات عقاري مبهر مشمول مع اشتراكك",
    open: "أطلق هذا الموقع",
    live: "معاينة مباشرة",
    items: [
      {
        title: "إطلاق واجهة بحرية",
        category: "إطلاق مشروع",
        description: "موقع فاخر مصمم لإطلاق المشاريع المميزة، وسرد قصة الموقع، مع التقاط فوري لبيانات المشترين المهتمين.",
        image: "/images/projects/waterfront.png",
        href: "/contact?template=waterfront-launch",
        frame: "tall",
      },
      {
        title: "محفظة مطور",
        category: "موقع شركة",
        description: "اعرض محفظة مشاريعك النشطة بالكامل، وابنِ مصداقية علامتك التجارية، واجذب انتباه كبار المستثمرين.",
        image: "/images/projects/business-park.png",
        href: "/contact?template=developer-portfolio",
        frame: "wide",
      },
      {
        title: "مبيعات سكنية",
        category: "موقع مبيعات",
        description: "احرص على إبهار المشترين بتصفح ممتع للشقق والفلل، مع حجز مواعيد المعاينة واستقبال طلبات الشراء فوراً.",
        image: "/images/projects/residential.png",
        href: "/contact?template=residential-sales",
        frame: "square",
      },
      {
        title: "تأجير تجاري",
        category: "موقع تجاري",
        description: "اعرض المكاتب والمحلات التجارية المتاحة مع خرائط تفاعلية، وبروشورات رقمية، وتسهيل إجراءات التأجير المباشرة.",
        image: "/images/projects/commercial.png",
        href: "/contact?template=commercial-leasing",
        frame: "wide",
      },
    ],
  },
} satisfies Record<
  "en" | "ar",
  {
    eyebrow: string;
    title: string;
    description: string;
    included: string;
    open: string;
    live: string;
    items: WebsiteTemplate[];
  }
>;

export function WebsiteTemplatesShowcase({ locale }: { locale: string }) {
  const copy = locale === "ar" ? websiteCopy.ar : websiteCopy.en;
  const reduceMotion = useReducedMotion();
  const isAr = locale === "ar";
  const columns = buildTemplateColumns(copy.items);
  const freeWebsiteMessage = isAr ? "أول موقع مخصص لك مجاني" : "Your first custom website is free";

  return (
    <PublicSection
      id="websites"
      tone="default"
      className="scroll-mt-28 overflow-hidden border-y border-white/[0.08] bg-[#050505] !py-14 text-white md:!py-20 !px-0"
      contentClassName="max-w-none relative"
    >
      {/* Background aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] pointer-events-none" />
      <div className="absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05),transparent_70%)] blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-10 px-0 md:gap-12 relative z-10">
        <div className="mx-auto flex flex-col items-center px-6 text-center max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl rtl:leading-[1.25] max-w-3xl">
            {freeWebsiteMessage}
          </h2>
          <p className="mt-4 text-base font-semibold leading-relaxed text-zinc-300 md:text-lg max-w-2xl rtl:leading-[1.7]">
            {copy.description}
          </p>
        </div>

        <div className="relative h-[520px] w-full overflow-hidden px-4 md:h-[580px] md:px-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[#050505] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#050505] to-transparent" />
          <div className="grid h-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-6" dir={isAr ? "rtl" : "ltr"}>
            {columns.map((column, columnIndex) => (
              <div
                key={column.map((item) => item.href).join("-")}
                className={cn("overflow-hidden", columnIndex > 1 && "hidden md:block", columnIndex % 2 === 1 && "pt-10", columnIndex === 2 && "pt-5")}
              >
                <div
                  className={cn("website-template-column flex flex-col gap-3 md:gap-6", reduceMotion && "pb-8")}
                  style={
                    reduceMotion
                      ? undefined
                      : {
                          animation: "qentrah-template-column 30s linear infinite",
                          animationDelay: `-${columnIndex * 6}s`,
                        }
                  }
                >
                  {[...column, ...column].map((item, index) => (
                    <TemplateCard
                      key={`${item.href}-${columnIndex}-${index}`}
                      item={item}
                      labels={{ open: copy.open, live: copy.live }}
                      isDuplicate={index >= column.length || columnIndex > 0}
                      isAr={isAr}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes qentrah-template-column {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(0, -50%, 0);
          }
        }

        #websites:hover .website-template-column {
          animation-play-state: paused;
        }
      `}</style>
    </PublicSection>
  );
}

function TemplateCard({
  item,
  labels,
  isDuplicate,
  isAr,
}: {
  item: WebsiteTemplate;
  labels: { open: string; live: string };
  isDuplicate: boolean;
  isAr: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-hidden={isDuplicate}
      tabIndex={isDuplicate ? -1 : undefined}
      className="group/card block focus-visible:outline-none"
    >
      <article
        dir={isAr ? "rtl" : "ltr"}
        className="h-full text-start transition duration-300 hover:-translate-y-1"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
            "transition duration-300 group-hover/card:border-white/20 group-hover/card:shadow-[0_24px_80px_rgba(0,0,0,0.5)]",
            item.frame === "wide" && "aspect-[16/9]",
            item.frame === "square" && "aspect-[4/3]",
            item.frame === "tall" && "aspect-[3/4]"
          )}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 390px, (min-width: 768px) 31vw, 45vw"
            className="object-cover transition duration-700 group-hover/card:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 opacity-70 transition group-hover/card:opacity-100" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 backdrop-blur-[1px] transition group-hover/card:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-950 shadow-2xl">
              {labels.open}
              <ArrowUpRight className={cn("h-4 w-4", isAr && "-rotate-90")} />
            </span>
          </div>
          <p className="sr-only">{item.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white md:text-base rtl:leading-[1.35]">{item.title}</h3>
            <p className="mt-1 truncate text-xs font-medium text-zinc-500">{item.category}</p>
          </div>
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition group-hover/card:bg-white group-hover/card:text-zinc-950">
            <ArrowUpRight className={cn("h-3.5 w-3.5", isAr && "-rotate-90")} />
          </span>
        </div>
      </article>
    </Link>
  );
}

function buildTemplateColumns(items: WebsiteTemplate[]) {
  return [
    [items[0], items[1], items[2], items[3]],
    [items[2], items[3], items[0]],
    [items[1], items[0], items[3]],
  ];
}
