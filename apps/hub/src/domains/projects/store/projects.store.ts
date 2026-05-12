import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { Project, ProjectStatus } from "./projects.types";

type ProjectInput = Omit<Project, "id" | "reference" | "updated" | "syncState">;

interface ProjectsState {
  projects: Project[];
  filter: "all" | ProjectStatus;
  search: string;
  view: ViewMode;
  setFilter: (filter: ProjectsState["filter"]) => void;
  setSearch: (search: string) => void;
  setView: (view: ViewMode) => void;
  getById: (id: string) => Project | undefined;
  createProject: (input: ProjectInput) => Project;
  updateProject: (id: string, input: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const projects: Project[] = [
  {
    id: "prj-1",
    name: "Al Madinah Residences",
    reference: "PRJ-001",
    developer: "Acme Development",
    city: "Riyadh",
    area: "Al Malqa",
    type: "Residential",
    unitTypes: ["Apartment", "Penthouse"],
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
    status: "approved",
    units: 42,
    syncState: "synced",
    priceRange: "850K SAR",
    updated: "2h ago",
    description: "A verified residential project with approved inventory and broker-ready media.",
  },
  {
    id: "prj-2",
    name: "Jeddah Tower Complex",
    reference: "PRJ-002",
    developer: "Red Sea Assets",
    city: "Jeddah",
    area: "Corniche",
    type: "Mixed Use",
    unitTypes: ["Apartment", "Office", "Retail"],
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
    status: "pending",
    units: 18,
    syncState: "blocked",
    priceRange: "1.2M SAR",
    updated: "1d ago",
    description: "Mixed-use complex awaiting final data sync approval.",
  },
  {
    id: "prj-3",
    name: "Dammam Waterfront",
    reference: "PRJ-003",
    developer: "Eastern Horizon",
    city: "Dammam",
    area: "Waterfront",
    type: "Residential",
    unitTypes: ["Villa"],
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
    status: "draft",
    units: 24,
    syncState: "draft",
    priceRange: "2.8M SAR",
    updated: "3d ago",
    description: "Luxury villa inventory in draft preparation.",
  },
];

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects,
  filter: "all",
  search: "",
  view: "grid",
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  getById: (id) => get().projects.find((project) => project.id === id || project.reference === id),
  createProject: (input) => {
    const number = get().projects.length + 1;
    const next: Project = {
      ...input,
      id: `prj-${number}`,
      reference: `PRJ-${String(number).padStart(3, "0")}`,
      updated: "Now",
      syncState: "draft",
    };
    set((state) => ({ projects: [next, ...state.projects] }));
    return next;
  },
  updateProject: (id, input) => set((state) => ({
    projects: state.projects.map((project) => (project.id === id || project.reference === id ? { ...project, ...input, updated: "Now" } : project)),
  })),
  deleteProject: (id) => set((state) => ({ projects: state.projects.filter((project) => project.id !== id && project.reference !== id) })),
}));
