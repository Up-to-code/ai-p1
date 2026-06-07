export type AssetStatus = "available" | "sold" | "reserved" | "pending" | "draft" | "active" | "review" | "approved" | "archived";
export type Visibility = "private" | "public" | "team" | "workspace";

export interface WorkspaceAsset {
  id: string;
  title: string;
  reference: string;
  projectId?: string;
  project: string;
  city: string;
  type: string;
  image?: string;
  coverImageUrl?: string;
  status: AssetStatus;
  visibility?: Visibility;
  purpose: "sale" | "rent";
  price: string;
  area: string;
  bedrooms: number | string;
  bathrooms: number;
  updated?: string;
  updatedAt?: number;
  createdAt?: number;
  description: string;
}
