import { z } from "zod";
import { uploadedFileReferenceSchema } from "./files";
import { propertyBodySchema, projectReadinessStatusSchema as propertyReadinessStatusSchema, propertyStatusSchema, publicationStateSchema } from "./properties";

export const projectReadinessStatusSchema = z.enum([
  "draft",
  "incomplete",
  "data_complete",
  "compliance_pending",
  "approved",
  "blocked",
  "published_ready",
]);

export const projectReadinessBlockerSchema = z.object({
  code: z.string(),
  label: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  area: z.enum(["identity", "location", "compliance", "units", "payment", "authorization", "publication"]),
  nextAction: z.string(),
});

export const projectReadinessResultSchema = z.object({
  status: projectReadinessStatusSchema,
  canPublish: z.boolean(),
  canDistributeToAi: z.boolean(),
  canCreateOpenOffer: z.boolean(),
  blockers: z.array(projectReadinessBlockerSchema),
  warnings: z.array(projectReadinessBlockerSchema),
  completedRequirements: z.array(z.string()),
});

export const projectInventoryKindSchema = z.enum(["project", "standalone_unit"]);

export const projectDossierInputSchema = z.object({
  propertyId: z.string().min(1),
  inventoryKind: projectInventoryKindSchema.optional(),
  projectType: z.enum(["ready_property", "off_plan", "land", "mixed_use"]),
  salesMode: z.enum(["developer_direct", "broker_mediated", "broker_owned"]),
  requestedVisibility: z.enum(["private", "public"]),
  title: z.string().min(1),
  summary: z.string().optional(),
  targetAudience: z.string().optional(),
  expectedUnitCountLabel: z.string().optional(),
  unitTypeMix: z.array(z.string()).optional(),
  primaryUnitType: z.string().optional(),
  averagePrice: z.number().optional(),
  options: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  location: z.object({
    countryCode: z.string().default("SA"),
    city: z.string().optional(),
    district: z.string().optional(),
    neighborhood: z.string().optional(),
    street: z.string().optional(),
    nationalAddress: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const projectLocationSchema = z.object({
  countryCode: z.string(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  nationalAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  confidence: z.enum(["manual", "verified", "legacy"]).optional(),
});

export const projectUnitLocationSchema = z.object({
  countryCode: z.string().default("SA").optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  nationalAddress: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const projectUnitInputSchema = z.object({
  dossierId: z.string().min(1),
  label: z.string().min(1),
  unitKind: z.enum(["unit_type", "unit"]),
  status: z.enum(["available", "reserved", "sold", "draft"]),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  sizeSqm: z.number().optional(),
  floor: z.string().optional(),
  view: z.string().optional(),
  price: z.number().optional(),
  handoverAt: z.number().optional(),
  location: projectUnitLocationSchema.optional(),
  floorPlanMedia: z.array(uploadedFileReferenceSchema).optional(),
});

export const projectPaymentPlanInputSchema = z.object({
  dossierId: z.string().min(1),
  title: z.string().min(1),
  cashPrice: z.number().optional(),
  startingPrice: z.number().optional(),
  downPayment: z.number().optional(),
  escrowReference: z.string().optional(),
  feesAndTaxNotes: z.string().optional(),
  bankAndSubsidyNotes: z.string().optional(),
  milestones: z
    .array(
      z.object({
        label: z.string().min(1),
        amount: z.number().optional(),
        percentage: z.number().optional(),
        dueType: z.enum(["booking", "contract", "construction", "handover", "custom"]).optional(),
        dueDate: z.number().optional(),
      }),
    )
    .optional(),
  status: z.enum(["draft", "active", "archived"]),
});

export const projectComplianceDocumentInputSchema = z.object({
  dossierId: z.string().min(1),
  documentType: z.enum([
    "ad_license",
    "wafi_license",
    "commercial_registration",
    "chamber_certificate",
    "land_title",
    "brokerage_contract",
    "architectural_plan",
    "consultant_contract",
    "escrow_or_cpa",
    "other",
  ]),
  title: z.string().min(1),
  licenseOrReferenceNumber: z.string().optional(),
  files: z.array(uploadedFileReferenceSchema),
  notes: z.string().optional(),
});

export const projectAdLicenseInputSchema = z.object({
  dossierId: z.string().min(1),
  licenseNumber: z.string().min(1),
  countryCode: z.string().optional(),
  jurisdiction: z.string().optional(),
  permitType: z.enum([
    "rega_ad_license",
    "fal_platform_license",
    "trakheesi",
    "madmoun",
    "adgm_advertising_permit",
    "bahrain_rera_advertising_guideline",
    "qatar_broker_license",
    "generic_ad_permit",
  ]).optional(),
  permitNumber: z.string().optional(),
  permitQrOrUrl: z.string().optional(),
  verificationStatus: z.enum(["missing", "submitted", "in_review", "verified", "rejected", "expired"]).optional(),
  requiredForChannels: z.array(z.string()).optional(),
  sourceAuthority: z.enum(["REGA", "DLD_RERA", "ADREC", "ADGM", "BAHRAIN_RERA", "QATAR_MOJ", "OTHER"]).optional(),
  purpose: z.string().optional(),
  channels: z.array(z.string()),
  brokerageContractNumber: z.string().optional(),
  expiresAt: z.number().optional(),
  evidenceFiles: z.array(uploadedFileReferenceSchema).optional(),
});

export const projectUnitBulkActionSchema = z.union([
  z.object({ type: z.literal("create"), unit: projectUnitInputSchema }),
  z.object({
    type: z.literal("update"),
    unitId: z.string().min(1),
    patch: projectUnitInputSchema.partial().omit({ dossierId: true }),
  }),
  z.object({ type: z.literal("delete"), unitId: z.string().min(1) }),
  z.object({ type: z.literal("duplicate"), unitId: z.string().min(1), label: z.string().optional() }),
  z.object({
    type: z.literal("mark_status"),
    unitIds: z.array(z.string().min(1)),
    status: z.enum(["available", "reserved", "sold", "draft"]),
  }),
  z.object({ type: z.literal("import"), units: z.array(projectUnitInputSchema) }),
]);

export const projectBrokerAuthorizationInputSchema = z.object({
  dossierId: z.string().min(1),
  brokerId: z.string().optional(),
  REDId: z.string().optional(),
  contractNumber: z.string().optional(),
  marketingScope: z.string().optional(),
  channels: z.array(z.string()),
  commissionTerms: z.string().optional(),
  validFrom: z.number().optional(),
  validUntil: z.number().optional(),
  evidenceFiles: z.array(uploadedFileReferenceSchema).optional(),
});

export const projectDocumentStatusSchema = z.enum(["missing", "submitted", "in_review", "approved", "rejected", "expired"]);
export const projectAdLicenseStatusSchema = z.enum(["pending", "approved", "rejected", "expired"]);

export const projectDossierRecordSchema = z.object({
  _id: z.string(),
  propertyId: z.string(),
  inventoryKind: projectInventoryKindSchema.optional(),
  tenantOrgId: z.string().optional(),
  ownerType: z.enum(["broker", "RED"]),
  ownerBrokerId: z.string().optional(),
  ownerREDId: z.string().optional(),
  projectType: z.enum(["ready_property", "off_plan", "land", "mixed_use"]),
  salesMode: z.enum(["developer_direct", "broker_mediated", "broker_owned"]),
  lifecycleStage: z.enum(["rough_draft", "draft", "review", "active", "suspended", "archived"]),
  requestedVisibility: z.enum(["private", "public"]),
  readinessStatus: projectReadinessStatusSchema,
  readinessBlockers: z.array(projectReadinessBlockerSchema),
  readinessWarnings: z.array(projectReadinessBlockerSchema),
  completedRequirements: z.array(z.string()),
  location: projectLocationSchema,
  title: z.string(),
  summary: z.string().optional(),
  targetAudience: z.string().optional(),
  expectedUnitCountLabel: z.string().optional(),
  unitTypeMix: z.array(z.string()).optional(),
  primaryUnitType: z.string().optional(),
  averagePrice: z.number().optional(),
  options: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  adminBlockedReason: z.string().optional(),
  adminReviewedAt: z.number().optional(),
  lastReadinessComputedAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectPropertyProjectionSchema = z.object({
  _id: z.string(),
  title: z.string(),
  address: z.string(),
  price: z.number(),
  beds: z.number(),
  baths: z.number(),
  sqft: z.number().optional(),
  description: z.string(),
  location: z.string().optional(),
  area: z.string().optional(),
  status: propertyStatusSchema.optional(),
  publicationState: publicationStateSchema.optional(),
  body: propertyBodySchema.optional(),
  media: z.array(uploadedFileReferenceSchema).optional(),
  adLicenseNumber: z.string().optional(),
  adLicenseStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  projectDossierId: z.string().optional(),
  projectReadinessStatus: propertyReadinessStatusSchema.optional(),
}).passthrough();

export const projectUnitRecordSchema = projectUnitInputSchema.extend({
  _id: z.string(),
  dossierId: z.string(),
  propertyId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectPaymentPlanRecordSchema = projectPaymentPlanInputSchema.extend({
  _id: z.string(),
  dossierId: z.string(),
  propertyId: z.string(),
  milestones: projectPaymentPlanInputSchema.shape.milestones.default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectComplianceDocumentRecordSchema = projectComplianceDocumentInputSchema.extend({
  _id: z.string(),
  dossierId: z.string(),
  propertyId: z.string(),
  status: projectDocumentStatusSchema,
  expiresAt: z.number().optional(),
  verificationRequestId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectAdLicenseRecordSchema = projectAdLicenseInputSchema.extend({
  _id: z.string(),
  dossierId: z.string(),
  propertyId: z.string(),
  status: projectAdLicenseStatusSchema,
  channels: z.array(z.string()),
  verificationRequestId: z.string().optional(),
  lastCheckedAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectBrokerAuthorizationRecordSchema = projectBrokerAuthorizationInputSchema.extend({
  _id: z.string(),
  dossierId: z.string(),
  propertyId: z.string(),
  channels: z.array(z.string()),
  status: z.enum(["draft", "active", "expired", "revoked"]),
  createdAt: z.number(),
  updatedAt: z.number(),
}).passthrough();

export const projectReadinessEventSchema = z.object({
  _id: z.string(),
  dossierId: z.string().optional(),
  propertyId: z.string().optional(),
  actorAuthUserId: z.string().optional(),
  actorRole: z.string().optional(),
  eventType: z.string(),
  previousStatus: projectReadinessStatusSchema.optional(),
  nextStatus: projectReadinessStatusSchema.optional(),
  message: z.string().optional(),
  metadata: z.unknown().optional(),
  createdAt: z.number(),
}).passthrough();

export const projectDossierDetailSchema = z.object({
  property: projectPropertyProjectionSchema,
  dossier: projectDossierRecordSchema.nullable(),
  units: z.array(projectUnitRecordSchema).optional(),
  paymentPlans: z.array(projectPaymentPlanRecordSchema).optional(),
  documents: z.array(projectComplianceDocumentRecordSchema).optional(),
  adLicenses: z.array(projectAdLicenseRecordSchema).optional(),
  brokerAuthorizations: z.array(projectBrokerAuthorizationRecordSchema).optional(),
  events: z.array(projectReadinessEventSchema).optional(),
  readiness: projectReadinessResultSchema.nullable(),
});

export const projectDraftSaveResultSchema = z.object({
  ok: z.literal(true),
  propertyId: z.string(),
  dossierId: z.string(),
  readiness: projectReadinessResultSchema,
  createdUnitIds: z.array(z.string()).optional(),
});

export const projectPublishSuccessResultSchema = z.object({
  ok: z.literal(true),
  publicationState: z.literal("published"),
  readiness: projectReadinessResultSchema,
});

export const adminProjectReviewActionInputSchema = z.object({
  status: z.union([projectDocumentStatusSchema, projectAdLicenseStatusSchema]),
  notes: z.string().optional(),
});

export type ProjectDossierInput = z.infer<typeof projectDossierInputSchema>;
export type ProjectUnitInput = z.infer<typeof projectUnitInputSchema>;
export type ProjectUnitBulkAction = z.infer<typeof projectUnitBulkActionSchema>;
export type ProjectPaymentPlanInput = z.infer<typeof projectPaymentPlanInputSchema>;
export type ProjectComplianceDocumentInput = z.infer<typeof projectComplianceDocumentInputSchema>;
export type ProjectAdLicenseInput = z.infer<typeof projectAdLicenseInputSchema>;
export type ProjectBrokerAuthorizationInput = z.infer<typeof projectBrokerAuthorizationInputSchema>;
export type ProjectReadinessResult = z.infer<typeof projectReadinessResultSchema>;
export type ProjectDossierDetail = z.infer<typeof projectDossierDetailSchema>;
export type ProjectDraftSaveResult = z.infer<typeof projectDraftSaveResultSchema>;
export type ProjectPublishSuccessResult = z.infer<typeof projectPublishSuccessResultSchema>;
export type ProjectDossierFormData = z.infer<typeof projectDossierInputSchema>;
export type ProjectUnitFormData = z.infer<typeof projectUnitInputSchema>;
export type ProjectPaymentPlanFormData = z.infer<typeof projectPaymentPlanInputSchema>;
export type ProjectComplianceDocumentFormData = z.infer<typeof projectComplianceDocumentInputSchema>;
export type ProjectBrokerAuthorizationFormData = z.infer<typeof projectBrokerAuthorizationInputSchema>;
