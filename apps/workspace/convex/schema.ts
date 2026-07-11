import { defineSchema } from "convex/server";
import { organizationTables } from "./schema/organization";
import { billingTables } from "./schema/billing";
import { partnerTables } from "./schema/partner";
import { userTables } from "./schema/users";
import { domainTables } from "./schema/domains";
import { customFieldTables } from "./schema/custom_fields";
import { mediaTables } from "./schema/media";
import { docsTables } from "./schema/docs";
import { maintenanceTables } from "./schema/maintenance";
import { theoriesTables } from "./schema/theories";
import { viewTables } from "./schema/views";
import { automationTables } from "./schema/automations";

// App tables are organization-scoped so user identity never owns business data directly.
export default defineSchema({
  ...organizationTables,
  ...billingTables,
  ...partnerTables,
  ...userTables,
  ...domainTables,
  ...customFieldTables,
  ...mediaTables,
  ...docsTables,
  ...theoriesTables,
  ...maintenanceTables,
  ...viewTables,
  ...automationTables,
});
