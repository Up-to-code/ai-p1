export type PropertyStatus = "available" | "sold" | "reserved" | "pending" | "draft";

export interface PropertyUnit {
  id: string;
  title: string;
  reference: string;
  project: string;
  city: string;
  type: string;
  image: string;
  status: PropertyStatus;
  purpose: "sale" | "rent";
  price: string;
  area: string;
  bedrooms: number | string;
  bathrooms: number;
  updated: string;
  description: string;
}
