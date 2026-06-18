"use client";

import type { FormEvent } from "react";
import { Mail, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WorkspaceContactPage() {
  const t = useTranslations("Landing.contact");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const subject = String(data.get("topic") || t("form.eyebrow"));
    const body = [
      `${t("form.name")}: ${data.get("name") || ""}`,
      `${t("form.email")}: ${data.get("email") || ""}`,
      `${t("form.team")}: ${data.get("team") || ""}`,
      "",
      `${t("form.message")}:`,
      data.get("message") || "",
    ].join("\n");

    window.location.href = `mailto:hello@qentrah.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <main
      className="px-6 py-28 md:py-32"
      style={{ background: "var(--q-bg)", fontFamily: "var(--font-sans)" }}
    >
      <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

        {/* ── Left column ─────────────────────── */}
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.24em]"
            style={{ color: "var(--q-accent)" }}
          >
            {t("hero.eyebrow")}
          </p>
          <h1
            className="mt-4 text-4xl font-bold tracking-tight md:text-5xl rtl:leading-[1.14]"
            style={{ color: "var(--q-text-primary)" }}
          >
            {t("hero.title")}
          </h1>
          <p
            className="mt-5 max-w-md text-sm font-medium leading-7"
            style={{ color: "var(--q-text-secondary)" }}
          >
            {t("hero.description")}
          </p>

          <div className="mt-8 space-y-3">
            <a
              className="flex items-center gap-3 text-sm font-bold transition"
              href="mailto:hello@qentrah.com"
              style={{ color: "var(--q-text-primary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--q-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--q-text-primary)"; }}
            >
              <Mail className="h-4 w-4" />
              hello@qentrah.com
            </a>
            <a
              className="flex items-center gap-3 text-sm font-bold transition"
              href="tel:+966110000000"
              style={{ color: "var(--q-text-primary)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--q-accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--q-text-primary)"; }}
            >
              <Phone className="h-4 w-4" />
              +966 11 XXX XXXX
            </a>
          </div>
        </div>

        {/* ── Form ────────────────────────────── */}
        <form
          className="rounded-3xl border p-5 md:p-6"
          style={{ borderColor: "var(--q-border)", background: "var(--q-card)" }}
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="contact-name" label={t("form.name")} name="name" />
            <Field id="contact-email" label={t("form.email")} name="email" type="email" />
            <Field id="contact-team" label={t("form.team")} name="team" />
            <Field id="contact-topic" label={t("form.topic")} name="topic" />
          </div>

          <div className="mt-5 space-y-2">
            <Label
              htmlFor="contact-message"
              className="text-[11px] font-black uppercase tracking-[0.18em]"
              style={{ color: "var(--q-text-muted)" }}
            >
              {t("form.message")}
            </Label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              className="flex w-full resize-none rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition focus-visible:ring-4 focus-visible:ring-[var(--q-accent-muted)]"
              style={{
                borderColor: "var(--q-border)",
                background: "var(--q-input-bg, var(--q-bg-very-light))",
                color: "var(--q-text-primary)",
              }}
            />
          </div>

          <Button
            type="submit"
            className="mt-6 h-12 rounded-full px-7 text-[11px] font-black uppercase tracking-[0.16em] text-white"
            style={{ background: "var(--q-accent)" }}
          >
            <Send className="h-3.5 w-3.5" />
            {t("form.submit")}
          </Button>
        </form>
      </section>
    </main>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-black uppercase tracking-[0.18em]"
        style={{ color: "var(--q-text-muted)" }}
      >
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        className="h-12 rounded-2xl text-sm font-semibold shadow-none"
        style={{
          borderColor: "var(--q-border)",
          background: "var(--q-input-bg, var(--q-bg-very-light))",
          color: "var(--q-text-primary)",
        }}
      />
    </div>
  );
}
