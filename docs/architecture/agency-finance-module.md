# Agency Finance and Bookkeeping Module

## Boundary

Agency Finance is separate from `convex/billing`, which owns Qentrah's own
subscription, seats, and AI-credit commerce. The Finance Module owns agency
Estimates, Budgets, Expenses, Invoices, Payments, Retainers, Vendors, bank
reconciliation, tax configuration, accounting periods, journal entries, and
ledger lines.

The public command Interface is `convex/finance/commands.ts`. React calls it
through Convex; integrations use the thin Hono Adapter under
`src/server/domains/finance`. Both paths execute the same authenticated Convex
commands and the same `finance` permission resource. Members receive no Finance
capability by default; owners/admins and explicitly configured custom roles do.

## Accounting invariants

- Transaction amounts and Organization-base amounts are stored as safe integer
  minor units. `exchangeRateMicros` stores base/transaction conversion at
  millionth precision.
- Every posted Journal balances in transaction and base currency. Ledger lines
  are append-only; corrections use `reverseJournal` in an open period.
- The Organization base currency cannot change after the first Journal.
- Posting requires a non-overlapping open Accounting Period. Closed dates are
  locked and reject later mutations.
- An Invoice posts Accounts Receivable against service Revenue and Tax Payable.
- An Expense posts net expense and recoverable input tax against Accounts
  Payable. Paying it clears AP against Cash and recognizes realized FX variance.
- Inbound invoice Payments clear AR against Cash and recognize realized FX
  variance. Cash-basis reporting is derived from recorded payment events; the
  ledger remains the accrual authority.
- Retainer receipts credit a liability. Applying a Retainer debits that
  liability and credits an already-posted Invoice's receivable.
- Project journal dimensions inherit the Project's current primary Space at
  posting time. Ledger lines retain Client, Engagement, Project, Space, and
  service dimensions for auditable profitability.

## Tax and multi-currency

Tax Rules are effective-dated, jurisdiction-scoped, inclusive or exclusive, and
may represent an exemption. Sales tax credits Tax Payable; purchase tax debits
Recoverable Tax. Tax and currency rounding are deterministic and covered by
focused tests. More complex jurisdiction filing adapters consume these records;
they do not rewrite source transactions.

## Delivery and resourcing seams

Delivery owns `deliveryTimeEntries`: users record and submit time, and a current
Engagement/Project manager approves it. Finance's
`createInvoiceFromTime` accepts only approved, billable entries with a live
Resource Planning Rate Card entry. It prices minutes from the hourly bill rate,
creates one Invoice, and marks every selected entry invoiced in the same Convex
transaction. Finance references Resource Planning Rate Cards rather than
creating a second rate model.

Budgets and Ledger dimensions reference Organization, Space, Project,
Engagement, or Client scope. `finance.read.profitability` derives revenue,
expense, profit, and margin from posted Ledger lines for those scopes.

## Search and navigation

Invoices, Expenses, and Payments write confidential Search Projections. Search
Policy must explicitly allow confidential external indexing; every candidate is
rehydrated from Convex and reauthorized through the Finance capability before a
title or amount reaches the client.

`/finance` implements the canonical Finance tree with semantic `view` params.
The Rate Cards node links to the Resource Planning owner. The route is absent
from the authorized navigation projection for users without Finance read access.
