import type { Bundle, HttpRequestOptionsWithUrl, HttpResponse, ZObject } from 'zapier-platform-core';

export function includeQentrahAuth(request: HttpRequestOptionsWithUrl, _z: ZObject, bundle: Bundle) {
  request.headers = request.headers ?? {};
  request.headers.Authorization = `Bearer ${bundle.authData.apiKey}`;
  request.headers.Accept = 'application/json';
  return request;
}

export function handleQentrahErrors(response: HttpResponse, z: ZObject) {
  if (response.status === 401 || response.status === 403) {
    throw new z.errors.Error('Qentrah rejected this API key or organization ID.', 'AuthenticationError', response.status);
  }
  if (response.status === 429) {
    throw new z.errors.ThrottledError('Qentrah API rate limit reached. Zapier will retry this request.');
  }
  response.throwForStatus();
  return response;
}

export const befores = [includeQentrahAuth];
export const afters = [handleQentrahErrors];
