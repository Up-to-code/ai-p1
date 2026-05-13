"use client";

import { ArrowLeft, ArrowRight, Check, ExternalLink, HelpCircle, KeyRound, Save, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccessCheckpoints } from "@/hooks/use-access-checkpoints";
import { usePartnerAppForm } from "@/hooks/use-partner-app-form";
import { AUTHORIZATION_CTA_COPY, authorizationExpiryLabel } from "@/lib/partner-authorization";
import { partnerAppFormSchema, type PartnerAppFormValues } from "@/lib/schemas/partner-app";
import { zodFormResolver } from "@/lib/schemas/resolver";
import { cn } from "@/lib/utils";
import type { PartnerAppSummary } from "@/server/partnerApps";
import { createPartnerAppAction, updatePartnerAppAction, type PartnerAppActionState } from "@/app/(portal)/dashboard/actions";

type StepId = "basics" | "authorization" | "access" | "review";

const steps: Array<{
  id: StepId;
  title: string;
  description: string;
  icon: typeof Sparkles;
  fields: FieldPath<PartnerAppFormValues>[];
}> = [
  {
    id: "basics",
    title: "Basics",
    description: "Name, publisher, and the page users will open.",
    icon: Sparkles,
    fields: ["name", "publisherName", "homepageUrl"],
  },
  {
    id: "authorization",
    title: "Authorization",
    description: "Client type and callback URL for OAuth.",
    icon: KeyRound,
    fields: ["clientType", "redirectUris"],
  },
  {
    id: "access",
    title: "Access",
    description: "The organization data your app can request.",
    icon: ShieldCheck,
    fields: ["allowedScopes"],
  },
  {
    id: "review",
    title: "Review",
    description: "Check the setup before saving.",
    icon: Check,
    fields: [],
  },
];

function defaultValues(app?: PartnerAppSummary): PartnerAppFormValues {
  return {
    appId: app?.id,
    name: app?.name ?? "",
    publisherName: app?.publisherName ?? "",
    iconUrl: app?.iconUrl ?? "",
    logoUrl: app?.logoUrl ?? "",
    homepageUrl: app?.homepageUrl ?? "",
    clientType: app?.clientType ?? "public",
    redirectUris: app?.redirectUris.join("\n") ?? "",
    allowedScopes: app?.allowedScopes.join("\n") ?? "organization:read\nclient:read\nproperty:read",
  };
}

function StepMarker({ complete, active, icon: Icon }: { complete: boolean; active: boolean; icon: typeof Sparkles }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[7px] border transition-colors",
        active
          ? "border-[#071A34] bg-[#071A34] text-white dark:border-white dark:bg-white dark:text-zinc-950"
          : complete
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
            : "border-border bg-white text-muted-foreground dark:bg-white/[0.03]",
      )}
    >
      {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
    </span>
  );
}

function HelpTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <HelpCircle className="size-3.5" />
      </button>
      <span className="pointer-events-none absolute left-1/2 top-7 z-20 hidden w-64 -translate-x-1/2 rounded-[7px] border border-border bg-white p-3 text-xs font-medium leading-5 text-muted-foreground shadow-[0_16px_50px_rgba(7,26,52,0.14)] group-hover:block group-focus-within:block dark:bg-card">
        {text}
      </span>
    </span>
  );
}

function LabelText({ children, help }: { children: string; help: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <HelpTip text={help} />
    </span>
  );
}

function inputClassName() {
  return "border-border bg-white text-[13px] font-medium focus:border-primary focus:ring-primary/15 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white dark:focus:ring-white/10";
}

export function PartnerAppForm({ app, mode = "create" }: { app?: PartnerAppSummary; mode?: "create" | "edit" }) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<PartnerAppActionState>({ ok: false });
  const { initialScopes } = usePartnerAppForm(app);
  const checkpoints = useAccessCheckpoints(initialScopes);
  const form = useForm<PartnerAppFormValues>({
    resolver: zodFormResolver(partnerAppFormSchema),
    defaultValues: defaultValues(app),
    mode: "onBlur",
  });
  const values = form.watch();
  const currentStep = steps[activeStep];
  const fieldClassName = inputClassName();
  const exitHref = app ? `/dashboard/apps/${app.id}` : "/dashboard/apps";

  useEffect(() => {
    form.setValue("allowedScopes", checkpoints.resolvedScopes.join("\n"), { shouldValidate: true });
  }, [checkpoints.resolvedScopes, form]);

  const completedSteps = useMemo(() => {
    return steps.map((step, index) => {
      if (index < activeStep) return true;
      if (step.id === "review") return false;
      return step.fields.length > 0 && step.fields.every((field) => Boolean(form.getValues(field)));
    });
  }, [activeStep, form, values.allowedScopes, values.clientType, values.homepageUrl, values.name, values.publisherName, values.redirectUris]);

  async function goNext() {
    const isValid = currentStep.fields.length === 0 || await form.trigger(currentStep.fields, { shouldFocus: true });
    if (isValid) setActiveStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setActiveStep((step) => Math.max(step - 1, 0));
  }

  function submit(values: PartnerAppFormValues) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (Array.isArray(value)) {
        formData.set(key, value.join("\n"));
      } else if (value !== undefined) {
        formData.set(key, String(value));
      }
    }

    startTransition(async () => {
      const result = mode === "edit"
        ? await updatePartnerAppAction(formData)
        : await createPartnerAppAction({ ok: false }, formData);
      setState(result);
      if (result.ok && mode === "edit") router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="overflow-hidden rounded-[15px] border border-border bg-white shadow-[0_18px_70px_rgba(7,26,52,0.06)] dark:border-white/10 dark:bg-card">
      <input type="hidden" {...form.register("appId")} />
      <input type="hidden" {...form.register("allowedScopes")} />
      <input type="hidden" {...form.register("logoUrl")} />
      <input type="hidden" {...form.register("iconUrl")} />

      <div className="grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-background p-4 dark:bg-white/[0.02] lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{mode === "edit" ? "Edit app" : "New app"}</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">OAuth setup</h2>
            </div>
            <span className="rounded-full border border-border bg-white px-2 py-1 text-xs font-bold text-muted-foreground dark:bg-white/[0.03]">
              {activeStep + 1}/{steps.length}
            </span>
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {steps.map((step, index) => {
              const active = index === activeStep;
              const complete = completedSteps[index];
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "flex items-center gap-3 rounded-[7px] border p-2.5 text-start transition-colors",
                    active
                      ? "border-[#071A34] bg-white dark:border-white dark:bg-white/[0.04]"
                      : "border-transparent hover:border-border hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/[0.03]",
                  )}
                >
                  <StepMarker active={active} complete={complete} icon={Icon} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">{step.title}</span>
                    {active ? <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">{step.description}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-[500px] p-5 md:p-8">
          {activeStep === 0 && (
            <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase text-primary">Basics</p>
                  <h3 className="mt-2 text-2xl font-bold text-foreground">What should Anan show users?</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    These fields appear in the partner catalog, review queue, and authorization handoff.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={<LabelText help="The product name workspace admins will recognize before opening your partner app.">App name</LabelText>} error={form.formState.errors.name?.message}>
                    <Input {...form.register("name")} placeholder="PDF Creator" className={fieldClassName} />
                  </Field>
                  <Field label={<LabelText help="The company, team, or developer organization responsible for this app.">Publisher</LabelText>} error={form.formState.errors.publisherName?.message}>
                    <Input {...form.register("publisherName")} placeholder="Your company" className={fieldClassName} />
                  </Field>
                  <Field label={<LabelText help="This is where Anan sends a workspace admin when they choose Visit Partner.">Partner app URL</LabelText>} error={form.formState.errors.homepageUrl?.message}>
                    <Input {...form.register("homepageUrl")} placeholder="https://partner.example.com" className={fieldClassName} />
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Need a local demo? Use <span className="font-mono text-foreground">http://localhost:3004</span> while developing.
                    </p>
                  </Field>
                </div>
              </div>

              <div className="rounded-[11px] border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase text-primary">User-facing preview</p>
                <div className="mt-4 rounded-[9px] border border-border bg-white p-4 dark:bg-white/[0.03]">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Partner app</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{values.name || "App name"}</p>
                  <p className="mt-1 text-sm font-semibold text-muted-foreground">{values.publisherName || "Publisher"}</p>
                  <p className="mt-4 break-words text-xs leading-5 text-muted-foreground">{values.homepageUrl || "https://partner.example.com"}</p>
                </div>
              </div>
            </section>
          )}

          {activeStep === 1 && (
            <section className="max-w-4xl space-y-6">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Authorization</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">How does Anan return users?</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your app starts the OAuth flow. Anan redirects back to your callback with an authorization code.
                </p>
              </div>

              <div className="rounded-[15px] border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Link href="/docs/oauth-flow" className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 hover:text-foreground dark:bg-card">
                    OAuth guide <ExternalLink className="size-3" />
                  </Link>
                  <Link href="/docs/register-an-app" className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 hover:text-foreground dark:bg-card">
                    Redirect URI rules <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Field label={<LabelText help="Public apps use PKCE and no secret. Confidential apps use a server-side client secret.">App type</LabelText>} error={form.formState.errors.clientType?.message}>
                  <Select {...form.register("clientType")} disabled={mode === "edit"} className={fieldClassName}>
                    <option value="public">Public PKCE app</option>
                    <option value="confidential">Confidential server app</option>
                  </Select>
                </Field>
                <Field label={<LabelText help="Anan redirects users to this URL after consent. Add one per line if you need multiple environments.">Redirect URI</LabelText>} error={form.formState.errors.redirectUris?.message as string | undefined}>
                  <Textarea
                    {...form.register("redirectUris")}
                    placeholder="https://partner.example.com/api/auth/anan/callback"
                    className={cn("min-h-[112px] font-mono text-sm", fieldClassName)}
                  />
                </Field>
              </div>
              <div className="rounded-[15px] border border-border bg-[#071A34] p-4 text-white">
                <p className="text-xs font-bold uppercase text-[#B1BCC7]">Button copy</p>
                <p className="mt-2 text-lg font-bold">{AUTHORIZATION_CTA_COPY}</p>
                <p className="mt-2 text-xs leading-5 text-[#B1BCC7]">
                  Use this copy exactly so users understand they are authorizing Anan organization access.
                </p>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="space-y-6">
              <div className="mx-auto max-w-2xl">
                <p className="text-xs font-bold uppercase text-primary">Access</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">What data does the app need?</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start with read-only scopes. Add write scopes only when the product cannot work without them.
                </p>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {checkpoints.groups.map((group) => (
                  <div key={group.id} className="rounded-[15px] border border-border bg-background p-4 dark:bg-white/[0.02]">
                    <div className="mb-4">
                      <p className="text-sm font-bold text-foreground">{group.title}</p>
                      <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">{group.description}</p>
                    </div>
                    <div className="space-y-2">
                      {group.scopes.map((scope) => {
                        const checked = checkpoints.selectedScopes.includes(scope.value);
                        return (
                          <label
                            key={scope.value}
                            className={cn(
                              "flex min-h-11 cursor-pointer items-center gap-3 rounded-[7px] border bg-white px-3 py-2 text-sm font-semibold transition-colors dark:bg-white/[0.03]",
                              checked ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => checkpoints.toggleScope(scope.value)}
                              className="size-4 accent-[#071A34]"
                            />
                            <span>{scope.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mx-auto max-w-2xl">
                <Field label={<LabelText help="Use custom scopes only if Anan has told you to include one.">Advanced custom scopes</LabelText>} error={form.formState.errors.allowedScopes?.message as string | undefined}>
                  <Textarea
                    value={checkpoints.manualScopes}
                    onChange={(event) => checkpoints.setManualScopes(event.target.value)}
                    placeholder="custom:scope_name"
                    className={cn("min-h-[88px] font-mono text-sm", fieldClassName)}
                  />
                </Field>
              </div>
            </section>
          )}

          {activeStep === 3 && (
            <section className="mx-auto max-w-3xl space-y-6">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Review</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">Ready to save</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Check the values below. You can save a draft first, then submit from the app details page.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {([
                  ["App", values.name || "Not set"],
                  ["Publisher", values.publisherName || "Not set"],
                  ["Partner URL", values.homepageUrl || "Not set"],
                  ["Client type", values.clientType === "confidential" ? "Confidential server app" : "Public PKCE app"],
                  ["Redirect URI", String(values.redirectUris || "Not set")],
                  ["Scopes", checkpoints.resolvedScopes.join(", ") || "No scopes selected"],
                ] satisfies Array<[string, string]>).map(([label, value]) => (
                  <div key={label} className="rounded-[7px] border border-border bg-background p-4">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
                    <p className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <Alert variant="default">
                Authorization expires after {authorizationExpiryLabel()}. Admin review can still reject broad scope requests.
              </Alert>
            </section>
          )}

          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"} className="mt-7">
              <p>{state.message}</p>
              {state.clientId ? <p className="mt-2 break-all font-mono text-xs">Client ID: {state.clientId}</p> : null}
              {state.clientSecret ? <p className="mt-2 break-all font-mono text-xs">Client secret: {state.clientSecret}</p> : null}
            </Alert>
          ) : null}
        </main>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        {activeStep === 0 ? (
          <Link
            href={exitHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted dark:bg-card"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>
        ) : (
          <Button type="button" variant="outline" onClick={goBack} disabled={isPending} className="h-10 gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={isPending} className="h-10 gap-2">
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending} className="h-10 gap-2">
            <Save className="size-4" />
            {isPending ? "Saving..." : mode === "edit" ? "Save settings" : "Create app"}
          </Button>
        )}
      </div>
    </form>
  );
}
