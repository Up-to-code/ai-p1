import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { PropertyStatus, PropertyUnit } from "./properties.types";

type PropertyInput = Omit<PropertyUnit, "id" | "reference" | "updated">;

interface PropertiesState {
  units: PropertyUnit[];
  filter: "all" | PropertyStatus;
  search: string;
  view: ViewMode;
  setFilter: (filter: PropertiesState["filter"]) => void;
  setSearch: (search: string) => void;
  setView: (view: ViewMode) => void;
  getById: (id: string) => PropertyUnit | undefined;
  createUnit: (input: PropertyInput) => PropertyUnit;
  updateUnit: (id: string, input: Partial<PropertyUnit>) => void;
  deleteUnit: (id: string) => void;
}

const units: PropertyUnit[] = [
  {
    id: "unt-1",
    title: "Unit A-101",
    reference: "A-101",
    project: "Al Madinah Residences",
    city: "Riyadh",
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
    status: "available",
    purpose: "sale",
    price: "850,000",
    area: "120 m2",
    bedrooms: 2,
    bathrooms: 2,
    updated: "2h ago",
    description: "Bright two-bedroom unit with approved documentation and media.",
  },
  {
    id: "unt-2",
    title: "Unit B-301",
    reference: "B-301",
    project: "Al Madinah Residences",
    city: "Riyadh",
    type: "Penthouse",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop",
    status: "pending",
    purpose: "sale",
    price: "2,100,000",
    area: "280 m2",
    bedrooms: 4,
    bathrooms: 4,
    updated: "1d ago",
    description: "Penthouse pending pricing approval.",
  },
  {
    id: "unt-3",
    title: "Villa 7",
    reference: "V-07",
    project: "Dammam Waterfront",
    city: "Dammam",
    type: "Villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop",
    status: "draft",
    purpose: "sale",
    price: "3,500,000",
    area: "450 m2",
    bedrooms: 5,
    bathrooms: 6,
    updated: "3d ago",
    description: "Draft luxury villa inventory awaiting document upload.",
  },
];

export const usePropertiesStore = create<PropertiesState>((set, get) => ({
  units,
  filter: "all",
  search: "",
  view: "grid",
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  getById: (id) => get().units.find((unit) => unit.id === id || unit.reference === id),
  createUnit: (input) => {
    const number = get().units.length + 1;
    const next: PropertyUnit = {
      ...input,
      id: `unt-${number}`,
      reference: `U-${String(number).padStart(3, "0")}`,
      updated: "Now",
    };
    set((state) => ({ units: [next, ...state.units] }));
    return next;
  },
  updateUnit: (id, input) => set((state) => ({
    units: state.units.map((unit) => (unit.id === id || unit.reference === id ? { ...unit, ...input, updated: "Now" } : unit)),
  })),
  deleteUnit: (id) => set((state) => ({ units: state.units.filter((unit) => unit.id !== id && unit.reference !== id) })),
}));
