function mergeHeaderList(current: string | null, next: string) {
  const values = new Set(
    [current, next]
      .filter(Boolean)
      .flatMap((value) => value!.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  );

  return Array.from(values).join(",");
}

function applyProxyHeader(headers: Headers, name: string, value: string) {
  const lowerName = name.toLowerCase();

  if (
    lowerName === "set-cookie" ||
    lowerName === "www-authenticate" ||
    lowerName === "proxy-authenticate" ||
    lowerName === "link"
  ) {
    headers.append(name, value);
    return;
  }

  if (lowerName === "vary") {
    headers.set(name, mergeHeaderList(headers.get(name), value));
    return;
  }

  headers.set(name, value);
}

export function applyWorkOSProxyHeaders(response: Response, workosHeaders: Headers) {
  const existingOverrideHeaders = response.headers.get("x-middleware-override-headers");

  for (const [name, value] of workosHeaders) {
    const lowerName = name.toLowerCase();
    if (
      lowerName === "x-middleware-next" ||
      lowerName === "x-middleware-override-headers" ||
      lowerName.startsWith("x-middleware-request-")
    ) {
      continue;
    }

    applyProxyHeader(response.headers, name, value);
  }

  const overrideHeaders = workosHeaders.get("x-middleware-override-headers");
  if (overrideHeaders) {
    response.headers.set(
      "x-middleware-override-headers",
      mergeHeaderList(existingOverrideHeaders, overrideHeaders),
    );
  }

  for (const [name, value] of workosHeaders) {
    if (name.toLowerCase().startsWith("x-middleware-request-")) {
      response.headers.set(name, value);
    }
  }

  return response;
}
