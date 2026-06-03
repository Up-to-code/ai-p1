import { assertTamaraApiConfig } from "./tamara-config";

export type TamaraAmount = {
  amount: number;
  currency: string;
};

type TamaraBillingPlanId = string;

export type TamaraCheckoutContext = {
  locale: string;
  plan: {
    id: TamaraBillingPlanId;
    name: string;
    amount: number;
    currency: string;
  };
  payment: {
    id: string;
    orderReferenceId: string;
    orderNumber: string;
  };
  organization: {
    name: string;
    legalName: string;
    email: string;
    phone: string;
    address: string;
  };
  discount?: {
    name: string;
    amount: number;
    currency: string;
  };
};

export type TamaraCheckoutResponse = {
  order_id: string;
  checkout_id: string;
  status: string;
  checkout_url: string;
};

type TamaraFetch = typeof fetch;

function amount(value: number, currency: string): TamaraAmount {
  return { amount: value, currency };
}

function returnUrl(siteUrl: string, locale: string, status: "success" | "cancel" | "failure", paymentId: string, reference: string) {
  const url = new URL(`/${locale}/billing/tamara/${status}`, siteUrl);
  url.searchParams.set("paymentId", paymentId);
  url.searchParams.set("reference", reference);
  return url.toString();
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/u).filter(Boolean);
  return {
    firstName: parts[0] ?? "Qentrah",
    lastName: parts.slice(1).join(" ") || "Workspace",
  };
}

function discount(input: TamaraCheckoutContext["discount"]) {
  if (!input || input.amount <= 0) return undefined;
  return {
    name: input.name,
    amount: amount(input.amount, input.currency),
  };
}

function planSku(planId: TamaraBillingPlanId) {
  return `qentrah-${planId.replace(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "").toLowerCase()}`;
}

export function buildTamaraCheckoutPayload(context: TamaraCheckoutContext, config: { siteUrl: string; webhookUrl: string }) {
  const totalAmount = amount(context.plan.amount, context.plan.currency);
  const discountPayload = discount(context.discount);
  const discountAmount = discountPayload?.amount ?? amount(0, context.plan.currency);
  const consumerName = splitName(context.organization.name);
  const address = {
    first_name: consumerName.firstName,
    last_name: consumerName.lastName,
    line1: context.organization.address || "Saudi Arabia",
    city: "Riyadh",
    country_code: "SA",
    phone_number: context.organization.phone,
  };

  return {
    total_amount: totalAmount,
    shipping_amount: amount(0, context.plan.currency),
    tax_amount: amount(0, context.plan.currency),
    discount_amount: discountAmount,
    order_reference_id: context.payment.orderReferenceId,
    order_number: context.payment.orderNumber,
    ...(discountPayload ? { discount: discountPayload } : {}),
    items: [
      {
        name: context.plan.name,
        quantity: 1,
        reference_id: context.plan.id,
        type: "Digital",
        sku: planSku(context.plan.id),
        unit_price: totalAmount,
        tax_amount: amount(0, context.plan.currency),
        discount_amount: discountAmount,
        total_amount: totalAmount,
      },
    ],
    consumer: {
      first_name: consumerName.firstName,
      last_name: consumerName.lastName,
      email: context.organization.email,
      phone_number: context.organization.phone,
    },
    country_code: "SA",
    description: `${context.plan.name} workspace access`,
    merchant_url: {
      success: returnUrl(config.siteUrl, context.locale, "success", context.payment.id, context.payment.orderReferenceId),
      cancel: returnUrl(config.siteUrl, context.locale, "cancel", context.payment.id, context.payment.orderReferenceId),
      failure: returnUrl(config.siteUrl, context.locale, "failure", context.payment.id, context.payment.orderReferenceId),
      notification: config.webhookUrl,
    },
    billing_address: address,
    shipping_address: address,
    platform: "Qentrah Workspace",
    is_mobile: false,
    locale: context.locale === "ar" ? "ar_SA" : "en_US",
  };
}

async function tamaraJson<TResponse>(
  path: string,
  options: { method?: string; body?: unknown; fetcher?: TamaraFetch } = {},
) {
  const config = assertTamaraApiConfig();
  const response = await (options.fetcher ?? fetch)(`${config.baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${config.apiToken}`,
      ...(options.body ? { "content-type": "application/json" } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload?.message === "string" ? payload.message : "Tamara request failed.";
    throw new Error(message);
  }

  return payload as TResponse;
}

export async function createTamaraCheckoutSession(
  context: TamaraCheckoutContext,
  options: { fetcher?: TamaraFetch } = {},
) {
  const config = assertTamaraApiConfig();
  return tamaraJson<TamaraCheckoutResponse>("/checkout", {
    method: "POST",
    body: buildTamaraCheckoutPayload(context, config),
    fetcher: options.fetcher,
  });
}

export async function authoriseTamaraOrder(orderId: string, options: { fetcher?: TamaraFetch } = {}) {
  return tamaraJson<Record<string, unknown>>(`/orders/${encodeURIComponent(orderId)}/authorise`, {
    method: "POST",
    fetcher: options.fetcher,
  });
}

export async function captureTamaraOrder(
  input: { orderId: string; amount: TamaraAmount; itemName: string; planId?: TamaraBillingPlanId },
  options: { fetcher?: TamaraFetch } = {},
) {
  return tamaraJson<Record<string, unknown>>("/payments/capture", {
    method: "POST",
    fetcher: options.fetcher,
    body: {
      order_id: input.orderId,
      total_amount: input.amount,
      shipping_info: {
        shipped_at: new Date().toISOString(),
        shipping_company: "Qentrah",
        tracking_number: input.orderId,
        tracking_url: "https://app.qentrah.com",
      },
      items: [
        {
          name: input.itemName,
          quantity: 1,
          reference_id: input.planId ?? "saudi_monthly",
          sku: planSku(input.planId ?? "saudi_monthly"),
          type: "Digital",
          unit_price: input.amount,
          tax_amount: amount(0, input.amount.currency),
          discount_amount: amount(0, input.amount.currency),
          total_amount: input.amount,
        },
      ],
      shipping_amount: amount(0, input.amount.currency),
      tax_amount: amount(0, input.amount.currency),
      discount_amount: amount(0, input.amount.currency),
    },
  });
}

export async function cancelTamaraOrder(
  input: { orderId: string; amount: TamaraAmount; itemName: string; planId?: TamaraBillingPlanId },
  options: { fetcher?: TamaraFetch } = {},
) {
  return tamaraJson<Record<string, unknown>>(`/orders/${encodeURIComponent(input.orderId)}/cancel`, {
    method: "POST",
    fetcher: options.fetcher,
    body: {
      total_amount: input.amount,
      shipping_amount: amount(0, input.amount.currency),
      tax_amount: amount(0, input.amount.currency),
      discount_amount: amount(0, input.amount.currency),
      items: [
        {
          name: input.itemName,
          quantity: 1,
          reference_id: input.planId ?? "saudi_monthly",
          sku: planSku(input.planId ?? "saudi_monthly"),
          type: "Digital",
          unit_price: input.amount,
          tax_amount: amount(0, input.amount.currency),
          discount_amount: amount(0, input.amount.currency),
          total_amount: input.amount,
        },
      ],
    },
  });
}

export async function refundTamaraOrder(
  input: { orderId: string; amount: TamaraAmount; comment: string; merchantRefundId?: string },
  options: { fetcher?: TamaraFetch } = {},
) {
  return tamaraJson<Record<string, unknown>>(`/payments/simplified-refund/${encodeURIComponent(input.orderId)}`, {
    method: "POST",
    fetcher: options.fetcher,
    body: {
      total_amount: input.amount,
      comment: input.comment,
      ...(input.merchantRefundId ? { merchant_refund_id: input.merchantRefundId } : {}),
    },
  });
}

export async function getTamaraOrderDetails(orderId: string, options: { fetcher?: TamaraFetch } = {}) {
  return tamaraJson<Record<string, unknown>>(`/orders/${encodeURIComponent(orderId)}`, {
    fetcher: options.fetcher,
  });
}
