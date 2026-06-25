"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AppPrimaryButton } from "@/components/shared";
import { FormActions, SelectField, TextInput } from "@/components/shared/crud-ui";
import { WorkOsRecordPicker, type WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { DEAL_PRIORITIES, DEAL_STAGES, DEAL_STATUSES } from "../config/deals.config";
import type { DealFormValues, DealPriority, DealStage } from "../store/deals.types";

export function DealForm({
  initialValues,
  isSubmitting,
  submitLabel,
  clientOptions,
  projectOptions,
  onCancel,
  onSubmit,
}: {
  initialValues: DealFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  clientOptions: WorkOsPickerOption[];
  projectOptions: WorkOsPickerOption[];
  onCancel?: () => void;
  onSubmit: (values: DealFormValues) => void;
}) {
  const t = useTranslations("Deals");
  const common = useTranslations("Common");
  const [values, setValues] = useState(initialValues);
  const stageOptions = DEAL_STAGES.map((value) => ({ value, label: t(`stages.${value}`) }));
  const statusOptions = DEAL_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) }));
  const priorityOptions = DEAL_PRIORITIES.map((value) => ({ value, label: t(`priorities.${value}`) }));

  function patch<TName extends keyof DealFormValues>(name: TName, value: DealFormValues[TName]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextInput label={t("form.title")} value={values.title} onChange={(value) => patch("title", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label={t("form.stage")} value={values.stage} options={stageOptions} onChange={(value) => patch("stage", value as DealStage)} />
        <SelectField label={t("form.status")} value={values.status} options={statusOptions} onChange={(value) => patch("status", value as DealFormValues["status"])} />
        <SelectField label={t("form.priority")} value={values.priority} options={priorityOptions} onChange={(value) => patch("priority", value as DealPriority)} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TextInput label={t("form.value")} inputMode="decimal" value={values.value} onChange={(value) => patch("value", value)} />
        <TextInput label={t("form.currency")} value={values.currency} onChange={(value) => patch("currency", value.toUpperCase())} />
        <TextInput label={t("form.closeDate")} type="date" value={values.closeDate} onChange={(value) => patch("closeDate", value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <WorkOsRecordPicker label={t("form.client")} value={values.clientId} options={clientOptions} placeholder={t("form.clientPlaceholder")} searchPlaceholder={t("form.searchClients")} emptyLabel={t("form.noClients")} clearLabel={t("form.noClient")} closeLabel={common("finish")} onChange={(value) => patch("clientId", value)} />
        <WorkOsRecordPicker label={t("form.project")} value={values.projectId} options={projectOptions} placeholder={t("form.projectPlaceholder")} searchPlaceholder={t("form.searchProjects")} emptyLabel={t("form.noProjects")} clearLabel={t("form.noProject")} closeLabel={common("finish")} onChange={(value) => patch("projectId", value)} />
      </div>
      <TextInput label={t("form.dealThinking")} value={values.dealThinking} onChange={(value) => patch("dealThinking", value)} />
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label={t("form.source")} value={values.source} onChange={(value) => patch("source", value)} />
        <TextInput label={t("form.tags")} value={values.tags} onChange={(value) => patch("tags", value)} />
      </div>
      <TextInput label={t("form.nextStep")} value={values.nextStep} onChange={(value) => patch("nextStep", value)} />
      {onCancel ? (
        <FormActions onCancel={onCancel} submitLabel={submitLabel} isSubmitting={isSubmitting} />
      ) : (
        <AppPrimaryButton type="submit" disabled={isSubmitting} className="h-11 px-6">
          {submitLabel}
        </AppPrimaryButton>
      )}
    </form>
  );
}
