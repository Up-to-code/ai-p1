import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { AssetStatus, WorkspaceAsset } from "./assets.types";

type AssetInput = Omit<WorkspaceAsset, "id" | "reference" | "updated">;

interface AssetsState {
  assets: WorkspaceAsset[];
  filter: "all" | AssetStatus;
  search: string;
  view: ViewMode;
  setFilter: (filter: AssetsState["filter"]) => void;
  setSearch: (search: string) => void;
  setView: (view: ViewMode) => void;
  getById: (id: string) => WorkspaceAsset | undefined;
  createAsset: (input: AssetInput) => WorkspaceAsset;
  updateAsset: (id: string, input: Partial<WorkspaceAsset>) => void;
  deleteAsset: (id: string) => void;
}

const assets: WorkspaceAsset[] = [
  {
    id: "ast-1",
    title: "Onboarding Brief",
    reference: "AST-101",
    project: "Operations Hub",
    city: "Remote",
    type: "Document",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop",
    status: "available",
    purpose: "sale",
    price: "0",
    area: "Shared",
    bedrooms: 0,
    bathrooms: 0,
    updated: "2h ago",
    description: "Shared workspace asset with approved documentation and media.",
  },
  {
    id: "ast-2",
    title: "Brand Resource Pack",
    reference: "AST-301",
    project: "Operations Hub",
    city: "Remote",
    type: "Resource",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=600&auto=format&fit=crop",
    status: "pending",
    purpose: "sale",
    price: "0",
    area: "Team",
    bedrooms: 0,
    bathrooms: 0,
    updated: "1d ago",
    description: "Resource pending approval.",
  },
  {
    id: "ast-3",
    title: "Field Checklist",
    reference: "AST-007",
    project: "Field Operations",
    city: "Remote",
    type: "Checklist",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop",
    status: "draft",
    purpose: "sale",
    price: "0",
    area: "Operations",
    bedrooms: 0,
    bathrooms: 0,
    updated: "3d ago",
    description: "Draft operational asset awaiting document upload.",
  },
];

export const useAssetsStore = create<AssetsState>((set, get) => ({
  assets,
  filter: "all",
  search: "",
  view: "grid",
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  getById: (id) => get().assets.find((asset) => asset.id === id || asset.reference === id),
  createAsset: (input) => {
    const number = get().assets.length + 1;
    const next: WorkspaceAsset = {
      ...input,
      id: `ast-${number}`,
      reference: `AST-${String(number).padStart(3, "0")}`,
      updated: "Now",
    };
    set((state) => ({ assets: [next, ...state.assets] }));
    return next;
  },
  updateAsset: (id, input) => set((state) => ({
    assets: state.assets.map((asset) => (asset.id === id || asset.reference === id ? { ...asset, ...input, updated: "Now" } : asset)),
  })),
  deleteAsset: (id) => set((state) => ({ assets: state.assets.filter((asset) => asset.id !== id && asset.reference !== id) })),
}));
