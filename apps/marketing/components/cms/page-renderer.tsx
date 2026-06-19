import React from "react";
import { HeroBlockRenderer } from "./blocks/HeroBlockRenderer";
import { RichTextBlockRenderer } from "./blocks/RichTextBlockRenderer";
import { FeatureGridBlockRenderer } from "./blocks/FeatureGridBlockRenderer";
import { ImageTextBlockRenderer } from "./blocks/ImageTextBlockRenderer";
import { CTASectionBlockRenderer } from "./blocks/CTASectionBlockRenderer";
import { StatsBlockRenderer } from "./blocks/StatsBlockRenderer";
import { TestimonialBlockRenderer } from "./blocks/TestimonialBlockRenderer";
import type { CMSPage } from "@/lib/cms-pages";

type PageRendererProps = {
  page: CMSPage;
};

type BlockData = {
  blockType: string;
  [key: string]: unknown;
};

/**
 * Renders a CMS page with its sections/blocks
 */
export function PageRenderer({ page }: PageRendererProps) {
  if (!page.sections || page.sections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold">{page.title}</h1>
        {page.excerpt && (
          <p className="mt-4 text-lg text-muted-foreground">{page.excerpt}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {page.sections.map((section, index) => (
        <BlockRenderer key={index} block={section as BlockData} />
      ))}
    </div>
  );
}

/**
 * Renders an individual content block based on its type
 */
function BlockRenderer({ block }: { block: BlockData }) {
  const { blockType, ...data } = block;

  switch (blockType) {
    case "hero":
      return <HeroBlockRenderer data={data as any} />;

    case "richText":
      return <RichTextBlockRenderer data={data as any} />;

    case "featureGrid":
      return <FeatureGridBlockRenderer data={data as any} />;

    case "imageText":
      return <ImageTextBlockRenderer data={data as any} />;

    case "ctaSection":
      return <CTASectionBlockRenderer data={data as any} />;

    case "stats":
      return <StatsBlockRenderer data={data as any} />;

    case "testimonial":
      return <TestimonialBlockRenderer data={data as any} />;

    default:
      console.warn(`Unknown block type: ${blockType}`);
      return null;
  }
}
