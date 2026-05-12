# MCP / Resources

## Purpose
Reserved MCP protocol boundary for future resources handling.

## What Belongs Here
- Protocol contracts
- Future transport/resource/tool/session schema placeholders
- Authorization notes for protocol access

## What Must Not Live Here
- Live MCP tool execution
- Network transports
- Secrets
- Direct domain data access without auth guards

## Public Export Expectations
Future MCP exports must be protocol-level contracts only. Domain work must be delegated to public domain services after authorization.

## Agent And Programmer Rules
- Every future MCP action must pass session and permission checks.
- Tools must not bypass Hono auth policies.
- Keep protocol schemas separate from business validation.

## Future Implementation Notes
Add transport adapters and tool/resource registries only after auth, audit, and permission contracts are in place.
