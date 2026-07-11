"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import { logger } from "@/lib/logger";
import type { DocFormValues, DocRecord } from "../docs.types";
import {
  documentDraftKey,
  documentFormFromRecord,
  restoreDocumentDraft,
  shouldAdoptServerDocument,
} from "../document-draft";

const DOCUMENT_AUTOSAVE_DELAY = 60_000;
const LOCAL_DRAFT_DELAY = 300;

export type DocumentSaveMode = "saved" | "local" | "autosaving";

export function useDocumentDraft({
  doc,
  organizationId,
  persist,
  onSaved,
}: {
  doc: DocRecord;
  organizationId: string;
  persist: (values: DocFormValues) => Promise<unknown>;
  onSaved?: () => void;
}) {
  const t = useTranslations("Docs");
  const toast = useToast();
  const initialDraft = documentFormFromRecord(doc);
  const [draft, setDraft] = useState<DocFormValues>(initialDraft);
  const [lastPersistedKey, setLastPersistedKey] = useState(() =>
    documentDraftKey(initialDraft),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saveMode, setSaveMode] = useState<DocumentSaveMode>("saved");

  const latestDraftRef = useRef(draft);
  const lastPersistedKeyRef = useRef(lastPersistedKey);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const localDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveVersionRef = useRef(0);
  const storageKey = `doc-draft:${organizationId}:${doc.id}`;
  const hasUnsavedChanges = documentDraftKey(draft) !== lastPersistedKey;

  const markPersisted = useCallback((key: string) => {
    lastPersistedKeyRef.current = key;
    setLastPersistedKey(key);
  }, []);

  useEffect(() => {
    latestDraftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    const serverDraft = documentFormFromRecord(doc);
    if (
      shouldAdoptServerDocument({
        currentDraft: latestDraftRef.current,
        lastPersistedKey: lastPersistedKeyRef.current,
        serverDraft,
      })
    ) {
      latestDraftRef.current = serverDraft;
      setDraft(serverDraft);
      markPersisted(documentDraftKey(serverDraft));
    }
  }, [
    doc.id,
    doc.title,
    doc.content,
    doc.folderId,
    doc.projectId,
    doc.visibility,
    doc.tags,
    doc.customFields,
    doc.updatedAt,
    markPersisted,
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { getItem } = await import("@/domains/storage");
      const stored = await getItem("drafts", storageKey);
      if (cancelled) return;
      if (stored?.value && typeof stored.value === "object") {
        const restored = restoreDocumentDraft(
          documentFormFromRecord(doc),
          stored.value,
        );
        latestDraftRef.current = restored;
        setDraft(restored);
        setSaveMode("local");
      }
      setDraftLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [doc.id, organizationId, storageKey]);

  useEffect(() => {
    if (!draftLoaded || !hasUnsavedChanges) return;
    if (localDraftTimerRef.current) clearTimeout(localDraftTimerRef.current);
    localDraftTimerRef.current = setTimeout(() => {
      void (async () => {
        const { setItem } = await import("@/domains/storage");
        await setItem(
          "drafts",
          storageKey,
          latestDraftRef.current as Record<string, unknown>,
        );
      })();
    }, LOCAL_DRAFT_DELAY);
    return () => {
      if (localDraftTimerRef.current) clearTimeout(localDraftTimerRef.current);
    };
  }, [draft, draftLoaded, hasUnsavedChanges, storageKey]);

  const persistDraft = useCallback(
    async (
      nextDraft: DocFormValues,
      options?: { showToast?: boolean; automatic?: boolean },
    ) => {
      const nextKey = documentDraftKey(nextDraft);
      if (nextKey === lastPersistedKeyRef.current) return;

      const saveVersion = ++saveVersionRef.current;
      if (options?.automatic) setSaveMode("autosaving");
      setIsSaving(true);
      try {
        await persist(nextDraft);
        if (saveVersion !== saveVersionRef.current) return;

        markPersisted(nextKey);
        setSaveMode("saved");
        const { removeItem } = await import("@/domains/storage");
        await removeItem("drafts", storageKey);
        if (options?.showToast) {
          toast.toast({ title: t("form.savedToast"), type: "success" });
        }
        onSaved?.();
      } catch (error) {
        logger.error("docs.save_failed", { docId: doc.id, error });
        if (saveVersion === saveVersionRef.current) {
          if (options?.showToast) {
            toast.toast({ title: "Document could not be saved.", type: "error" });
          }
          setSaveMode("local");
        }
      } finally {
        if (saveVersion === saveVersionRef.current) setIsSaving(false);
      }
    },
    [doc.id, markPersisted, onSaved, persist, storageKey, t, toast],
  );

  const scheduleServerAutosave = useCallback(
    (nextDraft: DocFormValues) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void persistDraft(nextDraft, { automatic: true });
      }, DOCUMENT_AUTOSAVE_DELAY);
    },
    [persistDraft],
  );

  const updateDraft = useCallback(
    (partial: Partial<DocFormValues>) => {
      setDraft((current) => {
        const next = { ...current, ...partial };
        latestDraftRef.current = next;
        setSaveMode("local");
        scheduleServerAutosave(next);
        return next;
      });
    },
    [scheduleServerAutosave],
  );

  const flushAutosave = useCallback(
    (options?: { showToast?: boolean }) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      return persistDraft(latestDraftRef.current, options);
    },
    [persistDraft],
  );

  const saveDraft = useCallback(() => {
    void flushAutosave({ showToast: true });
  }, [flushAutosave]);

  const updateBody = useCallback(
    (html: string) => {
      if (html === latestDraftRef.current.content) return;
      updateDraft({ content: html });
    },
    [updateDraft],
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (localDraftTimerRef.current) clearTimeout(localDraftTimerRef.current);
    };
  }, []);

  return {
    draft,
    isSaving,
    saveMode,
    hasUnsavedChanges,
    updateDraft,
    updateBody,
    saveDraft,
  };
}
