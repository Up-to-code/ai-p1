type PartnerProfileView = {
  id: string;
  authSubject: string;
  name: string | null;
  email: string | null;
  createdAt: number;
  updatedAt: number;
};

type ProgrammerOrganizationView = {
  id: string;
  ownerAuthSubject: string;
  tenantOrganizationId: string | null;
  name: string;
  type: "programmer";
  countryCode: string;
  createdAt: number;
  updatedAt: number;
};

type PartnerIdentityView = {
  subject: string;
  name?: string;
  email?: string;
};

export type PartnerAccountView = {
  identity: PartnerIdentityView;
  profile: PartnerProfileView | null;
  organization: ProgrammerOrganizationView | null;
};

export type GeneratedAvatar = {
  initials: string;
  className: string;
};
