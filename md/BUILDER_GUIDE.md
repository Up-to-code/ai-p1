# Qentrah: Builder Implementation Guide

> **Status**: Ready to Code  
> **Audience**: Ahmed (Solo Founder)  
> **Last Updated**: June 2026

---

## Quick Start Overview

You have **two comprehensive documents** ready:

1. **PRODUCT_SPEC.md** — Detailed UX, components, flows, layouts
2. **PRODUCT_STRATEGY.md** — Market positioning, competitors, pricing, roadmap

This guide summarizes the critical path and answers: "What do I build first, and in what order?"

---

## Your North Star (Keep This Close)

### Vision
**Qentrah is the AI-first Client Operations Platform** — the operating system for agencies. One workspace for **Clients → Opportunities → Projects → Tasks**. AI actively operates (create, assign, update, suggest) with human approval. Perfect profitability visibility.

### Tagline
"Stop juggling 5 tools. Qentrah is the operating system for your agency."

### Your Competitive Edge
1. **Agentic AI** (not chatbot) — actively operates your workspace
2. **Profitability Built-In** — track margin per project from day one
3. **Project Switcher Scoping** — entire experience adapts (Global vs. Project mode)
4. **Agency-First Design** — templates, language, and UI speak to your specific pain
5. **Radical Simplicity** — beautiful, fast, no bloat

### Your Target (Phase 1)
- **5–25 person agencies** in marketing, creative, web dev, consulting, recruitment
- Pain: Tool sprawl, lost client context, low profitability visibility, admin overhead
- Willing to pay: $15–25/seat/mo for the right solution

---

## Critical MVP Mechanics (Non-Negotiable)

### 1. Project Switcher + Scoping (THE Core Mechanic)
This is your differentiator. Get it right.

**What it does**:
- Top bar dropdown to switch between "Global Workspace" and specific projects
- When you select a project:
  - URL changes to `/workspace/[org]/project/[projectId]`
  - Sidebar labels update ("Tasks" → "Project Tasks", etc.)
  - Main content area re-queries data filtered to this project
  - Breadcrumb updates
  - AI context shifts to project-focused
- Zero page reloads, smooth 300ms transitions

**Why it matters**:
- No "project detail page with 8 tabs" (that's bloat)
- One mental model: "Select project in switcher, everything adapts"
- Agencies can deep-focus on one project or step back for org-wide view
- **This alone is worth the price**

**Implementation**:
```typescript
// Context-based architecture
const ProjectContext = createContext();

// Global state: selectedProjectId
// Any component reading from ProjectContext gets filtered data automatically
// When selectedProjectId changes, all subscribed components refetch

// Sidebar logic:
if (selectedProjectId) {
  // In project mode → show project-scoped items
  renderProjectNavigation(selectedProjectId);
} else {
  // In global mode → show all items
  renderGlobalNavigation();
}
```

### 2. Clients, Opportunities, Projects, Tasks (Core CRUD)
These four entities are your foundation. Get them CRUD-able first.

**Data Model**:
```
Organization
├─ User (with roles)
├─ Client
│  ├─ Contacts
│  ├─ Opportunities
│  └─ Projects
├─ Opportunity
│  └─ Links to Client
├─ Project
│  ├─ Links to Client
│  ├─ Links to Opportunity (if from conversion)
│  ├─ Tasks
│  ├─ Calendar Events
│  ├─ Team Assignments
│  └─ Budget (amount, spent, margin %)
└─ Task
   ├─ Links to Project
   ├─ Links to Assigned User
   ├─ Status (To Do, In Progress, In Review, Done)
   ├─ Priority (Low, Medium, High, Critical)
   └─ Due Date
```

**Schema** (PostgreSQL):
```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR,
  created_at TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  email VARCHAR UNIQUE,
  name VARCHAR,
  created_at TIMESTAMP
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  name VARCHAR,
  industry VARCHAR,
  website VARCHAR,
  status VARCHAR (active, paused, closed),
  created_at TIMESTAMP
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  client_id UUID REFERENCES clients,
  title VARCHAR,
  value DECIMAL,
  stage VARCHAR (prospecting, qualification, proposal, negotiation, won, lost),
  probability INT,
  expected_close_date DATE,
  owner_id UUID REFERENCES users,
  created_at TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  client_id UUID REFERENCES clients,
  opportunity_id UUID REFERENCES opportunities (nullable),
  name VARCHAR,
  description TEXT,
  status VARCHAR (active, on_hold, completed, archived),
  start_date DATE,
  due_date DATE,
  budget DECIMAL,
  budget_spent DECIMAL,
  billing_type VARCHAR (hourly, fixed_fee, retainer),
  created_at TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  project_id UUID REFERENCES projects,
  title VARCHAR,
  description TEXT,
  status VARCHAR (to_do, in_progress, in_review, done),
  priority VARCHAR (low, medium, high, critical),
  assigned_to_id UUID REFERENCES users (nullable),
  due_date DATE,
  created_at TIMESTAMP
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  project_id UUID REFERENCES projects (nullable),
  title VARCHAR,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  event_type VARCHAR (deadline, milestone, meeting, deliverable),
  created_at TIMESTAMP
);

-- Project Templates
CREATE TABLE project_templates (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations,
  name VARCHAR (Website Build, Marketing Campaign, etc.),
  default_tasks JSONB,
  default_milestones JSONB,
  created_at TIMESTAMP
);
```

### 3. Dashboard (The Home)
Users land here. Show them:
- 4 metric cards (Active Clients, Open Opportunities, Active Projects, Overdue Tasks)
- Recent clients, projects, upcoming events
- AI chat hero (prefilled with suggestion chips)
- AI next-actions panel (AI-generated suggestions)

**Layout Priority**:
1. Metric cards (quick glance)
2. AI chat hero (prominent, inviting)
3. Recent activity (what changed?)
4. Upcoming events (what's due?)

---

## 8-Week Sprint Plan

### Week 1-2: Foundation

**Goals**:
- Auth working (can log in)
- Navigation structure (top bar, sidebar, routing)
- Database schema deployed
- Project Switcher component (visual + interaction)

**To Build**:
- User authentication (Clerk or Auth0)
- Database setup (PostgreSQL + Prisma)
- Next.js or React app structure
- Top bar component (logo, switcher, search, settings, user)
- Sidebar component (global navigation)
- Project Switcher dropdown
- Route structure:
  - `/workspace/[org]` — Global mode
  - `/workspace/[org]/project/[projectId]` — Project mode
  - `/workspace/[org]/clients` — Clients page
  - `/workspace/[org]/opportunities` — Opportunities
  - `/workspace/[org]/projects` — Projects
  - `/workspace/[org]/tasks` — Tasks
  - `/workspace/[org]/calendar` — Calendar

**Checklist**:
- [ ] Auth flow working
- [ ] Database migrations running
- [ ] Project Switcher component renders (no data yet)
- [ ] Sidebar updates when switching projects
- [ ] URL updates correctly
- [ ] Logged-in user sees empty dashboard

**Estimated Time**: 40–60 hours

---

### Week 3: Clients

**Goals**:
- Full Clients CRUD
- List view with filters, search
- Detail view with contacts tab
- Create/Edit/Delete flows

**To Build**:
- Clients list page
  - Grid or list view (grid first, list second)
  - Filters: by status, industry, profitability
  - Search box (full-text on name, contact, tags)
  - Cards showing: logo, name, # projects, primary contact, AI snippet

- Client detail page
  - Tabs: Overview, Opportunities, Projects, Contacts, Activity, Files
  - Overview: summary, contacts list, recent projects, custom fields
  - [Edit] modal, [New Project] button, [New Opportunity] button

- Create Client modal
  - Fields: name, industry, website, logo upload, primary contact (name, email, phone)
  - Validation (name + industry required)
  - Success: client created, added to list

- API endpoints:
  - `GET /api/clients` (with filters, search, pagination)
  - `GET /api/clients/[id]` (detail)
  - `POST /api/clients` (create)
  - `PUT /api/clients/[id]` (update)
  - `DELETE /api/clients/[id]` (delete)

**Checklist**:
- [ ] Clients list page renders
- [ ] Filters and search working
- [ ] Client detail page working
- [ ] Create/Edit/Delete modals functional
- [ ] API endpoints responding
- [ ] Clients appear in Project Switcher client list (for later)

**Estimated Time**: 25–35 hours

---

### Week 4: Projects + Core Scoping

**Goals**:
- Full Projects CRUD
- Project Mode activation working
- Scope mechanic proven (sidebar + content update)
- Basic project templates

**To Build**:
- Projects list page
  - Grid view (project cards)
  - Filters: by status, client, team, risk
  - Sort: by due date, profitability, team, status
  - Cards: project name, client, status badge, budget health, due date, team avatars, progress bar, AI status
  - Click card → activate Project Mode (Project Switcher updates)

- Project detail page (in Project Mode)
  - Header: project name, status badge, [Actions] dropdown
  - Overview tab:
    - Hero section (AI summary: timeline, budget, team, risks)
    - Info cards (Budget, Timeline, Team, Health Dashboard)
    - Recent activity feed

- Create Project modal
  - Step 1: Basic info (name, client, description, status)
  - Step 2: Template (Website Build, Marketing Campaign, Generic)
  - Step 3: Timeline + Budget (start, due, budget, billing type)
  - Step 4: Team (assign team members, show availability)
  - Step 5: Review (summary, [Create Project])
  - Post-creation: success state, [View Project] (switches to Project Mode)

- Project Switcher integration
  - Clicking a project in switcher:
    - Updates URL to `/workspace/[org]/project/[projectId]`
    - Triggers ProjectContext change
    - Sidebar re-renders (items now project-scoped)
    - Main content area loads Project Overview
    - Breadcrumb updates: "Qentrah > [Client] > [Project]"

- Basic project templates (JSON)
  - Website Build: ~12 default tasks, 4-week timeline, 4 team roles
  - Marketing Campaign: ~10 default tasks, 2-week timeline, 3 team roles
  - Generic: empty, user adds tasks

- API endpoints:
  - `GET /api/projects` (with filters, search, pagination)
  - `GET /api/projects/[id]` (detail)
  - `POST /api/projects` (create, optionally populate from template)
  - `PUT /api/projects/[id]` (update)
  - `DELETE /api/projects/[id]` (delete/archive)
  - `GET /api/templates` (list templates)

**Checklist**:
- [ ] Projects list page renders
- [ ] Filters and sorting working
- [ ] Click project → Project Mode activates
- [ ] Sidebar updates in Project Mode
- [ ] URL updates correctly
- [ ] Breadcrumb shows project context
- [ ] Create Project modal functional
- [ ] Template selection working (tasks populate)
- [ ] Project Switcher shows recent projects + "All Projects"

**Estimated Time**: 35–50 hours

---

### Week 5: Tasks

**Goals**:
- Full Tasks CRUD (global + project-scoped)
- Kanban view (by status)
- Create/assign/complete workflows
- Task detail modal

**To Build**:
- Tasks list page
  - View options: Kanban (default), List, Timeline
  - Kanban view: columns by status (To Do, In Progress, In Review, Done)
  - Cards: title, project, assignee, due date, priority, AI note
  - Drag-to-update status
  - List view: table with columns (Name, Project, Assignee, Due, Priority, Status)
  - Filters: by status, priority, assignee, project, due date, tags
  - [+ New Task] button

- Task detail modal
  - Fields: title, description, status, priority, assignee, due date, project, tags
  - Subtasks (list of checkboxes)
  - Files (drag-drop)
  - Comments (threaded)
  - [Save], [Complete], [Delete] buttons
  - AI buttons (optional in MVP): [Break into subtasks], [Suggest assignee], [Estimate time]

- Create Task flow
  - Minimal modal: title, description, assignee, due date, priority, project, tags
  - Or inline quick-add in Kanban (+ button in column, text input, Enter to create)

- Project Mode scoping
  - When in Project Mode, Tasks automatically filter to that project
  - [+ New Task] creates task in current project
  - Kanban shows only this project's tasks

- API endpoints:
  - `GET /api/tasks` (with filters, project scoping)
  - `GET /api/tasks/[id]` (detail)
  - `POST /api/tasks` (create)
  - `PUT /api/tasks/[id]` (update, including status)
  - `DELETE /api/tasks/[id]` (delete)

**Checklist**:
- [ ] Tasks list page renders
- [ ] Kanban view working (drag-to-update status)
- [ ] List view rendering
- [ ] Filters and search working
- [ ] Task detail modal functional
- [ ] Create/Edit/Delete working
- [ ] In Project Mode: tasks automatically filtered
- [ ] [+ New Task] in Project Mode creates task in current project
- [ ] Assignee dropdown shows team members

**Estimated Time**: 30–40 hours

---

### Week 6: Opportunities + Calendar

**Goals**:
- Opportunities CRUD + pipeline (kanban)
- Convert Opportunity to Project flow
- Calendar (global + project-scoped)

**To Build**:
- Opportunities page
  - Kanban view (default): columns by stage (Prospecting, Qualification, Proposal, Negotiation, Won, Lost)
  - Cards: client name, deal title, value, probability, close date, owner avatar, AI confidence
  - Drag-to-update stage
  - Column headers show total value + count
  - List view (alternative): table with columns (Name, Client, Value, Stage, Probability, Close Date, Owner, AI Confidence)
  - Filters: by stage, value range, probability, client, owner
  - [+ New Opportunity] button

- Opportunity detail modal
  - Fields: title, client, description, value, stage, probability, close date, owner, key decision-makers, tags
  - [Convert to Project] button (triggers flow below)
  - [Edit], [Delete] buttons

- Convert Opportunity to Project flow
  - Modal: "Ready to create project from this opportunity?"
  - Pre-fill: project name = opp title, client = opp client, budget = opp value
  - Select template
  - [Create Project]
  - Background: project created, opp marked "Won", switch to Project Mode

- Calendar page
  - Month view (default), week, day
  - Events color-coded by type: 🔴 deadline, 🟡 milestone, 🟢 meeting, 🔵 deliverable
  - Click event → popover (title, time, project, team, notes)
  - Drag event → reschedule (updates date)
  - Sidebar: 7-day upcoming events list
  - [+ New Event] button
  - Project Mode: calendar shows only this project's events

- API endpoints:
  - `GET /api/opportunities` (with filters)
  - `GET /api/opportunities/[id]` (detail)
  - `POST /api/opportunities` (create)
  - `PUT /api/opportunities/[id]` (update, including stage)
  - `POST /api/opportunities/[id]/convert-to-project` (conversion flow)
  - `GET /api/calendar` (events, with project scoping)
  - `POST /api/calendar` (create event)

**Checklist**:
- [ ] Opportunities pipeline (kanban) rendering
- [ ] Drag-to-update stage working
- [ ] List view working
- [ ] Create/Edit/Delete opportunities working
- [ ] Convert to Project flow working (creates project, marks opp Won)
- [ ] Calendar month view rendering
- [ ] Calendar events showing (color-coded)
- [ ] Drag event → reschedule working
- [ ] In Project Mode: calendar filtered to project events
- [ ] [+ New Event] working

**Estimated Time**: 30–40 hours

---

### Week 7: Dashboard + Search

**Goals**:
- Dashboard with metric cards, recent activity, AI chat hero
- Super Search (full-text across all entities)
- Activity feeds

**To Build**:
- Dashboard page
  - Header: "Dashboard" + date range picker
  - Metric cards (4 cards in row):
    - Active Clients: "X | ↑ Y this month" (click → filter Clients list)
    - Open Opportunities: "$XK pipeline | Y deals | Z% avg probability"
    - Active Projects: "X projects | Y at risk | Avg margin Z%"
    - Overdue Tasks: "X items | Y critical | Across Z projects"
  - Recent Clients (3-card grid)
    - Card: logo, name, # projects, status, next event, AI snippet
    - Click → Client detail
  - Recent Projects (5-row table)
    - Columns: Name, Client, Status, Due, Budget Health, Team
    - Click → Project Mode
  - Calendar preview (7-day strip)
    - Day-by-day upcoming events
    - Click → full Calendar page
  - AI Chat Hero (large input field)
    - "Ask me anything about your business..."
    - Suggestion chips below (5–6 pre-filled queries)
    - On input, open full-width chat panel
    - (Chat responses can be mocked in MVP)
  - AI Next Actions Panel
    - AI-generated suggestions (mocked in MVP):
      - "Budget overrun alert: Project X 15% over"
      - "Team capacity: Person Y at 105% utilization"
      - "Client follow-up: Waiting on proposal for 3 days"
    - Each with [Approve] (creates task) and [Dismiss]

- Search page
  - Large search input at top
  - Full-text search across: Clients, Opportunities, Projects, Tasks, Files, Events
  - Results grouped by type
  - Each result clickable → navigate to detail page
  - Recent searches (saved, quick-access)
  - (Advanced AI search can be Phase 2)

- Activity feeds
  - Per-Client activity feed: all interactions, project changes, task updates
  - Per-Project activity feed: task updates, budget changes, team assignments
  - Chronological, filterable by type

- API endpoints:
  - `GET /api/dashboard/metrics` (returns card data)
  - `GET /api/search?q=...` (full-text search)
  - `GET /api/activity` (chronological feed, project/client scoped)

**Checklist**:
- [ ] Dashboard rendering with all sections
- [ ] Metric cards clickable (filter list pages)
- [ ] Date range picker updating cards
- [ ] Recent clients/projects/events showing
- [ ] AI chat hero showing (responses mocked)
- [ ] AI next actions panel showing (mocked)
- [ ] Search page functional
- [ ] Search results grouped by type
- [ ] Activity feeds showing (per client/project)

**Estimated Time**: 25–30 hours

---

### Week 8: Polish + Launch

**Goals**:
- Mobile responsiveness
- Error handling, loading states
- Performance optimization
- Deployment to production
- Beta invite system

**To Build**:
- Responsive design (mobile + tablet)
  - Top bar: hamburger menu on mobile
  - Sidebar: collapsible on tablet
  - Cards: responsive grid
  - Modals: full-screen on mobile

- Loading states & error handling
  - Skeleton loaders (while data loading)
  - Error messages (inline + toast notifications)
  - Retry buttons
  - 404 pages (client not found, etc.)

- Performance optimization
  - Code splitting (lazy load routes)
  - Image optimization
  - Database query optimization (indexes, pagination)
  - API response caching

- Onboarding flow
  - First-time user guide (5-step tour of core features)
  - Demo data option ("Load sample agency for 14 days")
  - [Skip] option

- Deployment
  - Deploy to Vercel (frontend)
  - Deploy to Railway or Fly.io (backend)
  - Set up PostgreSQL on Railway or Neon
  - Configure environment variables (API keys, database URLs)
  - DNS setup
  - SSL certificates (automatic with Vercel)

- Beta invite system
  - Landing page: "Join the Beta"
  - Email collection form
  - Unique sign-up links for beta users
  - Welcome email with login credentials
  - Onboarding tour for beta users

- Documentation
  - Quick start guide (5-step setup)
  - FAQ (common questions)
  - Keyboard shortcuts (Cmd+K opens search, etc.)
  - Help links in-app

**Checklist**:
- [ ] App is mobile-responsive
- [ ] Loading states showing on all pages
- [ ] Error handling in place (bad requests, 404s, etc.)
- [ ] Performance optimized (< 3s load time on 4G)
- [ ] Deployed to production (live URL)
- [ ] Beta invite system working
- [ ] Demo data loadable
- [ ] Onboarding tour functional
- [ ] Documentation written
- [ ] 10 beta users invited

**Estimated Time**: 30–40 hours

---

## Tech Stack (Recommended)

### Frontend
- **React 18** + TypeScript
- **Next.js 14** (app router, API routes)
- **Tailwind CSS** (styling)
- **Shadcn/ui** or **Headless UI** (components)
- **React Query** (data fetching, caching)
- **React Beautiful DND** (drag-drop for Kanban)

### Backend
- **Node.js 20** + Express (or Next.js API routes)
- **TypeScript**
- **PostgreSQL** (database)
- **Prisma ORM** (database client)
- **Zod** (validation)

### Authentication
- **Clerk** or **Auth0** (user management, SSO)

### Hosting
- **Vercel** (frontend)
- **Railway** or **Fly.io** (backend)
- **Neon** or **Railway** (PostgreSQL)

### AI (Phase 2+)
- **OpenAI GPT-4** or **Claude** (for chat, suggestions)
- **LangChain** (framework for AI chains)

### Monitoring
- **Sentry** (error tracking)
- **Vercel Analytics** (performance)

**Total Cost (MVP)**: ~$50–150/mo (dev), scales as you grow

---

## Critical Success Metrics (MVP)

Track these weekly:

1. **User Acquisition**: 10 beta users by end of week 8
2. **Activation**: 50%+ of users create a project in first week
3. **Engagement**: 3+ logins/week per user
4. **Feature Adoption**:
   - 80%+ use Tasks in-app (vs. external tools)
   - 50%+ create 5+ projects within 2 weeks
   - 30%+ view Dashboard daily
5. **NPS**: > 40 (qualitative: "How likely would you recommend this?")
6. **Retention**: 70%+ of users active after 30 days

---

## Feedback Loop (Critical)

**Biweekly Calls with Beta Users**:
- What's working? What's broken?
- What feature would make you use this daily?
- What's stopping you from inviting colleagues?
- Any bugs or confusion?

**Weekly Shipping**:
- Monday: Review feedback
- Tuesday–Thursday: Build improvements
- Friday: Deploy to production
- Show users what changed next Monday

---

## From MVP to Product-Market Fit

**What happens after MVP launch?**

1. **Week 1–2**: Ship based on beta feedback (bug fixes, clarifications)
2. **Week 3–4**: Add profitability dashboard (budget tracking + margin calculation)
3. **Week 5–6**: Add team workload management (capacity planning)
4. **Week 7–8**: Add advanced templates (Consulting Retainer, Recruitment Intake)
5. **Week 9–10**: Ship AI suggestions (break tasks into subtasks, assign people)

**By end of month 3**: 25–50 users, $2K–5K MRR, NPS > 50

**By end of month 6**: 50–100 users, $5K–10K MRR, product-market fit signals

---

## Your Checklist Before Week 1

- [ ] Database schema reviewed and approved
- [ ] Design mockups (Figma) for top 5 pages (Dashboard, Clients, Projects, Tasks, Opportunities)
- [ ] Tech stack finalized and dependencies installed
- [ ] GitHub repo created (private, for now)
- [ ] Vercel + Railway accounts set up
- [ ] Clerk auth configured
- [ ] Environment variables documented (.env.example)
- [ ] Development environment working locally (can run `npm run dev`)
- [ ] First commit pushed to GitHub
- [ ] Slack channel created for daily updates (optional but recommended)

---

## Key Reminders

1. **Ship > Perfect**: Done is better than perfect. Get feedback early.
2. **Project Switcher First**: This core mechanic makes or breaks the product. Test it thoroughly.
3. **Scope Creep = Death**: Stick to the MVP. No email integration, no mobile app, no API in week 1.
4. **Talk to Users Weekly**: Your beta users are your co-founders. Listen.
5. **Track Metrics**: What gets measured gets managed. Know your NPS, activation, retention.
6. **Sleep**: You're solo. Don't burn out. Pace yourself.

---

## You've Got This, Ahmed

You have:
- Clear product spec (PRODUCT_SPEC.md)
- Clear market positioning (PRODUCT_STRATEGY.md)
- Clear tech roadmap (this document)
- Clear weekly milestones
- Clear success metrics

You have everything you need. The rest is execution.

**Start Week 1 Monday. Ship something by Friday.**

Questions? Refer back to PRODUCT_SPEC.md or PRODUCT_STRATEGY.md.

---

**END OF BUILDER IMPLEMENTATION GUIDE**
