"use client";

export function TrustedByCloud({ isAr }: { isAr: boolean }) {
  const brands = [
    "Amazon", "NVIDIA", "Wayfair", "Verizon", "Spotify", "Stanford",
  ];

  return (
    <section className="cu-trusted" dir={isAr ? "rtl" : "ltr"}>
      <p className="cu-trusted-label">
        {isAr ? "موثوق من الأفضل" : "TRUSTED BY THE BEST"}
      </p>
      <div className="cu-trusted-logos">
        {brands.map((brand) => (
          <span key={brand} className="cu-trusted-logo">
            {brand}
          </span>
        ))}
      </div>

      <style>{`
        .cu-trusted {
          text-align: center;
          padding: 48px 0 0;
          border-top: 1px solid var(--q-border);
          margin-top: 0;
        }
        .cu-trusted-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--q-text-muted);
          margin-bottom: 24px;
        }
        .cu-trusted-logos {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .cu-trusted-logos { gap: 24px; }
        }
        .cu-trusted-logo {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--q-text-muted);
          opacity: 0.6;
          transition: opacity 0.2s;
          user-select: none;
        }
        .cu-trusted-logo:hover {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
