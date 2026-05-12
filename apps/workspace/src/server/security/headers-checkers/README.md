# Security / Headers Checkers

## Purpose
Security checker boundary for headers-checkers.

## What Belongs Here
- Checker contracts
- Future security policy files
- Vendor-neutral security decisions
- Documentation for how requests should be evaluated

## What Must Not Live Here
- Hard-coded origin or host allowlists
- Secrets
- Runtime enforcement before policy approval
- Domain business behavior

## Public Export Expectations
Expose policy and decision contracts only. Runtime enforcement must be mounted through middleware later.

## Agent And Programmer Rules
- Security checkers should be composable.
- Checkers should return typed allow/block/review decisions.
- Do not hide auth or permission logic here; use auth guards and policies for identity decisions.

## Future Implementation Notes
Use Hono middleware boundaries such as CORS and secure headers when implementation begins.
