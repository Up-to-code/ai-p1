import { create } from "zustand";
import type { ViewMode } from "@/types/common.types";
import type { Client, ClientType, PipelineStage } from "./clients.types";

type ClientInput = Omit<Client, "id" | "added" | "lastContact" | "nextActionDate" | "appointmentTime" | "syncState">;

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

const clients: Client[] = [
  {
    id: "cl-1",
    name: "Abdullah Al-Faisal",
    type: "Buyer",
    contact: "abdullah@example.com",
    phone: "+966 512 345 678",
    age: 34,
    nationality: "Saudi",
    generation: "Millennial",
    budget: "900K - 1.2M SAR",
    propertyInterest: "2BR apartment, Riyadh",
    status: "active",
    added: "May 1, 2026",
    pipelineStage: "qualified",
    priority: "high",
    lastContact: "Today",
    nextAction: "Send mortgage options",
    nextActionDate: "May 5, 2026",
    appointmentTime: "10:30",
    syncState: "eligible",
  },
  {
    id: "cl-2",
    name: "Sarah Al-Rashid",
    type: "Tenant",
    contact: "sarah@example.com",
    phone: "+966 555 123 456",
    age: 29,
    nationality: "Saudi",
    generation: "Millennial",
    budget: "80K - 110K SAR / year",
    propertyInterest: "Serviced apartment, Jeddah",
    status: "active",
    added: "May 2, 2026",
    pipelineStage: "new",
    priority: "normal",
    lastContact: "Yesterday",
    nextAction: "Confirm move-in date",
    nextActionDate: "May 6, 2026",
    appointmentTime: "13:00",
    syncState: "draft",
  },
  {
    id: "cl-3",
    name: "Capital Ventures",
    type: "Investor",
    contact: "info@capitalventures.sa",
    phone: "+966 11 234 5678",
    age: 42,
    nationality: "Saudi",
    generation: "Gen X",
    budget: "4M - 8M SAR",
    propertyInterest: "Commercial units, KAEC",
    status: "active",
    added: "Apr 28, 2026",
    pipelineStage: "negotiation",
    priority: "urgent",
    lastContact: "May 4",
    nextAction: "Share yield report",
    nextActionDate: "May 8, 2026",
    appointmentTime: "09:15",
    syncState: "synced",
  },
  {
    id: "cl-4",
    name: "Fahad Al-Saud",
    type: "Broker",
    contact: "fahad@example.com",
    phone: "+966 509 876 543",
    age: 39,
    nationality: "Saudi",
    generation: "Gen X",
    budget: "Partner pipeline",
    propertyInterest: "Waterfront villas, Dammam",
    issue: "Commission agreement needs legal review.",
    status: "inactive",
    added: "Apr 15, 2026",
    pipelineStage: "viewing",
    priority: "normal",
    lastContact: "Apr 30",
    nextAction: "Review commission agreement",
    nextActionDate: "May 11, 2026",
    appointmentTime: "15:30",
    syncState: "blocked",
  },
];

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
    const next: Client = {
      ...input,
      id: `cl-${get().clients.length + 1}`,
      added: "Today",
      lastContact: "Now",
      nextActionDate: "This week",
      appointmentTime: "10:00",
      syncState: "draft",
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
      
      // Find the position in the flat array that corresponds to targetIndex in the stage
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
