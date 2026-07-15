import { readFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const locale = "en-US";
const symbol = (id, name, required = true, validations = []) => ({ id, name, type: "Symbol", required, localized: false, validations });
const text = (id, name, required = true) => ({ id, name, type: "Text", required, localized: false });
const symbols = (id, name, required = true, validations = []) => ({ id, name, type: "Array", required, localized: false, validations, items: { type: "Symbol" } });
const entry = (id, name, types, required = true) => ({ id, name, type: "Link", linkType: "Entry", required, localized: false, validations: [{ linkContentType: types }] });
const entries = (id, name, types, required = true, validations = []) => ({ id, name, type: "Array", required, localized: false, validations, items: { type: "Link", linkType: "Entry", validations: [{ linkContentType: types }] } });
const asset = (id, name, required = true) => ({ id, name, type: "Link", linkType: "Asset", required, localized: false });
const exactSize = (size) => [{ size: { min: size, max: size } }];
const sizeRange = (min, max) => [{ size: { min, max } }];

const models = [
  { id: "qentrahLandingTextCard", name: "Qentrah · Text card", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("title", "Title"), text("body", "Body")] },
  { id: "qentrahBrandBlock", name: "Qentrah · Brand", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("displayName", "Display name"), symbol("accessibleName", "Accessible home-link label"), symbol("accentColor", "Accent color", false, [{ regexp: { pattern: "^#[0-9A-Fa-f]{6}$", flags: "" } }]), asset("markLight", "Logo on light surface"), asset("markDark", "Logo on dark surface")] },
  { id: "qentrahLandingHero", name: "Qentrah · Home hero", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("eyebrow", "Eyebrow"), symbol("title", "Primary headline", false), symbol("primaryActionLabel", "Primary action label"), entries("benefits", "Benefit rows", ["qentrahLandingTextCard"], false), text("note", "Supporting note", false), symbol("modulesLabel", "Modules label", false), symbols("modules", "Module labels", false)] },
  { id: "qentrahPlatformStoryBlock", name: "Qentrah · Platform story", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("contextTitle", "Context section title"), text("contextBody", "Context section body"), symbol("platformTitle", "Platform section title"), text("platformBody", "Platform section body"), symbol("agentTitle", "Agent section title"), text("agentBody", "Agent section body"), symbol("primaryActionLabel", "Primary action label"), symbol("secondaryActionLabel", "Secondary action label"), entries("agentCapabilities", "Agent capability cards", ["qentrahLandingTextCard"], true, sizeRange(5, 6))] },
  { id: "qentrahAiOutcomesBlock", name: "Qentrah · AI solutions", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("solutionsTitle", "Solutions title"), text("solutionsBody", "Solutions body"), symbol("solutionKicker", "Solution eyebrow"), symbols("solutionBullets", "Solution bullet points"), symbol("exploreLabel", "Explore action label")] },
  { id: "qentrahTrustBlock", name: "Qentrah · Trust", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("kicker", "Eyebrow"), symbol("title", "Title"), text("body", "Body"), entries("items", "Trust cards", ["qentrahLandingTextCard"], true, exactSize(3)), text("assurance", "Assurance statement"), symbols("marks", "Trust marks", true, exactSize(2))] },
  { id: "qentrahCtaBlock", name: "Qentrah · Final CTA", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("kicker", "Eyebrow"), symbol("title", "Title"), text("body", "Body"), symbol("primaryActionLabel", "Primary action label"), symbol("salesActionLabel", "Sales action label"), symbol("note", "Supporting note"), symbols("points", "Benefit points"), symbol("visualLabel", "Visual label"), symbol("visualTitle", "Visual title")] },
  { id: "qentrahLandingPage", name: "Qentrah · Home page", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("locale", "Locale", true, [{ in: ["en", "ar", "fr"] }, { unique: true }]), entry("hero", "Hero", ["qentrahLandingHero"]), entry("platformStory", "Platform story", ["qentrahPlatformStoryBlock"]), entry("aiOutcomes", "AI outcomes", ["qentrahAiOutcomesBlock"]), entry("trust", "Trust", ["qentrahTrustBlock"]), entry("cta", "Final CTA", ["qentrahCtaBlock"])] },
  { id: "qentrahNavigationItem", name: "Qentrah · Navigation item", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("label", "Label"), text("description", "Description", false)] },
  { id: "qentrahNavigationBlock", name: "Qentrah · Navigation", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("announcement", "Announcement"), symbol("platform", "Platform label"), symbol("ai", "AI label"), symbol("solutions", "Solutions label"), symbol("resources", "Resources label"), symbol("pricing", "Pricing label"), symbol("enterprise", "Enterprise label"), symbol("explore", "Explore label"), symbol("structure", "Structure label"), symbol("coordinate", "Coordinate label"), symbol("intelligence", "Intelligence label"), symbol("signIn", "Sign-in label", false), symbol("signUp", "Sign-up CTA"), symbol("sales", "Sales CTA"), symbol("openMenu", "Open-menu accessibility label", false), symbol("closeMenu", "Close-menu accessibility label", false), entries("platformItems", "Platform menu items", ["qentrahNavigationItem"]), symbol("mainNavigationAriaLabel", "Main navigation accessibility label")] },
  { id: "qentrahHomeSupportBlock", name: "Qentrah · Home support", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbols("workspaceCells", "Workspace cell labels", true, exactSize(32)), symbols("solutionTabs", "Solution tab labels", true, exactSize(5)), entry("logoCloud", "Logo cloud", ["qentrahLogoCloudBlock"]), entry("faq", "Home FAQ", ["qentrahFaqBlock"])] },
  { id: "qentrahFooterBlock", name: "Qentrah · Marketing site", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("locale", "Locale", true, [{ in: ["en", "ar", "fr"] }, { unique: true }]), entry("brand", "Brand", ["qentrahBrandBlock"], false), entry("navigation", "Navigation", ["qentrahNavigationBlock"]), entry("homePage", "Home · page composition", ["qentrahLandingPage"]), entry("homeSupport", "Home · support block", ["qentrahHomeSupportBlock"], false), entry("pricingPage", "Pricing page", ["qentrahPricingPage"]), entries("legalPages", "Legal pages", ["qentrahLegalPage"]), entries("seoEntries", "SEO entries", ["qentrahSeoEntry"]), symbol("footerTagline", "Footer · tagline"), text("description", "Footer · description"), symbol("product", "Footer · product heading"), symbol("company", "Footer · company heading"), symbol("legal", "Footer · legal heading"), symbol("contact", "Footer · contact heading"), symbol("copyright", "Footer · copyright"), symbols("companyLinks", "Footer · workspace link labels"), symbols("legalLinks", "Footer · legal link labels"), symbols("resourceLinks", "Footer · platform link labels") ] },
  { id: "qentrahLogoCloudItem", name: "Qentrah · Logo cloud item", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("name", "Name"), asset("icon", "Logo / icon", false)] },
  { id: "qentrahLogoCloudBlock", name: "Qentrah · Logo cloud", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("label", "Label"), entries("items", "Items", ["qentrahLogoCloudItem"])] },
  { id: "qentrahFaqItem", name: "Qentrah · FAQ item", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("question", "Question"), text("answer", "Answer")] },
  { id: "qentrahFaqBlock", name: "Qentrah · FAQ", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("eyebrow", "Eyebrow", false), symbol("title", "Title", false), symbols("heading", "Heading segments", true, exactSize(2)), text("description", "Description", false), symbol("subtitleBefore", "Subtitle before link", false), symbol("contactLabel", "Contact link label", false), symbol("subtitleAfter", "Subtitle after link", false), symbol("loadMoreLabel", "Load more label", false), entries("items", "FAQ items", ["qentrahFaqItem"])] },
  { id: "qentrahPricingPlanCopy", name: "Qentrah · Pricing plan copy", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("planId", "Canonical plan ID", true, [{ in: ["free", "good", "better", "custom"] }]), symbol("name", "Display name"), text("description", "Description"), symbol("badge", "Badge", false), symbol("cta", "CTA label"), symbol("sectionHeader", "Feature section heading"), symbol("moreLabel", "Feature footer label")] },
  { id: "qentrahPricingFeatureRow", name: "Qentrah · Pricing feature row", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("featureKey", "Canonical feature key"), symbol("label", "Display label")] },
  { id: "qentrahPricingFeatureSection", name: "Qentrah · Pricing feature section", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("category", "Category"), entries("rows", "Feature rows", ["qentrahPricingFeatureRow"])] },
  { id: "qentrahComparisonRow", name: "Qentrah · Platform comparison row", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("capability", "Capability"), symbol("qentrah", "Qentrah"), symbol("clickup", "ClickUp"), symbol("asana", "Asana"), symbol("notion", "Notion")] },
  { id: "qentrahComparisonSection", name: "Qentrah · Platform comparison section", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("label", "Section label"), entries("rows", "Comparison rows", ["qentrahComparisonRow"])] },
  { id: "qentrahPricingPage", name: "Qentrah · Pricing page", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("eyebrow", "Eyebrow"), symbols("headline", "Headline segments", true, exactSize(4)), text("subtitle", "Subtitle"), symbol("guarantee", "Checkout / cancellation note"), symbol("monthlyLabel", "Monthly label"), symbol("yearlyLabel", "Yearly label"), symbol("plansAriaLabel", "Plans accessibility label"), symbol("compareNote", "Comparison note"), symbol("monthlyUnitLabel", "Monthly seat unit label"), symbol("yearlyUnitLabel", "Yearly seat unit label"), symbol("customPriceLabel", "Enterprise price label"), entries("plans", "Plan editorial cards", ["qentrahPricingPlanCopy"], true, exactSize(4)), symbol("featureHeading", "Feature table heading"), symbol("featureAriaLabel", "Feature table accessibility label"), entries("featureSections", "Feature table sections", ["qentrahPricingFeatureSection"]), symbol("platformEyebrow", "Platform comparison eyebrow"), symbol("platformTitle", "Platform comparison title"), text("platformDescription", "Platform comparison description"), symbol("platformButton", "Platform comparison button"), symbols("platformLabels", "Platform comparison column labels", true, exactSize(5)), entries("platformSections", "Platform comparison sections", ["qentrahComparisonSection"]), text("platformNote", "Platform comparison note"), entry("faq", "Pricing FAQ", ["qentrahFaqBlock"])] },
  { id: "qentrahLegalSection", name: "Qentrah · Legal section", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("title", "Section title"), text("body", "Body"), symbols("bulletItems", "Bullet items", false)] },
  { id: "qentrahLegalPage", name: "Qentrah · Legal page", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("pageKey", "Page key", true, [{ in: ["privacy", "terms", "legal"] }]), symbol("eyebrow", "Eyebrow"), symbol("title", "Title"), symbol("updated", "Last updated label"), entries("sections", "Sections", ["qentrahLegalSection"])] },
  { id: "qentrahSeoEntry", name: "Qentrah · SEO entry", displayField: "internalName", fields: [symbol("internalName", "Internal name"), symbol("pageKey", "Page key"), symbol("title", "SEO title"), text("description", "SEO description"), symbols("keywords", "Keywords", false), asset("socialImage", "Social image", false), symbol("socialImageAlt", "Social image alt text", false)] },
];

function assertInputOnlyModels() {
  const modelIds = new Set();
  for (const model of models) {
    if (modelIds.has(model.id)) throw new Error(`Duplicate Contentful model ID: ${model.id}`);
    modelIds.add(model.id);
    for (const field of model.fields) {
      if (field.type === "Object" || field.items?.type === "Object") {
        throw new Error(`Contentful Object/JSON fields are forbidden: ${model.id}.${field.id}`);
      }
    }
  }
}

async function loadEnvironment() {
  const env = { ...process.env };
  const source = await readFile(new URL("../.env.local", import.meta.url), "utf8");
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    env[line.slice(0, separator)] = line.slice(separator + 1).replace(/^['"]|['"]$/g, "");
  }
  return env;
}

function message(result) {
  return result.content?.map((item) => item.type === "text" ? item.text : "").join("\n") ?? "";
}

function contentTypeFields(body) {
  return new Map([...body.matchAll(/<fields>([\s\S]*?)<\/fields>/g)].flatMap((match) => {
    const field = match[1];
    const itemBlock = field.match(/<items>([\s\S]*?)<\/items>/)?.[1];
    const outerField = field.replace(/<items>[\s\S]*?<\/items>/, "");
    const value = (name) => outerField.match(new RegExp(`<${name}>([^<]+)<\\/${name}>`))?.[1];
    const id = value("id");
    const type = value("type");
    if (!id || !type) return [];
    const itemValue = (name) => itemBlock?.match(new RegExp(`<${name}>([^<]+)<\\/${name}>`))?.[1];
    const definition = {
      id,
      name: value("name") ?? id,
      type,
      required: value("required") === "true",
      localized: value("localized") === "true",
      ...(value("linkType") ? { linkType: value("linkType") } : {}),
      ...(itemBlock ? {
        items: {
          type: itemValue("type") ?? "Symbol",
          ...(itemValue("linkType") ? { linkType: itemValue("linkType") } : {}),
        },
      } : {}),
    };
    return [[id, definition]];
  }));
}

function contentTypeFieldIds(body) {
  return new Set(contentTypeFields(body).keys());
}

async function call(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) throw new Error(`${name} failed: ${message(result)}`);
  return result;
}

async function existingContentTypeIds(client, scope) {
  const ids = new Set();
  for (let skip = 0; ; skip += 10) {
    const result = await call(client, "list_content_types", { ...scope, limit: 10, skip });
    const body = message(result);
    const matches = body.matchAll(/<\/space>\s*<id>(qentrah[^<]+)<\/id>/g);
    const page = [...matches].map((match) => match[1]);
    page.forEach((id) => ids.add(id));
    const total = Number(body.match(/<total>(\d+)<\/total>/)?.[1] ?? 0);
    if (skip + 10 >= total) break;
  }
  return ids;
}

assertInputOnlyModels();
const env = await loadEnvironment();
const spaceId = env.CONTENTFUL_SPACE_ID;
const environmentId = env.CONTENTFUL_ENVIRONMENT || "master";
if (!spaceId || !env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN) throw new Error("Missing Contentful management configuration in apps/marketing/.env.local");

const client = new Client({ name: "qentrah-marketing-model-sync", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "npx", args: ["-y", "@contentful/mcp-server"], env }));
try {
  const scope = { spaceId, environmentId };
  const existing = await existingContentTypeIds(client, scope);
  if (process.argv.includes("--audit")) {
    const expected = new Set(models.map((model) => model.id));
    const missing = [...expected].filter((id) => !existing.has(id));
    const unexpected = [...existing].filter((id) => !expected.has(id));
    let fieldCount = 0;
    let objectFieldCount = 0;
    const fieldMismatches = [];
    for (const model of models) {
      if (!existing.has(model.id)) continue;
      const result = await call(client, "get_content_type", { ...scope, contentTypeId: model.id });
      const body = message(result);
      const actualFields = contentTypeFieldIds(body);
      const expectedFields = new Set(model.fields.map((field) => field.id));
      fieldCount += actualFields.size;
      objectFieldCount += [...body.matchAll(/<type>Object<\/type>/g)].length;
      const missingFields = [...expectedFields].filter((id) => !actualFields.has(id));
      const unexpectedFields = [...actualFields].filter((id) => !expectedFields.has(id));
      if (missingFields.length || unexpectedFields.length) {
        fieldMismatches.push({ contentTypeId: model.id, missingFields, unexpectedFields });
      }
    }
    if (missing.length || unexpected.length || objectFieldCount || fieldMismatches.length) {
      throw new Error(`Contentful model audit failed: ${JSON.stringify({ missing, unexpected, objectFieldCount, fieldMismatches })}`);
    }
    console.log(JSON.stringify({ models: models.length, fields: fieldCount, objectFields: objectFieldCount }));
  } else {
    if (process.argv.includes("--prune")) {
      for (const model of models) {
        if (!existing.has(model.id)) continue;
        const current = await call(client, "get_content_type", { ...scope, contentTypeId: model.id });
        const currentFields = contentTypeFields(message(current));
        const expectedFields = new Set(model.fields.map((field) => field.id));
        const obsoleteFields = [...currentFields.keys()]
          .filter((fieldId) => !expectedFields.has(fieldId));
        if (!obsoleteFields.length) continue;
        await call(client, "update_content_type", {
          ...scope,
          contentTypeId: model.id,
          fields: [
            ...model.fields,
            ...obsoleteFields.map((fieldId) => ({
              ...currentFields.get(fieldId),
              required: false,
              disabled: true,
              omitted: true,
            })),
          ],
        });
        await call(client, "publish_content_type", { ...scope, contentTypeId: model.id });
        for (const fieldId of obsoleteFields) {
          await call(client, "delete_content_type_field", { ...scope, contentTypeId: model.id, fieldId });
        }
        await call(client, "publish_content_type", { ...scope, contentTypeId: model.id });
        console.log(`pruned ${model.id}: ${obsoleteFields.join(", ")}`);
      }
    }
    for (const model of models) {
      if (existing.has(model.id)) {
        await call(client, "update_content_type", { ...scope, contentTypeId: model.id, name: model.name, displayField: model.displayField, fields: model.fields });
      } else {
        await call(client, "create_content_type", { ...scope, contentTypeId: model.id, name: model.name, displayField: model.displayField, description: "Qentrah Marketing editor inputs. No JSON fields.", fields: model.fields });
      }
      await call(client, "publish_content_type", { ...scope, contentTypeId: model.id });
      console.log(`ready ${model.id}`);
    }
  }
} finally {
  await client.close();
}
