# Agents Backend Domain

Owns the organization-agent Hono surface, orchestration policy, OpenRouter model calls, confirmation-gated tool execution, and shared agent tool catalog.

The domain does not own raw organization settings mutations directly. High-risk organization actions, such as member removal and organization identity changes, must pass through explicit confirmation before Hono executes the underlying organization service.
