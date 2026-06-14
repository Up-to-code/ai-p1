import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { Project, ProjectStatus } from "./projects.types";

type ProjectInput = Omit<Project, "id" | "reference" | "syncState">;

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
    name: "Client Onboarding System",
    reference: "PRJ-001",
    status: "active",
    health: "onTrack",
    syncState: "synced",
    description: "A verified onboarding project with approved resources and customer-ready media.",
  } as Project,
  {
    id: "prj-2",
    name: "Partner Portal Rollout",
    reference: "PRJ-002",
    status: "active",
    health: "onTrack",
    syncState: "blocked",
    description: "Mixed-use complex awaiting final data sync approval.",
  } as Project,
  {
    id: "prj-3",
    name: "Field Operations Launch",
    reference: "PRJ-003",
    status: "planned",
    health: "onTrack",
    syncState: "draft",
    description: "Field operations workspace in draft preparation.",
  } as Project,
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
      syncState: "draft",
      _creationTime: Date.now(),
    } as Project;
    set((state) => ({ projects: [next, ...state.projects] }));
    return next;
  },
  updateProject: (id, input) => set((state) => ({
    projects: state.projects.map((project) => (project.id === id || project.reference === id ? { ...project, ...input, updated: "Now" } : project)),
  })),
  deleteProject: (id) => set((state) => ({ projects: state.projects.filter((project) => project.id !== id && project.reference !== id) })),
}));
