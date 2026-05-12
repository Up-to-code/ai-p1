"use client";

import { ArrowLeft, ArrowRight, Check, CheckCircle2, KeyRound, Link2, Save, ShieldCheck, Sparkles } from "lucide-react";
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

type StepId = "identity" | "oauth" | "permissions" | "review";

const steps: Array<{
  id: StepId;
  title: string;
  description: string;
  icon: typeof Sparkles;
  fields: FieldPath<PartnerAppFormValues>[];
}> = [
  {
    id: "identity",
    title: "App identity",
    description: "How your product appears before a workspace admin leaves Hub.",
    icon: Sparkles,
    fields: ["name", "publisherName", "homepageUrl", "logoUrl", "iconUrl"],
  },
  {
    id: "oauth",
    title: "OAuth setup",
    description: "Redirect URLs, client type, and the partner authorization button.",
    icon: KeyRound,
    fields: ["clientType", "redirectUris"],
  },
  {
    id: "permissions",
    title: "Permissions",
    description: "Organization-level scopes shown during consent.",
    icon: ShieldCheck,
    fields: ["allowedScopes"],
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm the app is ready for admin review.",
    icon: CheckCircle2,
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

function StepIcon({ complete, active, icon: Icon }: { complete: boolean; active: boolean; icon: typeof Sparkles }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors",
        active
          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
          : complete
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-border bg-background text-muted-foreground",
      )}
    >
      {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
    </span>
  );
}

function HubFieldInputClass() {
  return "border-zinc-200 bg-zinc-50/60 text-[13px] font-medium focus:border-zinc-950 focus:ring-zinc-950/10 dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white dark:focus:ring-white/10";
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
  const resolvedScopesValue = checkpoints.resolvedScopes.join("\n");
  const values = form.watch();
  const currentStep = steps[activeStep];
  const hubInputClassName = HubFieldInputClass();

  useEffect(() => {
    form.setValue("allowedScopes", resolvedScopesValue, { shouldValidate: true });
  }, [form, resolvedScopesValue]);

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
      if (result.ok && mode === "edit") {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0A0A0A]">
      <input type="hidden" {...form.register("appId")} />
      <input type="hidden" {...form.register("allowedScopes")} />

      <div className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-5 dark:border-white/5 dark:bg-white/[0.02] md:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Partner app setup</p>
            <h2 className="mt-2 text-xl font-black uppercase tracking-tight text-zinc-950 dark:text-white">
              {mode === "edit" ? "Application settings" : "Create application"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
              Register the partner page, OAuth redirect URIs, and organization permissions shown during workspace authorization.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">CTA</p>
              <p className="mt-1 text-xs font-black uppercase text-zinc-950 dark:text-white">{AUTHORIZATION_CTA_COPY}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Lifetime</p>
              <p className="mt-1 text-xs font-black uppercase text-zinc-950 dark:text-white">{authorizationExpiryLabel()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[620px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-100 bg-zinc-50/35 p-4 dark:border-white/5 dark:bg-white/[0.01] lg:border-b-0 lg:border-r">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {steps.map((step, index) => {
              const active = index === activeStep;
              const complete = completedSteps[index];
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3 text-start transition-colors",
                    active
                      ? "border-zinc-950 bg-white shadow-sm dark:border-white dark:bg-white/[0.04]"
                      : "border-transparent hover:border-zinc-200 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/[0.03]",
                  )}
                >
                  <StepIcon complete={complete} active={active} icon={step.icon} />
                  <span className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">Step {index + 1}</span>
                    <span className="mt-1 block text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">{step.title}</span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-zinc-500">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 p-5 md:p-7">
          {activeStep === 0 && (
            <section className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Identity</p>
                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Product details shown in Hub</h3>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                  This is the information a workspace admin sees before visiting your product to start authorization.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="App name" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} placeholder="PDF Creator" className={hubInputClassName} />
                </Field>
                <Field label="Publisher" error={form.formState.errors.publisherName?.message}>
                  <Input {...form.register("publisherName")} placeholder="Your company" className={hubInputClassName} />
                </Field>
                <Field label="Partner app URL" error={form.formState.errors.homepageUrl?.message} className="md:col-span-2">
                  <Input {...form.register("homepageUrl")} placeholder="https://partner.example.com" className={hubInputClassName} />
                </Field>
                <Field label="Logo URL" error={form.formState.errors.logoUrl?.message}>
                  <Input {...form.register("logoUrl")} placeholder="https://..." className={hubInputClassName} />
                </Field>
                <Field label="Icon URL" error={form.formState.errors.iconUrl?.message}>
                  <Input {...form.register("iconUrl")} placeholder="https://..." className={hubInputClassName} />
                </Field>
              </div>
            </section>
          )}

          {activeStep === 1 && (
            <section className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">OAuth</p>
                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Authorization settings</h3>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                  Your frontend should display the “{AUTHORIZATION_CTA_COPY}” button. Hub handles consent, organization selection, and token exchange.
                </p>
              </div>
              <div className="grid gap-5">
                <Field label="App type" error={form.formState.errors.clientType?.message}>
                  <Select {...form.register("clientType")} disabled={mode === "edit"} className={hubInputClassName}>
                    <option value="public">Public PKCE app (Browser-based)</option>
                    <option value="confidential">Confidential server app (Trusted servers)</option>
                  </Select>
                </Field>
                <Field label="Redirect URIs (one per line)" error={form.formState.errors.redirectUris?.message as string | undefined}>
                  <Textarea
                    {...form.register("redirectUris")}
                    placeholder="https://partner.example.com/oauth/callback"
                    className={cn("min-h-[150px] font-mono text-sm", hubInputClassName)}
                  />
                </Field>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Frontend example</p>
                <pre className="mt-3 overflow-x-auto rounded-md bg-zinc-950 p-4 text-xs font-medium leading-6 text-white">
{`<button>
  ${AUTHORIZATION_CTA_COPY}
</button>`}
                </pre>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Permissions</p>
                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Consent checkpoints</h3>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                  Choose the organization data your app needs. Delete scopes require manual Anan approval and are not available in self-serve setup.
                </p>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {checkpoints.groups.map((group) => (
                  <div key={group.id} className="rounded-md border border-zinc-200 bg-zinc-50/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="mb-4 flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-950 dark:text-white" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">{group.title}</p>
                        <p className="mt-1 text-xs font-medium leading-5 text-zinc-500">{group.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {group.scopes.map((scope) => {
                        const checked = checkpoints.selectedScopes.includes(scope.value);
                        return (
                          <label
                            key={scope.value}
                            className={cn(
                              "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm font-bold transition-colors",
                              checked
                                ? "border-zinc-950 bg-white text-zinc-950 dark:border-white dark:bg-white/[0.04] dark:text-white"
                                : "border-zinc-200 bg-white/60 text-zinc-600 hover:border-zinc-400 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-300",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => checkpoints.toggleScope(scope.value)}
                              className="h-4 w-4 accent-zinc-950 dark:accent-white"
                            />
                            <span>{scope.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <Field label="Advanced custom scopes" error={form.formState.errors.allowedScopes?.message as string | undefined}>
                <Textarea
                  value={checkpoints.manualScopes}
                  onChange={(event) => checkpoints.setManualScopes(event.target.value)}
                  placeholder="custom:scope_name"
                  className={cn("min-h-[96px] font-mono text-sm", hubInputClassName)}
                />
              </Field>
            </section>
          )}

          {activeStep === 3 && (
            <section className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Review</p>
                <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-zinc-950 dark:text-white">Ready for admin review</h3>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
                  Confirm your app explains data use, has the correct authorization CTA, and stores tokens only on your backend.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["Application", values.name || "Not set"],
                  ["Publisher", values.publisherName || "Not set"],
                  ["Partner URL", values.homepageUrl || "Not set"],
                  ["Client type", values.clientType === "confidential" ? "Confidential server app" : "Public PKCE app"],
                  ["Authorization", `${AUTHORIZATION_CTA_COPY}, ${authorizationExpiryLabel()}`],
                  ["Scopes", checkpoints.resolvedScopes.join(", ") || "No scopes selected"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-zinc-200 bg-zinc-50/60 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
                    <p className="mt-2 break-words text-sm font-bold leading-6 text-zinc-950 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium leading-6 text-emerald-700 dark:text-emerald-300">
                <p className="font-black uppercase tracking-tight">Review checklist</p>
                <ul className="mt-2 space-y-1">
                  <li>Partner page explains what workspace data is used.</li>
                  <li>Frontend button says “{AUTHORIZATION_CTA_COPY}”.</li>
                  <li>OAuth tokens are stored and refreshed from your backend only.</li>
                </ul>
              </div>
            </section>
          )}

          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"} className="mt-7 border-zinc-200 bg-zinc-50/60 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-medium">{state.message}</p>
              {state.clientId && (
                <div className="mt-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client ID</p>
                  <p className="break-all font-mono text-sm text-foreground">{state.clientId}</p>
                </div>
              )}
              {state.clientSecret && (
                <div className="mt-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Secret</p>
                  <p className="break-all font-mono text-sm text-foreground">{state.clientSecret}</p>
                </div>
              )}
            </Alert>
          ) : null}
        </main>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 dark:border-white/5 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between md:px-6">
        <Button type="button" variant="outline" onClick={goBack} disabled={activeStep === 0 || isPending} className="h-10 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {activeStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={isPending} className="h-10 gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending} className="h-10 gap-2">
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : mode === "edit" ? "Save settings" : "Create app"}
          </Button>
        )}
      </div>
    </form>
  );
}
