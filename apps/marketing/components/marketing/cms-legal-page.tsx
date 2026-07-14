import { LegalArticle, LegalBlock } from "@/components/design-system";
import type { MarketingLegalPageContent } from "@/lib/content";

/** Renders one typed legal-page composition from repository or Contentful inputs. */
export function CmsLegalPage({ content }: { content: MarketingLegalPageContent }) {
  return (
    <LegalArticle eyebrow={content.eyebrow} title={content.title} updated={content.updated}>
      {content.sections.map((section) => (
        <LegalBlock key={section.title} title={section.title}>
          {section.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.bulletItems.length > 0 && (
            <ul className="list-inside list-disc space-y-1">
              {section.bulletItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </LegalBlock>
      ))}
    </LegalArticle>
  );
}
