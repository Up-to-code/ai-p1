export async function readJsonResponse<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function createJsonRequest(url: string, body: unknown, init: RequestInit = {}) {
  return new Request(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
    body: JSON.stringify(body),
    ...init,
  });
}
