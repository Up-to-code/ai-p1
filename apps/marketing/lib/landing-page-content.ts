import type { Locale } from "./content";

const platformStoryCopy = {
  en: {
    contextTitle: "Work loses momentum when context is scattered.",
    contextBody: "Projects, tasks, decisions, files, and conversations should move together—not disappear across disconnected tools.",
    contextImageAlt: "Disconnected tools and scattered work create gaps in team context",
    pains: [
      ["Context switching", "Teams jump between messages, files, and task lists."],
      ["Context missing", "People and AI act without the full workspace history."],
      ["Context stitching", "Hours are spent rebuilding what happened and what comes next."],
    ],
    platformTitle: "Everything your team needs in one connected workspace",
    platformBody: "Spaces, projects, tasks, documents, communication, and AI share the same operating context.",
    agentKicker: "SCOPED AI AGENTS",
    agentTitle: "AI that works inside your workspace—not beside it.",
    agentBody: "Qentrah AI understands your spaces, projects, tasks, documents, and conversations, then acts only within the permissions your team controls.",
    buildAgent: "Explore AI agents",
    learn: "Read the docs",
    agentCapabilities: [
      ["Workspace memory", "Keeps the decisions, preferences, and project history that make every next action more useful."],
      ["Context intelligence", "Understands how spaces, projects, tasks, documents, and conversations connect."],
      ["Team-aware", "Works from the same live operating context your people use—not an isolated chat window."],
      ["Connected tools + MCP", "Brings approved external tools into the workflow through a clear, extensible protocol."],
      ["Scoped execution", "Acts only inside the spaces, projects, and permissions explicitly granted to it."],
      ["Deep workspace search", "Finds answers across connected work without forcing your team to rebuild the brief."],
    ],
  },
  ar: {
    contextTitle: "يفقد العمل زخمه عندما يتشتت السياق.",
    contextBody: "يجب أن تتحرك المشاريع والمهام والقرارات والملفات والمحادثات معاً، لا أن تضيع بين أدوات منفصلة.",
    contextImageAlt: "أدوات منفصلة وعمل متشتت يصنعان فجوات في سياق الفريق",
    pains: [
      ["التنقل بين السياقات", "يتنقل الفريق بين الرسائل والملفات وقوائم المهام."],
      ["سياق مفقود", "يتصرف الأشخاص والذكاء الاصطناعي دون تاريخ مساحة العمل الكامل."],
      ["إعادة تركيب السياق", "يضيع الوقت في معرفة ما حدث وما هي الخطوة التالية."],
    ],
    platformTitle: "كل ما يحتاجه فريقك في مساحة عمل مترابطة",
    platformBody: "تشترك المساحات والمشاريع والمهام والمستندات والتواصل والذكاء الاصطناعي في سياق تشغيل واحد.",
    agentKicker: "وكلاء ذكاء ضمن النطاق",
    agentTitle: "ذكاء يعمل داخل مساحة عملك، لا بجانبها.",
    agentBody: "يفهم ذكاء قنترة مساحاتك ومشاريعك ومهامك ومستنداتك ومحادثاتك، ثم يعمل فقط داخل الصلاحيات التي يتحكم بها فريقك.",
    buildAgent: "استكشف وكلاء الذكاء",
    learn: "اقرأ الوثائق",
    agentCapabilities: [
      ["ذاكرة مساحة العمل", "يحفظ القرارات والتفضيلات وسجل المشاريع ليجعل كل خطوة تالية أكثر فائدة."],
      ["ذكاء السياق", "يفهم كيف ترتبط المساحات والمشاريع والمهام والمستندات والمحادثات."],
      ["مدرك للفريق", "يعمل من نفس سياق التشغيل المباشر الذي يستخدمه فريقك، لا من نافذة محادثة معزولة."],
      ["أدوات متصلة وMCP", "يربط الأدوات الخارجية المعتمدة بسير العمل عبر بروتوكول واضح وقابل للتوسع."],
      ["تنفيذ ضمن النطاق", "يتصرف فقط داخل المساحات والمشاريع والصلاحيات الممنوحة له بوضوح."],
      ["بحث عميق", "يجد الإجابات عبر العمل المترابط دون إجبار الفريق على إعادة بناء الملخص."],
    ],
  },
  fr: {
    contextTitle: "Le travail ralentit quand le contexte est dispersé.",
    contextBody: "Projets, tâches, décisions, fichiers et conversations doivent avancer ensemble, pas disparaître entre des outils isolés.",
    contextImageAlt: "Des outils isolés et un travail dispersé créent des ruptures de contexte",
    pains: [
      ["Changement de contexte", "L’équipe passe sans cesse des messages aux fichiers et aux tâches."],
      ["Contexte manquant", "Les personnes et l’IA agissent sans l’historique complet de l’espace."],
      ["Contexte à reconstruire", "Des heures sont perdues à comprendre ce qui s’est passé et la suite."],
    ],
    platformTitle: "Tout ce dont votre équipe a besoin dans un espace connecté",
    platformBody: "Espaces, projets, tâches, documents, communication et IA partagent le même contexte opérationnel.",
    agentKicker: "AGENTS IA CADRÉS",
    agentTitle: "Une IA qui travaille dans votre espace, pas à côté.",
    agentBody: "L’IA Qentrah comprend vos espaces, projets, tâches, documents et conversations, puis agit dans les limites définies par votre équipe.",
    buildAgent: "Découvrir les agents",
    learn: "Lire la documentation",
    agentCapabilities: [
      ["Mémoire de l’espace", "Conserve décisions, préférences et historique projet pour améliorer chaque action suivante."],
      ["Intelligence contextuelle", "Comprend les liens entre espaces, projets, tâches, documents et conversations."],
      ["Conscient de l’équipe", "Travaille dans le même contexte opérationnel que votre équipe, pas dans un chat isolé."],
      ["Outils connectés + MCP", "Intègre les outils externes approuvés via un protocole clair et extensible."],
      ["Exécution cadrée", "Agit uniquement dans les espaces, projets et permissions qui lui sont accordés."],
      ["Recherche approfondie", "Retrouve les réponses dans le travail connecté sans reconstruire le brief."],
    ],
  },
} as const;

const aiOutcomesCopy = {
  en: {
    solutionsTitle: "One workspace for every team and workflow",
    solutionsBody: "Move between spaces, projects, tasks, and AI without rebuilding context.",
    solution: {
      kicker: "CONNECTED WORKSPACE",
      title: "Plan, execute, and understand work from one operating system.",
      body: "Qentrah gives every person and agent the same live context across spaces, projects, tasks, documents, and activity.",
      bullets: ["Structure work with spaces and projects", "Surface priorities, risks, and blocked tasks", "Keep knowledge and execution connected"],
      agents: ["Planning agent turns goals into next steps", "Assignment agent suggests owners", "Progress agent tracks blockers and milestones", "Answers agent finds the latest context"],
    },
    outcomesTitle: "More momentum, without adding more tools",
    outcomesKicker: "CONNECTED IMPACT",
    outcomesBody: "A connected operating layer reduces the invisible work between requests, decisions, and delivery.",
    outcomes: [
      ["Less switching", "Spaces, projects, tasks, documents, messages, and AI live in one operating context."],
      ["Faster handoffs", "Ownership, history, and the next action travel together."],
      ["Clearer scope", "People and agents see only the spaces and work they are allowed to access."],
      ["Reusable systems", "Turn recurring delivery patterns into templates, automations, and agent workflows."],
    ],
    storiesTitle: "Built around the work every team repeats",
    storiesBody: "Connected operating loops, one shared source of truth.",
    stories: [
      ["Client intake", "Turn a request into a structured brief, linked client record, and ready-to-plan project."],
      ["Active delivery", "Keep tasks, decisions, files, approvals, and team communication beside the work."],
      ["Review and handoff", "Package the latest context for the client, the next owner, or a scoped AI agent."],
    ],
    explore: "Explore the workspace",
  },
  ar: {
    solutionsTitle: "مساحة واحدة لكل فريق ومسار عمل",
    solutionsBody: "تنقل بين المساحات والمشاريع والمهام والذكاء دون إعادة بناء السياق.",
    solution: { kicker: "مساحة عمل مترابطة", title: "خطط ونفّذ وافهم العمل من نظام تشغيل واحد.", body: "تمنح قنترة كل شخص ووكيل نفس السياق المباشر عبر المساحات والمشاريع والمهام والمستندات والنشاط.", bullets: ["نظّم العمل بالمساحات والمشاريع", "اكشف الأولويات والمخاطر والمهام المتعطلة", "اربط المعرفة بالتنفيذ"], agents: ["وكيل التخطيط يحول الأهداف إلى خطوات", "وكيل التعيين يقترح المسؤولين", "وكيل التقدم يتابع العوائق والمراحل", "وكيل الإجابات يجد أحدث سياق"] },
    outcomesTitle: "زخم أكبر، دون أدوات أكثر",
    outcomesKicker: "أثر العمل المترابط",
    outcomesBody: "تقلل طبقة التشغيل المترابطة العمل الخفي بين الطلبات والقرارات والتسليم.",
    outcomes: [["تنقل أقل", "المشاريع والعملاء والمستندات والرسائل والذكاء في سياق واحد."], ["تسليم أسرع", "تنتقل الملكية والسجل والخطوة التالية معاً."], ["نطاق أوضح", "يرى الأشخاص والوكلاء فقط المساحات والعمل المسموح لهم به."], ["أنظمة قابلة للتكرار", "حوّل أنماط التسليم المتكررة إلى قوالب وأتمتة ومسارات وكلاء."]],
    storiesTitle: "مصمم حول العمل الذي يكرره كل فريق",
    storiesBody: "حلقات تشغيل مترابطة ومصدر حقيقة واحد.",
    stories: [["استقبال العميل", "حوّل الطلب إلى ملخص منظم وسجل عميل ومشروع جاهز للتخطيط."], ["التسليم النشط", "اجمع المهام والقرارات والملفات والموافقات والتواصل بجانب العمل."], ["المراجعة والتسليم", "جهز أحدث سياق للعميل أو المسؤول التالي أو وكيل ذكاء محدد النطاق."]],
    explore: "استكشف مساحة العمل",
  },
  fr: {
    solutionsTitle: "Un espace pour chaque équipe et processus",
    solutionsBody: "Passez des espaces aux projets, tâches et agents sans reconstruire le contexte.",
    solution: { kicker: "ESPACE CONNECTÉ", title: "Planifiez, exécutez et comprenez le travail dans un seul système.", body: "Qentrah donne aux personnes et aux agents le même contexte en direct sur les espaces, projets, tâches, documents et activités.", bullets: ["Structurer le travail par espaces et projets", "Détecter priorités, risques et blocages", "Relier connaissance et exécution"], agents: ["L’agent de planification transforme les objectifs", "L’agent d’affectation propose les responsables", "L’agent de suivi surveille les blocages", "L’agent de réponses retrouve le contexte"] },
    outcomesTitle: "Plus d’élan, sans ajouter d’outils",
    outcomesKicker: "IMPACT CONNECTÉ",
    outcomesBody: "Une couche opérationnelle connectée réduit le travail invisible entre demande, décision et livraison.",
    outcomes: [["Moins de bascule", "Projets, clients, documents, messages et IA partagent un contexte."], ["Relais plus rapides", "Responsabilité, historique et prochaine action restent ensemble."], ["Périmètre clair", "Personnes et agents ne voient que les espaces autorisés."], ["Systèmes réutilisables", "Transformez les routines en modèles, automatisations et agents."]],
    storiesTitle: "Conçu autour du travail répété chaque semaine",
    storiesBody: "Trois boucles opérationnelles, une source de vérité.",
    stories: [["Intake client", "Transformez une demande en brief, fiche client et projet prêt à planifier."], ["Livraison active", "Gardez tâches, décisions, fichiers, validations et échanges avec le travail."], ["Revue et relais", "Préparez le contexte pour le client, le prochain responsable ou un agent cadré."]],
    explore: "Découvrir l’espace",
  },
} as const;

const trustCopy = {
  en: {
    kicker: "Security",
    title: "Security & privacy, built into the workspace",
    body: "Qentrah keeps people, projects, and AI actions inside explicit workspace boundaries so every handoff stays controlled and understandable.",
    items: [
      ["Your workspace stays yours", "Space, project, task, and document context remains attached to the organization it belongs to."],
      ["Permission-aware access", "People and agents see only the spaces, projects, and resources their role permits."],
      ["Scoped agent execution", "AI actions run within deliberately granted tools and boundaries instead of unrestricted access."],
    ],
    assurance: "Qentrah is designed around explicit ownership, permissions, and scoped execution.",
    marks: ["Role-based", "Scoped AI"],
  },
  ar: {
    kicker: "الأمان",
    title: "الأمان والخصوصية مدمجان في مساحة العمل",
    body: "تبقي قنترة الأشخاص والمشاريع وإجراءات الذكاء داخل حدود واضحة، لتظل كل عملية تسليم مفهومة وتحت السيطرة.",
    items: [["مساحة عملك تبقى لك", "يبقى سياق المساحة والمشروع والمهمة والمستند مرتبطاً بالمؤسسة التي ينتمي إليها."], ["وصول مدرك للصلاحيات", "لا يرى الأشخاص والوكلاء إلا المساحات والمشاريع والموارد المسموحة لأدوارهم."], ["تنفيذ وكلاء محدد النطاق", "تعمل إجراءات الذكاء ضمن أدوات وحدود ممنوحة بوضوح، لا بوصول غير مقيد."]],
    assurance: "صُممت قنترة حول الملكية الواضحة والصلاحيات والتنفيذ محدد النطاق.",
    marks: ["حسب الدور", "ذكاء محدد النطاق"],
  },
  fr: {
    kicker: "Sécurité",
    title: "Sécurité et confidentialité intégrées à l’espace de travail",
    body: "Qentrah maintient personnes, projets et actions IA dans des limites explicites pour garder chaque relais contrôlé et compréhensible.",
    items: [["Votre espace reste le vôtre", "Le contexte des espaces, projets, tâches et documents reste lié à son organisation."], ["Accès selon les permissions", "Personnes et agents ne voient que les espaces, projets et ressources autorisés par leur rôle."], ["Exécution IA cadrée", "Les actions IA s’exécutent uniquement avec les outils et limites explicitement accordés."]],
    assurance: "Qentrah repose sur une propriété explicite, des permissions claires et une exécution cadrée.",
    marks: ["Selon le rôle", "IA cadrée"],
  },
} as const;

const ctaCopy = {
  en: {
    kicker: "YOUR WORKSPACE STARTS HERE",
    title: "Ready to bring your team’s work into one place?",
    body: "Bring your spaces, projects, tasks, documents, and AI agents into one connected operating workspace.",
    primary: "Start your workspace",
    sales: "Talk to sales",
    note: "Free to start. No credit card required.",
    points: ["Create your first space", "Invite your team", "Keep every decision in context"],
    visualLabel: "CONNECTED WORKSPACE",
    visualTitle: "Everything moves together",
  },
  ar: {
    kicker: "مساحة عملك تبدأ هنا",
    title: "جاهز لتجمع عمل فريقك في مكان واحد؟",
    body: "اجمع مساحاتك ومشاريعك ومهامك ومستنداتك ووكلاء الذكاء في مساحة تشغيل مترابطة.",
    primary: "أنشئ مساحة عملك",
    sales: "تحدث إلى المبيعات",
    note: "ابدأ مجاناً. لا تحتاج إلى بطاقة ائتمان.",
    points: ["أنشئ مساحتك الأولى", "ادعُ فريقك", "احتفظ بسياق كل قرار"],
    visualLabel: "مساحة عمل مترابطة",
    visualTitle: "كل شيء يتحرك معاً",
  },
  fr: {
    kicker: "VOTRE ESPACE COMMENCE ICI",
    title: "Prêt à réunir le travail de votre équipe ?",
    body: "Réunissez espaces, projets, tâches, documents et agents IA dans un environnement opérationnel connecté.",
    primary: "Créer mon espace",
    sales: "Contacter l’équipe",
    note: "Commencez gratuitement. Aucune carte bancaire requise.",
    points: ["Créez votre premier espace", "Invitez votre équipe", "Gardez chaque décision en contexte"],
    visualLabel: "ESPACE CONNECTÉ",
    visualTitle: "Tout avance ensemble",
  },
} as const;

function toolBrand(name: string, url: string) {
  return {
    name,
    url,
    image: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=128`,
  };
}

const landingSupportCopy = {
  en: {
    workspaceCells: ["Connected search", "Tasks", "Spaces", "Calendar", "Approvals", "Inbox", "Forms", "Dashboards", "Workflows", "Team spaces", "Reminders", "Project planning", "Team members", "Docs", "Projects", "Goals", "Project status", "Knowledge", "AI agents", "Communication", "Deep search", "Dependencies", "Milestones", "Activity history", "Automations", "Permissions", "Linked work", "Insights", "Templates", "Handoffs", "Scoped access", "MCP tools"],
    solutionTabs: ["Projects", "Team spaces", "Tasks", "Automations", "Insights"],
    showcaseImageAlt: "Connected workspace with projects, tasks, owners, and team navigation",
    logoCloud: {
      label: "Connect the tools your team already uses",
      items: [
        toolBrand("WhatsApp", "https://www.whatsapp.com/"), toolBrand("Telegram", "https://telegram.org/"), toolBrand("n8n", "https://n8n.io/"), toolBrand("Zapier", "https://zapier.com"), toolBrand("Slack", "https://slack.com"), toolBrand("HubSpot", "https://www.hubspot.com/"), toolBrand("Google Sheets", "https://www.google.com/sheets/about/"), toolBrand("Airtable", "https://airtable.com/"), toolBrand("Notion", "https://www.notion.so/"), toolBrand("Webhooks", "https://webhook.site/"),
      ],
    },
    faq: {
      eyebrow: "FREQUENTLY ASKED QUESTIONS",
      title: "Before you bring the team in.",
      description: "Clear answers for evaluating Qentrah as your team's connected workspace.",
      items: [
        ["Who is Qentrah for?", "Qentrah is built for teams that want spaces, projects, tasks, documents, and operations in one connected workspace."],
        ["How do we get started?", "Create an organization, add a team space, and structure projects, tasks, and documents as your work grows."],
        ["Can several teams share the same information?", "Yes. Spaces and projects give each team the context it needs while roles and permissions control access."],
        ["How does pricing work?", "Start on Free, then upgrade the organization when you need more capacity, AI credits, automation, or advanced controls."],
        ["How does Qentrah protect workspace context?", "Organization, space, and project permissions apply to people, agents, integrations, and every scoped action."],
      ],
    },
  },
  ar: {
    workspaceCells: ["بحث مترابط", "المهام", "المساحات", "التقويم", "الموافقات", "البريد الوارد", "النماذج", "لوحات المعلومات", "مسارات العمل", "مساحات الفريق", "التذكيرات", "تخطيط المشاريع", "أعضاء الفريق", "المستندات", "المشاريع", "الأهداف", "حالة المشروع", "المعرفة", "وكلاء الذكاء", "التواصل", "البحث العميق", "الاعتماديات", "المراحل الرئيسية", "سجل النشاط", "الأتمتة", "الصلاحيات", "العمل المترابط", "الرؤى", "القوالب", "عمليات التسليم", "وصول محدد النطاق", "أدوات MCP"],
    solutionTabs: ["المشاريع", "مساحات الفريق", "المهام", "الأتمتة", "الرؤى"],
    showcaseImageAlt: "مساحة عمل مترابطة تعرض المشاريع والمهام والمسؤولين وتنقل الفريق",
    logoCloud: {
      label: "اربط الأدوات التي يستخدمها فريقك بالفعل",
      items: [toolBrand("واتساب", "https://www.whatsapp.com/"), toolBrand("تيليجرام", "https://telegram.org/"), toolBrand("n8n", "https://n8n.io/"), toolBrand("Zapier", "https://zapier.com"), toolBrand("Slack", "https://slack.com"), toolBrand("HubSpot", "https://www.hubspot.com/"), toolBrand("Google Sheets", "https://www.google.com/sheets/about/"), toolBrand("Airtable", "https://airtable.com/"), toolBrand("Notion", "https://www.notion.so/"), toolBrand("Webhooks", "https://webhook.site/")],
    },
    faq: {
      eyebrow: "الأسئلة الشائعة",
      title: "قبل أن تجمع فريقك.",
      description: "إجابات واضحة تساعدك على تقييم قنترة كمساحة عمل مترابطة لفريقك.",
      items: [
        ["لمن صُممت قنترة؟", "صُممت قنترة للفرق التي تريد تنظيم المساحات والمشاريع والمهام والمستندات والعمليات في مساحة مترابطة."],
        ["كيف نبدأ؟", "أنشئ مؤسسة، وأضف مساحة للفريق، ثم نظّم المشاريع والمهام والمستندات مع نمو العمل."],
        ["هل يمكن لعدة فرق مشاركة المعلومات نفسها؟", "نعم. تمنح المساحات والمشاريع كل فريق السياق الذي يحتاجه، بينما تتحكم الأدوار والصلاحيات في الوصول."],
        ["كيف يعمل التسعير؟", "ابدأ بالخطة المجانية، ثم رقِّ المؤسسة عندما تحتاج إلى سعة أكبر أو أرصدة ذكاء أو أتمتة أو ضوابط متقدمة."],
        ["كيف تحمي قنترة سياق مساحة العمل؟", "تنطبق صلاحيات المؤسسة والمساحة والمشروع على الأشخاص والوكلاء والتكاملات وكل إجراء محدد النطاق."],
      ],
    },
  },
  fr: {
    workspaceCells: ["Recherche connectée", "Tâches", "Espaces", "Calendrier", "Validations", "Boîte de réception", "Formulaires", "Tableaux de bord", "Flux de travail", "Espaces d’équipe", "Rappels", "Planification", "Membres", "Documents", "Projets", "Objectifs", "Statut projet", "Connaissance", "Agents IA", "Communication", "Recherche avancée", "Dépendances", "Jalons", "Historique", "Automatisations", "Autorisations", "Travail relié", "Analyses", "Modèles", "Relais", "Accès cadré", "Outils MCP"],
    solutionTabs: ["Projets", "Espaces d’équipe", "Tâches", "Automatisations", "Analyses"],
    showcaseImageAlt: "Espace connecté avec projets, tâches, responsables et navigation d’équipe",
    logoCloud: {
      label: "Connectez les outils déjà utilisés par votre équipe",
      items: [toolBrand("WhatsApp", "https://www.whatsapp.com/"), toolBrand("Telegram", "https://telegram.org/"), toolBrand("n8n", "https://n8n.io/"), toolBrand("Zapier", "https://zapier.com"), toolBrand("Slack", "https://slack.com"), toolBrand("HubSpot", "https://www.hubspot.com/"), toolBrand("Google Sheets", "https://www.google.com/sheets/about/"), toolBrand("Airtable", "https://airtable.com/"), toolBrand("Notion", "https://www.notion.so/"), toolBrand("Webhooks", "https://webhook.site/")],
    },
    faq: {
      eyebrow: "QUESTIONS FRÉQUENTES",
      title: "Avant d’installer votre équipe.",
      description: "Des réponses claires pour évaluer Qentrah comme espace de travail connecté.",
      items: [
        ["À qui s’adresse Qentrah ?", "Qentrah est conçu pour les équipes qui veulent réunir espaces, projets, tâches, documents et opérations."],
        ["Comment démarrer ?", "Créez une organisation, ajoutez un espace d’équipe, puis structurez projets, tâches et documents à mesure que le travail évolue."],
        ["Plusieurs équipes peuvent-elles partager les mêmes données ?", "Oui. Les espaces et projets donnent à chacun le contexte nécessaire, avec des rôles et autorisations adaptés."],
        ["Comment fonctionne la tarification ?", "Commencez gratuitement, puis faites évoluer l’organisation lorsque vous avez besoin de capacité, de crédits IA, d’automatisation ou de contrôles avancés."],
        ["Comment Qentrah protège-t-il le contexte ?", "Les permissions d’organisation, d’espace et de projet s’appliquent aux personnes, agents, intégrations et actions cadrées."],
      ],
    },
  },
} as const;

export type LandingPageContent = {
  platformStory: (typeof platformStoryCopy)[Locale];
  aiOutcomes: (typeof aiOutcomesCopy)[Locale];
  trust: (typeof trustCopy)[Locale];
  cta: (typeof ctaCopy)[Locale];
  support: (typeof landingSupportCopy)[Locale];
};

export function getRepositoryLandingPageContent(
  locale: Locale,
): LandingPageContent {
  return {
    platformStory: platformStoryCopy[locale],
    aiOutcomes: aiOutcomesCopy[locale],
    trust: trustCopy[locale],
    cta: ctaCopy[locale],
    support: landingSupportCopy[locale],
  };
}
