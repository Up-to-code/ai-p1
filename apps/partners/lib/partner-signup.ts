export const PARTNER_SIGNUP_MIN_PASSWORD_LENGTH = 12;

export const PARTNER_COUNTRY_OPTIONS = [
  { code: "SA", label: "Saudi Arabia" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "QA", label: "Qatar" },
  { code: "KW", label: "Kuwait" },
  { code: "BH", label: "Bahrain" },
  { code: "OM", label: "Oman" },
] as const;

export type PartnerSignupInput = {
  name: unknown;
  email: unknown;
  password: unknown;
  confirmPassword: unknown;
  organizationName: unknown;
  countryCode: unknown;
};

export type PartnerSignupValue = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  countryCode: string;
};

export type PartnerOrganizationInput = {
  name: unknown;
  countryCode: unknown;
};

export type PartnerOrganizationValue = {
  name: string;
  type: "programmer";
  countryCode: string;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return readString(value).toLowerCase();
}

function normalizeCountryCode(value: unknown) {
  return readString(value).toUpperCase() || "SA";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

export function sanitizeReturnTo(value?: string | null) {
  if (
    !value
    || !value.startsWith("/")
    || value.startsWith("//")
    || value.startsWith("/signin")
    || value.startsWith("/signup")
  ) {
    return "/dashboard";
  }
  return value;
}

export function validatePartnerOrganizationInput(input: PartnerOrganizationInput): ValidationResult<PartnerOrganizationValue> {
  const name = readString(input.name).replace(/\s+/gu, " ");
  const countryCode = normalizeCountryCode(input.countryCode);

  if (name.length < 2) {
    return { ok: false, message: "Programmer organization name must be at least 2 characters." };
  }

  return {
    ok: true,
    value: {
      name,
      type: "programmer",
      countryCode,
    },
  };
}

export function validatePartnerSignupInput(input: PartnerSignupInput): ValidationResult<PartnerSignupValue> {
  const name = readString(input.name).replace(/\s+/gu, " ");
  const email = normalizeEmail(input.email);
  const password = typeof input.password === "string" ? input.password : "";
  const confirmPassword = typeof input.confirmPassword === "string" ? input.confirmPassword : "";

  if (name.length < 2) {
    return { ok: false, message: "Your name must be at least 2 characters." };
  }
  if (!isEmail(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  if (password.length < PARTNER_SIGNUP_MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${PARTNER_SIGNUP_MIN_PASSWORD_LENGTH} characters.` };
  }
  if (password !== confirmPassword) {
    return { ok: false, message: "Passwords do not match." };
  }

  const organization = validatePartnerOrganizationInput({
    name: input.organizationName,
    countryCode: input.countryCode,
  });
  if (!organization.ok) {
    return organization;
  }

  return {
    ok: true,
    value: {
      name,
      email,
      password,
      organizationName: organization.value.name,
      countryCode: organization.value.countryCode,
    },
  };
}
