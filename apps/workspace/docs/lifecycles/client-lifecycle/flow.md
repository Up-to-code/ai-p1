# Flow

1. A transport validates the canonical create or patch contract.
2. Its adapter derives the authenticated actor and Organization scope.
3. Convex authorization checks the Client capability.
4. The lifecycle verifies the exact existing record for update/delete.
5. One Convex transaction persists the record, appends the Organization audit event, and schedules the outbound webhook.
6. Presentation removes encrypted and deletion fields and reveals permitted PII.

Eve sends patches directly. It does not read and mirror the persisted Client before an update.
