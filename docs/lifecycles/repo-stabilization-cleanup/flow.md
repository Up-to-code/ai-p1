# Flow

## Cleanup Flow

1. Inventory dirty files and classify each change.
2. Remove local/generated churn first.
3. Normalize package manifests and regenerate lockfile.
4. Clean shallow Modules and duplicate Adapters only where tests cover the Interface.
5. Preserve source-of-truth decisions from ADRs.
6. Run focused tests per bucket, then final typecheck and `git diff --check`.

```mermaid
flowchart TD
  A["Dirty tree"] --> B["Classify changes"]
  B --> C["Remove local/generated churn"]
  B --> D["Clean dependencies"]
  B --> E["Prune dead compatibility"]
  B --> F["Tighten deep Modules"]
  C --> G["Focused tests"]
  D --> G
  E --> G
  F --> G
  G --> H["Final typecheck and diff check"]
```
