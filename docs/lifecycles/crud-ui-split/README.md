# crud-ui.tsx Split

## Purpose
Split 929-line god file into 3 focused modules by concern.

## Owner
`apps/workspace/src/components/shared/crud-ui/`

## Modules
| File | Lines | Contents |
|------|-------|----------|
| `loading.tsx` | 446 | LoadingState, ProgressiveLoadingState, WorkspaceQueryState, HttpQueryState, ErrorState, ResourceLoadingSkeleton, TableLoadingSkeleton, QueryDebugDetails |
| `forms.tsx` | 300 | FormErrorSummary, DetailNotFoundState, DeleteRecordDialog, TextInput, FormActions, SelectField, SegmentedControl, FormField (internal) |
| `status.tsx` | 81 | StatusPill, SearchBox, EmptyWorkspace |
| `index.ts` | 17 | Re-exports all public components for backward compatibility |

## Consumer Impact
Zero. All 11 consumer files import from `@/components/shared/crud-ui` which resolves to the directory's `index.ts`.
