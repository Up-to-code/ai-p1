export class OrganizationProfileUpdateError extends Error {
  constructor(message: string, readonly status: 403 | 500) {
    super(message);
    this.name = "OrganizationProfileUpdateError";
  }
}
