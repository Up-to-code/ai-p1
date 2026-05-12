# Agents Backend Domain

Owns the organization-agent Hono surface, orchestration policy, OpenRouter model calls, and shared agent tool catalog.

The domain does not own raw organization settings mutations. Dangerous organization settings remain blocked by policy even when the caller is an owner.
