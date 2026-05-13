type UploadThingTokenPayload = {
  apiKey?: string;
  appId?: string;
};

export function hydrateUploadThingEnvFromToken() {
  if (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) return;

  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (!token) return;

  try {
    const payload = JSON.parse(Buffer.from(token.replace(/^['"]|['"]$/g, ""), "base64").toString("utf8")) as UploadThingTokenPayload;
    if (!process.env.UPLOADTHING_SECRET && payload.apiKey) {
      process.env.UPLOADTHING_SECRET = payload.apiKey;
    }
    if (!process.env.UPLOADTHING_APP_ID && payload.appId) {
      process.env.UPLOADTHING_APP_ID = payload.appId;
    }
  } catch {
    // UploadThing will surface its own configuration error if the token is malformed.
  }
}
