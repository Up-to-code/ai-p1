# Qentrah ChatGPT Plugin Submission

## Submission type

- Type: With MCP (app-only, no bundled skill)
- Production MCP URL: `https://mcp.qentrah.com/mcp`
- Authentication: OAuth 2.1 authorization code with PKCE
- Challenge base URL: `https://mcp.qentrah.com`
- Publisher: Qentrah

## Public listing

- Name: Qentrah
- Short description: Plan projects, manage clients, and keep agency work moving from ChatGPT.
- Category: Productivity
- Website: `https://qentrah.com`
- Support: `mailto:hello@qentrah.com`
- Privacy: `https://qentrah.com/en/privacy`
- Terms: `https://qentrah.com/en/terms`
- Logo: `apps/marketing/public/app-icon-1024.png`

### Long description

Qentrah connects ChatGPT to an authorized Qentrah workspace so teams can inspect and manage their daily work without copying data between tools. Review projects, tasks, clients, deals, spaces, calendar events, and attached documents; create or update work when requested; and keep every action inside the organization, scope, and permissions approved by the signed-in user.

The connection uses browser-based OAuth. Qentrah shows the exact resource permissions before approval, supports time-limited grants, and lets users revoke access. Read, write, and destructive operations are represented as separate permissions. The plugin never places credentials in the MCP URL.

## Starter prompts

1. Summarize my active projects and flag anything overdue or blocked.
2. Show today’s tasks and calendar events, grouped by project.
3. Create a project plan for the selected client and add the first five tasks.
4. Review open deals and identify which clients need a follow-up this week.
5. Update the selected task with this progress note and mark it complete.
6. List the documents attached to this project and explain what is missing.

## Reviewer setup

1. Connect to `https://mcp.qentrah.com/mcp`.
2. Complete OAuth in the browser with the reviewer account supplied in the portal.
3. Select the review organization.
4. Approve organization-wide access for 30 days with read, create, and update permissions. Leave delete disabled for the normal test pass.
5. Call `tools_allowed` first to confirm the grant and expiry.

## Positive test cases

1. **Inspect authorization**: Call `tools_allowed`. Expect the selected organization ID, expiry, and only the tools allowed by the approved grant.
2. **List projects**: Ask for active projects. Expect `projects_list` to return only projects in the approved organization and scope.
3. **Read a task**: Choose a returned task and request details. Expect `tasks_get` to return that task without exposing credentials or unrelated organizations.
4. **Create and update a task**: Create a clearly named review task, then update its description. Expect both operations to succeed and the updated task to appear in Qentrah.
5. **Calendar workflow**: Create a review calendar event, list the relevant date range, then update the event time. Expect consistent event identifiers and values.

## Negative test cases

1. **No OAuth token**: Call the MCP endpoint without a bearer token. Expect HTTP 401 with protected-resource metadata in `WWW-Authenticate` and no private data.
2. **Permission denied**: With delete permission disabled, request deletion of the review task. Expect the delete tool to be unavailable or access to be denied without changing data.
3. **Cross-organization access**: Request a resource identifier from another organization. Expect a not-found or access-denied response with no resource details.

## Content security policy

The current app-only plugin has no ChatGPT-hosted custom UI and makes no browser-side network requests. If the portal requires explicit domains, use only:

- Connect: `https://mcp.qentrah.com`, `https://app.qentrah.com`
- Resource: `https://mcp.qentrah.com`, `https://app.qentrah.com`, `https://qentrah.com`

## Country availability

All countries supported by OpenAI and Qentrah, excluding jurisdictions where either service is unavailable or prohibited.

## Release notes

Initial public submission of Qentrah as an OAuth-protected MCP plugin. Includes organization-scoped project, task, client, deal, space, calendar, and document workflows; explicit read-only, open-world, and destructive tool annotations; scoped OAuth grants; rate limiting; and domain verification support.

## Submission checklist

- [ ] Publisher identity is verified in the OpenAI Platform organization.
- [ ] Submitter has Apps Management Write permission.
- [ ] Production deployment includes the portal-provided `OPENAI_APPS_CHALLENGE` value.
- [ ] Domain challenge returns the exact token as plain text.
- [ ] Tool scan reports no schema, annotation, or OAuth errors.
- [ ] Reviewer credentials are entered only in the private portal fields.
- [ ] Five positive and three negative cases pass in production.
- [ ] Listing, availability, policy attestations, and release notes are complete.
