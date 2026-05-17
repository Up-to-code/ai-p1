"use client";

import { ArrowLeft, ArrowRight, Check, KeyRound, Save, ShieldCheck, Sparkles } from "lucide-react";
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
import { partnerAppFormSchema, type PartnerAppFormValues } from "@/lib/schemas/partner-app";
import { zodFormResolver } from "@/lib/schemas/resolver";
import { cn } from "@/lib/utils";
import type { PartnerAppSummary } from "@/server/partnerApps";
import { createPartnerAppAction, updatePartnerAppAction, type PartnerAppActionState } from "@/app/(portal)/dashboard/actions";

type StepId = "basics" | "authorization" | "access" | "review";

const steps: Array<{
  id: StepId;
  title: string;
  icon: typeof Sparkles;
  fields: FieldPath<PartnerAppFormValues>[];
}> = [
  {
    id: "basics",
    title: "Basics",
    icon: Sparkles,
    fields: ["name", "publisherName", "homepageUrl"],
  },
  {
    id: "authorization",
    title: "Authorization",
    icon: KeyRound,
    fields: ["clientType", "redirectUris"],
  },
  {
    id: "access",
    title: "Access",
    icon: ShieldCheck,
    fields: ["allowedScopes"],
  },
  {
    id: "review",
    title: "Review",
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
    <form onSubmit={form.handleSubmit(submit)} className="command-panel code-zone-shadow overflow-hidden">
      <input type="hidden" {...form.register("appId")} />
      <input type="hidden" {...form.register("allowedScopes")} />
      <input type="hidden" {...form.register("logoUrl")} />
      <input type="hidden" {...form.register("iconUrl")} />

      <div className="grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-sidebar p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-primary">{mode === "edit" ? "Edit app" : "New app"}</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">OAuth setup</h2>
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
                    "flex items-center gap-3 rounded-[6px] border p-2.5 text-start transition-colors",
                    active
                      ? "border-primary/30 bg-primary/10"
                      : "border-transparent hover:border-border hover:bg-card",
                  )}
                >
                  <StepMarker active={active} complete={complete} icon={Icon} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">{step.title}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-[420px] p-5 md:p-8">
          {activeStep === 0 && (
            <section className="max-w-4xl space-y-6">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Basics</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">App details</h3>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="App name" error={form.formState.errors.name?.message}>
                  <Input {...form.register("name")} placeholder="PDF Creator" className={fieldClassName} />
                </Field>
                <Field label="Publisher" error={form.formState.errors.publisherName?.message}>
                  <Input {...form.register("publisherName")} placeholder="Your company" className={fieldClassName} />
                </Field>
                <Field label="Partner app URL" error={form.formState.errors.homepageUrl?.message}>
                  <Input {...form.register("homepageUrl")} placeholder="https://partner.example.com" className={fieldClassName} />
                </Field>
              </div>
            </section>
          )}

          {activeStep === 1 && (
            <section className="max-w-4xl space-y-6">
              <div>
                <p className="text-xs font-bold uppercase text-primary">Authorization</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">OAuth settings</h3>
              </div>

              <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
                <Field label="App type" error={form.formState.errors.clientType?.message}>
                  <Select {...form.register("clientType")} disabled={mode === "edit"} className={fieldClassName}>
                    <option value="public">Public PKCE app</option>
                    <option value="confidential">Confidential server app</option>
                  </Select>
                </Field>
                <Field label="Redirect URI" error={form.formState.errors.redirectUris?.message as string | undefined}>
                  <Textarea
                    {...form.register("redirectUris")}
                    placeholder="https://partner.example.com/api/auth/qentrah/callback"
                    className={cn("min-h-[112px] font-mono text-sm", fieldClassName)}
                  />
                </Field>
              </div>
            </section>
          )}

          {activeStep === 2 && (
            <section className="space-y-6">
              <div className="mx-auto max-w-2xl">
                <p className="text-xs font-bold uppercase text-primary">Access</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">Scopes</h3>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {checkpoints.groups.map((group) => (
                  <div key={group.id} className="command-panel p-4">
                    <div className="mb-4">
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
                              checked ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground",
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
              <div className="mx-auto max-w-2xl">
                <Field label="Custom scopes" error={form.formState.errors.allowedScopes?.message as string | undefined}>
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
                  <div key={label} className="rounded-[6px] border border-border bg-muted p-4">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
                    <p className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</p>
                  </div>
                ))}
              </div>
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
