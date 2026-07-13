export const MCP_MAX_REQUEST_BYTES = 1_000_000;
export const MCP_REQUEST_TIMEOUT_MS = 30_000;

export class McpRequestPolicyError extends Error {
  constructor(
    readonly code: "request_too_large" | "request_timeout",
    readonly status: 413 | 504,
  ) {
    super(code);
    this.name = "McpRequestPolicyError";
  }
}

async function readLimitedBody(request: Request, maxBytes: number): Promise<ArrayBuffer> {
  if (!request.body) return new ArrayBuffer(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new McpRequestPolicyError("request_too_large", 413);
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new ArrayBuffer(length);
  const body = new Uint8Array(buffer);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer;
}

/** Rebuilds POST requests after enforcing a streaming body-size limit. */
export async function enforceMcpRequestSize(
  request: Request,
  maxBytes = MCP_MAX_REQUEST_BYTES,
): Promise<Request> {
  if (request.method !== "POST") return request;
  const declaredSize = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > maxBytes) {
    throw new McpRequestPolicyError("request_too_large", 413);
  }

  const body = await readLimitedBody(request, maxBytes);
  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body,
    signal: request.signal,
  });
}

/** Applies the public MCP deadline without leaking unfinished errors to clients. */
export async function withMcpDeadline<T>(
  operation: Promise<T>,
  timeoutMs = MCP_REQUEST_TIMEOUT_MS,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new McpRequestPolicyError("request_timeout", 504)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
