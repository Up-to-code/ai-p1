export type PropertyStatus = "available" | "sold" | "reserved" | "pending" | "draft";
export type Visibility = "private" | "public";

export interface PropertyUnit {
  id: string;
  title: string;
  reference: string;
  projectId?: string;
  project: string;
  city: string;
  type: string;
  image?: string;
  coverImageUrl?: string;
  status: PropertyStatus;
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
