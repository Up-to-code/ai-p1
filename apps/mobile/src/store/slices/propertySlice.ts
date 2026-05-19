import type { StateCreator } from "zustand";

export type PropertySlice = {
  selectedPropertyId: string | null;
  comparePropertyIds: string[];
  dismissedPropertyIds: string[];
  setSelectedPropertyId: (id: string | null) => void;
  setComparePropertyIds: (ids: string[]) => void;
  toggleCompareProperty: (id: string) => void;
  dismissProperty: (id: string) => void;
  clearDismissedProperties: () => void;
};

export const createPropertySlice: StateCreator<PropertySlice, [], [], PropertySlice> = (set) => ({
  selectedPropertyId: null,
  comparePropertyIds: [],
  dismissedPropertyIds: [],
  setSelectedPropertyId: (id) => set({ selectedPropertyId: id }),
  setComparePropertyIds: (ids) =>
    set({
      comparePropertyIds: Array.from(new Set(ids)).slice(-2),
    }),
  toggleCompareProperty: (id) =>
    set((state) => ({
      comparePropertyIds: state.comparePropertyIds.includes(id)
        ? state.comparePropertyIds.filter((propertyId) => propertyId !== id)
        : [...state.comparePropertyIds, id].slice(-2),
    })),
  dismissProperty: (id) =>
    set((state) => {
      const isDismissed = state.dismissedPropertyIds.includes(id);
      if (isDismissed) return state;

      const newDismissed = [...state.dismissedPropertyIds, id];
      return {
        dismissedPropertyIds: newDismissed,
      };
    }),
  clearDismissedProperties: () => set({ dismissedPropertyIds: [] }),
});
