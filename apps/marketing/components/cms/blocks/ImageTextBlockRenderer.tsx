import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RichTextRenderer } from "../rich-text-renderer";

type ImageTextBlockData = {
  layout: "imageLeft" | "imageRight";
  image: {
    url: string;
    alt?: string;
  };
  title?: string;
  content: Record<string, unknown>;
  cta?: {
    label?: string;
    href?: string;
  };
};

type ImageTextBlockRendererProps = {
  data: ImageTextBlockData;
};

export function ImageTextBlockRenderer({ data }: ImageTextBlockRendererProps) {
  const { layout, image, title, content, cta } = data;
  const isImageLeft = layout === "imageLeft";

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          className={`grid gap-8 lg:grid-cols-2 lg:gap-12 ${
            isImageLeft ? "" : "lg:grid-flow-dense"
          }`}
        >
          {/* Image */}
          <div className={`relative aspect-video overflow-hidden rounded-2xl bg-muted ${isImageLeft ? "" : "lg:col-start-2"}`}>
            <Image
              src={image.url}
              alt={image.alt || title || ""}
              fill
              className="object-cover"
            />
          </div>

          {/* Text Content */}
          <div className={`flex flex-col justify-center space-y-6 ${isImageLeft ? "" : "lg:col-start-1"}`}>
            {title && (
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {title}
              </h2>
            )}

            <div className="prose prose-lg dark:prose-invert">
              <RichTextRenderer content={content} />
            </div>

            {cta?.label && cta?.href && (
              <div>
                <Link
                  href={cta.href}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {cta.label}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
