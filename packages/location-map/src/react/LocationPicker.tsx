"use client";

import { MapPin, Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import type { LocationValue } from "../types";
import LocationPreview from "./LocationPreview";

type MapboxFeature = {
  id: string;
  place_name?: string;
  place_name_ar?: string;
  text?: string;
  center?: [number, number];
  context?: Array<{ id: string; text?: string; text_ar?: string }>;
};

function readContext(feature: MapboxFeature, prefix: string) {
  return feature.context?.find((item) => item.id.startsWith(prefix))?.text_ar
    ?? feature.context?.find((item) => item.id.startsWith(prefix))?.text;
}

function mapFeatureToLocation(feature: MapboxFeature): LocationValue | null {
  const [longitude, latitude] = feature.center ?? [];
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const city = readContext(feature, "place") ?? readContext(feature, "region");
  const district = readContext(feature, "neighborhood") ?? readContext(feature, "locality");

  return {
    label: feature.place_name_ar ?? feature.place_name ?? feature.text ?? "نقطة محددة على الخريطة",
    city,
    district,
    latitude,
    longitude,
  };
}

export default function LocationPicker({
  value,
  onChange,
  label = "النقطة على الخريطة",
  placeholder = "ابحث عن مدينة أو حي أو عنوان",
  fieldError,
}: {
  value?: LocationValue | null;
  onChange: (location: LocationValue) => void;
  label?: string;
  placeholder?: string;
  fieldError?: string;
}) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const disabled = !token;
  const canSearch = useMemo(() => query.trim().length >= 2 && !disabled, [disabled, query]);

  const search = () => {
    if (!canSearch || !token) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          access_token: token,
          country: "SA",
          language: "ar",
          limit: "5",
        });
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query.trim())}.json?${params.toString()}`);
        if (!response.ok) {
          throw new Error("تعذر البحث عن الموقع الآن.");
        }
        const payload = await response.json() as { features?: MapboxFeature[] };
        setResults(payload.features ?? []);
        if (!payload.features?.length) {
          setMessage("لا توجد نتائج مطابقة.");
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "تعذر البحث عن الموقع الآن.");
      }
    });
  };

  return (
    <div className="grid gap-3 text-right">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-bold text-rose-400">{fieldError}</span>
        <span className="text-[12px] font-black text-[var(--workspace-muted)]">{label}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={search}
          disabled={!canSearch || isPending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-4 text-[12px] font-black text-background transition disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Search className="h-4 w-4" />
          بحث
        </button>
        <div className="relative min-w-0 flex-1">
          <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--workspace-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search();
              }
            }}
            placeholder={disabled ? "أضف NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN لتفعيل البحث." : placeholder}
            disabled={disabled}
            className="h-11 w-full rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 pr-10 text-right text-sm font-bold text-foreground outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-foreground disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
      {message ? <p className="text-[12px] font-bold text-[var(--workspace-muted)]">{message}</p> : null}
      {results.length > 0 ? (
        <div className="grid gap-2">
          {results.map((feature) => (
            <button
              key={feature.id}
              type="button"
              onClick={() => {
                const location = mapFeatureToLocation(feature);
                if (!location) return;
                onChange(location);
                setQuery(location.label);
                setResults([]);
              }}
              className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-3 text-right text-[13px] font-black text-foreground transition hover:bg-[var(--workspace-elevated)]"
            >
              {feature.place_name_ar ?? feature.place_name ?? feature.text}
            </button>
          ))}
        </div>
      ) : null}
      <LocationPreview value={value} title="معاينة الموقع" compact />
    </div>
  );
}
