import { z } from "zod";

const externalReferenceSchema = z.object({
  sourceSystem: z.string().trim().min(1).max(120).optional(),
  externalId: z.string().trim().min(1).max(200).optional(),
  businessId: z.string().trim().min(1).max(200).optional(),
});

export const orgApiClientInputSchema = z.object({
  name: z.string().trim().min(1, "Client name must be at least 1 character").max(120),
  phone: z.string().trim().min(1).max(40).optional(),
  email: z.string().trim().email("Client email must be valid").max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
}).merge(externalReferenceSchema);

export const orgApiClientUpdateInputSchema = orgApiClientInputSchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  "Provide at least one client field to update",
);

export const orgApiPropertyInputSchema = z.object({
  title: z.string().trim().min(1, "Property title must be at least 1 character").max(200),
  address: z.string().trim().min(1, "Property address must be at least 1 character").max(300),
  price: z.number().finite().nonnegative(),
  beds: z.number().int().nonnegative(),
  baths: z.number().int().nonnegative(),
  description: z.string().trim().min(1, "Property description must be at least 1 character").max(5000),
  area: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
}).merge(externalReferenceSchema);

export const orgApiPropertyUpdateInputSchema = orgApiPropertyInputSchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  "Provide at least one property field to update",
);

export const orgApiDealStageSchema = z.enum(["new", "contacted", "negotiation", "won", "lost"]);
export const orgApiDealRelationTypeSchema = z.enum(["internal_client", "broker_managed"]);

export const orgApiDealInputSchema = z.object({
  title: z.string().trim().min(1, "Deal title must be at least 1 character").max(200),
  description: z.string().trim().max(5000).optional(),
  value: z.number().finite().optional(),
  nextFollowUpAt: z.number().int().positive().optional(),
  stage: orgApiDealStageSchema,
  contactName: z.string().trim().min(1).max(120).optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  relationType: orgApiDealRelationTypeSchema,
  clientId: z.string().trim().min(1).optional(),
  projectId: z.string().trim().min(1).optional(),
  brokerId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(5000).optional(),
}).merge(externalReferenceSchema);

export const orgApiDealUpdateInputSchema = orgApiDealInputSchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  "Provide at least one deal field to update",
);

export type OrgApiClientInput = z.infer<typeof orgApiClientInputSchema>;
export type OrgApiClientUpdateInput = z.infer<typeof orgApiClientUpdateInputSchema>;
export type OrgApiPropertyInput = z.infer<typeof orgApiPropertyInputSchema>;
export type OrgApiPropertyUpdateInput = z.infer<typeof orgApiPropertyUpdateInputSchema>;
export type OrgApiDealInput = z.infer<typeof orgApiDealInputSchema>;
export type OrgApiDealUpdateInput = z.infer<typeof orgApiDealUpdateInputSchema>;

export type OrgApiClientRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  sourceSystem?: string;
  externalId?: string;
  businessId?: string;
  sourceClientId?: string;
  brokerId?: string;
  redId?: string;
  createdAt: number;
  updatedAt: number;
};

export type OrgApiPropertyRecord = {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  description: string;
  area?: string;
  location?: string;
  sourceSystem?: string;
  externalId?: string;
  businessId?: string;
  brokerId?: string;
  redId?: string;
  status?: string;
  publicationState?: string;
};

export type OrgApiBrokerRecord = {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  isVerified?: boolean;
  status?: string;
};

export type OrgApiDealClientRelation = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  sourceSystem?: string;
  externalId?: string;
  businessId?: string;
  sourceClientId?: string;
} | null;

export type OrgApiDealProjectRelation = {
  id: string;
  title: string;
  address: string;
  location?: string;
  price?: number;
  publicationState?: string;
  status?: string;
  sourceSystem?: string;
  externalId?: string;
  businessId?: string;
} | null;

export type OrgApiDealBrokerRelation = {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  isVerified?: boolean;
  status?: string;
} | null;

export type OrgApiDealRecord = {
  id: string;
  title: string;
  description?: string;
  value?: number;
  nextFollowUpAt?: number;
  stage: z.infer<typeof orgApiDealStageSchema>;
  relationType: z.infer<typeof orgApiDealRelationTypeSchema>;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  sourceSystem?: string;
  externalId?: string;
  businessId?: string;
  brokerId?: string;
  redId?: string;
  clientId?: string;
  projectId?: string;
  relatedBrokerId?: string;
  createdAt: number;
  client: OrgApiDealClientRelation;
  project: OrgApiDealProjectRelation;
  broker: OrgApiDealBrokerRelation;
};
