export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Manager" | "Editor" | "Viewer";
  status: "Active" | "Invited";
}

export interface ApiKey {
  id: string;
  name: string;
  token: string;
  created: string;
  scopes: string[];
}

export interface OrganizationProfile {
  name: string;
  legalName: string;
  type: string;
  email: string;
  phone: string;
  website: string;
  address: string;
}
