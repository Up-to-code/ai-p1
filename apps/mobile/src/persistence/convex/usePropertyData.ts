import { useEffect, useMemo, useState } from "react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";

import { useAuthSession } from "@/auth/useAuthSession";
import {
  buildListingSearchArgs,
  filterListingProperties,
  hasListingSearchIntent,
  mergeUniqueProperties,
  type FilterKey,
} from "@/decision/listingBrowse";
import type { ListingFilters } from "@/decision/listingFilters";
import { api } from "@/persistence/convex/api";
import { toPropertyCardVM, type ListingPropertyRow } from "@/persistence/convex/propertyAdapter";
import { useAppStore } from "@/store";
import type { PropertyCardVM } from "@/types/domain";

type SavedListingApiRow = {
  listingId: string;
  property?: ListingPropertyRow | null;
};

export type PropertyCollectionState = {
  items: PropertyCardVM[];
  isLoading: boolean;
  hasLoaded: boolean;
  isEmpty: boolean;
};

export type SavedPropertyRow = {
  listingId: string;
  property: PropertyCardVM | null;
};

export type SavedPropertyCollectionState = {
  items: SavedPropertyRow[];
  isLoading: boolean;
  hasLoaded: boolean;
  isEmpty: boolean;
};

export type PropertyValueState = {
  item: PropertyCardVM | null;
  isLoading: boolean;
  hasLoaded: boolean;
  isMissing: boolean;
};

export type CandidatePropertySearchState = PropertyCollectionState & {
  hasSearchIntent: boolean;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  loadMore: () => void;
};

const REMOTE_SEARCH_PAGE_SIZE = 6;

function ensureArray<T>(value: unknown, label: string): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (__DEV__ && value !== undefined && value !== null) {
    console.warn(`[property] Expected array for ${label}`, value);
  }

  return [];
}

export function useCandidatePropertiesState(): PropertyCollectionState {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const rows = useQuery(
    api.listings.listCandidateListings,
    e2eQaMode ? "skip" : {},
  );

  return useMemo(() => {
    if (e2eQaMode) {
      return {
        items: [],
        isLoading: false,
        hasLoaded: true,
        isEmpty: true,
      };
    }

    const items = ensureArray<ListingPropertyRow>(rows, "listCandidateProperties").map(toPropertyCardVM);
    const isLoading = rows === undefined;

    return {
      items,
      isLoading,
      hasLoaded: !isLoading,
      isEmpty: !isLoading && items.length === 0,
    };
  }, [e2eQaMode, rows]);
}

export function useCandidateProperties() {
  return useCandidatePropertiesState().items;
}

export function useCandidatePropertySearchState({
  searchQuery = "",
  activeFilter = "all",
  advancedFilters,
  remoteExpansionEnabled,
}: {
  searchQuery?: string;
  activeFilter?: FilterKey;
  advancedFilters: ListingFilters;
  remoteExpansionEnabled: boolean;
}): CandidatePropertySearchState {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const candidateState = useCandidatePropertiesState();
  const searchArgs = useMemo(
    () => buildListingSearchArgs({ searchQuery, advancedFilters }),
    [advancedFilters, searchQuery],
  );
  const searchIntent = useMemo(
    () => hasListingSearchIntent({ searchQuery, activeFilter, advancedFilters }),
    [activeFilter, advancedFilters, searchQuery],
  );
  const remoteResults = usePaginatedQuery(
    api.listings.searchListingsPaginated,
    e2eQaMode || !remoteExpansionEnabled || !searchIntent ? "skip" : searchArgs,
    { initialNumItems: REMOTE_SEARCH_PAGE_SIZE },
  );

  const localItems = useMemo(
    () => filterListingProperties(candidateState.items, { searchQuery, activeFilter, advancedFilters }),
    [activeFilter, advancedFilters, candidateState.items, searchQuery],
  );
  const remoteItems = useMemo(
    () => ensureArray<ListingPropertyRow>(remoteResults.results, "searchListingsPaginated").map(toPropertyCardVM),
    [remoteResults.results],
  );
  const remoteFilteredItems = useMemo(
    () => filterListingProperties(remoteItems, { searchQuery, activeFilter, advancedFilters }),
    [activeFilter, advancedFilters, remoteItems, searchQuery],
  );
  const items = useMemo(
    () => mergeUniqueProperties(localItems, remoteFilteredItems),
    [localItems, remoteFilteredItems],
  );

  const remoteLoadingFirstPage = remoteExpansionEnabled && remoteResults.status === "LoadingFirstPage";
  const remoteLoadingMore = remoteExpansionEnabled && remoteResults.status === "LoadingMore";
  const canLoadMore = remoteExpansionEnabled && remoteResults.status === "CanLoadMore";
  const isLoading = candidateState.isLoading || (remoteLoadingFirstPage && items.length === 0);
  const hasLoaded = candidateState.hasLoaded && !(remoteLoadingFirstPage && items.length === 0);

  return {
    items,
    isLoading,
    hasLoaded,
    isEmpty: hasLoaded && items.length === 0,
    hasSearchIntent: searchIntent,
    isLoadingMore: remoteLoadingFirstPage || remoteLoadingMore,
    canLoadMore,
    loadMore: () => {
      if (!canLoadMore) {
        return;
      }
      remoteResults.loadMore(REMOTE_SEARCH_PAGE_SIZE);
    },
  };
}

export function usePropertyByIdState(propertyId: string | undefined): PropertyValueState {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const row = useQuery(
    api.listings.getListing,
    e2eQaMode || !propertyId ? "skip" : { listingId: propertyId },
  );

  return useMemo(() => {
    if (e2eQaMode) {
      return {
        item: null,
        isLoading: false,
        hasLoaded: true,
        isMissing: true,
      };
    }

    const isLoading = Boolean(propertyId) && row === undefined;
    const item = row ? toPropertyCardVM(row) : null;

    return {
      item,
      isLoading,
      hasLoaded: !isLoading,
      isMissing: Boolean(propertyId) && !isLoading && item === null,
    };
  }, [e2eQaMode, propertyId, row]);
}

export function usePropertyById(propertyId: string | undefined) {
  return usePropertyByIdState(propertyId).item;
}

export function usePropertiesByIds(propertyIds: string[]) {
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const rows = useQuery(
    api.listings.listListingsByIds,
    e2eQaMode || propertyIds.length === 0 ? "skip" : { listingIds: propertyIds },
  );

  return useMemo(() => {
    if (e2eQaMode) {
      return [];
    }

    return ensureArray<ListingPropertyRow>(rows, "listByIds").map(toPropertyCardVM);
  }, [e2eQaMode, rows]);
}

export function useSavedPropertiesState(): SavedPropertyCollectionState {
  const { isAuthenticated, isGuest } = useAuthSession();
  const e2eQaMode = useAppStore((state) => state.e2eQaMode);
  const e2eSavedPropertyIds = useAppStore((state) => state.e2eSavedPropertyIds);
  const guestMirrorSavedPropertyIds = useAppStore((state) => state.guestMirrorSavedPropertyIds);
  const setGuestMirrorSavedPropertyIds = useAppStore((state) => state.setGuestMirrorSavedPropertyIds);
  const syncSavedListing = useMutation(api.listings.toggleSavedListing);
  const [syncingGuestSaves, setSyncingGuestSaves] = useState(false);
  const rows = useQuery(
    api.listings.listSavedListings,
    isAuthenticated && !e2eQaMode ? {} : "skip",
  );
  const mirroredRows = useQuery(
    api.listings.listListingsByIds,
    !e2eQaMode && isGuest && guestMirrorSavedPropertyIds.length > 0
      ? { listingIds: guestMirrorSavedPropertyIds }
      : "skip",
  );

  useEffect(() => {
    if (e2eQaMode || !isGuest || rows === undefined) {
      return;
    }

    const savedRows = ensureArray<SavedListingApiRow>(rows, "listSavedProperties");

    if (savedRows.length === 0 && guestMirrorSavedPropertyIds.length > 0) {
      return;
    }

    setGuestMirrorSavedPropertyIds(savedRows.map((row) => row.listingId));
  }, [e2eQaMode, guestMirrorSavedPropertyIds.length, isGuest, rows, setGuestMirrorSavedPropertyIds]);

  useEffect(() => {
    if (
      e2eQaMode
      || !isAuthenticated
      || !isGuest
      || rows === undefined
      || guestMirrorSavedPropertyIds.length === 0
      || syncingGuestSaves
    ) {
      return;
    }

    const savedRows = ensureArray<SavedListingApiRow>(rows, "listSavedProperties");
    const existingIds = savedRows.map((row) => row.listingId);
    const missingIds = guestMirrorSavedPropertyIds.filter((propertyId) => !existingIds.includes(propertyId));

    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;
    setSyncingGuestSaves(true);

    void Promise.all(
      missingIds.map((listingId) => syncSavedListing({ listingId })),
    ).finally(() => {
      if (!cancelled) {
        setSyncingGuestSaves(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    e2eQaMode,
    guestMirrorSavedPropertyIds,
    isAuthenticated,
    isGuest,
    rows,
    syncSavedListing,
    syncingGuestSaves,
  ]);

  return useMemo(
    () => {
      if (e2eQaMode) {
        const items = e2eSavedPropertyIds.map((propertyId) => ({
          listingId: propertyId,
          property: null,
        }));
        return {
          items,
          isLoading: false,
          hasLoaded: true,
          isEmpty: items.length === 0,
        };
      }

      const savedRows = ensureArray<SavedListingApiRow>(rows, "listSavedProperties");
      const authLoading = isAuthenticated && rows === undefined;
      const guestMirrorLoading =
        !e2eQaMode
        && isGuest
        && guestMirrorSavedPropertyIds.length > 0
        && mirroredRows === undefined
        && rows === undefined;

      if (rows !== undefined && !(savedRows.length === 0 && isGuest && guestMirrorSavedPropertyIds.length > 0)) {
        const items = savedRows.map((row) => ({
          ...row,
          listingId: row.listingId,
          property: row.property ? toPropertyCardVM(row.property) : null,
        }));

        return {
          items,
          isLoading: false,
          hasLoaded: true,
          isEmpty: items.length === 0,
        };
      }

      if (isGuest) {
        const mirroredProperties = ensureArray<ListingPropertyRow>(mirroredRows, "listByIds.mirrored").map(toPropertyCardVM);
        const items = guestMirrorSavedPropertyIds.map((listingId) => ({
          listingId,
          property: mirroredProperties.find((property: PropertyCardVM) => property.id === listingId) ?? null,
        }));

        return {
          items,
          isLoading: guestMirrorLoading,
          hasLoaded: !guestMirrorLoading,
          isEmpty: !guestMirrorLoading && items.length === 0,
        };
      }

      return {
        items: [],
        isLoading: authLoading,
        hasLoaded: !authLoading,
        isEmpty: !authLoading,
      };
    },
    [e2eQaMode, e2eSavedPropertyIds, guestMirrorSavedPropertyIds, isAuthenticated, isGuest, mirroredRows, rows],
  );
}

export function useSavedProperties() {
  return useSavedPropertiesState().items;
}
