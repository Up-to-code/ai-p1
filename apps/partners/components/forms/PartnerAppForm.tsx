"use client";

import { ArrowLeft, ArrowRight, Bug, Check, KeyRound, Rocket, Save, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccessCheckpoints } from "@/hooks/use-access-checkpoints";
import { usePartnerAppForm } from "@/hooks/use-partner-app-form";
import { partnerAppFormSchema, type PartnerAppFormValues } from "@/lib/schemas/partner-app";
import { zodFormResolver } from "@/lib/schemas/resolver";
import { cn } from "@/lib/utils";
import type { PartnerAppSummary } from "@/server/partnerApps";
import { createPartnerAppAction, updatePartnerAppAction, type PartnerAppActionState } from "@/app/(portal)/dashboard/actions";

type StepId = "profile" | "integrate" | "sandbox" | "production";

const steps: Array<{
  id: StepId;
  title: string;
  caption: string;
  icon: typeof Sparkles;
  fields: FieldPath<PartnerAppFormValues>[];
}> = [
  {
    id: "profile",
    title: "App profile",
    caption: "Catalog identity",
    icon: Sparkles,
    fields: ["name", "publisherName", "description", "appCategory", "supportEmail", "homepageUrl"],
  },
  {
    id: "integrate",
    title: "Integrate & debug",
    caption: "OAuth callback",
    icon: KeyRound,
    fields: ["integrationMode", "clientType", "redirectUris"],
  },
  {
    id: "sandbox",
    title: "Sandbox & Workspace",
    caption: "Scopes and webhooks",
    icon: ShieldCheck,
    fields: ["allowedScopes", "webhookUrl"],
  },
  {
    id: "production",
    title: "Production",
    caption: "Review readiness",
    icon: Rocket,
    fields: ["privacyPolicyUrl", "termsOfServiceUrl"],
  },
];

const categoryOptions = [
  { value: "brokerage", label: "Brokerage tools" },
  { value: "developer", label: "Developer / project portal" },
  { value: "crm", label: "CRM and sales ops" },
  { value: "marketing", label: "Marketing automation" },
  { value: "operations", label: "Operations workflow" },
  { value: "other", label: "Other integration" },
] as const;

const integrationModes = [
  {
    value: "integrate",
    label: "Integrate",
    title: "Wire the SDK",
    description: "Use this while adding the button, callback route, and token storage.",
    icon: KeyRound,
  },
  {
    value: "debug",
    label: "Debug",
    title: "Debug callbacks",
    description: "Use this while checking redirect URIs, PKCE, state, and callback errors.",
    icon: Bug,
  },
  {
    value: "sandbox",
    label: "Sandbox",
    title: "Exercise safe data",
    description: "Use sandbox OAuth and request logs before touching Workspace data.",
    icon: Check,
  },
  {
    value: "workspace",
    label: "Workspace",
    title: "Verify grants",
    description: "Confirm Workspace organization consent and resource scopes.",
    icon: ShieldCheck,
  },
  {
    value: "production",
    label: "Production",
    title: "Review-ready",
    description: "Use production URLs, policies, and webhook endpoints for review.",
    icon: Rocket,
  },
] as const;

function defaultValues(app?: PartnerAppSummary): PartnerAppFormValues {
  return {
    appId: app?.id,
    name: app?.name ?? "",
    publisherName: app?.publisherName ?? "",
    description: app?.description ?? "",
    appCategory: app?.appCategory ?? "operations",
    integrationMode: app?.integrationMode ?? "sandbox",
    supportEmail: app?.supportEmail ?? "",
    iconUrl: app?.iconUrl ?? "",
    logoUrl: app?.logoUrl ?? "",
    homepageUrl: app?.homepageUrl ?? "",
    webhookUrl: app?.webhookUrl ?? "",
    privacyPolicyUrl: app?.privacyPolicyUrl ?? "",
    termsOfServiceUrl: app?.termsOfServiceUrl ?? "",
    clientType: app?.clientType ?? "public",
    redirectUris: app?.redirectUris.join("\n") ?? "",
    allowedScopes: app?.allowedScopes.join("\n") ?? "organization:read\nclient:read\nasset:read",
  };
}

function StepMarker({ complete, active, icon: Icon }: { complete: boolean; active: boolean; icon: typeof Sparkles }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[6px] border transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : complete
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
            : "border-border bg-card text-muted-foreground",
      )}
    >
      {complete ? <Check className="size-4" /> : <Icon className="size-4" />}
    </span>
  );
}

function inputClassName() {
  return "border-input bg-card text-[13px] font-medium focus:border-primary focus:ring-primary/15";
}

function FieldHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-5 text-muted-foreground">{children}</p>;
}

function ReadinessPill({ label, done }: { label: string; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-[999px] border border-border bg-card px-3 py-1.5 text-xs font-semibold">
      <span className={cn("size-2 rounded-full", done ? "bg-emerald-500" : "bg-muted-foreground/45")} />
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </span>
  );
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
  const selectedMode = integrationModes.find((mode) => mode.value === values.integrationMode) ?? integrationModes[2];
  const profileReady = Boolean(values.name && values.publisherName && values.description && values.homepageUrl);
  const integrateReady = Boolean(values.clientType && values.redirectUris);
  const sandboxReady = checkpoints.resolvedScopes.length > 0;
  const productionReady = Boolean(values.privacyPolicyUrl && values.termsOfServiceUrl && values.supportEmail);

  useEffect(() => {
    form.setValue("allowedScopes", checkpoints.resolvedScopes.join("\n"), { shouldValidate: true });
  }, [checkpoints.resolvedScopes, form]);

  const completedSteps = useMemo(() => {
    return steps.map((step, index) => {
      if (index < activeStep) return true;
      if (step.id === "profile") return profileReady;
      if (step.id === "integrate") return integrateReady;
      if (step.id === "sandbox") return sandboxReady;
      if (step.id === "production") return productionReady;
      return step.fields.length > 0 && step.fields.every((field) => Boolean(form.getValues(field)));
    });
  }, [activeStep, form, integrateReady, productionReady, profileReady, sandboxReady]);

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
    <form onSubmit={form.handleSubmit(submit)} className="overflow-hidden rounded-[6px] border border-border bg-background">
      <input type="hidden" {...form.register("appId")} />
      <input type="hidden" {...form.register("allowedScopes")} />
      <input type="hidden" {...form.register("logoUrl")} />
      <input type="hidden" {...form.register("iconUrl")} />

      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-sidebar p-3 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{mode === "edit" ? "Edit app" : "New app"}</p>
              <h2 className="mt-1 text-base font-bold text-foreground">Setup</h2>
            </div>
            <span className="rounded-[999px] border border-border bg-card px-2 py-1 text-xs font-bold text-muted-foreground">
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
                    "flex items-center gap-2 rounded-[6px] border p-2 text-start transition-colors",
                    active
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent hover:border-border hover:bg-card",
                  )}
                >
                  <StepMarker active={active} complete={complete} icon={Icon} />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-foreground">{step.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{step.caption}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-h-[420px] p-5 md:p-7">
          {activeStep === 0 && (
            <section className="max-w-5xl space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-primary">App profile</p>
                <h3 className="mt-1 text-xl font-bold text-foreground">Catalog identity</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="App name" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} placeholder="Launch Desk" className={fieldClassName} />
                </Field>
                <Field label="Publisher" error={form.formState.errors.publisherName?.message}>
                  <Input {...form.register("publisherName")} placeholder="Qentrah Labs" className={fieldClassName} />
                </Field>
                <Field label="Integration category" error={form.formState.errors.appCategory?.message}>
                  <Select {...form.register("appCategory")} className={fieldClassName}>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Support email" error={form.formState.errors.supportEmail?.message}>
                  <Input {...form.register("supportEmail")} placeholder="support@partner.example.com" className={fieldClassName} />
                  <FieldHint>Review follow-up and customer support handoff.</FieldHint>
                </Field>
                <Field label="Partner app URL" error={form.formState.errors.homepageUrl?.message}>
                  <Input {...form.register("homepageUrl")} placeholder="https://partner.example.com" className={fieldClassName} />
                </Field>
                <Field label="Description" error={form.formState.errors.description?.message} className="md:col-span-2">
                  <Textarea
                    {...form.register("description")}
                    placeholder="Sync Saudi real estate leads, buyer notes, and launch tasks into Qentrah Workspace with scoped OAuth."
                    className={cn("min-h-[112px]", fieldClassName)}
                  />
                  <FieldHint>Keep it short: what the integration does and why Workspace owners should authorize it.</FieldHint>
                </Field>
              </div>
            </section>
          )}

          {activeStep === 1 && (
            <section className="max-w-5xl space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Integrate & debug</p>
                <h3 className="mt-1 text-xl font-bold text-foreground">OAuth path</h3>
              </div>

              <input type="hidden" {...form.register("integrationMode")} />
              <div className="rounded-[6px] border border-border bg-card p-1">
                <div className="grid gap-1 sm:grid-cols-5">
                  {integrationModes.map((modeOption) => {
                    const Icon = modeOption.icon;
                    const selected = values.integrationMode === modeOption.value;
                    return (
                      <button
                        key={modeOption.value}
                        type="button"
                        onClick={() => form.setValue("integrationMode", modeOption.value, { shouldValidate: true, shouldDirty: true })}
                        className={cn(
                          "flex h-10 items-center justify-center gap-2 rounded-[5px] px-2 text-xs font-bold transition-colors",
                          selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        title={modeOption.description}
                      >
                        <Icon className="size-3.5" />
                        <span className="truncate">{modeOption.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[6px] border border-border bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
                <span className="font-semibold text-foreground">{selectedMode.title}:</span> {selectedMode.description}
              </div>

              <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
                <Field label="App type" error={form.formState.errors.clientType?.message}>
                  <Select {...form.register("clientType")} disabled={mode === "edit"} className={fieldClassName}>
                    <option value="public">Public PKCE app</option>
                    <option value="confidential">Confidential server app</option>
                  </Select>
                  <FieldHint>Use confidential only when a server keeps the client secret.</FieldHint>
                </Field>
                <Field label="Redirect URIs" error={form.formState.errors.redirectUris?.message as string | undefined}>
                  <Textarea
                    {...form.register("redirectUris")}
                    placeholder={"http://localhost:3003/api/qentrah/oauth/callback\nhttps://partner.example.com/api/qentrah/oauth/callback"}
                    className={cn("min-h-[112px] font-mono text-sm", fieldClassName)}
                  />
                  <FieldHint>Add one callback URL per line. Only localhost may use HTTP.</FieldHint>
                </Field>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Sandbox & Workspace</p>
                <h3 className="mt-1 text-xl font-bold text-foreground">Scopes and events</h3>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {checkpoints.groups.map((group) => (
                  <div key={group.id} className="rounded-[6px] border border-border bg-card p-3">
                    <div className="mb-3">
                      <p className="text-sm font-bold text-foreground">{group.title}</p>
                    </div>
                    <div className="space-y-2">
                      {group.scopes.map((scope) => {
                        const checked = checkpoints.selectedScopes.includes(scope.value);
                        return (
                          <label
                            key={scope.value}
                            className={cn(
                              "flex min-h-10 cursor-pointer items-center gap-3 rounded-[6px] border bg-card px-3 py-2 text-[13px] font-semibold transition-colors",
                              checked ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => checkpoints.toggleScope(scope.value)}
                              className="size-4 accent-[var(--primary)]"
                            />
                            <span>{scope.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Custom scopes" error={form.formState.errors.allowedScopes?.message as string | undefined}>
                  <Textarea
                    value={checkpoints.manualScopes}
                    onChange={(event) => checkpoints.setManualScopes(event.target.value)}
                    placeholder="custom:scope_name"
                    className={cn("min-h-[88px] font-mono text-sm", fieldClassName)}
                  />
                  <FieldHint>Use this for new resource scopes. Delete access stays out of self-serve review.</FieldHint>
                </Field>
                <Field label="Webhook endpoint" error={form.formState.errors.webhookUrl?.message}>
                  <Input {...form.register("webhookUrl")} placeholder="https://partner.example.com/api/qentrah/webhooks" className={fieldClassName} />
                  <FieldHint>Optional while debugging. Required for production event delivery.</FieldHint>
                </Field>
              </div>
            </section>
          )}

          {activeStep === 3 && (
            <section className="mx-auto max-w-5xl space-y-5">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Production</p>
                <h3 className="mt-1 text-xl font-bold text-foreground">Review package</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Privacy policy URL" error={form.formState.errors.privacyPolicyUrl?.message}>
                  <Input {...form.register("privacyPolicyUrl")} placeholder="https://partner.example.com/privacy" className={fieldClassName} />
                </Field>
                <Field label="Terms of service URL" error={form.formState.errors.termsOfServiceUrl?.message}>
                  <Input {...form.register("termsOfServiceUrl")} placeholder="https://partner.example.com/terms" className={fieldClassName} />
                </Field>
              </div>
              <div className="overflow-hidden rounded-[6px] border border-border">
                {([
                  ["App", values.name || "Not set"],
                  ["Publisher", values.publisherName || "Not set"],
                  ["Category", categoryOptions.find((option) => option.value === values.appCategory)?.label ?? "Not set"],
                  ["Mode", selectedMode.label],
                  ["Partner URL", values.homepageUrl || "Not set"],
                  ["Support", values.supportEmail || "Not set"],
                  ["Client type", values.clientType === "confidential" ? "Confidential server app" : "Public PKCE app"],
                  ["Redirect URI", String(values.redirectUris || "Not set")],
                  ["Webhook", values.webhookUrl || "Not set"],
                  ["Scopes", checkpoints.resolvedScopes.join(", ") || "No scopes selected"],
                ] satisfies Array<[string, string]>).map(([label, value]) => (
                  <div key={label} className="grid gap-1 border-b border-border bg-card px-3 py-2 last:border-b-0 md:grid-cols-[150px_minmax(0,1fr)]">
                    <p className="text-xs font-bold text-muted-foreground">{label}</p>
                    <p className="break-words text-sm font-semibold leading-6 text-foreground">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <ReadinessPill label="Catalog copy" done={profileReady} />
                <ReadinessPill label="OAuth callback" done={integrateReady} />
                <ReadinessPill label="Webhook endpoint" done={Boolean(values.webhookUrl)} />
                <ReadinessPill label="Support and policies" done={productionReady} />
              </div>
            </section>
          )}

          {state.message ? (
            <Alert variant={state.ok ? "success" : "danger"} className="mt-7">
              <p>{state.message}</p>
              {state.clientId ? <p className="mt-2 break-all font-mono text-xs">Client ID: {state.clientId}</p> : null}
              {state.clientSecret ? <p className="mt-2 break-all font-mono text-xs">Client secret: {state.clientSecret}</p> : null}
              {state.ok && state.appId ? (
                <Link
                  href={`/dashboard/apps/${state.appId}`}
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-[6px] bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Open app details
                </Link>
              ) : null}
            </Alert>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        {activeStep === 0 ? (
          <Link
            href={exitHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        ) : (
          <Button type="button" variant="outline" onClick={goBack} disabled={isPending} className="h-10 gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={isPending} className="h-10 gap-2 rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90">
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={isPending} className="h-10 gap-2 rounded-[6px] bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="size-4" />
            {isPending ? "Saving..." : mode === "edit" ? "Save settings" : "Create app"}
          </Button>
        )}
      </div>
    </form>
  );
}
