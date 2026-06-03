"use client";

import type { FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContactFormCopy = {
  eyebrow: string;
  name: string;
  email: string;
  team: string;
  topic: string;
  message: string;
  submit: string;
};

export function ContactFormClient({ copy }: { copy: ContactFormCopy }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const subject = String(data.get("topic") || copy.eyebrow);
    const body = [
      `${copy.name}: ${data.get("name") || ""}`,
      `${copy.email}: ${data.get("email") || ""}`,
      `${copy.team}: ${data.get("team") || ""}`,
      "",
      `${copy.message}:`,
      data.get("message") || "",
    ].join("\n");

    window.location.href = `mailto:hello@qentrah.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.04] md:p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="contact-name" label={copy.name} name="name" />
        <Field id="contact-email" label={copy.email} name="email" type="email" />
        <Field id="contact-team" label={copy.team} name="team" />
        <Field id="contact-topic" label={copy.topic} name="topic" />
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="contact-message" className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
          {copy.message}
        </Label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          className="flex w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 outline-none transition focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
        />
      </div>

      <Button type="submit" className="mt-6 h-12 rounded-full bg-zinc-950 px-7 text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
        <Send className="h-3.5 w-3.5" />
        {copy.submit}
      </Button>
    </form>
  );
}

function Field({ id, label, name, type = "text" }: { id: string; label: string; name: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </Label>
      <Input id={id} name={name} type={type} className="h-12 rounded-2xl border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950" />
    </div>
  );
}

