import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { Client, ClientType, PipelineStage } from "./clients.types";

type ClientInput = Omit<Client, "id" | "_id" | "_creationTime" | "added" | "lastContact" | "createdByUserId" | "createdAt" | "updatedAt">;

interface ClientsState {
  clients: Client[];
  filter: "all" | ClientType;
  search: string;
  view: ViewMode | "pipeline" | "calendar";
  setFilter: (filter: ClientsState["filter"]) => void;
  setSearch: (search: string) => void;
  setView: (view: ClientsState["view"]) => void;
  getById: (id: string) => Client | undefined;
  createClient: (input: ClientInput) => Client;
  updateClient: (id: string, input: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  moveClient: (id: string, pipelineStage: PipelineStage, targetIndex?: number) => void;
}

const clients: Client[] = [];

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients,
  filter: "all",
  search: "",
  view: "pipeline",
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setView: (view) => set({ view }),
  getById: (id) => get().clients.find((client) => client.id === id),
  createClient: (input) => {
    const now = Date.now();
    const next: Client = {
      ...input,
      _id: `cl-${get().clients.length + 1}`,
      _creationTime: now,
      id: `cl-${get().clients.length + 1}`,
      organizationId: "",
      ownerUserId: "",
      added: "Today",
      lastContact: "Now",
      createdByUserId: "",
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ clients: [next, ...state.clients] }));
    return next;
  },
  updateClient: (id, input) => set((state) => ({
    clients: state.clients.map((client) => (client.id === id ? { ...client, ...input } : client)),
  })),
  deleteClient: (id) => set((state) => ({ clients: state.clients.filter((client) => client.id !== id) })),
  moveClient: (id, pipelineStage, targetIndex) => set((state) => {
    const clientIndex = state.clients.findIndex(c => c.id === id);
    if (clientIndex === -1) return state;
    
    const updatedClients = [...state.clients];
    const [client] = updatedClients.splice(clientIndex, 1);
    const updatedClient = { ...client, pipelineStage };
    
    if (targetIndex !== undefined) {
      let stageCount = 0;
      let insertAt = -1;
      
      for (let i = 0; i <= updatedClients.length; i++) {
        if (stageCount === targetIndex) {
          insertAt = i;
          break;
        }
        if (i < updatedClients.length && updatedClients[i].pipelineStage === pipelineStage) {
          stageCount++;
        }
      }
      
      if (insertAt === -1) {
        updatedClients.push(updatedClient);
      } else {
        updatedClients.splice(insertAt, 0, updatedClient);
      }
    } else {
      updatedClients.push(updatedClient);
    }
    
    return { clients: updatedClients };
  }),
}));
