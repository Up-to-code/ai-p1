import Link from "next/link";

import FlowArt, { FlowSection } from "@/components/ui/story-scroll";
import { getContent, type Locale } from "@/lib/content";

const sectionText = {
  en: {
    one: {
      eyebrow: "01 - The brand",
      title: ["Work", "Without", "Fragments"],
      body: "Anan gives real estate teams one public product family for workspace operations, trusted partner access, and organization-level authorization."
    },
    two: {
      eyebrow: "02 - Workspace",
      title: ["Operate", "Every", "Day"],
      body: "The workspace is where organizations manage clients, properties, projects, team activity, and the daily work that keeps real estate moving.",
      items: [
        ["Clients", "Keep client data organized across the whole organization."],
        ["Properties", "Manage listings, ownership context, and operational records."],
        ["Projects", "Coordinate work between teams, brokers, and managers."]
      ],
      more: [
        ["Teams", "Give the right people the right access."],
        ["Activity", "Track the operational history of the workspace."],
        ["Integrations", "Connect approved tools through scoped authorization."]
      ]
    },
    three: {
      eyebrow: "03 - Partners",
      title: ["Build", "With", "Consent"],
      body: "Partners register OAuth apps, submit them for review, and access organization data only through approved Hub APIs.",
      items: [
        ["Register", "Create the app profile, redirect URLs, and requested scopes."],
        ["Review", "Anan reviews the product, permissions, and token handling."],
        ["Authorize", "Workspace admins approve access for their organization."]
      ],
      more: [
        ["Read", "Request only the data needed for the product workflow."],
        ["Write safely", "Use create and update scopes where the API supports them."],
        ["Expire", "Connections can expire, pause, or be revoked."]
      ]
    },
    four: {
      eyebrow: "04 - Public products",
      title: ["One", "Clear", "Route"],
      body: "The public site points customers to Workspace and developers to Partners. Internal review tools and demo apps stay outside the public product catalog."
    },
    five: {
      eyebrow: "05 - Start",
      title: ["Choose", "Your", "Path"],
      body: "Open the workspace to run your organization, or open the partner portal to build approved integrations for Anan customers."
    }
  },
  ar: {
    one: {
      eyebrow: "01 - العلامة",
      title: ["عمل", "بلا", "تشتت"],
      body: "تمنح أنان فرق العقار عائلة منتجات عامة واحدة لتشغيل مساحة العمل ووصول الشركاء الموثوق والتفويض على مستوى المؤسسة."
    },
    two: {
      eyebrow: "02 - مساحة العمل",
      title: ["شغل", "كل", "يوم"],
      body: "مساحة العمل هي المكان الذي تدير فيه المؤسسات العملاء والعقارات والمشاريع ونشاط الفريق والعمل اليومي.",
      items: [
        ["العملاء", "تنظيم بيانات العملاء على مستوى المؤسسة."],
        ["العقارات", "إدارة القوائم وسياق الملكية والسجلات التشغيلية."],
        ["المشاريع", "تنسيق العمل بين الفرق والوسطاء والمديرين."]
      ],
      more: [
        ["الفرق", "منح الأشخاص المناسبين الوصول المناسب."],
        ["النشاط", "تتبع التاريخ التشغيلي لمساحة العمل."],
        ["التكاملات", "ربط الأدوات المعتمدة عبر تفويض محدد."]
      ]
    },
    three: {
      eyebrow: "03 - الشركاء",
      title: ["ابن", "مع", "موافقة"],
      body: "يسجل الشركاء تطبيقات OAuth ويرسلونها للمراجعة ولا يصلون إلى بيانات المؤسسة إلا عبر واجهات Hub المعتمدة.",
      items: [
        ["التسجيل", "إنشاء ملف التطبيق وروابط التحويل والصلاحيات المطلوبة."],
        ["المراجعة", "تراجع أنان المنتج والصلاحيات وطريقة حفظ الرموز."],
        ["التفويض", "يعتمد مديرو مساحة العمل الوصول لمؤسستهم."]
      ],
      more: [
        ["القراءة", "طلب البيانات اللازمة فقط لتدفق المنتج."],
        ["كتابة آمنة", "استخدام صلاحيات الإنشاء والتحديث حيث تدعمها الواجهة."],
        ["الانتهاء", "يمكن أن تنتهي الاتصالات أو تتوقف أو تلغى."]
      ]
    },
    four: {
      eyebrow: "04 - المنتجات العامة",
      title: ["مسار", "واحد", "واضح"],
      body: "يوجه الموقع العام العملاء إلى مساحة العمل والمطورين إلى الشركاء. تبقى أدوات المراجعة الداخلية وتطبيقات العرض خارج الكتالوج العام."
    },
    five: {
      eyebrow: "05 - البداية",
      title: ["اختر", "مسارك", "الآن"],
      body: "افتح مساحة العمل لتشغيل مؤسستك، أو افتح بوابة الشركاء لبناء تكاملات معتمدة لعملاء أنان."
    }
  }
} as const;

function BigTitle({ lines }: { lines: readonly string[] }) {
  return (
    <div>
      <h1 className="text-[clamp(3.5rem,12vw,14rem)] font-bold leading-[0.85] uppercase tracking-tight">
        {lines.map((line) => (
          <span className="block" key={line}>
            {line}
          </span>
        ))}
      </h1>
    </div>
  );
}

function Rule({ light = false }: { light?: boolean }) {
  return <hr className={light ? "my-[2vw] border-none border-t border-white/60" : "my-[2vw] border-none border-t border-black/60"} />;
}

function FeatureRows({
  items,
  light = false
}: {
  items: readonly (readonly [string, string])[];
  light?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-[3vw]">
      {items.map(([title, description]) => (
        <div className="min-w-[180px] flex-1" key={title}>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider">{title}</p>
          <p className={light ? "text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75" : "text-[clamp(0.85rem,1.3vw,1.05rem)] leading-relaxed opacity-75"}>
            {description}
          </p>
        </div>
      ))}
    </div>
  );
}

export function HomePage({ locale }: { locale: Locale }) {
  const copy = getContent(locale);
  const text = sectionText[locale];
  const isAr = locale === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"}>
      <FlowArt aria-label={isAr ? "قصة منتجات أنان" : "Anan product story"} className="pt-24">
      <FlowSection aria-label={text.one.eyebrow} style={{ backgroundColor: "#fd5200", color: "#fff" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">{text.one.eyebrow}</p>
        <hr className="my-[2vw] border-none border-t border-black opacity-100" />
        <BigTitle lines={text.one.title} />
        <hr className="my-[2vw] border-none border-t border-black opacity-100" />
        <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">{text.one.body}</p>
      </FlowSection>

      <FlowSection aria-label={text.two.eyebrow} style={{ backgroundColor: "#000", color: "#fff" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">{text.two.eyebrow}</p>
        <Rule light />
        <BigTitle lines={text.two.title} />
        <Rule light />
        <p className="max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">{text.two.body}</p>
        <Rule light />
        <FeatureRows items={text.two.items} light />
        <Rule light />
        <FeatureRows items={text.two.more} light />
        <Rule light />
        <a className="mt-auto inline-flex w-fit rounded-full bg-white px-7 py-3 text-sm font-bold text-black" href={copy.products[0].href}>
          {copy.products[0].cta}
        </a>
      </FlowSection>

      <FlowSection aria-label={text.three.eyebrow} style={{ backgroundColor: "#F5F0E8", color: "#000" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">{text.three.eyebrow}</p>
        <Rule />
        <BigTitle lines={text.three.title} />
        <Rule />
        <p className="max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">{text.three.body}</p>
        <Rule />
        <FeatureRows items={text.three.items} />
        <Rule />
        <FeatureRows items={text.three.more} />
        <Rule />
        <a className="inline-flex w-fit rounded-full bg-black px-7 py-3 text-sm font-bold text-white" href={copy.products[1].href}>
          {copy.products[1].cta}
        </a>
      </FlowSection>

      <FlowSection aria-label={text.four.eyebrow} style={{ backgroundColor: "#1A3DE8", color: "#fff" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">{text.four.eyebrow}</p>
        <hr className="my-[2vw] border-none border-t border-white/50" />
        <BigTitle lines={text.four.title} />
        <hr className="my-[2vw] border-none border-t border-white/50" />
        <p className="max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">{text.four.body}</p>
        <hr className="my-[2vw] border-none border-t border-white/50" />
        <FeatureRows
          light
          items={copy.products.map((product) => [product.name, product.description] as const)}
        />
      </FlowSection>

      <FlowSection aria-label={text.five.eyebrow} style={{ backgroundColor: "#000", color: "#fff" }}>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">{text.five.eyebrow}</p>
        <hr className="my-[2vw] border-none border-t border-white/60" />
        <BigTitle lines={text.five.title} />
        <hr className="my-[2vw] border-none border-t border-white/60" />
        <p className="mt-auto max-w-[50ch] text-[clamp(1rem,2.5vw,2rem)] font-normal leading-relaxed">{text.five.body}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a className="inline-flex rounded-full bg-white px-7 py-3 text-sm font-bold text-black" href={copy.products[0].href}>
            {copy.home.primaryCta}
          </a>
          <a className="inline-flex rounded-full border border-white/40 px-7 py-3 text-sm font-bold text-white" href={copy.products[1].href}>
            {copy.home.secondaryCta}
          </a>
          <Link className="inline-flex rounded-full border border-white/40 px-7 py-3 text-sm font-bold text-white" href={`/${locale}/privacy`}>
            {copy.nav.privacy}
          </Link>
        </div>
      </FlowSection>
      </FlowArt>
    </div>
  );
}
