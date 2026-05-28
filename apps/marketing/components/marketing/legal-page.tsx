import type { ReactNode } from "react";

import { LegalArticle, LegalBlock } from "@/components/landing/public-page-shell";
import { getContent, type LegalBlockBody, type Locale } from "@/lib/content";

export function LegalPage({ locale, kind }: { locale: Locale; kind: "privacy" | "terms" | "legal" }) {
  const copy = getContent(locale).legal;
  const title = kind === "privacy" ? copy.privacyTitle : kind === "terms" ? copy.termsTitle : copy.legalTitle;
  const updated = kind === "privacy" ? copy.privacyUpdated : kind === "terms" ? copy.termsUpdated : copy.legalUpdated;
  const blocks = kind === "privacy" ? copy.privacy : kind === "terms" ? copy.terms : copy.legal;

  return (
    <LegalArticle title={title} updated={updated}>
      {blocks.map((item) => (
        <LegalBlock key={item.title} title={item.title}>
          <RichBlockBody body={item.body} />
        </LegalBlock>
      ))}
    </LegalArticle>
  );
}

function RichBlockBody({ body }: { body: LegalBlockBody }) {
  const items = Array.isArray(body) ? body : body.split("\n\n");

  return (
    <>
      {items.map((item, index): ReactNode =>
        Array.isArray(item) ? (
          <ul className="my-4 list-disc space-y-2 px-6" key={`list-${index}`}>
            {item.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p key={item}>{item}</p>
        ),
      )}
    </>
  );
}
