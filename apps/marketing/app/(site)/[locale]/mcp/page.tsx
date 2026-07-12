import { redirect } from "next/navigation";
import { isLocale, productUrls } from "@/lib/content";

export default async function MarketingMcpHandoffPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  const activeLocale = isLocale(locale) ? locale : "en";
  const target = new URL(`/${activeLocale}/mcp`, productUrls.workspace);

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) target.searchParams.append(key, item);
    } else if (value) {
      target.searchParams.set(key, value);
    }
  }

  if (!target.searchParams.has("create")) {
    target.searchParams.set("create", "1");
  }

  redirect(target.toString());
}
