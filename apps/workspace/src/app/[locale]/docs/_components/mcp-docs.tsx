import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  Code2,
  Database,
  DoorOpen,
  Eye,
  FileText,
  Globe2,
  KeyRound,
  Languages,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";

import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Locale = "en" | "ar";

export type DocsTopicSlug =
  | "overview"
  | "why-public"
  | "endpoint"
  | "create-link"
  | "permissions"
  | "examples"
  | "security"
  | "troubleshooting"
  | "references";

type DocsTopic = {
  slug: DocsTopicSlug;
  label: Record<Locale, string>;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

type PermissionRow = {
  resource: string;
  bestFor: string;
  actions: string;
};

type DocsCopy = {
  badge: string;
  dashboard: string;
  language: string;
  search: string;
  sidebarTitle: string;
  quickFactsTitle: string;
  quickFacts: string[];
  overviewBody: string[];
  whyPublicBody: string[];
  endpointBody: string[];
  stepsIntro: string;
  steps: Array<{ title: string; description: string }>;
  permissionsDescription: string;
  permissionRows: PermissionRow[];
  examplesDescription: string;
  examples: Array<{ name: string; description: string; code: string }>;
  securityDescription: string;
  securityItems: Array<{ title: string; description: string }>;
  troubleshootDescription: string;
  troubleshootItems: Array<{ issue: string; fix: string }>;
  referencesDescription: string;
  nextTopics: string;
  plainLanguage: string;
  technicalSetup: string;
};

export const docsTopics: DocsTopic[] = [
  {
    slug: "overview",
    label: { en: "Overview", ar: "نظرة عامة" },
    title: {
      en: "MCP for your organization, in plain language",
      ar: "MCP لمؤسستك بلغة بسيطة",
    },
    description: {
      en: "Connect ChatGPT, Claude, Grok, Codex, Cursor, or your own agent to one Qentrah organization without giving anyone a dashboard login.",
      ar: "اربط ChatGPT أو Claude أو Grok أو Codex أو Cursor أو وكيلك الخاص بمؤسسة واحدة في كانترا بدون إعطاء أي شخص دخولاً للوحة التحكم.",
    },
  },
  {
    slug: "why-public",
    label: { en: "Why public", ar: "لماذا عام" },
    title: {
      en: "Share the guide, not the dashboard",
      ar: "شارك الدليل وليس لوحة التحكم",
    },
    description: {
      en: "Public docs let vendors, admins, and agent builders understand the setup before they touch private company data.",
      ar: "التوثيق العام يساعد الموردين والمسؤولين ومطوري الوكلاء على فهم الربط قبل الوصول إلى بيانات الشركة الخاصة.",
    },
  },
  {
    slug: "endpoint",
    label: { en: "Agent link", ar: "رابط الوكيل" },
    title: {
      en: "The MCP link is a controlled doorway",
      ar: "رابط MCP هو باب مضبوط",
    },
    description: {
      en: "The link is the address the agent uses to ask Qentrah for approved tools and approved data.",
      ar: "هذا الرابط هو العنوان الذي يستخدمه الوكيل لطلب الأدوات والبيانات المسموحة فقط من كانترا.",
    },
  },
  {
    slug: "create-link",
    label: { en: "Create link", ar: "إنشاء الرابط" },
    title: {
      en: "Create the organization link step by step",
      ar: "إنشاء رابط المؤسسة خطوة بخطوة",
    },
    description: {
      en: "Start with a narrow link, copy it into the agent, test it, then manage it from Organization settings.",
      ar: "ابدأ برابط محدود، انسخه داخل الوكيل، اختبره، ثم أدره من إعدادات المؤسسة.",
    },
  },
  {
    slug: "permissions",
    label: { en: "Permissions", ar: "الصلاحيات" },
    title: {
      en: "Choose what the agent can see and do",
      ar: "اختر ما يستطيع الوكيل رؤيته وفعله",
    },
    description: {
      en: "Think of permissions as switches. If a switch is off, the agent cannot see that part of the company.",
      ar: "فكر في الصلاحيات كمفاتيح تشغيل. إذا كان المفتاح مغلقاً، فلن يرى الوكيل ذلك الجزء من الشركة.",
    },
  },
  {
    slug: "examples",
    label: { en: "Agent examples", ar: "أمثلة الوكلاء" },
    title: {
      en: "What different agents can help with",
      ar: "كيف تساعدك الوكلاء المختلفة",
    },
    description: {
      en: "Use the same Qentrah organization link with popular AI agents or with your own internal assistant.",
      ar: "استخدم نفس رابط مؤسسة كانترا مع الوكلاء المشهورين أو مع مساعدك الداخلي الخاص.",
    },
  },
  {
    slug: "security",
    label: { en: "Security", ar: "الأمان" },
    title: {
      en: "Keep company data protected",
      ar: "حافظ على بيانات الشركة محمية",
    },
    description: {
      en: "Separate company data, keep the link private, and remove access the moment it is no longer needed.",
      ar: "افصل بيانات كل شركة، حافظ على سرية الرابط، وأزل الوصول فور انتهاء الحاجة إليه.",
    },
  },
  {
    slug: "troubleshooting",
    label: { en: "Troubleshooting", ar: "حل المشاكل" },
    title: {
      en: "Fix common connection problems",
      ar: "حل مشاكل الربط الشائعة",
    },
    description: {
      en: "Most issues come from an inactive link, missing permissions, or a private URL the cloud agent cannot reach.",
      ar: "أغلب المشاكل تأتي من رابط غير نشط، صلاحيات ناقصة، أو رابط خاص لا يستطيع الوكيل السحابي الوصول إليه.",
    },
  },
  {
    slug: "references",
    label: { en: "References", ar: "المراجع" },
    title: {
      en: "Reference material",
      ar: "مواد مرجعية",
    },
    description: {
      en: "Official MCP references for the technical team when they need exact implementation details.",
      ar: "مراجع MCP الرسمية للفريق التقني عند الحاجة إلى تفاصيل التنفيذ الدقيقة.",
    },
  },
];

const references = [
  ["Model Context Protocol transports", "https://modelcontextprotocol.io/docs/concepts/transports"],
  ["OpenAI MCP integrations", "https://platform.openai.com/docs/mcp/"],
  ["OpenAI Agents SDK MCP", "https://openai.github.io/openai-agents-python/mcp/"],
  ["Anthropic MCP", "https://docs.anthropic.com/en/docs/mcp"],
  ["Claude remote MCP connectors", "https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-integrations-using-remote-mcp"],
  ["xAI remote MCP tools", "https://docs.x.ai/developers/tools/remote-mcp"],
];

const codeSamples = {
  openai: `{
  "model": "gpt-5",
  "input": "Check today's clients and prepare follow-up tasks.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET",
      "allowed_tools": ["organization_info", "clients_list", "tasks_create"],
      "require_approval": "never"
    }
  ]
}`,
  chatgpt: `Connector name: Qentrah organization
Connector URL: https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET
Suggested scope: only the tools selected when the link was created`,
  claude: `Name: Qentrah organization
Remote MCP URL: https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET
Notes: Claude cloud must be able to reach this HTTPS endpoint.`,
  grok: `{
  "model": "grok-4.3",
  "input": "Summarize available apartments for this client.",
  "tools": [
    {
      "type": "mcp",
      "server_label": "qentrah",
      "server_url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
    }
  ]
}`,
  ide: `codex mcp add qentrah --url https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET

{
  "mcpServers": {
    "qentrah": {
      "url": "https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET"
    }
  }
}`,
};

const copyByLocale: Record<Locale, DocsCopy> = {
  en: {
    badge: "Public documentation",
    dashboard: "Open dashboard",
    language: "Language",
    search: "Find a topic...",
    sidebarTitle: "Documentation",
    quickFactsTitle: "Simple facts",
    quickFacts: [
      "Each organization has its own data bubble",
      "The agent gets one controlled link",
      "Permissions decide what appears",
      "Private records stay hidden",
    ],
    overviewBody: [
      "MCP is the connection language. It lets an AI agent ask Qentrah for specific tools, like reading public client records, checking available properties, or creating a task.",
      "The important part is that the agent does not get a full dashboard account. It only receives a special organization link and only sees the tools that an admin allowed.",
      "Every company keeps its own data bubble. Company A's link opens Company A's approved tools. Company B's link opens Company B's approved tools. The two do not mix.",
    ],
    whyPublicBody: [
      "This guide lives outside the dashboard because setup often involves people who should read the instructions but should not manage live access: vendors, AI consultants, developers, and operations leads.",
      "Public docs explain the process. The dashboard remains the place where an admin creates the real link, chooses permissions, pauses access, rotates the secret, or deletes the link.",
    ],
    endpointBody: [
      "The MCP server URL is the controlled doorway. You copy it from Organization settings and paste it into the agent platform.",
      "Anyone holding the full URL can try to connect, so treat it like a password. Share the docs freely, but share the real link only with trusted agent configuration.",
    ],
    stepsIntro: "The safest path is to create a small link first, test it, then expand permissions only when the workflow proves it needs more.",
    steps: [
      { title: "Choose the organization", description: "Pick the company workspace the agent is allowed to help with. This keeps each company's data separate." },
      { title: "Create an agent link", description: "Give it a human name like ChatGPT Sales Helper or Claude Vendor Review so everyone knows why it exists." },
      { title: "Select permissions", description: "Start with read-only access. Turn on create or update only for jobs where the agent must write back to Qentrah." },
      { title: "Copy the MCP URL", description: "Paste the generated URL into ChatGPT, Claude, Grok, Codex, Cursor, or your custom agent as the MCP server URL." },
      { title: "Test and manage", description: "Ask the agent what it can do. If anything looks wrong, pause, rotate, or revoke the link from settings." },
    ],
    permissionsDescription:
      "Permissions are plain switches. A switch can allow the agent to read, create, update, or delete a type of information. If a switch is off, that tool is not shown to the agent.",
    permissionRows: [
      { resource: "Organization", bestFor: "Let the agent know which company it is helping", actions: "read" },
      { resource: "Clients", bestFor: "Find leads, summarize client needs, prepare follow-ups", actions: "read, create, update, delete" },
      { resource: "Properties", bestFor: "Search available units and explain options to a client", actions: "read, create, update, delete" },
      { resource: "Projects", bestFor: "Answer project questions and compare inventory", actions: "read, create, update, delete" },
      { resource: "Calendar", bestFor: "View meetings or schedule appointments", actions: "read, create, update, delete" },
      { resource: "Tasks", bestFor: "Create work for the team after a conversation", actions: "read, create, update, delete" },
      { resource: "Media", bestFor: "Read approved files or attach URL-based documents", actions: "read, create" },
    ],
    examplesDescription:
      "Different agents can use the same Qentrah link, but you should create separate links when the purpose is different. A sales helper, a vendor helper, and an internal automation should not share one broad key.",
    examples: [
      { name: "ChatGPT", description: "Good for a non-technical team member asking questions, drafting follow-ups, or summarizing approved records.", code: codeSamples.chatgpt },
      { name: "Claude", description: "Good for reviewing long notes, vendor handoffs, policy documents, or detailed client context.", code: codeSamples.claude },
      { name: "Grok / xAI", description: "Good for a custom cloud workflow that needs the same approved Qentrah tools.", code: codeSamples.grok },
      { name: "Codex, Cursor, or IDE agents", description: "Good for technical teams building automation around your organization data.", code: codeSamples.ide },
      { name: "OpenAI API", description: "Good when your own product calls OpenAI and attaches Qentrah as a remote MCP server.", code: codeSamples.openai },
    ],
    securityDescription: "Before you connect an agent, agree on what it is allowed to touch and who owns the link.",
    securityItems: [
      { title: "Keep the URL private", description: "The secret is inside the URL. Store it only in the agent's secure connector settings." },
      { title: "Use smaller links", description: "Create one link per agent or workflow instead of one powerful link for everything." },
      { title: "Show only approved data", description: "Read tools should return records and files that are safe for this outside workflow." },
      { title: "Rotate after exposure", description: "If the URL appears in chat, email, screenshots, tickets, or logs, rotate it and update the agent." },
    ],
    troubleshootDescription: "Use this page when the agent cannot connect or when it connects but cannot do what you expected.",
    troubleshootItems: [
      { issue: "The agent says no tools are available.", fix: "Open the link settings and confirm the link is active with at least one permission switched on." },
      { issue: "The agent can read but cannot create anything.", fix: "That is usually correct for read-only links. Add create permission only for the resources the workflow must write." },
      { issue: "A cloud agent cannot reach the URL.", fix: "Use a public HTTPS domain. Localhost and private VPN URLs are not reachable from hosted AI agents." },
      { issue: "The wrong company data appears.", fix: "Stop using the link and create a fresh link from the correct organization workspace." },
    ],
    referencesDescription: "These links are for the technical person who needs exact MCP behavior, transport details, or provider-specific setup.",
    nextTopics: "Next topics",
    plainLanguage: "Plain-language visual",
    technicalSetup: "Technical setup examples",
  },
  ar: {
    badge: "التوثيق العام",
    dashboard: "فتح لوحة التحكم",
    language: "اللغة",
    search: "ابحث عن موضوع...",
    sidebarTitle: "التوثيق",
    quickFactsTitle: "حقائق بسيطة",
    quickFacts: [
      "كل مؤسسة لها فقاعة بيانات خاصة",
      "الوكيل يحصل على رابط مضبوط واحد",
      "الصلاحيات تحدد ما يظهر",
      "البيانات الخاصة تبقى مخفية",
    ],
    overviewBody: [
      "MCP هي لغة الربط. تسمح للوكيل الذكي أن يطلب من كانترا أدوات محددة، مثل قراءة سجلات العملاء العامة، فحص العقارات المتاحة، أو إنشاء مهمة.",
      "النقطة المهمة أن الوكيل لا يحصل على حساب كامل في لوحة التحكم. يحصل فقط على رابط خاص بالمؤسسة، ويرى فقط الأدوات التي سمح بها المسؤول.",
      "كل شركة تحتفظ بفقاعة بيانات منفصلة. رابط الشركة الأولى يفتح أدوات الشركة الأولى المسموحة. رابط الشركة الثانية يفتح أدوات الشركة الثانية المسموحة. لا يتم خلط البيانات.",
    ],
    whyPublicBody: [
      "هذا الدليل خارج لوحة التحكم لأن الإعداد غالباً يحتاج أشخاصاً يجب أن يقرأوا التعليمات بدون إدارة الوصول الفعلي: موردون، مستشارو ذكاء اصطناعي، مطورون، ومسؤولو تشغيل.",
      "التوثيق العام يشرح العملية. أما لوحة التحكم فهي مكان إنشاء الرابط الحقيقي، اختيار الصلاحيات، إيقاف الوصول، تدوير السر، أو حذف الرابط.",
    ],
    endpointBody: [
      "رابط خادم MCP هو الباب المضبوط. تنسخه من إعدادات المؤسسة وتلصقه داخل منصة الوكيل.",
      "أي شخص يملك الرابط الكامل يستطيع محاولة الاتصال، لذلك تعامل معه مثل كلمة مرور. شارك الدليل بحرية، لكن شارك الرابط الحقيقي فقط داخل إعدادات وكيل موثوقة.",
    ],
    stepsIntro: "المسار الأكثر أماناً هو إنشاء رابط صغير أولاً، اختباره، ثم توسيع الصلاحيات فقط عندما يثبت سير العمل أنه يحتاج أكثر.",
    steps: [
      { title: "اختر المؤسسة", description: "حدد مساحة عمل الشركة التي يسمح للوكيل بمساعدتها. هذا يفصل بيانات كل شركة عن الأخرى." },
      { title: "أنشئ رابط وكيل", description: "اكتب اسماً مفهوماً مثل مساعد مبيعات ChatGPT أو مراجعة مورد Claude حتى يعرف الجميع سبب وجوده." },
      { title: "حدد الصلاحيات", description: "ابدأ بالقراءة فقط. شغل الإنشاء أو التحديث فقط عندما يحتاج الوكيل للكتابة داخل كانترا." },
      { title: "انسخ رابط MCP", description: "الصق الرابط الناتج داخل ChatGPT أو Claude أو Grok أو Codex أو Cursor أو وكيلك المخصص كرابط خادم MCP." },
      { title: "اختبر وأدر الرابط", description: "اسأل الوكيل عما يستطيع فعله. إذا كان هناك شيء غير صحيح، أوقف الرابط أو دوّره أو ألغِه من الإعدادات." },
    ],
    permissionsDescription:
      "الصلاحيات هي مفاتيح بسيطة. المفتاح يسمح للوكيل أن يقرأ أو ينشئ أو يحدث أو يحذف نوعاً من المعلومات. إذا كان المفتاح مغلقاً فلن تظهر الأداة للوكيل.",
    permissionRows: [
      { resource: "المؤسسة", bestFor: "تعريف الوكيل بالشركة التي يساعدها", actions: "قراءة" },
      { resource: "العملاء", bestFor: "البحث عن العملاء وتلخيص احتياجاتهم وتجهيز المتابعات", actions: "قراءة، إنشاء، تحديث، حذف" },
      { resource: "العقارات", bestFor: "البحث عن الوحدات المتاحة وشرح الخيارات للعميل", actions: "قراءة، إنشاء، تحديث، حذف" },
      { resource: "المشاريع", bestFor: "الإجابة عن أسئلة المشاريع ومقارنة المخزون", actions: "قراءة، إنشاء، تحديث، حذف" },
      { resource: "التقويم", bestFor: "عرض الاجتماعات أو جدولة المواعيد", actions: "قراءة، إنشاء، تحديث، حذف" },
      { resource: "المهام", bestFor: "إنشاء مهام للفريق بعد المحادثة", actions: "قراءة، إنشاء، تحديث، حذف" },
      { resource: "الوسائط", bestFor: "قراءة الملفات المعتمدة أو إرفاق مستندات عبر روابط", actions: "قراءة، إنشاء" },
    ],
    examplesDescription:
      "يمكن للوكلاء المختلفين استخدام رابط كانترا، لكن الأفضل إنشاء روابط منفصلة عندما يختلف الغرض. مساعد المبيعات ومساعد المورد والأتمتة الداخلية لا يجب أن يتشاركوا مفتاحاً واسعاً واحداً.",
    examples: [
      { name: "ChatGPT", description: "مناسب لعضو فريق غير تقني يسأل أسئلة أو يكتب متابعات أو يلخص السجلات المسموحة.", code: codeSamples.chatgpt },
      { name: "Claude", description: "مناسب لمراجعة الملاحظات الطويلة وتسليمات الموردين والسياسات وسياق العملاء المفصل.", code: codeSamples.claude },
      { name: "Grok / xAI", description: "مناسب لسير عمل سحابي مخصص يحتاج نفس أدوات كانترا المسموحة.", code: codeSamples.grok },
      { name: "Codex أو Cursor أو وكلاء IDE", description: "مناسب للفرق التقنية التي تبني أتمتة حول بيانات المؤسسة.", code: codeSamples.ide },
      { name: "OpenAI API", description: "مناسب عندما يستدعي منتجك OpenAI ويربط كانترا كخادم MCP بعيد.", code: codeSamples.openai },
    ],
    securityDescription: "قبل ربط أي وكيل، اتفقوا على ما يسمح له بلمسه ومن يملك الرابط.",
    securityItems: [
      { title: "حافظ على سرية الرابط", description: "السر موجود داخل الرابط. خزنه فقط في إعدادات الموصل الآمنة الخاصة بالوكيل." },
      { title: "استخدم روابط أصغر", description: "أنشئ رابطاً لكل وكيل أو سير عمل بدلاً من رابط قوي واحد لكل شيء." },
      { title: "اعرض البيانات المعتمدة فقط", description: "أدوات القراءة يجب أن تعيد السجلات والملفات المناسبة لهذا العمل الخارجي." },
      { title: "دوّر الرابط بعد انكشافه", description: "إذا ظهر الرابط في محادثة أو بريد أو صورة شاشة أو تذكرة أو سجل، دوّره وحدث الوكيل." },
    ],
    troubleshootDescription: "استخدم هذه الصفحة عندما لا يستطيع الوكيل الاتصال أو عندما يتصل لكنه لا يفعل ما توقعته.",
    troubleshootItems: [
      { issue: "الوكيل يقول إن الأدوات غير متاحة.", fix: "افتح إعدادات الرابط وتأكد أنه نشط وفيه صلاحية واحدة على الأقل." },
      { issue: "الوكيل يستطيع القراءة لكنه لا يستطيع الإنشاء.", fix: "هذا طبيعي غالباً في روابط القراءة فقط. أضف صلاحية الإنشاء فقط للمورد الذي يحتاج سير العمل الكتابة فيه." },
      { issue: "وكيل سحابي لا يستطيع الوصول للرابط.", fix: "استخدم نطاق HTTPS عاماً. روابط localhost و VPN الخاصة لا تصل إليها الوكلاء المستضافة." },
      { issue: "ظهرت بيانات الشركة الخاطئة.", fix: "أوقف استخدام الرابط وأنشئ رابطاً جديداً من مساحة عمل المؤسسة الصحيحة." },
    ],
    referencesDescription: "هذه الروابط للفريق التقني عندما يحتاج تفاصيل MCP الدقيقة أو النقل أو إعدادات كل مزود.",
    nextTopics: "المواضيع التالية",
    plainLanguage: "رسم توضيحي بسيط",
    technicalSetup: "أمثلة إعداد تقنية",
  },
};

const panelClassName = "rounded-2xl border border-white/[0.08] bg-[#111111] p-5 shadow-none md:p-6";
const subtlePanelClassName = "rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4";
const visualShellClassName = "rounded-2xl border border-white/[0.08] bg-[#0D0D0D] p-4 md:p-5";

export function isDocsTopic(value: string): value is DocsTopicSlug {
  return docsTopics.some((topic) => topic.slug === value);
}

function localeKey(locale: string): Locale {
  return locale === "ar" ? "ar" : "en";
}

function topicHref(slug: DocsTopicSlug) {
  return slug === "overview" ? "/docs" : `/docs/${slug}`;
}

function topicBySlug(slug: DocsTopicSlug) {
  return docsTopics.find((topic) => topic.slug === slug) ?? docsTopics[0];
}

function textFor(isArabic: boolean, en: string, ar: string) {
  return isArabic ? ar : en;
}

export function getDocsMetadata(locale: string, topicSlug: DocsTopicSlug): Metadata {
  const language = localeKey(locale);
  const topic = topicBySlug(topicSlug);

  return {
    title: `${topic.title[language]} | Qentrah MCP`,
    description: topic.description[language],
  };
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="max-w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#050505] p-4 text-left text-[12px] leading-6 text-zinc-100 shadow-sm">
      <code>{children}</code>
    </pre>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300">
      {children}
    </span>
  );
}

function IconBadge({ icon: Icon, tone = "neutral" }: { icon: LucideIcon; tone?: "neutral" | "green" | "red" | "amber" }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
        tone === "green" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        tone === "red" && "border-red-400/20 bg-red-400/10 text-red-300",
        tone === "amber" && "border-amber-400/20 bg-amber-400/10 text-amber-300",
        tone === "neutral" && "border-white/10 bg-white/[0.05] text-zinc-200",
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function PageHeader({
  topic,
  copy,
  locale,
}: {
  topic: DocsTopic;
  copy: DocsCopy;
  locale: Locale;
}) {
  return (
    <section className={cn(panelClassName, "md:p-8")}>
      <div className="flex flex-wrap gap-2">
        <Pill>{copy.badge}</Pill>
        <Pill>MCP</Pill>
        <Pill>Organization</Pill>
      </div>
      <h1 className="mt-6 max-w-5xl text-3xl font-black tracking-tight text-white md:text-5xl md:leading-tight">
        {topic.title[locale]}
      </h1>
      <p className="mt-5 max-w-4xl text-base font-medium leading-8 text-zinc-300">{topic.description[locale]}</p>
    </section>
  );
}

function TextTopic({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={panelClassName}>
      <div className="space-y-4 text-sm font-medium leading-7 text-zinc-300">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function TopicCard({
  icon,
  title,
  children,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <div className="flex items-center gap-3">
        <IconBadge icon={icon} tone={tone} />
        <h2 className="text-sm font-black text-white">{title}</h2>
      </div>
      <div className="mt-3 text-sm font-medium leading-6 text-zinc-400">{children}</div>
    </div>
  );
}

function DataBubbleVisual({ isArabic }: { isArabic: boolean }) {
  const labels = {
    companyA: textFor(isArabic, "Company A", "الشركة أ"),
    companyB: textFor(isArabic, "Company B", "الشركة ب"),
    dataBubble: textFor(isArabic, "Own data bubble", "فقاعة بيانات خاصة"),
    publicData: textFor(isArabic, "Approved data", "بيانات مسموحة"),
    privateData: textFor(isArabic, "Private data", "بيانات خاصة"),
    gate: textFor(isArabic, "Permission gate", "بوابة الصلاحيات"),
    agent: textFor(isArabic, "AI agent", "الوكيل الذكي"),
    sees: textFor(isArabic, "Sees allowed tools only", "يرى الأدوات المسموحة فقط"),
    blocked: textFor(isArabic, "Private records stay locked", "السجلات الخاصة تبقى مغلقة"),
  };

  return (
    <section className={visualShellClassName} role="img" aria-label={labels.sees}>
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{labels.dataBubble}</p>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.72fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={Building2} tone="green" />
            <div>
              <h2 className="text-sm font-black text-white">{labels.companyA}</h2>
              <p className="text-xs font-medium text-zinc-500">{labels.dataBubble}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
              <Database className="h-4 w-4 text-emerald-300" />
              <p className="mt-3 text-sm font-black text-emerald-50">{labels.publicData}</p>
            </div>
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-3">
              <LockKeyhole className="h-4 w-4 text-red-300" />
              <p className="mt-3 text-sm font-black text-red-50">{labels.privateData}</p>
            </div>
          </div>
        </div>

        <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-center">
          <ShieldCheck className="h-8 w-8 text-emerald-300" />
          <h2 className="mt-3 text-sm font-black text-white">{labels.gate}</h2>
          <p className="mt-2 text-xs font-medium leading-5 text-emerald-50/75">{labels.blocked}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={Bot} />
            <div>
              <h2 className="text-sm font-black text-white">{labels.agent}</h2>
              <p className="text-xs font-medium text-zinc-500">{labels.sees}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {["clients.read", "properties.read", "tasks.create"].map((tool) => (
              <div key={tool} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-300">
                <span>{tool}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-zinc-300">
          <Building2 className="h-4 w-4 text-zinc-500" />
          <span>{labels.companyB}</span>
          <span className="rounded-md border border-white/10 px-2 py-1 text-[11px] text-zinc-500">{labels.dataBubble}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-500">{textFor(isArabic, "Needs its own separate link", "تحتاج رابطاً منفصلاً خاصاً بها")}</span>
        </div>
      </div>
    </section>
  );
}

function PublicDocsVisual({ isArabic }: { isArabic: boolean }) {
  const items = [
    {
      icon: Globe2,
      title: textFor(isArabic, "Public guide", "دليل عام"),
      description: textFor(isArabic, "Anyone can read the setup steps.", "أي شخص يستطيع قراءة خطوات الإعداد."),
    },
    {
      icon: Settings2,
      title: textFor(isArabic, "Dashboard controls", "تحكم لوحة الإدارة"),
      description: textFor(isArabic, "Only admins create or change real access.", "المسؤولون فقط ينشئون أو يغيرون الوصول الفعلي."),
    },
    {
      icon: LockKeyhole,
      title: textFor(isArabic, "Private workspace", "مساحة عمل خاصة"),
      description: textFor(isArabic, "Company records stay behind permissions.", "سجلات الشركة تبقى خلف الصلاحيات."),
    },
  ];

  return (
    <section className={visualShellClassName}>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <TopicCard key={item.title} icon={item.icon} title={item.title} tone={item.icon === LockKeyhole ? "red" : item.icon === Settings2 ? "green" : "neutral"}>
            {item.description}
          </TopicCard>
        ))}
      </div>
    </section>
  );
}

function EndpointVisual({ isArabic }: { isArabic: boolean }) {
  return (
    <section className={visualShellClassName}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <TopicCard icon={DoorOpen} title={textFor(isArabic, "One controlled doorway", "باب مضبوط واحد")} tone="green">
          {textFor(
            isArabic,
            "The agent knocks on this link whenever it needs approved Qentrah tools.",
            "الوكيل يستخدم هذا الرابط كلما احتاج أدوات كانترا المسموحة.",
          )}
        </TopicCard>
        <div className={subtlePanelClassName}>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <TerminalSquare className="h-4 w-4 text-emerald-300" />
            MCP server URL
          </div>
          <div className="mt-3 break-all rounded-xl border border-white/10 bg-[#070707] p-3 font-mono text-xs leading-6 text-zinc-200">
            https://your-domain.com/api/mcp/agent/PUBLIC_ID/SECRET
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-200">
            <KeyRound className="h-3.5 w-3.5" />
            {textFor(isArabic, "The SECRET part makes the full URL private.", "جزء SECRET يجعل الرابط الكامل سرياً.")}
          </div>
        </div>
      </div>
    </section>
  );
}

function CreateFlowVisual({ copy }: { copy: DocsCopy }) {
  const icons = [Building2, DoorOpen, ShieldCheck, MessageSquareText, RotateCcw];

  return (
    <section className={visualShellClassName}>
      <div className="grid gap-3 md:grid-cols-5">
        {copy.steps.map((step, index) => {
          const Icon = icons[index] ?? CheckCircle2;
          return (
            <div key={step.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <IconBadge icon={Icon} tone={index === 2 ? "green" : "neutral"} />
                <span className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="mt-4 text-sm font-black text-white">{step.title}</h2>
              <p className="mt-2 text-xs font-medium leading-5 text-zinc-500">{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PermissionsVisual({ copy, isArabic }: { copy: DocsCopy; isArabic: boolean }) {
  const sampleRows = copy.permissionRows.slice(0, 4);

  return (
    <section className={visualShellClassName}>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <TopicCard icon={Eye} title={textFor(isArabic, "What the agent sees", "ما يراه الوكيل")} tone="green">
          {textFor(
            isArabic,
            "Only switched-on resources become tools. Everything else is invisible to the agent.",
            "الموارد المفعلة فقط تصبح أدوات. كل شيء آخر يبقى غير مرئي للوكيل.",
          )}
        </TopicCard>
        <div className="grid gap-2">
          {sampleRows.map((row, index) => (
            <div key={row.resource} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <div>
                <p className="text-sm font-black text-white">{row.resource}</p>
                <p className="text-xs font-medium text-zinc-500">{row.bestFor}</p>
              </div>
              <span className={cn("h-6 w-11 rounded-full border p-0.5", index < 3 ? "border-emerald-400/30 bg-emerald-400/20" : "border-white/10 bg-white/5")}>
                <span className={cn("block h-5 w-5 rounded-full bg-white transition", index < 3 && "ms-auto bg-emerald-200")} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCloudVisual({ isArabic }: { isArabic: boolean }) {
  const agents = ["ChatGPT", "Claude", "Grok", "Codex", "Cursor"];

  return (
    <section className={visualShellClassName}>
      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
            {textFor(isArabic, "One pattern, many agents", "نمط واحد، وكلاء متعددون")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {agents.map((agent) => (
              <div key={agent} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
                <Bot className="h-4 w-4 text-zinc-300" />
                <span className="text-sm font-black text-white">{agent}</span>
              </div>
            ))}
          </div>
        </div>
        <TopicCard icon={Workflow} title={textFor(isArabic, "Best practice", "أفضل ممارسة")} tone="green">
          {textFor(
            isArabic,
            "Create a separate Qentrah link for each agent or job, so you can pause one workflow without breaking the rest.",
            "أنشئ رابط كانترا منفصلاً لكل وكيل أو وظيفة، حتى تستطيع إيقاف سير عمل واحد بدون تعطيل البقية.",
          )}
        </TopicCard>
      </div>
    </section>
  );
}

function SecurityVisual({ copy }: { copy: DocsCopy }) {
  const icons = [KeyRound, DoorOpen, ShieldCheck, RotateCcw];
  const tones: Array<"amber" | "neutral" | "green"> = ["amber", "neutral", "green", "amber"];

  return (
    <section className={visualShellClassName}>
      <div className="grid gap-4 md:grid-cols-4">
        {copy.securityItems.map((item, index) => {
          const Icon = icons[index] ?? ShieldCheck;
          return (
            <TopicCard key={item.title} icon={Icon} title={item.title} tone={tones[index] ?? "neutral"}>
              {item.description}
            </TopicCard>
          );
        })}
      </div>
    </section>
  );
}

function TroubleshootingVisual({ copy }: { copy: DocsCopy }) {
  return (
    <section className={visualShellClassName}>
      <div className="grid gap-3 md:grid-cols-2">
        {copy.troubleshootItems.map((item) => (
          <div key={item.issue} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex gap-3">
              <IconBadge icon={AlertTriangle} tone="amber" />
              <div>
                <h2 className="text-sm font-black text-white">{item.issue}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">{item.fix}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewTopic({ copy, locale }: { copy: DocsCopy; locale: Locale }) {
  const isArabic = locale === "ar";

  return (
    <div className="space-y-6">
      <DataBubbleVisual isArabic={isArabic} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <TextTopic paragraphs={copy.overviewBody} />
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            {copy.quickFactsTitle}
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-50/80">
            {copy.quickFacts.map((fact) => (
              <li key={fact} className="flex gap-2">
                <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={panelClassName}>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">{copy.nextTopics}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {docsTopics.slice(1, 4).map((topic) => (
            <Link
              key={topic.slug}
              href={topicHref(topic.slug)}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.018] p-4 transition hover:bg-white/[0.06]"
            >
              <p className="text-sm font-black text-white">{topic.label[locale]}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">{topic.description[locale]}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateLinkTopic({ copy }: { copy: DocsCopy }) {
  return (
    <div className="space-y-6">
      <CreateFlowVisual copy={copy} />
      <section className={panelClassName}>
        <p className="max-w-3xl text-sm font-medium leading-7 text-zinc-400">{copy.stepsIntro}</p>
        <ol className="mt-6 border-s border-white/10">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="relative pb-7 ps-6 last:pb-0">
              <span className="absolute -start-[13px] flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-[#111111] text-[11px] font-black text-zinc-200">
                {index + 1}
              </span>
              <h2 className="text-sm font-black text-white">{step.title}</h2>
              <p className="mt-1 text-sm font-medium leading-7 text-zinc-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function PermissionsTopic({ copy, isArabic }: { copy: DocsCopy; isArabic: boolean }) {
  return (
    <div className="space-y-6">
      <PermissionsVisual copy={copy} isArabic={isArabic} />
      <section className={panelClassName}>
        <p className="max-w-3xl text-sm font-medium leading-7 text-zinc-400">{copy.permissionsDescription}</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="hidden grid-cols-[0.75fr_1.3fr_0.95fr] bg-white/[0.04] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 md:grid">
            <span>{isArabic ? "المورد" : "Resource"}</span>
            <span>{isArabic ? "الاستخدام" : "Best for"}</span>
            <span>{isArabic ? "الإجراءات" : "Actions"}</span>
          </div>
          {copy.permissionRows.map((row) => (
            <div
              key={row.resource}
              className="grid grid-cols-1 gap-2 border-t border-white/10 px-4 py-4 text-sm first:border-t-0 md:grid-cols-[0.75fr_1.3fr_0.95fr] md:first:border-t"
            >
              <span className="font-black text-white">{row.resource}</span>
              <span className="font-medium text-zinc-400">{row.bestFor}</span>
              <span className="font-mono text-xs text-zinc-500">{row.actions}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExamplesTopic({ copy, isArabic }: { copy: DocsCopy; isArabic: boolean }) {
  return (
    <div className="space-y-6">
      <AgentCloudVisual isArabic={isArabic} />
      <section className={panelClassName}>
        <p className="max-w-3xl text-sm font-medium leading-7 text-zinc-400">{copy.examplesDescription}</p>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">{copy.technicalSetup}</p>
        <div className="mt-4 space-y-5">
          {copy.examples.map((example) => (
            <div key={example.name} className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.018] p-4">
              <div className="flex items-start gap-3">
                <IconBadge icon={Code2} />
                <div className="min-w-0">
                  <h2 className="text-base font-black text-white">{example.name}</h2>
                  <p className="mt-1 text-sm font-medium leading-6 text-zinc-400">{example.description}</p>
                </div>
              </div>
              <div className="mt-4">
                <CodeBlock>{example.code}</CodeBlock>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReferencesTopic({ copy }: { copy: DocsCopy }) {
  return (
    <section className={panelClassName}>
      <p className="max-w-3xl text-sm font-medium leading-7 text-zinc-400">{copy.referencesDescription}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {references.map(([label, href]) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.018] p-4 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <span>{label}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
}

function TopicContent({
  topicSlug,
  copy,
  locale,
  isArabic,
}: {
  topicSlug: DocsTopicSlug;
  copy: DocsCopy;
  locale: Locale;
  isArabic: boolean;
}) {
  switch (topicSlug) {
    case "overview":
      return <OverviewTopic copy={copy} locale={locale} />;
    case "why-public":
      return (
        <div className="space-y-6">
          <PublicDocsVisual isArabic={isArabic} />
          <TextTopic paragraphs={copy.whyPublicBody} />
        </div>
      );
    case "endpoint":
      return (
        <div className="space-y-6">
          <EndpointVisual isArabic={isArabic} />
          <TextTopic paragraphs={copy.endpointBody} />
        </div>
      );
    case "create-link":
      return <CreateLinkTopic copy={copy} />;
    case "permissions":
      return <PermissionsTopic copy={copy} isArabic={isArabic} />;
    case "examples":
      return <ExamplesTopic copy={copy} isArabic={isArabic} />;
    case "security":
      return (
        <div className="space-y-6">
          <SecurityVisual copy={copy} />
          <TextTopic paragraphs={[copy.securityDescription]} />
        </div>
      );
    case "troubleshooting":
      return (
        <div className="space-y-6">
          <TroubleshootingVisual copy={copy} />
          <TextTopic paragraphs={[copy.troubleshootDescription]} />
        </div>
      );
    case "references":
      return <ReferencesTopic copy={copy} />;
  }
}

export function McpDocsPage({
  locale,
  topicSlug,
}: {
  locale: string;
  topicSlug: DocsTopicSlug;
}) {
  const activeLocale = localeKey(locale);
  const copy = copyByLocale[activeLocale];
  const topic = topicBySlug(topicSlug);
  const isArabic = activeLocale === "ar";

  return (
    <main dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-[#0A0A0A] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#0A0A0A]/95 px-4 backdrop-blur lg:px-6">
        <div className="flex h-16 w-full items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-zinc-950">
              <FileText className="h-4 w-4" />
            </span>
            <span>{copy.sidebarTitle}</span>
          </Link>

          <div className="hidden h-9 min-w-0 max-w-xl flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-zinc-500 md:flex">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">{copy.search}</span>
            <kbd className="ms-auto rounded-lg border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] text-zinc-400">/</kbd>
          </div>

          <nav className="ms-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 text-xs font-medium text-zinc-500 sm:flex">
              <Languages className="h-4 w-4" />
              {copy.language}
            </span>
            <Link
              href={topicHref(topicSlug)}
              locale="en"
              className={cn(
                "rounded-md px-3 py-2 text-xs font-semibold transition",
                activeLocale === "en" ? "bg-white text-zinc-950" : "text-zinc-500 hover:bg-white/10 hover:text-white",
              )}
            >
              EN
            </Link>
            <Link
              href={topicHref(topicSlug)}
              locale="ar"
              className={cn(
                "rounded-md px-3 py-2 text-xs font-semibold transition",
                activeLocale === "ar" ? "bg-white text-zinc-950" : "text-zinc-500 hover:bg-white/10 hover:text-white",
              )}
            >
              عربي
            </Link>
            <Link
              href="/sign-in"
              className="hidden rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-white/10 sm:inline-flex"
            >
              {copy.dashboard}
            </Link>
          </nav>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 lg:grid-cols-[296px_minmax(0,1fr)]">
        <aside className="hidden border-e border-white/[0.07] bg-[#0D0D0D] px-4 py-8 lg:block">
          <div className="sticky top-24">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">{copy.sidebarTitle}</p>
            <nav className="space-y-1">
              {docsTopics.map((item) => (
                <Link
                  key={item.slug}
                  href={topicHref(item.slug)}
                  data-active={item.slug === topicSlug}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition",
                    item.slug === topicSlug ? "bg-white text-zinc-950" : "text-zinc-500 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <span className="truncate">{item.label[activeLocale]}</span>
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", item.slug === topicSlug ? "text-zinc-950" : "text-zinc-400", isArabic && "rotate-180")} />
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="min-w-0 bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {docsTopics.map((item) => (
              <Link
                key={item.slug}
                href={topicHref(item.slug)}
                data-active={item.slug === topicSlug}
                className={cn(
                  "shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold",
                  item.slug === topicSlug ? "border-white bg-white text-zinc-950" : "border-white/10 bg-white/[0.04] text-zinc-300",
                )}
              >
                {item.label[activeLocale]}
              </Link>
            ))}
          </div>

          <div className="max-w-[1180px] space-y-6">
            <PageHeader topic={topic} copy={copy} locale={activeLocale} />
            <TopicContent topicSlug={topicSlug} copy={copy} locale={activeLocale} isArabic={isArabic} />
          </div>
        </article>
      </div>
    </main>
  );
}
