export type ProjectStatus = "draft" | "pending" | "approved" | "rejected";
export type Visibility = "private" | "public";

export interface Project {
  id: string;
  name: string;
  reference: string;
  developer: string;
  city: string;
  area: string;
  type: string;
  unitTypes?: string[];
  image?: string;
  coverImageUrl?: string;
  status: ProjectStatus;
  visibility?: Visibility;
  syncState: "draft" | "blocked" | "synced";
  units: number;
  priceRange: string;
  averagePrice?: string;
  projectPrices?: Array<{ id: string; label: string; price: string }>;
  regaAuthorizationNo?: string;
  regaExpiresAt?: string;
  planNumber?: string;
  plotNumber?: string;
  postalIdentity?: string;
  updated?: string;
  updatedAt?: number;
  createdAt?: number;
  description: string;
}
