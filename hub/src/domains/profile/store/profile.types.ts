export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  role: string;
  language: "en" | "ar";
  timezone: string;
  notifications: {
    product: boolean;
    approvals: boolean;
    billing: boolean;
    security: boolean;
  };
}
