export type ProjectStatus = "draft" | "pending" | "approved" | "rejected";

export interface Project {
  id: string;
  name: string;
  reference: string;
  developer: string;
  city: string;
  area: string;
  type: string;
  image?: string;
  coverImageUrl?: string;
  status: ProjectStatus;
  syncState: "draft" | "blocked" | "synced";
  units: number;
  priceRange: string;
  updated?: string;
  updatedAt?: number;
  createdAt?: number;
  description: string;
}
