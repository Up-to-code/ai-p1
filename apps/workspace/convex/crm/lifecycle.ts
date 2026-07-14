import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { mutation, type MutationCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { createClient } from "../clients/lifecycle";
import { createDealFromDomainCommand } from "../deals/write";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { organizationLookupFingerprint, protectOrganizationText, redactSensitiveText, revealOrganizationText } from "../security/organizationData";
import { companyValidator, contactValidator, leadStatusValidator, leadValidator } from "./validators";
import { companySearchProjection, contactSearchProjection, leadSearchProjection } from "./search";
import { assertLeadConvertible, normalizeCompanyKey } from "./identity";

const leadInputValidator = v.object({
  name: v.string(), email: v.optional(v.string()), phone: v.optional(v.string()), companyName: v.optional(v.string()), source: v.string(), notes: v.optional(v.string()),
  estimatedValueMinor: v.optional(v.number()), currency: v.optional(v.string()), ownerUserId: v.optional(v.string()),
});

export const createLead = mutation({
  args: { organizationId: v.string(), input: leadInputValidator }, returns: leadValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "create");
    const now = Date.now();
    const protectedPii = await protectCrmPii(args.organizationId, "lead", args.input.email, args.input.phone);
    if (args.input.estimatedValueMinor !== undefined && (!Number.isSafeInteger(args.input.estimatedValueMinor) || args.input.estimatedValueMinor < 0)) throw crmError("INVALID_LEAD_VALUE", "Lead value must be a non-negative integer in minor units.");
    const companyName = optionalText(args.input.companyName);
    const id = await ctx.db.insert("crmLeads", {
      organizationId: args.organizationId, name: requiredText(args.input.name, "Lead name"), ...protectedPii, companyName, companyNameKey: companyName ? normalizeCompanyKey(companyName) : undefined,
      source: requiredText(args.input.source, "Lead source"), notes: optionalText(args.input.notes), estimatedValueMinor: args.input.estimatedValueMinor,
      currency: args.input.currency ? currency(args.input.currency) : undefined, status: "new", ownerUserId: args.input.ownerUserId ?? actor.userId,
      recordState: "active", createdByUserId: actor.userId, createdAt: now, updatedAt: now,
    });
    const lead = await required(ctx.db.get(id), "Lead could not be created.");
    await leadSearchProjection(ctx, lead);
    await audit(ctx, args.organizationId, actor.userId, "lead.create", id, `Created lead ${lead.name}.`, now);
    return lead;
  },
});

export const updateLeadStatus = mutation({
  args: { organizationId: v.string(), leadId: v.id("crmLeads"), status: leadStatusValidator }, returns: leadValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "update");
    const lead = await requireLead(ctx, args.organizationId, args.leadId);
    if (lead.status === "converted") throw crmError("LEAD_ALREADY_CONVERTED", "A converted Lead cannot return to an earlier state.");
    if (args.status === "converted") throw crmError("LEAD_CONVERSION_COMMAND_REQUIRED", "Use convertLead to produce Client and Deal records.");
    const now = Date.now();
    await ctx.db.patch(lead._id, { status: args.status, updatedAt: now });
    const updated = await required(ctx.db.get(lead._id), "Lead was not found.");
    await leadSearchProjection(ctx, updated);
    await audit(ctx, args.organizationId, actor.userId, `lead.${args.status}`, lead._id, `Marked lead ${lead.name} as ${args.status}.`, now);
    return updated;
  },
});

export const createCompany = mutation({
  args: { organizationId: v.string(), name: v.string(), website: v.optional(v.string()), industry: v.optional(v.string()) }, returns: companyValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    return upsertCompany(ctx, { ...args, actorUserId: actor.userId });
  },
});

export const createContact = mutation({
  args: { organizationId: v.string(), companyId: v.optional(v.id("crmCompanies")), clientId: v.optional(v.id("clients")), name: v.string(), email: v.optional(v.string()), phone: v.optional(v.string()), title: v.optional(v.string()) }, returns: contactValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    return upsertContact(ctx, { ...args, actorUserId: actor.userId });
  },
});

export const convertLead = mutation({
  args: { organizationId: v.string(), leadId: v.id("crmLeads"), dealTitle: v.optional(v.string()) },
  returns: v.object({ clientId: v.id("clients"), dealId: v.id("deals"), companyId: v.optional(v.id("crmCompanies")), contactId: v.optional(v.id("crmContacts")) }),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    await Promise.all([
      assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create"),
      assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "create"),
    ]);
    const lead = await requireLead(ctx, args.organizationId, args.leadId);
    if (lead.convertedClientId && lead.convertedDealId) {
      const [company, contact] = await Promise.all([companyForLead(ctx, lead), contactForLead(ctx, lead)]);
      return { clientId: lead.convertedClientId, dealId: lead.convertedDealId, companyId: company?._id, contactId: contact?._id };
    }
    assertLeadConvertible(lead.status);

    const existingCompany = await companyForLead(ctx, lead);
    const existingContact = await contactForLead(ctx, lead);
    let clientId = existingContact?.clientId ?? existingCompany?.clientId;
    if (!clientId) {
      const email = lead.encryptedEmail ? await revealCrmPii(args.organizationId, "lead-email", lead.encryptedEmail) : undefined;
      const phone = lead.encryptedPhone ? await revealCrmPii(args.organizationId, "lead-phone", lead.encryptedPhone) : undefined;
      const client = await createClient(ctx, {
        organizationId: args.organizationId, actorUserId: actor.userId,
        input: {
          name: lead.companyName ?? lead.name, type: lead.companyName ? "organization" : "person", status: "new", source: lead.source,
          ownerUserId: lead.ownerUserId, company: lead.companyName, contactName: lead.companyName ? lead.name : undefined, email, phone, notes: lead.notes,
          visibility: "private",
        },
      });
      clientId = client._id;
    }
    const company = lead.companyName
      ? await upsertCompany(ctx, { organizationId: args.organizationId, name: lead.companyName, clientId, actorUserId: actor.userId })
      : undefined;
    const contact = await upsertContact(ctx, {
      organizationId: args.organizationId, companyId: company?._id, clientId, name: lead.name,
      encryptedEmail: lead.encryptedEmail, emailFingerprint: lead.emailFingerprint, encryptedPhone: lead.encryptedPhone, actorUserId: actor.userId,
    });
    const deal = await createDealFromDomainCommand(ctx, {
      organizationId: args.organizationId, actorUserId: actor.userId, auditSummary: `Created deal from qualified lead ${lead.name}.`,
      input: {
        title: requiredText(args.dealTitle ?? `${lead.companyName ?? lead.name} opportunity`, "Deal title"), clientId, stage: "qualified", status: "open",
        value: lead.estimatedValueMinor !== undefined ? lead.estimatedValueMinor / 100 : undefined, currency: lead.currency, source: lead.source, priority: "normal", ownerUserId: lead.ownerUserId,
      },
    });
    const now = Date.now();
    await ctx.db.patch(lead._id, { status: "converted", convertedClientId: clientId, convertedDealId: deal._id, convertedAt: now, updatedAt: now });
    const converted = await required(ctx.db.get(lead._id), "Lead was not found.");
    await leadSearchProjection(ctx, converted);
    await audit(ctx, args.organizationId, actor.userId, "lead.convert", lead._id, `Converted lead ${lead.name} to Client and Deal.`, now);
    return { clientId, dealId: deal._id, companyId: company?._id, contactId: contact._id };
  },
});

async function upsertCompany(ctx: MutationCtx, args: { organizationId: string; name: string; website?: string; industry?: string; clientId?: Id<"clients">; actorUserId: string }) {
  const name = requiredText(args.name, "Company name");
  const nameKey = normalizeCompanyKey(name);
  const existing = await ctx.db.query("crmCompanies").withIndex("by_org_name", (q) => q.eq("organizationId", args.organizationId).eq("nameKey", nameKey)).unique();
  const now = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, { name, website: args.website ? website(args.website) : existing.website, industry: args.industry ?? existing.industry, clientId: args.clientId ?? existing.clientId, recordState: "active", deletedAt: undefined, updatedAt: now });
    const company = await required(ctx.db.get(existing._id), "Company was not found.");
    await companySearchProjection(ctx, company);
    return company;
  }
  const id = await ctx.db.insert("crmCompanies", { organizationId: args.organizationId, clientId: args.clientId, name, nameKey, website: args.website ? website(args.website) : undefined, industry: optionalText(args.industry), ownerUserId: args.actorUserId, recordState: "active", createdByUserId: args.actorUserId, createdAt: now, updatedAt: now });
  const company = await required(ctx.db.get(id), "Company could not be created.");
  await companySearchProjection(ctx, company);
  return company;
}

async function upsertContact(ctx: MutationCtx, args: { organizationId: string; companyId?: Id<"crmCompanies">; clientId?: Id<"clients">; name: string; email?: string; phone?: string; title?: string; encryptedEmail?: string; emailFingerprint?: string; encryptedPhone?: string; actorUserId: string }) {
  if (args.companyId) await requireOrganizationRecord(ctx.db.get(args.companyId), args.organizationId, "Company was not found.");
  if (args.clientId) await requireOrganizationRecord(ctx.db.get(args.clientId), args.organizationId, "Client was not found.");
  const protectedPii = args.encryptedEmail || args.encryptedPhone
    ? { email: args.encryptedEmail ? "[encrypted]" : undefined, encryptedEmail: args.encryptedEmail, emailFingerprint: args.emailFingerprint, phone: args.encryptedPhone ? "[encrypted]" : undefined, encryptedPhone: args.encryptedPhone }
    : await protectCrmPii(args.organizationId, "contact", args.email, args.phone);
  const existing = protectedPii.emailFingerprint ? await ctx.db.query("crmContacts").withIndex("by_org_email", (q) => q.eq("organizationId", args.organizationId).eq("emailFingerprint", protectedPii.emailFingerprint)).unique() : null;
  const now = Date.now();
  if (existing) {
    await ctx.db.patch(existing._id, { name: requiredText(args.name, "Contact name"), title: optionalText(args.title) ?? existing.title, companyId: args.companyId ?? existing.companyId, clientId: args.clientId ?? existing.clientId, ...protectedPii, recordState: "active", deletedAt: undefined, updatedAt: now });
    const contact = await required(ctx.db.get(existing._id), "Contact was not found.");
    await contactSearchProjection(ctx, contact);
    return contact;
  }
  const id = await ctx.db.insert("crmContacts", { organizationId: args.organizationId, companyId: args.companyId, clientId: args.clientId, name: requiredText(args.name, "Contact name"), title: optionalText(args.title), ...protectedPii, ownerUserId: args.actorUserId, recordState: "active", createdByUserId: args.actorUserId, createdAt: now, updatedAt: now });
  const contact = await required(ctx.db.get(id), "Contact could not be created.");
  await contactSearchProjection(ctx, contact);
  return contact;
}

async function companyForLead(ctx: MutationCtx, lead: Doc<"crmLeads">) {
  return lead.companyNameKey ? ctx.db.query("crmCompanies").withIndex("by_org_name", (q) => q.eq("organizationId", lead.organizationId).eq("nameKey", lead.companyNameKey!)).unique() : null;
}
async function contactForLead(ctx: MutationCtx, lead: Doc<"crmLeads">) {
  return lead.emailFingerprint ? ctx.db.query("crmContacts").withIndex("by_org_email", (q) => q.eq("organizationId", lead.organizationId).eq("emailFingerprint", lead.emailFingerprint!)).unique() : null;
}
async function requireLead(ctx: MutationCtx, organizationId: string, id: Id<"crmLeads">) { return requireOrganizationRecord(ctx.db.get(id), organizationId, "Lead was not found."); }
async function requireOrganizationRecord<T extends { organizationId: string; deletedAt?: number; recordState: string }>(value: Promise<T | null>, organizationId: string, message: string) { const record = await value; if (!record || record.organizationId !== organizationId || record.deletedAt || record.recordState === "deleted") throw crmError("CRM_RECORD_NOT_FOUND", message); return record; }
async function required<T>(value: Promise<T | null>, message: string) { const record = await value; if (!record) throw new Error(message); return record; }

async function protectCrmPii(organizationId: string, purpose: "lead" | "contact", email?: string, phone?: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();
  if (normalizedEmail && !/^\S+@\S+\.\S+$/u.test(normalizedEmail)) throw crmError("INVALID_EMAIL", "A valid email is required.");
  if (normalizedPhone && normalizedPhone.length > 80) throw crmError("INVALID_PHONE", "Phone is too long.");
  return {
    email: normalizedEmail ? redactSensitiveText(normalizedEmail, 160) : undefined,
    encryptedEmail: normalizedEmail ? await protectOrganizationText(organizationId, `${purpose}-email`, normalizedEmail) : undefined,
    emailFingerprint: normalizedEmail ? await organizationLookupFingerprint(organizationId, "crm-email-lookup", normalizedEmail) : undefined,
    phone: normalizedPhone ? redactSensitiveText(normalizedPhone, 80) : undefined,
    encryptedPhone: normalizedPhone ? await protectOrganizationText(organizationId, `${purpose}-phone`, normalizedPhone) : undefined,
  };
}

async function revealCrmPii(organizationId: string, purpose: string, encrypted: string) {
  return revealOrganizationText(organizationId, purpose, encrypted);
}

async function audit(ctx: MutationCtx, organizationId: string, actorUserId: string, action: string, target: string, summary: string, createdAt: number) { await ctx.db.insert("organizationAuditEvents", { organizationId, actorUserId, action, target, summary, createdAt }); }
function requiredText(value: string, label: string) { const normalized = value.trim(); if (!normalized) throw crmError("REQUIRED_TEXT", `${label} is required.`); return normalized; }
function optionalText(value?: string) { const normalized = value?.trim(); return normalized || undefined; }
function currency(value: string) { const normalized = value.trim().toUpperCase(); if (!/^[A-Z]{3}$/u.test(normalized)) throw crmError("INVALID_CURRENCY", "Currency must be a three-letter ISO code."); return normalized; }
function website(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported protocol.");
    return url.toString();
  } catch {
    throw crmError("INVALID_WEBSITE", "Website must be a valid HTTP or HTTPS URL.");
  }
}
function crmError(code: string, message: string) { return new ConvexError({ code, message }); }
