import { describe, expect, it, vi } from 'vitest';
import App from '../index.js';
import { listResource, writeResource } from '../api.js';
import { qentrahApiBase } from '../config.js';
import { includeQentrahAuth } from '../middleware.js';

const authData = {
  organizationId: 'org_123',
  apiKey: 'qentrah_org_secret',
  baseUrl: 'https://qentrah.example',
};

describe('Qentrah Zapier app', () => {
  it('publishes the expected triggers and actions', () => {
    expect(Object.keys(App.triggers ?? {})).toEqual([
      'new_or_updated_task',
      'new_or_updated_client',
      'new_or_updated_document',
      'project_list',
    ]);
    expect(Object.keys(App.creates ?? {})).toEqual([
      'create_task', 'update_task', 'create_client', 'update_client', 'create_document', 'update_document',
    ]);
  });

  it('builds an organization-scoped HTTPS endpoint', () => {
    expect(qentrahApiBase(authData)).toBe('https://qentrah.example/api/v1/partner/organizations/org_123');
    expect(() => qentrahApiBase({ ...authData, baseUrl: 'http://public.example' })).toThrow('must use HTTPS');
  });

  it('adds the organization API key as a bearer header', () => {
    const request = includeQentrahAuth(
      { url: 'https://qentrah.example/api', headers: {} },
      {} as never,
      { authData } as never,
    );
    expect(request.headers?.Authorization).toBe('Bearer qentrah_org_secret');
  });

  it('sorts polling results newest first', async () => {
    const request = vi.fn().mockResolvedValue({ data: { data: [
      { id: 'old', updatedAt: 10 }, { id: 'new', updatedAt: 20 },
    ] } });
    const rows = await listResource({ request } as never, { authData } as never, 'tasks');
    expect(rows.map((row: { id: string }) => row.id)).toEqual(['new', 'old']);
  });

  it('sends action input to the scoped resource endpoint', async () => {
    const request = vi.fn().mockResolvedValue({ data: { data: { id: 'task_1' } } });
    const result = await writeResource(
      { request } as never,
      { authData, inputData: { title: 'Follow up' } } as never,
      'tasks',
      'POST',
    );
    expect(result).toEqual({ id: 'task_1' });
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST', body: { title: 'Follow up' } }));
  });
});
