import type { Bundle, ZObject } from 'zapier-platform-core';
import { qentrahApiBase } from './config.js';

export async function listResource(z: ZObject, bundle: Bundle, resource: string) {
  const response = await z.request({
    url: `${qentrahApiBase(bundle.authData)}/${resource}`,
    params: { limit: 100 },
  });
  const rows = Array.isArray(response.data?.data) ? response.data.data : [];
  return rows.sort((left: Record<string, unknown>, right: Record<string, unknown>) =>
    Number(right.updatedAt ?? right.createdAt ?? 0) - Number(left.updatedAt ?? left.createdAt ?? 0),
  );
}

export async function writeResource(
  z: ZObject,
  bundle: Bundle,
  resource: string,
  method: 'POST' | 'PATCH',
  id?: string,
) {
  const response = await z.request({
    url: `${qentrahApiBase(bundle.authData)}/${resource}${id ? `/${encodeURIComponent(id)}` : ''}`,
    method,
    body: bundle.inputData,
  });
  return response.data.data;
}
