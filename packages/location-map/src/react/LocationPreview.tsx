import { MapPin } from "lucide-react";
import type { LocationValue } from "../types";
import { formatLocationLabel, hasMapPoint } from "../types";

function buildStaticMapUrl(location: LocationValue & { latitude: number; longitude: number }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;

  const longitude = location.longitude.toFixed(6);
  const latitude = location.latitude.toFixed(6);
  const pin = `pin-s+2563eb(${longitude},${latitude})`;
  return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${pin}/${longitude},${latitude},14,0/900x420?access_token=${encodeURIComponent(token)}`;
}

export default function LocationPreview({
  value,
  title = "الموقع",
  compact = false,
}: {
  value?: LocationValue | null;
  title?: string;
  compact?: boolean;
}) {
  const mapUrl = hasMapPoint(value) ? buildStaticMapUrl(value) : null;
  const label = formatLocationLabel(value, "لا توجد نقطة خريطة محددة");

  return (
    <section className="overflow-hidden rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-right">
      <div className="flex items-center justify-between gap-3 border-b border-[color:var(--workspace-border)] px-4 py-3">
        <span className="text-[12px] font-black text-[var(--workspace-muted)]">
          {hasMapPoint(value) ? `${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}` : "بدون إحداثيات"}
        </span>
        <div className="flex items-center justify-end gap-2">
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          <MapPin className="h-4 w-4 text-[var(--workspace-muted)]" />
        </div>
      </div>
      <div className={compact ? "h-44" : "h-64"}>
        {mapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mapUrl} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--workspace-elevated)] px-4 text-center text-[13px] font-black text-[var(--workspace-muted)]">
            {hasMapPoint(value) ? "أضف NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN لعرض الخريطة." : label}
          </div>
        )}
      </div>
      <div className="border-t border-[color:var(--workspace-border)] px-4 py-3 text-[13px] font-black text-foreground">
        {label}
      </div>
    </section>
  );
}
