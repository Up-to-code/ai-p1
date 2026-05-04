# Integration Specification

## Purpose

This specification defines how external CRMs, mobile apps, developer systems, partner platforms, and the separate `partners/` project connect to the hub.

The integration layer exists for controlled property data movement:

- external system submits data to hub;
- hub normalizes and reviews it;
- approved data becomes authoritative;
- visibility engine decides what can be distributed;
- connected platforms receive scoped events or pull scoped feeds.

## Relationship to `partners/`

`partners/` owns:

- developer account signup;
- partner organizations;
- app registration;
- client IDs and allowed scopes;
- partner app review;
- developer documentation;
- partner lifecycle events.

`hub/` owns:

- publishers;
- property submissions;
- property approvals;
- compliance;
- visibility;
- distribution.

Boundary rule:

- Use versioned JSON contracts.
- Do not import generated Convex APIs across projects.
- Treat app registration sync as integration data, not direct database sharing.

## Authentication

Supported modes:

- OAuth client credentials for production server-to-server integrations.
- Scoped API keys for controlled integrations and early partners.
- Signed webhooks for outbound hub events.

Required inbound headers:

```http
Authorization: Bearer <access_token_or_api_key>
Content-Type: application/json
Idempotency-Key: subm_01J...
X-Anan-Source: crm
```

Optional inbound headers:

```http
X-Anan-Request-Id: req_client_generated
X-Anan-Webhook-Replay: false
```

## Scopes

Example scopes:

- `submissions:create`
- `submissions:read`
- `properties:read:visible`
- `properties:read:own`
- `properties:update:own`
- `visibility:read`
- `webhooks:receive`
- `distribution:read`
- `evidence:upload`
- `sandbox:validate`

No token receives sensitive document access by default.

## Submission Endpoint

```http
POST /api/v1/submissions
```

### Payload

```json
{
  "sourceSystem": "riyadh-crm",
  "sourceRecordId": "CRM-100284",
  "transactionIntent": "sale",
  "property": {
    "category": "residential",
    "subtype": "villa",
    "title": "Villa in Riyadh",
    "description": "Publisher-provided marketing description.",
    "location": {
      "countryCode": "SA",
      "region": "Riyadh Region",
      "city": "Riyadh",
      "district": "Al Narjis",
      "neighborhood": "Al Narjis",
      "latitude": 24.8461,
      "longitude": 46.6701,
      "nationalAddress": {
        "buildingNumber": "1234",
        "streetName": "King Salman Road",
        "district": "Al Narjis",
        "city": "Riyadh",
        "postalCode": "13327",
        "additionalNumber": "5678"
      }
    },
    "registry": {
      "rerPropertyNumber": "RER-12345",
      "realEstateSheetNumber": "SHEET-12345",
      "titleDeedNumber": "TD-123456",
      "titleDeedDate": "1446-08-20",
      "titleDeedSource": "Ministry of Justice",
      "planNumber": "PLAN-22",
      "plotNumber": "144",
      "blockNumber": "B2"
    },
    "areas": {
      "landSqm": 400,
      "builtUpSqm": 320
    },
    "features": {
      "bedrooms": 5,
      "bathrooms": 6,
      "parkingSpaces": 2
    },
    "pricing": {
      "amount": 2500000,
      "currency": "SAR"
    },
    "compliance": {
      "regaLicenseNumber": "REGA-123",
      "advertisingLicenseNumber": "AD-123",
      "nonSaudiOwnershipZoneCode": "RUH-ZONE-A",
      "nonSaudiOwnershipAllowed": true
    }
  },
  "evidence": [
    {
      "type": "title_deed",
      "url": "https://publisher.example/files/title-deed.pdf",
      "checksumSha256": "replace-with-checksum"
    },
    {
      "type": "advertising_license",
      "url": "https://publisher.example/files/ad-license.pdf",
      "checksumSha256": "replace-with-checksum"
    }
  ]
}
```

### Response

```json
{
  "submissionId": "sub_01J123",
  "status": "pending_review",
  "canonicalPropertyId": null,
  "complianceScore": 82,
  "blockingIssues": [],
  "warnings": [
    {
      "code": "RER_VERIFICATION_PENDING",
      "field": "property.registry.rerPropertyNumber",
      "message": "RER reference accepted but not yet verified by official integration."
    }
  ],
  "requestId": "req_01J123"
}
```

## Status Update Endpoint

```http
POST /api/v1/properties/{propertyId}/status
```

Use for sold, leased, withdrawn, off-market, expired, or corrected source status changes. These events recompute visibility immediately.

```json
{
  "sourceSystem": "riyadh-crm",
  "sourceRecordId": "CRM-100284",
  "status": "sold",
  "occurredAt": "2026-05-04T10:00:00.000Z",
  "reason": "Sale completed in source CRM"
}
```

## Sandbox Validation Endpoint

```http
POST /api/v1/sandbox/validate-property
```

Purpose:

- validate payload shape;
- show normalized output;
- show likely compliance issues;
- show duplicate matching hints;
- do not create a real submission.

## Webhook Events

Outbound events:

- `property.created`
- `property.updated`
- `property.visible`
- `property.hidden`
- `property.withdrawn`
- `property.deleted_from_feed`
- `submission.needs_evidence`
- `submission.rejected`
- `distribution.test`

### Webhook Headers

```http
X-Anan-Event-Id: evt_01J...
X-Anan-Event-Type: property.hidden
X-Anan-Timestamp: 2026-05-04T10:00:00.000Z
X-Anan-Signature: sha256=<hmac>
```

### Event Payload

```json
{
  "eventId": "evt_01J123",
  "eventType": "property.hidden",
  "occurredAt": "2026-05-04T10:00:00.000Z",
  "propertyId": "prop_01J123",
  "publisherId": "pub_01J123",
  "version": 4,
  "visibility": {
    "state": "hidden",
    "reasons": ["leased_ejar"]
  },
  "data": {
    "canonicalReference": "SA-RUH-000001",
    "lifecycleStatus": "leased"
  }
}
```

## Retry Policy

- Attempt 1 immediately.
- Attempt 2 after 1 minute.
- Attempt 3 after 5 minutes.
- Attempt 4 after 15 minutes.
- Attempt 5 after 1 hour.
- Move to dead letter after max attempts.

Connected platforms must handle duplicate events idempotently using `eventId`.

## Error Format

```json
{
  "error": {
    "code": "invalid_payload",
    "message": "The submitted property payload failed validation.",
    "requestId": "req_01J123",
    "details": {
      "field": "property.location.city",
      "reason": "City is required for Saudi property submissions."
    }
  }
}
```

Common errors:

- `unauthorized`
- `forbidden_scope`
- `publisher_suspended`
- `platform_suspended`
- `invalid_payload`
- `idempotency_conflict`
- `rate_limited`
- `unsupported_property_category`
- `evidence_required`
- `duplicate_possible`
- `internal_error`

## CRM Example

1. CRM sends villa payload with source record ID.
2. Hub accepts submission and returns `pending_review`.
3. Reviewer approves.
4. Hub creates canonical property.
5. Visibility engine marks property visible.
6. Hub sends `property.created` to connected portals.
7. CRM later marks property sold.
8. Hub receives sold update.
9. Visibility engine marks hidden with reason `sold`.
10. Hub sends `property.hidden` to every platform that previously received it.

## Mobile App Example

1. Mobile app submits unit media and corrected price.
2. Hub validates source scope.
3. Price update enters review if material.
4. Reviewer approves update.
5. Property version increments.
6. Hub sends `property.updated` only to platforms allowed to receive pricing.

