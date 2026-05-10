"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bath, Bed, Building, Edit, FolderOpen, Home, MapPin, Plus, Ruler, Trash2 } from "lucide-react";
import {
  AppDataTable,
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppSection,
  AppStatsGrid,
  AppThumbnailCell,
  AppToolbar,
  type AppDataTableColumn,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link, useRouter } from "@/i18n/routing";
import { useAccountContext } from "@/domains/auth";
import { createPropertyRequest, deletePropertyRequest, updatePropertyRequest, usePropertiesQuery, usePropertyQuery } from "../api/properties";
import { useProjectsQuery } from "@/domains/projects/api/projects";
import { ResourceMediaUploader } from "@/domains/media/components/resource-media-uploader";
import { uploadAndAttachMedia } from "@/domains/media/api/media";
import type { PropertyStatus, PropertyUnit } from "../store/properties.types";
import { propertySchema, type PropertyFormValues } from "../validation/property.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { ChoiceGrid, DeleteRecordDialog, DetailNotFoundState, EmptyWorkspace, FormActions, FormErrorSummary, SearchBox, StatusPill, TextInput } from "@/components/shared/crud-ui";
import { useUrlListState } from "@/components/shared/use-url-list-state";
import { useTranslations } from "next-intl";

/** Format a price string with SAR currency */
function formatSAR(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat('en-SA', { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' SAR';
}

const propertyFilters = ["all", "available", "pending", "reserved", "sold", "draft"] as const;
const propertyViews = ["grid", "list"] as const;

function statusTone(status: PropertyStatus) {
  if (status === "available") return "success";
  if (status === "pending" || status === "reserved") return "warning";
  if (status === "sold") return "info";
  return "neutral";
}

function UnitTile({ unit, onDelete }: { unit: PropertyUnit; onDelete: (unit: PropertyUnit) => void }) {
  const t = useTranslations('Properties');
  return (
    <article className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white transition-colors hover:border-zinc-300 dark:border-white/5 dark:bg-[#0A0A0A]">
      <Link href={`/properties/${unit.id}`} className="relative block h-40 w-full overflow-hidden bg-zinc-100 text-start focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:bg-white/5">
        {unit.coverImageUrl ? (
          <Image src={unit.coverImageUrl} alt={unit.title} fill sizes="(max-width: 768px) 100vw, 360px" className="object-cover opacity-80 grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Home className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <h3 className="truncate text-sm font-black uppercase tracking-tight text-white">{unit.title}</h3>
          <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-white/60">{unit.project}</p>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">{unit.reference}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.area')}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{unit.area}</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/[0.02]">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('card.layout')}</p>
            <p className="mt-1 text-sm font-black text-zinc-900 dark:text-white">{unit.bedrooms}{t('card.beds')} / {unit.bathrooms}{t('card.baths')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-white/5">
          <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">{formatSAR(unit.price)}</p>
          <div className="flex items-center gap-2">
            <Link href={`/properties/${unit.id}/edit`} aria-label={`Edit ${unit.title}`} className="inline-flex h-7 w-7 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:bg-white/5 dark:hover:text-white"><Edit className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            <button type="button" aria-label={`Delete ${unit.title}`} onClick={() => onDelete(unit)} className="text-zinc-300 transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PropertiesWorkspace() {
  const t = useTranslations('Properties');
  const account = useAccountContext();
  const unitsQuery = usePropertiesQuery(account.organization.id ?? undefined);
  const units = useMemo(() => (unitsQuery ?? []) as PropertyUnit[], [unitsQuery]);
  const [filter, setFilter] = useState<(typeof propertyFilters)[number]>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<(typeof propertyViews)[number]>("grid");
  const [deleting, setDeleting] = useState<PropertyUnit | null>(null);
  const deleteOperation = useOperationState({ errorMessage: "Unit delete failed." });
  useUrlListState({
    filter,
    search,
    view,
    setFilter,
    setSearch,
    setView: (next) => setView(next as (typeof propertyViews)[number]),
    defaultFilter: "all",
    defaultView: "grid",
    validFilters: propertyFilters,
    validViews: propertyViews,
  });
  const filteredUnits = useMemo(() => units.filter((unit) => {
    const matchesFilter = filter === "all" || unit.status === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [unit.title, unit.project, unit.city, unit.reference].some((value) => value.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  }), [units, filter, search]);

  const columns: AppDataTableColumn<PropertyUnit>[] = [
    { key: "title", header: t('form.nameLabel'), render: (unit) => <AppThumbnailCell src={unit.coverImageUrl} alt={unit.title} title={unit.title} meta={<span className="inline-flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{unit.city}</span>} /> },
    { key: "reference", header: t('detail.labels.type') !== '' ? 'Ref.' : '' },
    { key: "status", header: t('form.statusLabel'), render: (unit) => <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} /> },
    { key: "project", header: t('detail.labels.project'), render: (unit) => <span className="block max-w-[180px] truncate">{unit.project}</span> },
    { key: "area", header: t('detail.labels.area') },
    { key: "price", header: t('detail.labels.price') },
    { key: "actions", header: "", align: "end", render: (unit) => <div className="flex justify-end gap-1"><Link href={`/properties/${unit.id}/edit`} aria-label={`Edit ${unit.title}`} className="p-2 text-zinc-300 hover:text-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:hover:text-white"><Edit className="h-3.5 w-3.5" aria-hidden="true" /></Link><button type="button" aria-label={`Delete ${unit.title}`} onClick={(event) => { event.stopPropagation(); setDeleting(unit); }} className="p-2 text-zinc-300 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></button></div> },
  ];

  return (
    <AppPageShell>
      <AppPageHeader eyebrow={t('eyebrow')} title={t('title') + "."} actions={<Link href="/properties/create"><AppPrimaryButton><Plus className="me-2 h-3.5 w-3.5" />{t('add')}</AppPrimaryButton></Link>} />
      <AppStatsGrid stats={[
        { label: t('stats.size'), value: units.length, icon: FolderOpen },
        { label: t('stats.available'), value: units.filter((unit) => unit.status === "available").length, dotClassName: "bg-emerald-500" },
        { label: t('stats.pending'), value: units.filter((unit) => unit.status === "pending").length, dotClassName: "bg-amber-500" },
        { label: t('stats.drafts'), value: units.filter((unit) => unit.status === "draft").length, icon: Home },
      ]} />
      <AppToolbar
        filters={[
          { value: "all", label: t('toolbar.filters.all') },
          { value: "available", label: t('toolbar.filters.available') },
          { value: "pending", label: t('toolbar.filters.pending') },
          { value: "reserved", label: t('toolbar.filters.reserved') },
          { value: "sold", label: t('toolbar.filters.sold') },
          { value: "draft", label: t('toolbar.filters.draft') },
        ]}
        activeFilter={filter}
        onFilterChange={(next) => setFilter(next as "all" | PropertyStatus)}
        view={view}
        onViewChange={(next) => setView(next as (typeof propertyViews)[number])}
        sortLabel={t('toolbar.priceHigh')}
        trailing={<SearchBox value={search} onChange={setSearch} placeholder={t('toolbar.search')} name="unit-search" ariaLabel="Search units" />}
      />
      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUnits.map((unit) => <UnitTile key={unit.id} unit={unit} onDelete={setDeleting} />)}
        </div>
      ) : (
        <AppDataTable columns={columns} data={filteredUnits} getRowKey={(unit) => unit.id} />
      )}
      {filteredUnits.length === 0 && <EmptyWorkspace icon={Home} title={t('empty.title')} description={t('empty.desc')} />}
      <DeleteRecordDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            deleteOperation.clearError();
            setDeleting(null);
          }
        }}
        title={t('delete.title')}
        description={t('delete.desc', { name: deleting?.title ?? "..." })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!deleting || !units.some((unit) => unit.id === deleting.id)) {
            throw new Error("This unit is no longer available.");
          }
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deletePropertyRequest(account.organization.id, deleting.id);
        }, {
          successMessage: "Unit deleted.",
          onSuccess: () => setDeleting(null),
        })}
      />
    </AppPageShell>
  );
}

export function PropertyDetailScreen({ id }: { id: string }) {
  const t = useTranslations('Properties');
  const account = useAccountContext();
  const unit = usePropertyQuery(account.organization.id ?? undefined, id) as PropertyUnit | null | undefined;
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const deleteOperation = useOperationState({ errorMessage: "Unit delete failed." });

  if (unit === undefined) {
    return <AppPageShell><EmptyWorkspace icon={Home} title="Loading unit" description="Unit data is syncing from Convex." /></AppPageShell>;
  }

  if (!unit) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell>
      <AppPageHeader eyebrow={unit.reference} title={`${unit.title}.`} actions={<><Link href={`/properties/${unit.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-100 px-5 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/15 dark:border-white/10 dark:hover:bg-white/5"><Edit className="me-2 h-3.5 w-3.5" />{t('detail.edit')}</Link><Button variant="destructive" onClick={() => setDeleting(true)} className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"><Trash2 className="me-2 h-3.5 w-3.5" />{t('detail.delete')}</Button></>} />
      <div className="relative min-h-[340px] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-100 dark:border-white/5">
        {unit.coverImageUrl ? (
          <Image src={unit.coverImageUrl} alt={unit.title} fill priority sizes="100vw" className="object-cover grayscale" />
        ) : (
          <div className="flex h-full min-h-[340px] w-full items-center justify-center bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-white/20">
            <Home className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <StatusPill label={t(`toolbar.filters.${unit.status}`)} tone={statusTone(unit.status)} />
          <p className="mt-5 max-w-2xl text-3xl font-black uppercase leading-tight tracking-tight">{unit.description}</p>
        </div>
      </div>
      <AppStatsGrid stats={[
        { label: t('detail.labels.project'), value: unit.project, icon: Building },
        { label: t('detail.labels.area'), value: unit.area, icon: Ruler },
        { label: t('detail.labels.beds'), value: unit.bedrooms, icon: Bed },
        { label: t('detail.labels.baths'), value: unit.bathrooms, icon: Bath },
      ]} />
      <AppSection title={t('detail.recordTitle')}>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            [t('detail.labels.city'), unit.city],
            [t('detail.labels.type'), t(`types.${unit.type}`)],
            [t('detail.labels.purpose'), t(`purposes.${unit.purpose}`)],
            [t('detail.labels.price'), formatSAR(unit.price)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-zinc-100 p-5 dark:border-white/5">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
              <p className="mt-2 text-sm font-black uppercase text-zinc-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      </AppSection>
      <ResourceMediaUploader
        organizationId={account.organization.id ?? undefined}
        resourceType="property"
        resourceId={unit.id}
        pendingFiles={[]}
        onPendingFilesChange={() => undefined}
        immediate
        labels={{ title: "Media", description: "Images, videos, and PDFs for this unit." }}
      />
      <DeleteRecordDialog
        open={deleting}
        onOpenChange={(open) => {
          if (!open) deleteOperation.clearError();
          setDeleting(open);
        }}
        title={t('delete.title')}
        description={t('delete.desc', { name: unit.title })}
        isDeleting={deleteOperation.isRunning}
        error={deleteOperation.error}
        onConfirm={() => deleteOperation.run(() => {
          if (!account.organization.id) throw new Error("Select an organization first.");
          return deletePropertyRequest(account.organization.id, unit.id);
        }, {
          successMessage: "Unit deleted.",
          onSuccess: () => {
            setDeleting(false);
            router.push("/properties");
          },
        })}
      />
    </AppPageShell>
  );
}

export function PropertyFormScreen({ id }: { id?: string }) {
  const t = useTranslations('Properties');
  const account = useAccountContext();
  const existing = usePropertyQuery(account.organization.id ?? undefined, id ?? "") as PropertyUnit | null | undefined;
  const projects = useProjectsQuery(account.organization.id ?? undefined) ?? [];
  const router = useRouter();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: existing?.title ?? "",
      projectId: existing?.projectId ?? "",
      project: existing?.project ?? "",
      city: existing?.city ?? "",
      type: existing?.type ?? "Apartment",
      status: existing?.status ?? "draft" as PropertyStatus,
      purpose: existing?.purpose ?? "sale" as PropertyUnit["purpose"],
      price: existing?.price ?? "",
      area: existing?.area ?? "",
      bedrooms: String(existing?.bedrooms ?? 1),
      bathrooms: String(existing?.bathrooms ?? 1),
      description: existing?.description ?? "",
    },
  });
  const form = useWatch({ control }) as PropertyFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof PropertyFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Unit save failed." });
  const setField = (key: keyof PropertyFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };
  const onSubmit = handleSubmit((data) => {
    saveOperation.run(async () => {
      if (!account.organization.id) throw new Error("Select an organization first.");
      const selectedProject = projects.find((project) => project._id === data.projectId || project.id === data.projectId);
      const payload = {
        ...data,
        projectId: selectedProject?._id ?? data.projectId,
        project: selectedProject?.name ?? data.project,
      };
      const result = existing
        ? await updatePropertyRequest(account.organization.id, existing.id, payload)
        : await createPropertyRequest(account.organization.id, payload);
      const nextId = result.property.id;
      if (pendingFiles.length > 0) {
        await uploadAndAttachMedia({
          organizationId: account.organization.id,
          resourceType: "property",
          resourceId: nextId,
          files: pendingFiles,
        });
      }
      return nextId;
    }, {
      successMessage: existing ? "Unit saved." : "Unit created.",
      onSuccess: (nextId) => router.push(`/properties/${nextId}`),
    });
  });

  if (id && existing === undefined) {
    return <AppPageShell><EmptyWorkspace icon={Home} title="Loading unit" description="Unit data is syncing from Convex." /></AppPageShell>;
  }

  if (id && !existing) {
    return <AppPageShell><DetailNotFoundState title={t('detail.notFound')} description={t('detail.notFoundDesc')} backHref="/properties" backLabel={t('detail.back')} /></AppPageShell>;
  }

  return (
    <AppPageShell maxWidth="default">
      <AppPageHeader eyebrow={t('form.eyebrow')} title={existing ? t('form.editTitle') + "." : t('form.createTitle') + "."} subtitle={t('form.subtitle')} />
      <form
        className="space-y-8 rounded-[32px] border border-zinc-100 bg-white p-8 dark:border-white/5 dark:bg-[#0A0A0A]"
        onSubmit={onSubmit}
      >
        <FormErrorSummary errors={fieldErrors} />
        <div className="grid gap-6 md:grid-cols-2">
          <TextInput name="title" label={t('form.nameLabel')} value={form.title} onChange={(value) => setField("title", value)} placeholder="Unit A-101…" error={fieldErrors.title} />
          <div className="grid gap-2">
            <label htmlFor="project" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('form.projectLabel')}</label>
            <select
              id="project"
              name="project"
              value={form.projectId || ""}
              onChange={(e) => {
                const selected = projects.find((project) => project._id === e.target.value || project.id === e.target.value);
                setField("projectId", e.target.value);
                setField("project", selected?.name ?? "");
              }}
              className="h-12 rounded-2xl border border-zinc-100 bg-white px-4 text-sm font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 dark:border-white/10 dark:bg-transparent dark:text-white dark:focus:border-white"
              aria-invalid={Boolean(fieldErrors.project)}
              aria-describedby={fieldErrors.project ? 'project-error' : undefined}
            >
              <option value="">— Select project —</option>
              {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            {fieldErrors.project && <p id="project-error" className="text-xs font-bold text-red-600">{fieldErrors.project}</p>}
          </div>
          <TextInput name="city" label={t('form.cityLabel')} value={form.city} onChange={(value) => setField("city", value)} placeholder="Riyadh…" error={fieldErrors.city} />
          <TextInput name="area" label={t('form.areaLabel')} value={form.area} onChange={(value) => setField("area", value)} placeholder="120 m2…" error={fieldErrors.area} />
          <TextInput name="price" label={t('form.priceLabel')} value={form.price} onChange={(value) => setField("price", value)} placeholder="850,000…" error={fieldErrors.price} />
          <TextInput name="bedrooms" label={t('form.bedsLabel')} type="number" inputMode="numeric" value={form.bedrooms} onChange={(value) => setField("bedrooms", value)} error={fieldErrors.bedrooms} />
          <TextInput name="bathrooms" label={t('form.bathsLabel')} type="number" inputMode="numeric" value={form.bathrooms} onChange={(value) => setField("bathrooms", value)} error={fieldErrors.bathrooms} />
        </div>
        <ChoiceGrid id="type" label={t('form.typeLabel')} value={form.type} onChange={(value) => setField("type", value)} columns="grid-cols-2 md:grid-cols-4" options={[{ value: "Apartment", label: t('types.Apartment') }, { value: "Villa", label: t('types.Villa') }, { value: "Penthouse", label: t('types.Penthouse') }, { value: "Office", label: t('types.Office') }]} error={fieldErrors.type} />
        <ChoiceGrid id="purpose" label={t('form.purposeLabel')} value={form.purpose} onChange={(value) => setField("purpose", value)} columns="grid-cols-2" options={[{ value: "sale", label: t('purposes.sale') }, { value: "rent", label: t('purposes.rent') }]} error={fieldErrors.purpose} />
        <ChoiceGrid id="status" label={t('form.statusLabel')} value={form.status} onChange={(value) => setField("status", value)} columns="grid-cols-2 md:grid-cols-5" options={[{ value: "draft", label: t('toolbar.filters.draft') }, { value: "available", label: t('toolbar.filters.available') }, { value: "pending", label: t('toolbar.filters.pending') }, { value: "reserved", label: t('toolbar.filters.reserved') }, { value: "sold", label: t('toolbar.filters.sold') }]} error={fieldErrors.status} />
        <div className="grid gap-2">
          <label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t('form.descLabel')}</label>
          <Textarea id="description" name="description" value={form.description} onChange={(event) => setField("description", event.target.value)} aria-invalid={Boolean(fieldErrors.description)} aria-describedby={fieldErrors.description ? "description-error" : undefined} />
          {fieldErrors.description && <p id="description-error" className="text-xs font-bold text-red-600">{fieldErrors.description}</p>}
        </div>
        <ResourceMediaUploader
          organizationId={account.organization.id ?? undefined}
          resourceType="property"
          resourceId={existing?.id}
          pendingFiles={pendingFiles}
          onPendingFilesChange={setPendingFiles}
          immediate={Boolean(existing)}
        />
        <FormActions onCancel={() => router.back()} submitLabel={existing ? t('form.saveBtn') : t('form.createBtn')} isSubmitting={saveOperation.isRunning || isSubmitting} />
      </form>
    </AppPageShell>
  );
}
