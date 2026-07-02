/**
 * Strapi seed script — populates sample content for local development.
 *
 * Run with:
 *   npm --workspace @qentrah/strapi run strapi -- import --file seed-data.tar.gz
 *
 * Or run this script directly after `strapi develop` is running:
 *   npx ts-node -r tsconfig-paths/register scripts/seed.ts
 *
 * Prerequisites:
 *   - Strapi must be running on http://localhost:1337
 *   - Set STRAPI_ADMIN_EMAIL and STRAPI_ADMIN_PASSWORD in .env (or env vars)
 */

const BASE_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL ?? "admin@qentrah.com";
const ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD ?? "Admin1234!";

async function getAdminJwt(): Promise<string> {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Admin login failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { data: { token: string } };
  return json.data.token;
}

async function createApiToken(jwt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/admin/api-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      name: "marketing-read",
      description: "Read-only token for the marketing Next.js app",
      type: "read-only",
      lifespan: null, // never expires
    }),
  });
  if (!res.ok) throw new Error(`Failed to create API token: ${res.status}`);
  const json = (await res.json()) as { data: { accessKey: string } };
  console.log("\n✅ API token created. Add this to apps/marketing/.env.local:");
  console.log(`   STRAPI_API_TOKEN=${json.data.accessKey}\n`);
  return json.data.accessKey;
}

async function post(path: string, token: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} — ${text}`);
  }
  return res.json();
}

async function seed() {
  console.log("🌱 Connecting to Strapi at", BASE_URL, "…");

  const jwt = await getAdminJwt();
  console.log("🔐 Admin authenticated");

  const apiToken = await createApiToken(jwt);

  // ── Pricing plans ────────────────────────────────────────────────────────────
  console.log("💰 Seeding pricing plans…");
  await post("/pricing-plans", apiToken, {
    name: "Starter",
    planId: "starter",
    amount: 0,
    currency: "USD",
    periodDays: 30,
    features: ["Up to 3 projects", "2 team members", "AI suggestions", "Basic analytics"],
    highlighted: false,
    checkoutMode: "provider",
    locale: "en",
  });
  await post("/pricing-plans", apiToken, {
    name: "Pro",
    planId: "pro",
    amount: 49,
    currency: "USD",
    periodDays: 30,
    features: [
      "Unlimited projects",
      "Up to 15 team members",
      "AI agents",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
    checkoutMode: "provider",
    locale: "en",
  });
  await post("/pricing-plans", apiToken, {
    name: "Enterprise",
    planId: "enterprise",
    amount: null,
    currency: "USD",
    periodDays: 30,
    features: [
      "Unlimited everything",
      "Unlimited team members",
      "Custom AI workflows",
      "Dedicated support",
      "SLA guarantee",
      "SSO / SAML",
    ],
    highlighted: false,
    checkoutMode: "contact_sales",
    locale: "en",
  });

  // ── FAQs ─────────────────────────────────────────────────────────────────────
  console.log("❓ Seeding FAQs…");
  const faqs = [
    { question: "Can I change plans later?", answer: "Yes — upgrade or downgrade at any time from your billing settings.", sortOrder: 1 },
    { question: "Is there a free trial?", answer: "The Starter plan is free forever. Pro and Enterprise both include a 14-day trial with no credit card required.", sortOrder: 2 },
    { question: "What payment methods do you accept?", answer: "We accept all major credit cards, as well as bank transfers for annual Enterprise contracts.", sortOrder: 3 },
  ];
  for (const faq of faqs) {
    await post("/faqs", apiToken, { ...faq, locale: "en" });
  }

  // ── Team members ─────────────────────────────────────────────────────────────
  console.log("👥 Seeding team members…");
  await post("/team-members", apiToken, {
    name: "Ahmed Mansour",
    role: "Founder & CEO",
    bio: "Building Qentrah to help agencies and teams work smarter with AI.",
    sortOrder: 1,
    locale: "en",
  });

  // ── Blog posts ───────────────────────────────────────────────────────────────
  console.log("📝 Seeding blog posts…");
  await post("/blog-posts", apiToken, {
    title: "Welcome to Qentrah: Revolutionizing Business Management",
    slug: "welcome-to-qentrah",
    excerpt: "Discover how Qentrah is changing the way agencies and businesses manage their projects, clients, and workflows.",
    body: "Qentrah is an AI-powered workspace designed for modern agencies and businesses. From project management to client pipelines and intelligent automation, we're building the tools that let your team focus on what matters most.",
    author: "Ahmed Mansour",
    authorRole: "Founder & CEO",
    category: "Product",
    tags: ["product", "launch", "ai"],
    readingTime: 4,
    publishedAt: new Date().toISOString(),
    locale: "en",
  });

  // ── Marketing pages ───────────────────────────────────────────────────────────
  console.log("📄 Seeding marketing pages…");
  await post("/marketing-pages", apiToken, {
    title: "Pricing",
    slug: "pricing",
    pageType: "pricing",
    excerpt: "Transparent, flexible pricing that grows with your team.",
    sections: [
      {
        __component: "sections.hero",
        title: "Pricing that grows with you",
        subtitle: "Start free, scale with Pro, or go Enterprise.",
        primaryCtaLabel: "Start free",
        primaryCtaHref: "https://app.qentrah.com/sign-up",
        secondaryCtaLabel: "Contact sales",
        secondaryCtaHref: "/contact",
      },
      {
        __component: "sections.cta-section",
        title: "Ready to get started?",
        description: "Start your free trial today. No credit card required.",
        primaryCtaLabel: "Sign up free",
        primaryCtaHref: "https://app.qentrah.com/sign-up",
        secondaryCtaLabel: "Talk to us",
        secondaryCtaHref: "/contact",
      },
    ],
    locale: "en",
  });

  console.log("\n✅ Seed complete!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
