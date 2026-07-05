import type { DocVisibility, DocFormValues } from "./docs.types";

export const DEFAULT_DOC_FORM_VALUES: DocFormValues = {
  title: "",
  content: "",
  folderId: "",
  projectId: "",
  visibility: "team",
  tags: "",
  customFields: [],
};

export const emptyDoc: typeof DEFAULT_DOC_FORM_VALUES = {
  ...DEFAULT_DOC_FORM_VALUES,
  title: "Untitled document",
};

export const DEFAULT_DOC_FOLDER_FORM_VALUES = {
  name: "",
  parentId: "",
  projectId: "",
};

export const ownershipFilters = ["all", "createdByMe"] as const;
export type OwnershipFilter = (typeof ownershipFilters)[number];

export type DocViewMode = "list" | "grid";

export const DOC_TEMPLATE_TYPES = [
  { id: "blank", label: "Blank Document", icon: "FileText" },
  { id: "sdd", label: "Software Design Document", icon: "FileCode" },
  { id: "api", label: "API Documentation", icon: "Globe" },
  { id: "guide", label: "User / Feature Guide", icon: "BookOpen" },
  { id: "adr", label: "Architecture Decision Record", icon: "GitBranch" },
  { id: "plan", label: "Project Plan", icon: "ClipboardList" },
] as const;

export const DOC_TEMPLATE_CONTENT: Record<string, string> = {
  sdd: `# Software Design Document

## Overview
**Purpose:** ...
**Audience:** ...
**Scope:** ...

## Background
...

## Requirements
### Functional Requirements
- ...

### Non-Functional Requirements
- ...

## Design
### Architecture
\`\`\`mermaid
graph TD
  A[Component] --> B[Component]
\`\`\`

### Data Model
...

### API Design
...

## Alternatives Considered
...

## Risks & Mitigations
...

## Changelog
| Date | Author | Change |
|------|--------|--------|
|      |        |        |
`,
  api: `# API Documentation

## Endpoint
**Method:** GET/POST/...
**Path:** \`/api/...\`

## Description
...

## Authentication
...

## Request
### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
|      |      |          |             |

### Body
\`\`\`json
{}
\`\`\`

## Response
### Success (200)
\`\`\`json
{}
\`\`\`

### Errors
| Status | Description |
|--------|-------------|
| 400    |             |
| 401    |             |

## Examples
...
`,
  guide: `# User / Feature Guide

## Introduction
...

## Prerequisites
...

## Step-by-Step
### Step 1: ...
...

### Step 2: ...
...

## Tips
...

## Troubleshooting
...
`,
  adr: `# ADR-{NUMBER}: {TITLE}

## Status
**Status:** Proposed / Accepted / Deprecated / Superseded

## Context
...

## Decision
...

## Consequences
### Positive
- ...

### Negative
- ...

### Risks
- ...
`,
  plan: `# Project Plan

## Objective
...

## Timeline
| Phase | Start | End | Status |
|-------|-------|-----|--------|
|       |       |     |        |

## Milestones
- [ ] ...

## Resources
...

## Risks
...
`,
};
