/**
 * Seed script for Payload CMS
 * Usage: npx tsx apps/marketing/scripts/seed-cms.ts
 */

import { getPayloadClient } from "../lib/payload";

async function seedCMS() {
  console.log("🌱 Starting CMS seed...");

  const payload = await getPayloadClient();

  // Seed Media (placeholder images)
  console.log("📸 Seeding media...");
  const mediaIds: Record<string, number> = {};

  // Note: In production, you would upload actual image files
  // For now, we'll create placeholder references
  // You can manually upload images via the admin panel at /admin

  // Seed Blog Posts
  console.log("📝 Seeding blog posts...");

  const blogPost1En = await payload.create({
    collection: "blog-posts",
    locale: "en",
    data: {
      title: "Welcome to Qentrah: Revolutionizing Business Management",
      slug: "welcome-to-qentrah",
      excerpt:
        "Discover how Qentrah is transforming the way businesses manage their operations, partnerships, and growth strategies in the modern digital landscape.",
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "In today's fast-paced business environment, managing operations efficiently is more critical than ever. Qentrah was born from the need to streamline business processes while maintaining the flexibility modern teams require.",
                },
              ],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "Why Qentrah?" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Traditional business management tools often fall short in addressing the complex needs of today's interconnected business ecosystem. Qentrah bridges this gap by providing a comprehensive platform that integrates seamlessly with your existing workflows.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      author: "Ahmed Mansour",
      authorRole: "Founder & CEO",
      category: "Company News",
      tags: ["announcement", "platform", "business management"],
      readingTime: 5,
      publishedAt: new Date("2024-01-15").toISOString(),
      status: "published",
    },
  });

  const blogPost1Ar = await payload.update({
    collection: "blog-posts",
    id: blogPost1En.id,
    locale: "ar",
    data: {
      title: "مرحباً بكم في قنطرة: ثورة في إدارة الأعمال",
      excerpt:
        "اكتشف كيف تُحدث قنطرة تحولاً في طريقة إدارة الشركات لعملياتها وشراكاتها واستراتيجيات نموها في المشهد الرقمي الحديث.",
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "في بيئة الأعمال سريعة الوتيرة اليوم، أصبحت إدارة العمليات بكفاءة أكثر أهمية من أي وقت مضى. ولدت قنطرة من الحاجة إلى تبسيط العمليات التجارية مع الحفاظ على المرونة التي تحتاجها الفرق الحديثة.",
                },
              ],
            },
          ],
          direction: "rtl",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      author: "أحمد منصور",
      authorRole: "المؤسس والرئيس التنفيذي",
      category: "أخبار الشركة",
      tags: ["إعلان", "منصة", "إدارة أعمال"],
    },
  });

  const blogPost2En = await payload.create({
    collection: "blog-posts",
    locale: "en",
    data: {
      title: "5 Essential Features Every Modern Workspace Needs",
      slug: "essential-workspace-features",
      excerpt:
        "Learn about the must-have features that make a workspace truly productive in 2024, from collaboration tools to automation capabilities.",
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "The modern workspace has evolved beyond simple task management. Today's teams need sophisticated tools that enable seamless collaboration, automation, and data-driven decision making.",
                },
              ],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "1. Real-time Collaboration" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Teams working across different time zones need tools that enable real-time collaboration without friction. Qentrah provides instant updates and notifications to keep everyone in sync.",
                },
              ],
            },
            {
              type: "heading",
              tag: "h2",
              children: [{ type: "text", text: "2. Smart Automation" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Automate repetitive tasks to free up time for strategic work. From workflow automation to smart notifications, modern workspaces should work for you.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      author: "Sarah Johnson",
      authorRole: "Product Manager",
      category: "Product",
      tags: ["features", "productivity", "collaboration"],
      readingTime: 7,
      publishedAt: new Date("2024-02-10").toISOString(),
      status: "published",
    },
  });

  const blogPost3En = await payload.create({
    collection: "blog-posts",
    locale: "en",
    data: {
      title: "How Qentrah Helps Scale Partnership Programs",
      slug: "scale-partnership-programs",
      excerpt:
        "Discover proven strategies and tools for managing and scaling your partnership ecosystem effectively with Qentrah's partnership management features.",
      body: {
        root: {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "Partnership programs are the backbone of business growth, but managing them at scale presents unique challenges. Qentrah's partnership management features are designed to address these challenges head-on.",
                },
              ],
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      },
      author: "Michael Chen",
      authorRole: "Partnerships Lead",
      category: "Partnerships",
      tags: ["partnerships", "growth", "b2b"],
      readingTime: 6,
      publishedAt: new Date("2024-03-05").toISOString(),
      status: "published",
    },
  });

  console.log(`✅ Created ${3} blog posts`);

  // Seed Marketing Pages
  console.log("📄 Seeding marketing pages...");

  const pricingPageEn = await payload.create({
    collection: "marketing-pages",
    locale: "en",
    data: {
      slug: "pricing-cms",
      title: "Pricing Plans",
      status: "published",
      blocks: [
        {
          blockType: "hero",
          heading: "Simple, Transparent Pricing",
          subheading: "Choose the perfect plan for your business needs",
          alignment: "center",
        },
        {
          blockType: "featureGrid",
          heading: "All Plans Include",
          features: [
            {
              title: "Unlimited Workspaces",
              description: "Create as many workspaces as you need",
            },
            {
              title: "24/7 Support",
              description: "Get help whenever you need it",
            },
            {
              title: "Advanced Security",
              description: "Enterprise-grade security for your data",
            },
            {
              title: "API Access",
              description: "Integrate with your existing tools",
            },
          ],
        },
        {
          blockType: "cta",
          heading: "Ready to Get Started?",
          description: "Join thousands of businesses already using Qentrah",
          primaryLink: {
            label: "Start Free Trial",
            url: "https://app.qentrah.com/signup",
            style: "primary",
          },
          secondaryLink: {
            label: "Contact Sales",
            url: "https://app.qentrah.com/contact",
            style: "secondary",
          },
        },
      ],
      seo: {
        title: "Pricing Plans - Qentrah",
        description:
          "Explore Qentrah's flexible pricing plans designed for businesses of all sizes. Start with a free trial and scale as you grow.",
        keywords: "pricing, plans, subscription, business tools, workspace",
      },
    },
  });

  const aboutPageEn = await payload.create({
    collection: "marketing-pages",
    locale: "en",
    data: {
      slug: "about-cms",
      title: "About Qentrah",
      status: "published",
      blocks: [
        {
          blockType: "hero",
          heading: "Building the Future of Business Management",
          subheading:
            "We're on a mission to empower businesses with tools that make work more efficient, collaborative, and impactful.",
          alignment: "center",
        },
        {
          blockType: "richText",
          content: {
            root: {
              type: "root",
              children: [
                {
                  type: "heading",
                  tag: "h2",
                  children: [{ type: "text", text: "Our Story" }],
                },
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      text: "Qentrah was founded with a simple belief: that business management tools should empower teams, not complicate their workflows. We've built a platform that brings together everything your team needs to succeed.",
                    },
                  ],
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: "stats",
          stats: [
            { number: "10,000+", label: "Active Users" },
            { number: "50+", label: "Countries" },
            { number: "99.9%", label: "Uptime" },
            { number: "24/7", label: "Support" },
          ],
        },
        {
          blockType: "cta",
          heading: "Join Us on This Journey",
          description: "Start using Qentrah today and experience the difference",
          primaryLink: {
            label: "Get Started",
            url: "https://app.qentrah.com/signup",
            style: "primary",
          },
        },
      ],
      seo: {
        title: "About Qentrah - Our Mission & Story",
        description:
          "Learn about Qentrah's mission to revolutionize business management and our journey to building the platform that powers modern teams.",
        keywords: "about, company, mission, story, team",
      },
    },
  });

  const contactPageEn = await payload.create({
    collection: "marketing-pages",
    locale: "en",
    data: {
      slug: "contact-cms",
      title: "Contact Us",
      status: "published",
      blocks: [
        {
          blockType: "hero",
          heading: "Get in Touch",
          subheading: "We'd love to hear from you. Reach out to our team.",
          alignment: "center",
        },
        {
          blockType: "richText",
          content: {
            root: {
              type: "root",
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      text: "Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.",
                    },
                  ],
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: "featureGrid",
          heading: "Ways to Reach Us",
          features: [
            {
              title: "Sales Inquiries",
              description: "Interested in Qentrah for your business?",
            },
            {
              title: "Technical Support",
              description: "Need help with your account?",
            },
            {
              title: "Partnership Opportunities",
              description: "Want to partner with Qentrah?",
            },
            {
              title: "General Questions",
              description: "Have other questions? We're here to help.",
            },
          ],
        },
      ],
      seo: {
        title: "Contact Qentrah - Get in Touch",
        description:
          "Contact the Qentrah team for sales inquiries, support, partnership opportunities, or general questions. We're here to help.",
        keywords: "contact, support, sales, help, questions",
      },
    },
  });

  console.log(`✅ Created ${3} marketing pages`);

  // Add Arabic translations
  console.log("🌍 Adding Arabic translations...");

  await payload.update({
    collection: "marketing-pages",
    id: pricingPageEn.id,
    locale: "ar",
    data: {
      title: "خطط الأسعار",
      blocks: [
        {
          blockType: "hero",
          heading: "أسعار بسيطة وشفافة",
          subheading: "اختر الخطة المثالية لاحتياجات عملك",
          alignment: "center",
        },
        {
          blockType: "featureGrid",
          heading: "جميع الخطط تتضمن",
          features: [
            {
              title: "مساحات عمل غير محدودة",
              description: "أنشئ عدداً غير محدود من مساحات العمل",
            },
            {
              title: "دعم على مدار الساعة",
              description: "احصل على المساعدة متى احتجتها",
            },
            {
              title: "أمان متقدم",
              description: "أمان على مستوى المؤسسات لبياناتك",
            },
            {
              title: "وصول API",
              description: "تكامل مع أدواتك الحالية",
            },
          ],
        },
      ],
      seo: {
        title: "خطط الأسعار - قنطرة",
        description:
          "استكشف خطط أسعار قنطرة المرنة المصممة للشركات من جميع الأحجام. ابدأ بتجربة مجانية وقم بالتوسع مع نموك.",
        keywords: "أسعار، خطط، اشتراك، أدوات عمل، مساحة عمل",
      },
    },
  });

  await payload.update({
    collection: "marketing-pages",
    id: aboutPageEn.id,
    locale: "ar",
    data: {
      title: "عن قنطرة",
      blocks: [
        {
          blockType: "hero",
          heading: "بناء مستقبل إدارة الأعمال",
          subheading:
            "مهمتنا هي تمكين الشركات بأدوات تجعل العمل أكثر كفاءة وتعاوناً وتأثيراً.",
          alignment: "center",
        },
      ],
      seo: {
        title: "عن قنطرة - مهمتنا وقصتنا",
        description:
          "تعرف على مهمة قنطرة لإحداث ثورة في إدارة الأعمال ورحلتنا في بناء المنصة التي تشغل الفرق الحديثة.",
        keywords: "عن، شركة، مهمة، قصة، فريق",
      },
    },
  });

  console.log("✅ Seed complete! 🎉");
  console.log("\n📊 Summary:");
  console.log("  - Blog posts: 3 (EN)");
  console.log("  - Marketing pages: 3 (EN + AR translations)");
  console.log(
    "\n💡 Tip: Upload images via the admin panel at http://localhost:3005/admin",
  );
  console.log(
    "      Then assign them to blog posts using the heroImage and cardImage fields.",
  );

  process.exit(0);
}

// Run the seed
seedCMS().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
