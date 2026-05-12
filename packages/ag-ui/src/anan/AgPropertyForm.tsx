"use client";

import {
  AlertCircle,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Video,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import ZonePageIntro from "../../../../apps/web/app/(ws)/ws/_components/ZoneShell/ZonePageIntro";
import type { BrokerPresence } from "../../../../apps/web/app/(ws)/ws/_components/Visuals/BrokerPresenceChip";
import { useUploadThing } from "../../../../apps/web/lib/uploadthing";
import { cn } from "../../../../apps/web/lib/utils";
import type { UploadedFileReference } from "../../../../apps/web/server/contracts/files";
import AgRichTextEditor from "./AgRichTextEditor";

export type ProjectFormData = {
  name: string;
  price: string;
  location: string;
  description: string;
  rooms: string;
  baths: string;
  area: string;
  status: string;
  images: UploadedFileReference[];
  video: string | null;
  brokerId: string | null;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected" | null;
};

type AgPropertyFormProps = {
  propertyId?: string;
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: () => void;
};

/**
 * WHY:   The current Anan project workflow relies on a rich, media-aware property form that is still tied to workspace adapters.
 * WHAT:  Exposes the existing Anan property form through the package `anan` entrypoint without forcing it into the generic core.
 * HOW:   Preserves UploadThing, verification-request, and broker-selection behavior while relocating the component into the package.
 */
export default function AgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  title = "مسؤولية الاطلاع",
  description = "تكامل البيانات وإدارة الأصول العقارية المركزية. مراجعة، تدقيق، ونشر.",
  submitLabel = "تأكيد ونشر المشروع",
  onSave,
  onCancel,
  onDelete,
}: AgPropertyFormProps) {
  const mockDataEnabled = process.env.NEXT_PUBLIC_MOCK_DATA_ENABLED === "true";
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
  const [brokerSearch, setBrokerSearch] = useState("");
  const [isBrokerDropdownOpen, setIsBrokerDropdownOpen] = useState(false);
  const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("propertyMedia");
  const { startUpload: startLicenseUpload, isUploading: isLicenseUploading } = useUploadThing("verificationDocuments");

  const [formState, setFormState] = useState({
    name: initialData?.name ?? "",
    price: initialData?.price ?? "",
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    rooms: initialData?.rooms ?? "",
    baths: initialData?.baths ?? "",
    area: initialData?.area ?? "",
    status: initialData?.status ?? "active",
    images: initialData?.images ?? [],
    video: initialData?.video ?? null,
    adLicenseNumber: initialData?.adLicenseNumber ?? "",
  });
  const adLicenseStatus = initialData?.adLicenseStatus ?? null;
  const [licenseDocs, setLicenseDocs] = useState<UploadedFileReference[]>([]);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSubmitting, setLicenseSubmitting] = useState(false);
  const [licenseSubmitted, setLicenseSubmitted] = useState(false);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = Boolean(initialData);
  const adLicenseLabel =
    adLicenseStatus === "approved"
      ? "معتمد"
      : adLicenseStatus === "rejected"
        ? "مرفوض"
        : adLicenseStatus === "pending"
          ? "قيد المراجعة"
          : "غير مكتمل";
  const adLicenseTone =
    adLicenseStatus === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : adLicenseStatus === "rejected"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : adLicenseStatus === "pending"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-600";

  const filteredBrokers = useMemo(
    () =>
      brokers.filter(
        (broker) =>
          broker.name.toLowerCase().includes(brokerSearch.toLowerCase()) ||
          broker.title?.toLowerCase().includes(brokerSearch.toLowerCase()),
      ),
    [brokerSearch, brokers],
  );

  const selectedBroker = useMemo(
    () => brokers.find((broker) => broker.id === selectedBrokerId),
    [selectedBrokerId, brokers],
  );

  const removeImage = (index: number) => {
    setFormState((previous) => ({ ...previous, images: previous.images.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadError(null);

    try {
      const uploaded = await startUpload(files);
      const nextImages = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setFormState((previous) => ({ ...previous, images: [...previous.images, ...nextImages] }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع الصور حالياً.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setLicenseError(null);
    setLicenseSubmitted(false);

    try {
      const uploaded = await startLicenseUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setLicenseDocs((current) => [...current, ...nextDocs]);
    } catch (error) {
      setLicenseError(error instanceof Error ? error.message : "تعذر رفع مستندات الترخيص.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseSubmit = async () => {
    if (!propertyId) {
      setLicenseError("الرجاء حفظ المشروع أولاً ثم إرسال طلب الترخيص.");
      return;
    }
    if (!formState.adLicenseNumber?.trim()) {
      setLicenseError("الرجاء إدخال رقم رخصة الإعلان العقاري.");
      return;
    }
    if (licenseDocs.length === 0) {
      setLicenseError("الرجاء رفع مستند واحد على الأقل لإرسال الطلب.");
      return;
    }

    setLicenseSubmitting(true);
    setLicenseError(null);
    setLicenseSubmitted(false);

    try {
      const response = await fetch("/api/property-verification-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          adLicenseNumber: formState.adLicenseNumber.trim(),
          documents: licenseDocs,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "تعذر إرسال الطلب.");
      }

      setLicenseSubmitted(true);
    } catch (error) {
      setLicenseError(error instanceof Error ? error.message : "تعذر إرسال الطلب.");
    } finally {
      setLicenseSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    const payload: ProjectFormData = { ...formState, brokerId: selectedBrokerId, adLicenseStatus };
    setSavePending(true);
    try {
      await onSave?.(payload);
      setShowSafetyConfirm(false);
    } finally {
      setSavePending(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col pb-32">
      {showSafetyConfirm ? (
        <div
          className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md duration-300"
          onClick={() => setShowSafetyConfirm(false)}
        >
          <div
            className="animate-in zoom-in-95 w-full max-w-md bg-white p-12 text-center duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <ShieldCheck className="mx-auto mb-6 h-16 w-16 text-blue-600" />
            <h2 className="mb-4 text-3xl font-black text-slate-950">تأكيد التدقيق النهائي</h2>
            <p className="mb-10 text-base font-medium leading-relaxed text-slate-500">
              يرجى مراجعة كافة البيانات المدخلة قبل الاعتماد والنشر، لضمان دقة معلومات الوصول والمواصفات.
            </p>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={savePending}
                className="border-2 border-blue-600 bg-blue-600 py-4 text-sm font-black tracking-[0.2em] text-white transition-colors hover:border-slate-950 hover:bg-slate-950"
              >
                {savePending ? "جارٍ الحفظ..." : "اعتماد ونشر"}
              </button>
              <button
                type="button"
                onClick={() => setShowSafetyConfirm(false)}
                className="border border-slate-200 py-4 text-[10px] font-black tracking-widest text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                تراجع للمراجعة
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ZonePageIntro
        eyebrow="العمليات التشغيلية"
        title={title}
        description={description}
        actions={
          isEditMode ? (
            <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-2 border border-red-200 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف المشروع
                </button>
              ) : null}
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-2 border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 transition hover:border-slate-950"
              >
                <ChevronLeft className="h-4 w-4" />
                العودة للمشروع
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="grid gap-8 px-6 py-6 lg:px-8 lg:py-8 xl:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-8">
          <div className="border border-slate-200 bg-white p-8">
            <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">البيانات الأساسية</h3>

            <div className="grid gap-8">
              <div className="grid gap-3 text-right">
                <label className="text-[11px] font-black text-slate-400">اسم المشروع أو العقار</label>
                <div className="group relative">
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(event) => setFormState((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder="أدخل اسماً يميز المشروع..."
                    className="w-full border-b-2 border-slate-100 bg-transparent py-4 pr-2 text-right text-3xl font-black text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
                  />
                  <Building2 className="absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-200 transition duration-500 group-focus-within:text-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="grid gap-3 text-right">
                  <label className="text-[11px] font-black text-slate-400">النطاق السعري التقديري</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formState.price}
                      onChange={(event) => setFormState((previous) => ({ ...previous, price: event.target.value }))}
                      placeholder="مثال: 2.1 مليون ر.س"
                      className="w-full border-b-2 border-slate-100 bg-transparent py-3 pr-2 text-right text-xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid gap-3 text-right">
                  <label className="text-[11px] font-black text-slate-400">الموقع (الحي، المدينة)</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formState.location}
                      onChange={(event) =>
                        setFormState((previous) => ({ ...previous, location: event.target.value }))
                      }
                      placeholder="الرياض، حطين"
                      className="w-full border-b-2 border-slate-100 bg-transparent py-3 pr-2 text-right text-xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
                    />
                    <MapPin className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-200 transition duration-500 group-focus-within:text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-8">
            <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">التفاصيل والتسويق</h3>
            <div className="grid gap-4 text-right">
              <AgRichTextEditor
                value={formState.description}
                onChange={(value) => setFormState((previous) => ({ ...previous, description: value }))}
                placeholder="اكتب تفاصيل المشروع، المميزات الاستثنائية للوحدات والخدمات..."
                className="text-right"
              />
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-8">
            <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">تكليف وسيط</h3>

            <div className="relative">
              {selectedBroker ? (
                <div className="flex flex-row-reverse items-center justify-between border-2 border-blue-600 bg-blue-50/20 p-5">
                  <div className="flex flex-row-reverse items-center gap-4">
                    <div className="h-12 w-12 overflow-hidden border border-slate-100 bg-white">
                      {selectedBroker.avatarImage ? (
                        <img src={selectedBroker.avatarImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-black text-slate-400">
                          {selectedBroker.avatarLabel}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-1 text-right">
                      <div className="text-base font-black uppercase leading-none text-slate-950">{selectedBroker.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{selectedBroker.title}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBrokerId(null)}
                    className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-600 hover:text-red-600"
                    title="إلغاء التكليف"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="group relative">
                  <input
                    type="text"
                    value={brokerSearch}
                    onChange={(event) => {
                      setBrokerSearch(event.target.value);
                      setIsBrokerDropdownOpen(true);
                    }}
                    onFocus={() => setIsBrokerDropdownOpen(true)}
                    placeholder="ابحث بالاسم لتكليف وسيط للمشروع..."
                    className="w-full border-2 border-slate-100 bg-slate-50 p-5 pr-12 text-right text-base font-bold text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:bg-white"
                  />
                  <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 transition group-focus-within:text-blue-600" />

                  {isBrokerDropdownOpen ? (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsBrokerDropdownOpen(false)} />
                      <div className="animate-in slide-in-from-top-2 absolute left-0 right-0 top-full z-20 mt-1 max-h-[300px] overflow-auto border-2 border-slate-950 bg-white shadow-none duration-200">
                        {filteredBrokers.length > 0 ? (
                          <div className="grid divide-y divide-slate-100">
                            {filteredBrokers.map((broker) => (
                              <button
                                key={broker.id}
                                type="button"
                                onClick={() => {
                                  setSelectedBrokerId(broker.id);
                                  setIsBrokerDropdownOpen(false);
                                  setBrokerSearch("");
                                }}
                                className="group flex flex-row-reverse items-center gap-4 p-4 text-right transition hover:bg-slate-50"
                              >
                                <div className="h-10 w-10 overflow-hidden bg-slate-100">
                                  {broker.avatarImage ? (
                                    <img src={broker.avatarImage} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-slate-400">
                                      {broker.avatarLabel}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <div className="text-sm font-black uppercase leading-none text-slate-950 transition-colors group-hover:text-blue-600">
                                    {broker.name}
                                  </div>
                                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    {broker.title}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 translate-x-0 text-slate-200 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                            <UserPlus className="h-8 w-8 text-slate-200" />
                            <div className="text-xs font-black text-slate-400">لا يوجد بيانات مطابقة</div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="border border-slate-200 bg-white p-8">
            <div className="mb-6 flex flex-row-reverse items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-950">المعرض المرئي</h3>
              <span className="bg-slate-50 px-2 py-1 text-[10px] font-black tracking-widest text-slate-400">
                {formState.images.length}/10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelection}
              />

              <div
                className="group col-span-2 flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-blue-600 hover:bg-white"
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-slate-300 transition-colors duration-300 group-hover:text-blue-600" />
                <div className="text-sm font-black text-slate-900">
                  {isUploading ? "جارٍ رفع الصور..." : "إضافة صور"}
                </div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400">UploadThing</div>
              </div>

              {uploadError ? (
                <div className="col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-right text-xs font-bold text-red-700">
                  {uploadError}
                </div>
              ) : null}

              {formState.images.map((image, index) => (
                <div key={index} className="group relative aspect-square overflow-hidden border-2 border-slate-100 bg-white">
                  <img src={image.url} alt={image.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-white/90 text-red-600 opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <div
                className={cn(
                  "group col-span-2 mt-2 flex cursor-pointer flex-row-reverse items-center justify-between border-2 p-4 text-right transition-all",
                  formState.video ? "border-blue-600 bg-blue-50/20" : "border-slate-100 bg-white hover:border-slate-300",
                )}
                onClick={() => {
                  if (!mockDataEnabled) return;
                  setFormState((previous) => ({ ...previous, video: previous.video ? null : "mock-video.mp4" }));
                }}
              >
                <div className="flex flex-row-reverse items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center border transition-colors",
                      formState.video
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-slate-100",
                    )}
                  >
                    {formState.video ? <PlayCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                  </div>
                  <div className="grid gap-0 leading-tight">
                    <div className="text-xs font-black uppercase text-slate-950">
                      {formState.video ? "الفيديو جاهز" : "إضافة فيديو (اختياري)"}
                    </div>
                    <div className="text-[9px] font-bold tracking-widest text-slate-400">
                      {formState.video ? "تم الاعتماد" : "صيغة MP4"}
                    </div>
                  </div>
                </div>
                {formState.video ? <Check className="h-4 w-4 text-blue-600" /> : null}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-8">
            <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">المواصفات والتحكم</h3>

            <div className="grid gap-6">
              <div className="grid gap-2 text-right">
                <label className="text-[10px] font-black tracking-widest text-slate-400">حالة الظهور</label>
                <div className="relative">
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState((previous) => ({ ...previous, status: event.target.value }))}
                    className="w-full cursor-pointer appearance-none border-2 border-slate-100 bg-slate-50 px-4 py-3 text-right text-sm font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
                  >
                    <option value="active">جاهز للنشر ومتاح للجميع</option>
                    <option value="pending">مسودة للحفظ فقط المراجعة</option>
                    <option value="maintenance">إخفاء عن الجمهور (أرشفة)</option>
                  </select>
                  <ChevronRight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-300" />
                </div>
              </div>

              <div className="grid gap-3 border border-slate-200 bg-slate-50/60 p-4 text-right">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-slate-900">ترخيص الإعلان العقاري</div>
                  <span className={`rounded-none border px-3 py-1 text-[10px] font-black ${adLicenseTone}`}>
                    {adLicenseLabel}
                  </span>
                </div>
                <input
                  type="text"
                  value={formState.adLicenseNumber}
                  onChange={(event) =>
                    setFormState((previous) => ({ ...previous, adLicenseNumber: event.target.value }))
                  }
                  placeholder="رقم رخصة الإعلان"
                  className="h-12 w-full border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                />
                {propertyId ? (
                  <div className="grid gap-3">
                    <input
                      ref={licenseInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleLicenseFiles}
                    />
                    <button
                      type="button"
                      onClick={() => licenseInputRef.current?.click()}
                      className="flex w-full items-center justify-center gap-2 border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-black text-slate-700"
                    >
                      <Upload className="h-4 w-4" />
                      {isLicenseUploading ? "جارٍ رفع المستندات..." : "رفع مستندات الترخيص"}
                    </button>
                    {licenseDocs.length > 0 ? (
                      <div className="grid gap-2">
                        {licenseDocs.map((doc) => (
                          <div
                            key={doc.key}
                            className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600"
                          >
                            <span className="truncate">{doc.name}</span>
                            <button
                              type="button"
                              onClick={() => setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))}
                              className="text-[10px] text-slate-500 hover:text-slate-900"
                            >
                              إزالة
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {licenseError ? (
                      <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-700">
                        {licenseError}
                      </div>
                    ) : null}
                    {licenseSubmitted ? (
                      <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700">
                        تم إرسال الطلب بنجاح.
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLicenseSubmit}
                      disabled={licenseSubmitting}
                      className="h-11 border-2 border-slate-950 bg-slate-950 px-4 text-[10px] font-black tracking-[0.2em] text-white transition hover:border-blue-600 hover:bg-blue-600"
                    >
                      {licenseSubmitting ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-slate-500">احفظ المشروع أولاً لإرسال طلب ترخيص الإعلان.</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2 text-right">
                  <label className="text-[10px] font-black tracking-widest text-slate-400">الغرف</label>
                  <input
                    type="number"
                    value={formState.rooms}
                    onChange={(event) => setFormState((previous) => ({ ...previous, rooms: event.target.value }))}
                    placeholder="0"
                    className="w-full border-2 border-slate-100 bg-slate-50 px-3 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div className="grid gap-2 text-right">
                  <label className="text-[10px] font-black tracking-widest text-slate-400">دورات المياه</label>
                  <input
                    type="number"
                    value={formState.baths}
                    onChange={(event) => setFormState((previous) => ({ ...previous, baths: event.target.value }))}
                    placeholder="0"
                    className="w-full border-2 border-slate-100 bg-slate-50 px-3 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-2 text-right">
                <label className="text-[10px] font-black tracking-widest text-slate-400">المساحة م²</label>
                <input
                  type="text"
                  value={formState.area}
                  onChange={(event) => setFormState((previous) => ({ ...previous, area: event.target.value }))}
                  placeholder="0"
                  className="w-full border-2 border-slate-100 bg-slate-50 px-4 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-8">
            <div className="mb-6 flex flex-row-reverse items-start gap-3 border border-slate-100 bg-slate-50 p-4 text-right">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
              <p className="text-[10px] font-bold leading-relaxed text-slate-600">
                إن النشر يؤثر فوراً على ظهور المشروع في التطبيقات. يرجى التأكد من المرفقات.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSafetyConfirm(true)}
              disabled={savePending}
              className="flex w-full items-center justify-center bg-blue-600 py-5 text-sm font-black tracking-[0.2em] text-white transition-colors hover:bg-slate-950"
            >
              {savePending ? "جارٍ الحفظ..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
