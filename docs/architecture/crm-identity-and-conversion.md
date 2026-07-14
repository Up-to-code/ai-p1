# CRM Identity and Lead Conversion

## Domain ownership

- `crmLeads` owns pre-client demand and qualification state.
- `crmCompanies` owns reusable organization identity and may reference one
  canonical Client account.
- `crmContacts` owns people related to a Company and/or canonical Client.
- `clients` remains the authoritative customer/account record.
- `deals` remains the authoritative commercial opportunity record.

Lead conversion never creates alternate Client or Deal implementations. The
CRM conversion command calls the existing Client lifecycle and Deal creation
Interfaces inside one Convex transaction.

## Conversion command

`convertLead` requires a qualified Lead and is idempotent for that Lead:

1. Re-evaluate Client and Deal creation permission.
2. Resolve an existing Company by normalized Organization-scoped name.
3. Resolve an existing Contact by an Organization-scoped HMAC email lookup key.
4. Reuse the Contact/Company Client when one exists; otherwise call the
   canonical Client lifecycle, including encrypted PII and webhook effects.
5. Upsert the Company and Contact relations.
6. Call the canonical Deal creation Interface.
7. Store the resulting Client and Deal IDs on the Lead and mark it converted.

A converted Lead cannot be moved back to an earlier status. Repeating the
conversion returns its durable IDs instead of creating duplicates.

## PII boundary

Raw Lead and Contact email/phone values are encrypted with the Organization
data key. Read models retain only the existing encrypted placeholder.
Deterministic lookup uses HMAC-SHA-256 with the same server-only secret plus
Organization and purpose domain separation; an email cannot be correlated
between Organizations. Search projections exclude email and phone and are
classified `restricted`, so external indexing remains off unless Search Policy
explicitly permits restricted CRM identity records.

## Routes and search

- `/crm/leads` creates, qualifies, and converts Leads.
- `/crm/companies` manages organization identities.
- `/crm/contacts` manages people and Company relations.

Lead, Company, and Contact mutations write versioned Search Projections in the
same transaction. Search hydration rechecks current Deal or Client capability
before returning a live title or route.
