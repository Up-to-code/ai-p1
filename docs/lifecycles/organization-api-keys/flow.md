# Flow

1. User creates or rotates an organization API key.
2. Workspace returns the one-time bearer secret.
3. UI shows the secret once, the external API base URL, and a starter request.
4. External server stores the secret and calls Qentrah resource endpoints with `Authorization: Bearer <key>`.
5. Workspace validates the key, organization scope, quota, and resource/action permission before reading or writing data.

## API Base

`/api/v1/partner/organizations/:organizationId`

Example health/context endpoint:

`GET /api/v1/partner/organizations/:organizationId/me`
