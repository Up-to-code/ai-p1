import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  HeadingFeature,
  ParagraphFeature,
  LinkFeature,
  UnorderedListFeature,
  OrderedListFeature,
  BlockquoteFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { ar } from "@payloadcms/translations/languages/ar";

import { defaultLocale, payloadLocales } from "./lib/locales";

import { BlogPosts } from "./collections/BlogPosts";
import { FAQs } from "./collections/FAQs";
import { LegalPages } from "./collections/LegalPages";
import { PricingPlans } from "./collections/PricingPlans";
import { TeamMembers } from "./collections/TeamMembers";
import { LandingSections } from "./collections/LandingSections";
import { MarketingPages } from "./collections/MarketingPages";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: process.cwd(),
    },
  },
  collections: [
    Users,
    Media,
    MarketingPages,
    BlogPosts,
    FAQs,
    LegalPages,
    PricingPlans,
    TeamMembers,
    LandingSections,
  ],
  editor: lexicalEditor({
    features: () => [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h2", "h3", "h4"] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      StrikethroughFeature(),
      LinkFeature({
        enabledCollections: [],
      }),
      UnorderedListFeature(),
      OrderedListFeature(),
      BlockquoteFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || "CHANGE-ME-IN-PRODUCTION",
  typescript: {
    outputFile: process.cwd() + "/payload-types.ts",
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
    },
  }),
  localization: {
    locales: payloadLocales,
    defaultLocale,
    fallback: true,
  },
  i18n: {
    supportedLanguages: { en, ar },
    fallbackLanguage: "en",
  },
});
