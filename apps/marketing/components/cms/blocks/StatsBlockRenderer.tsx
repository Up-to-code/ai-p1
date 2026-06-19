import React from "react";

type Stat = {
  value: string;
  label: string;
  description?: string;
};

type StatsBlockData = {
  title?: string;
  stats: Stat[];
};

type StatsBlockRendererProps = {
  data: StatsBlockData;
};

export function StatsBlockRenderer({ data }: StatsBlockRendererProps) {
  const { title, stats } = data;

  return (
    <section className="bg-muted py-16 md:py-24">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h2>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-medium text-foreground">
                {stat.label}
              </div>
              {stat.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
