export type CrmRelationType = "internal_client" | "broker_managed";

export type ClientRecordLike = {
  _id: unknown;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  sourceClientId?: string;
  brokerId?: unknown;
  REDId?: unknown;
  createdAt?: number;
  updatedAt?: number;
};

export type DealRecordLike = {
  _id: unknown;
  _creationTime?: number;
  createdAt?: number;
  title: string;
  description?: string;
  value?: number;
  nextFollowUpAt?: number;
  stage: string;
  relationType?: CrmRelationType;
  crmClientId?: unknown;
  relatedBrokerId?: unknown;
  brokerId?: unknown;
  REDId?: unknown;
  assetId?: unknown;
  offerId?: unknown;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  lastUpdatedBy?: string;
  documents?: unknown;
};

type AssetLike = {
  _id?: unknown;
  title?: string;
  heroImage?: { url?: string };
  media?: Array<{ url?: string }>;
  location?: string;
  address?: string;
  price?: number;
  description?: string;
  body?: { presentation?: { descriptionShort?: string } };
};

type BrokerLike = {
  _id?: unknown;
  name?: string;
  description?: string;
  phone?: string;
  isVerified?: boolean;
};

const DEFAULT_ASSET_IMAGE =
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80";

function formatPriceLabel(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "غير محدد";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} ر.س`;
}

function resolveAssetSummary(asset: AssetLike) {
  const presentation = asset.body?.presentation;
  if (presentation?.descriptionShort?.trim()) {
    return presentation.descriptionShort.trim();
  }
  if (asset.description?.trim()) {
    return asset.description.trim();
  }
  return "نبذة الأصل غير متاحة بعد.";
}

function mapAssetPreview(asset: AssetLike | null | undefined) {
  if (!asset) return null;
  return {
    id: String(asset._id),
    title: asset.title,
    image: asset.heroImage?.url ?? asset.media?.[0]?.url ?? DEFAULT_ASSET_IMAGE,
    location: asset.location ?? asset.address ?? "غير محدد",
    priceLabel: formatPriceLabel(asset.price),
    summary: resolveAssetSummary(asset),
  };
}

function mapClientPreview(client: ClientRecordLike | null) {
  if (!client) return null;
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    notes: client.notes,
    sourceClientId: client.sourceClientId,
  };
}

export function buildAvatarLabel(name?: string | null) {
  return (name?.trim()?.[0] ?? "و").toUpperCase();
}

function mapBrokerPreview(broker: BrokerLike | null | undefined, relationType?: CrmRelationType) {
  if (!broker) return null;
  return {
    id: String(broker._id),
    name: broker.name,
    description: broker.description,
    phone: broker.phone,
    avatarLabel: buildAvatarLabel(broker.name),
    stateLabel: relationType === "broker_managed" ? "يدار عبر وسيط" : undefined,
    isVerified: broker.isVerified === true,
  };
}

export function mapDeal(
  deal: DealRecordLike,
  args: {
    client?: ClientRecordLike | null;
    broker?: BrokerLike | null;
    asset?: AssetLike | null;
    brokerName?: string | null;
    redName?: string | null;
  } = {},
) {
  return {
    id: deal._id,
    createdAt: deal.createdAt ?? deal._creationTime,
    title: deal.title,
    description: deal.description,
    value: deal.value,
    nextFollowUpAt: deal.nextFollowUpAt,
    stage: deal.stage,
    relationType: deal.relationType,
    crmClientId: deal.crmClientId,
    relatedBrokerId: deal.relatedBrokerId,
    brokerId: deal.brokerId,
    REDId: deal.REDId,
    assetId: deal.assetId,
    offerId: deal.offerId,
    notes: deal.notes,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    lastUpdatedBy: deal.lastUpdatedBy,
    brokerName: args.brokerName,
    redName: args.redName,
    client: mapClientPreview(args.client ?? null),
    linkedBroker: mapBrokerPreview(args.broker ?? null, deal.relationType),
    asset: mapAssetPreview(args.asset ?? null),
    documents: deal.documents,
  };
}

export function mapClient(client: ClientRecordLike) {
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    brokerId: client.brokerId ? String(client.brokerId) : undefined,
    redId: client.REDId ? String(client.REDId) : undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}
