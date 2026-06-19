import React from "react";
import Image from "next/image";

type Testimonial = {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: {
    url: string;
    alt?: string;
  };
  companyLogo?: {
    url: string;
    alt?: string;
  };
};

type TestimonialBlockData = {
  title?: string;
  testimonials: Testimonial[];
};

type TestimonialBlockRendererProps = {
  data: TestimonialBlockData;
};

export function TestimonialBlockRenderer({ data }: TestimonialBlockRendererProps) {
  const { title, testimonials } = data;

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6">
      {/* Quote */}
      <blockquote className="flex-1 text-base text-foreground">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="mt-6 flex items-center gap-4">
        {testimonial.authorAvatar && (
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={testimonial.authorAvatar.url}
              alt={testimonial.authorAvatar.alt || testimonial.authorName}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="font-semibold text-foreground">
            {testimonial.authorName}
          </div>
          {testimonial.authorRole && (
            <div className="text-sm text-muted-foreground">
              {testimonial.authorRole}
            </div>
          )}
        </div>

        {testimonial.companyLogo && (
          <div className="relative h-8 w-16">
            <Image
              src={testimonial.companyLogo.url}
              alt={testimonial.companyLogo.alt || "Company logo"}
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
