# Qentrah: Comprehensive Product Specification

> **Status**: Builder-Ready for Ahmed (Solo Founder)  
> **Last Updated**: June 2026  
> **Context**: AI-first Client Operations Platform for agencies/PSFs

---

## 1. Overall Vision & Modes

### Core Concept
Qentrah unifies **Clients → Opportunities → Projects → Tasks** in a single workspace. The AI Agent actively operates (create, assign, update, summarize) with human-in-the-loop. Users experience two distinct modes that share navigation but dramatically different contexts.

### Global Workspace Mode (Default)
- **Entry Point**: User logs in, no project selected
- **Scope**: Full agency/business view across all clients, opportunities, projects, tasks
- **Sidebar**: Navigation items show global content (All Clients, All Opportunities, All Projects, All Tasks, Calendar, Search)
- **Main Content**: Dashboard with AI chat, metrics, recent activity, upcoming work, suggestions
- **AI Context**: Understands entire business; makes organization-wide recommendations
- **Use Case**: Agency leaders reviewing business health, forecasting, strategy

### Project Mode (Dynamic Scope)
- **Activation**: User clicks a project in the Project Switcher (top bar)
- **Scope**: Entire experience narrows to **that single project**
- **Sidebar**: Navigation items automatically refocus (Tasks now shows project tasks only, Calendar shows project events, etc.)
- **Main Content**: Project-specific dashboards, details, activity
- **AI Context**: Focused on project; knows about client relationship, budget, team, deliverables
- **URL**: Updates to `/workspace/[org]/project/[projectId]` (automatically scopes sub-routes)
- **Use Case**: Team deep-work on delivery; staying focused on one engagement

### Mode Switching Mechanics
1. **Programmatic Scoping** (happens on project selection):
   - Data query filters update automatically
   - Sidebar labels refresh ("Tasks" → "Project Tasks", "Calendar" → "Project Events")
   - Breadcrumbs update: "Qentrah > [Client Name] > [Project Name]"
   - Context Provider broadcasts scope change to all subscribed components
   - URL and state update simultaneously
2. **No Page Reload**: Transition is smooth (300ms fade + content swap)
3. **Return to Global**: Click "Global Workspace" or home icon to deselect project
4. **Memory**: App remembers last-selected project per session (localStorage)

---

## 2. Navigation System

### Top Bar (Global, Always Visible)
```
[Qentrah Logo] [Project Switcher] [Search] [Notifications] [Settings] [User Avatar]
```

**Project Switcher Component**:
- **Default State (Global Mode)**:
  - Display: "Global Workspace"
  - Icon: Globe with checkmark
  - Dropdown on click shows:
    - "Global Workspace" (with checkmark if active)
    - "Recent Projects" (last 5, with client names in gray)
    - "All Projects" (link to Projects page)
    - "New Project" (quick create button)
- **Selected State (Project Mode)**:
  - Display: "Client Name > Project Name"
  - Icon: Project pin with checkmark
  - Dropdown shows all projects under that client
  - Quick project switch to siblings
- **Search in Switcher**: Type to filter projects by name or client
- **Interactions**:
  - Click project → scope changes, URL updates, sidebar refreshes
  - Hover → show project stats (status, due date, team)
  - Right-click → context menu (view details, edit, archive, delete)

### Sidebar (Responsive, Scope-Aware)
```
WORKSPACE NAVIGATION
─────────────────────
[Workspace Icon] Qentrah [Settings]

MAIN MENU
─ Dashboard
─ Clients
─ Opportunities (Sales Pipeline)
─ Projects
─ Tasks
─ Calendar
─ Search
─ Templates
─ Automations

CUSTOM SECTIONS (if applicable)
─ [Custom tags/views created by user]

BOTTOM
─ Help & Docs
─ Feedback
─ Logout
```

**When in Project Mode, Sidebar Updates**:
- "Dashboard" → "Project Overview" (links to project detail)
- "Tasks" → "Project Tasks" (only shows tasks in this project)
- "Calendar" → "Project Calendar" (only project events/milestones)
- "Clients" → "Client > [Name]" (breadcrumb, click to view client detail)
- Other items (Opportunities, Templates, Automations) remain global
- Breadcrumb at top: "Qentrah > Client > Project" with back links

### Breadcrumbs (Context Trail)
**Global Mode**: `Qentrah > [Current Page]` (e.g., `Qentrah > Projects`)  
**Project Mode**: `Qentrah > [Client Name] > [Project Name] > [Current Section]` (e.g., `Qentrah > Acme Corp > Website Redesign > Tasks`)
- Each part is clickable to navigate
- Clicking Qentrah returns to Global mode

---

## 3. Global Workspace Mode (Detailed Pages)

### 3.1 Dashboard (Home)

**Layout**:
```
┌─────────────────────────────────────────────┐
│  Dashboard                     [Date Range]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────┐  ┌────────────────┐  │
│  │  AI Chat Hero    │  │ Metric Cards   │  │
│  │  (Full width)    │  │ (Row of 4)     │  │
│  └──────────────────┘  └────────────────┘  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Quick Actions Bar                   │   │
│  │ [New Client] [New Opp] [New Proj]  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Recent       │  │ Opportunities    │   │
│  │ Clients      │  │ Snapshot (Chart) │   │
│  │ (3 cards)    │  │                  │   │
│  └──────────────┘  └──────────────────┘   │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Recent       │  │ Upcoming Events  │   │
│  │ Projects     │  │ (Next 7 days)    │   │
│  │ (5 rows)     │  │                  │   │
│  └──────────────┘  └──────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ AI Next Actions Panel               │   │
│  │ - [Suggestion 1] [Approve]          │   │
│  │ - [Suggestion 2] [Approve]          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Components**:

1. **AI Chat Hero**
   - Large text input: "Ask me anything about your business..."
   - Floating action buttons (chips) below input:
     - "What's my profitability this month?"
     - "Flag overdue tasks"
     - "Suggest next client actions"
     - "Summarize last 7 days"
   - On input, opens full-width chat panel (swipe down to minimize)

2. **Metric Cards (Row of 4)**
   - **Active Clients**: "24 | ↑ 2 this month" (clickable → Clients list)
   - **Open Opportunities**: "$150K | 8 deals" (clickable → Opportunities)
   - **Active Projects**: "12 | 2 at risk" (clickable → Projects)
   - **Overdue Tasks**: "3 | 1 critical" (clickable → Tasks filtered by overdue)

3. **Quick Actions Bar**
   - Prominent buttons with icons:
     - [+ Client] → opens Create Client modal
     - [+ Opportunity] → opens Create Opportunity modal
     - [+ Project] → opens Create Project modal

4. **Recent Clients (3 Card Grid)**
   - Card: [Client Logo] [Client Name] [# Projects] [Status]
   - Click → Client detail page
   - Right-click → context menu (new project, new opportunity, view all)

5. **Opportunities Snapshot (Pie/Bar Chart)**
   - Visual breakdown by stage (Prospecting, Qualification, Proposal, Negotiation, Won)
   - Hover → show count + total value
   - Click slice → filter to that stage

6. **Recent Projects (5-Row Table)**
   - Columns: Project Name | Client | Status | Due Date | Budget Health | Team
   - Row hover → expand to show AI summary + quick actions
   - Click row → open Project Mode

7. **Upcoming Events (7-Day Timeline)**
   - Card-based layout: [Day] [Event Type] [Title] [Project] [Team]
   - Color-coded by type (deadline, milestone, meeting, deliverable)
   - Click → open Calendar or navigate to context

8. **AI Next Actions Panel**
   - AI-generated list of suggested actions (based on project health, overdue items, client activity):
     - "Budget overrun on Acme website — consider scope adjustment"
     - "Follow up with Design Co on proposal — due in 2 days"
     - "Creative team at capacity — reassign 3 tasks to available staff"
   - Each with [Approve] button (creates task or automation)
   - Refresh button to re-generate suggestions

**Interactions**:
- Date range picker (top-right) filters all dashboard cards dynamically
- All cards refresh in real-time (WebSocket or 10-sec poll)
- Click-through on any metric → filtered list page (Tasks, Projects, etc.)

---

### 3.2 Clients Page (Global)

**Layout**:
```
┌────────────────────────────────────┐
│ Clients [Filter] [Sort] [New]      │
├────────────────────────────────────┤
│ [Search box with tags filter]      │
├────────────────────────────────────┤
│ ┌──────────────────────────────┐   │
│ │ Client 1 Card                │   │
│ │ [Logo] Name | Status | #Proj │   │
│ │ Contact | Next event | AI... │   │
│ └──────────────────────────────┘   │
│                                    │
│ [More cards in responsive grid]    │
└────────────────────────────────────┘
```

**Components**:
- **Header**: Title + [Filter button] + [Sort dropdown] + [+ New Client]
- **Filters**: By status (active, paused, closed), industry, profitability (profitable, break-even, loss)
- **Sort**: By name, last contact, profitability, # projects
- **Search**: Full-text search on client name, contact, tags
- **Client Card**:
  - Logo/avatar
  - Name + status badge (Active, Paused, Closed)
  - "X projects | Y opportunities"
  - Primary contact + email
  - Next event/milestone
  - AI summary: "2 active projects, $45K contracted, 85% on-time delivery"
  - Hover → [View] [Edit] [New Project] [New Opportunity]
  - Click card → Client detail page

---

### 3.3 Client Detail Page

**Tabs/Sections**:
- **Overview**
  - Basic info (name, logo, industry, location, website, tags)
  - Status badge + custom fields
  - Contact list (people at client org)
  - "Last 3 opportunities" mini-list
  - "Active projects" mini-list
  - AI summary + health score

- **Opportunities**
  - Pipeline view of all opportunities for this client (kanban)
  - Inline creation ("+ New Opportunity")

- **Projects**
  - All projects for this client (table + kanban view toggle)
  - [New Project] button

- **Contacts**
  - Table of decision-makers, contacts (role, email, phone, last contact)
  - [New Contact] button

- **Activity**
  - Chronological feed of all interactions, project changes, task updates
  - Filter by type (email, note, project update, task created, etc.)

- **Files**
  - Centralized file storage for client (contracts, briefs, assets, etc.)
  - Upload area + drag-drop
  - Organized by custom folders or auto-categorized

- **Custom Fields**
  - Additional fields defined in template (e.g., "Billing Model", "Retainer Amount", "Contract End Date")

**Actions**:
- [Edit] → Modal to update client info
- [Archive] → Soft-delete client (can restore)
- [+ New Project] → Opens Create Project modal (client pre-filled)
- [+ New Opportunity] → Opens Create Opportunity modal (client pre-filled)

---

### 3.4 Opportunities Page (Sales Pipeline)

**Layout (Kanban View - Default)**:
```
┌────────────────────────────────────────────┐
│ Opportunities [View: Kanban/List] [+ New]  │
├────────────────────────────────────────────┤
│ [Filter: Stage, Probability, Value, Client]│
├──────────┬──────────┬──────────┬──────────┤
│ Prosp.   │ Qualif.  │ Proposal │ Negot.   │ Won
│ $50K     │ $120K    │ $200K    │ $80K     │ $150K
├──────────┼──────────┼──────────┼──────────┤
│ [Card 1] │ [Card 2] │ [Card 3] │ [Card 4] │ [Card]
│ [Card 2] │ [Card 3] │ [Card 4] │ [Card 5] │ [Card]
│          │ [Card 4] │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

**Components**:
- **Header**: Title + [Kanban/List toggle] + [Filter] + [Sort] + [+ New Opportunity]
- **Stage Columns** (Kanban):
  - Prospecting, Qualification, Proposal, Negotiation, Won, Lost
  - Column header shows total value + count
  - Drag-drop cards between columns (auto-updates stage)

- **Opportunity Card**:
  - Client name (link)
  - Deal title
  - Value (e.g., "$50K")
  - Probability % (if tracked)
  - Expected close date
  - Owner (team member avatar)
  - AI snippet: "90% win probability, 2 contacts engaged"
  - Hover → [View] [Edit] [Convert to Project] [Delete]

- **Filters**:
  - By stage, probability range, value range, client, owner, date range
  - "My Opportunities" checkbox

- **List View** (alternative):
  - Table: Name | Client | Value | Stage | Probability | Close Date | Owner | AI Confidence
  - Sortable columns
  - Inline edit cells (drag-to-edit or click to edit)

**Actions**:
- [Convert to Project] → Creates project from template, pre-fills client + info, opens Project Mode
- [Edit] → Modal to update opportunity
- [Delete] → Archive opportunity
- Drag card → updates stage automatically

---

### 3.5 Projects Page (All Projects - Global)

**Layout**:
```
┌──────────────────────────────────────┐
│ Projects [View] [Filter] [Sort] [+]  │
├──────────────────────────────────────┤
│ [View: Grid/Kanban/List]             │
│ [Filter: Status, Client, Team, Risk] │
├──────────────────────────────────────┤
│ [Project 1] [Project 2] [Project 3]  │
│ [Project 4] [Project 5] [Project 6]  │
└──────────────────────────────────────┘
```

**Components**:
- **View Toggle**: Grid (default) | Kanban (by status) | List (table)
- **Filters**: By status (Active, On Hold, Completed, Archived), client, team member, risk level (On Track, At Risk, Off Track), date range
- **Sort**: By due date, profitability, team, client, status

- **Project Card (Grid View)**:
  - [Project hero image or placeholder]
  - Project name (bold)
  - Client name (smaller)
  - Status badge (Active, On Hold, Completed, At Risk)
  - Budget: $XXK (with health indicator 🟢 🟡 🔴)
  - Due date + days remaining
  - Team avatars (3 max, +X more on hover)
  - Progress bar (% complete)
  - AI health score: "On track. 2 overdue tasks. Margin: 65%."
  - Click → Opens Project Mode

- **Kanban View** (by status):
  - Columns: Active, On Hold, Completed, Archived
  - Cards can be dragged between columns (auto-updates status)

- **List View** (table):
  - Columns: Name | Client | Status | Due Date | Budget | Margin | Team | AI Status
  - Sortable, filterable
  - Click row → Project Mode

**Actions**:
- [+ New Project] → Opens Create Project modal
- Click project → Switches to Project Mode (via Project Switcher internally)

---

### 3.6 Tasks Page (All Tasks - Global)

**Layout**:
```
┌─────────────────────────────────────┐
│ Tasks [View] [Filter] [Sort] [+]    │
├─────────────────────────────────────┤
│ [View: Kanban/List/Timeline]        │
│ [Filter: Status, Priority, Assignee]│
├─────────────────────────────────────┤
│ [Kanban columns or list rows]       │
└─────────────────────────────────────┘
```

**Components**:
- **View Options**:
  - **Kanban** (by status): To Do | In Progress | In Review | Done
  - **List** (table): Name | Project | Assignee | Due Date | Priority | Status
  - **Timeline** (Gantt): Tasks on horizontal timeline

- **Filters**:
  - By status, priority, assignee, project, due date (overdue, due today, due this week, etc.), tags

- **Task Card (Kanban View)**:
  - Title
  - Project + client (smaller text)
  - Assignee avatar
  - Due date + days remaining (🔴 if overdue)
  - Priority indicator (⚡ 🔴 ⚠️ ⭐)
  - AI note: "Waiting on client feedback since 3 days"
  - Click → Task detail modal
  - Drag → move between status columns

- **Task Row (List View)**:
  - Name | Project | Assignee | Due Date | Priority | Status
  - Hover → [Edit] [Complete] [Assign] [Drag]

**Actions**:
- [+ New Task] → Create Task modal
- Click task → Task detail modal (inline edit)
- Drag task (Kanban) → update status
- Mark complete → strikethrough + archive

---

### 3.7 Calendar (Global View)

**Layout**:
```
┌──────────────────────────────────────┐
│ Calendar [Month/Week/Day] [Today]    │
├──────────────────────────────────────┤
│ [Cal month view with events]         │
├──────────────────────────────────────┤
│ [Upcoming 7-day sidebar]             │
└──────────────────────────────────────┘
```

**Components**:
- **Main Calendar**: Month/Week/Day toggle
  - Color-coded event types (Deadline: 🔴 | Milestone: 🟡 | Meeting: 🟢 | Deliverable: 🔵)
  - Click event → detail popover (title, time, project, attendees, notes)
  - Drag event to reschedule (auto-updates, with AI conflict check)

- **Sidebar (Upcoming Events)**:
  - Next 7 days listed chronologically
  - [+ New Event] button
  - Click event → detail popover

**Filtering**:
- By event type, project, client, team member

---

### 3.8 Search (Universal Super Search)

**Layout**:
```
┌──────────────────────────────┐
│ [🔍 Search across all...]    │
├──────────────────────────────┤
│ Recent searches / suggestions │
├──────────────────────────────┤
│ Results:                     │
│ [Client] Acme Corp           │
│ [Project] Website Redesign   │
│ [Task] Fix homepage          │
│ [File] Brand Guidelines.pdf  │
│ [Contact] John@acme.com      │
└──────────────────────────────┘
```

**Features**:
- Full-text search across:
  - Clients (name, contact, tags)
  - Opportunities (title, notes)
  - Projects (name, description)
  - Tasks (title, description, comments)
  - Files (name, content)
  - Calendar events
  - Activity feed

- **AI-Powered Filtering**:
  - Natural language: "Show all overdue tasks on profitable projects"
  - Returns filtered results with explanation

- **Recent Searches**: Saved, quick-access

---

## 4. Project Mode (Detailed)

### 4.1 Activation & Scoping

**How It Works**:
1. User selects a project from Project Switcher (top bar)
2. URL updates to `/workspace/[org]/project/[projectId]`
3. Context Provider emits `ProjectScope` event with projectId
4. All subscribed components re-query data filtered to this project
5. Sidebar labels update ("Tasks" → "Project Tasks", etc.)
6. Breadcrumbs update: "Qentrah > [Client] > [Project]"
7. Main content area loads Project Overview

**Real-Time Behavior**:
- If data updates while in Project Mode, only project-scoped data updates
- Notifications only for this project (unless user switches back to Global)
- AI context shifts to project-focused

---

### 4.2 Project Overview (When in Project Mode)

**Layout**:
```
┌─────────────────────────────────────┐
│ [Project Name] [Status] [Actions ▼] │
├─────────────────────────────────────┤
│ [Hero Section with AI Summary]      │
│                                     │
│ ┌─────────────┬─────────────────┐   │
│ │ Info Cards  │ Quick Stats     │   │
│ │ (Budget,    │ (Tasks, Team,   │   │
│ │  Timeline,  │  Next Milestone)│   │
│ │  Team)      │                 │   │
│ └─────────────┴─────────────────┘   │
│                                     │
│ ┌──────────────────────────────┐    │
│ │ AI Project Health Dashboard  │    │
│ │ Timeline Risk | Budget Risk  │    │
│ │ Team Capacity | Quality Flag │    │
│ └──────────────────────────────┘    │
│                                     │
│ ┌──────────────────────────────┐    │
│ │ Recent Activity Feed          │    │
│ │ (Tasks completed, updates...)  │    │
│ └──────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Components**:

1. **Header Bar**
   - Project name (large, bold)
   - Status badge (Active, On Hold, Completed, At Risk)
   - [Actions ▼] dropdown: Edit, Archive, Share Client Portal, Delete

2. **Hero Section (AI Summary)**
   - "2 weeks to completion. Budget: $50K (67% spent). Team: 4/5 capacity. Next milestone: Design approval in 3 days."
   - Health indicators: 🟢 (green) for on-track, 🟡 (yellow) for caution, 🔴 (red) for risk
   - "View AI Full Assessment" link

3. **Info Cards**:
   - **Budget**: $50K budgeted | $33.5K spent | $16.5K remaining | Margin: 65%
   - **Timeline**: Start: Jan 5 | Due: Feb 15 | Completed: 40% | Days remaining: 21 | ⚠️ (if trending late)
   - **Team**: 4 members | Capacity: 85% | Hours logged: 120 / 200 | Utilization by member

4. **Health Dashboard** (Visual Grid):
   - **Timeline Risk**: On Track / At Risk / Off Track (with % completion vs planned)
   - **Budget Risk**: On Track / At Risk / Over Budget (with spent vs budget)
   - **Team Capacity**: Green (available) / Yellow (high utilization) / Red (over capacity)
   - **Quality Flags**: Any issues flagged by AI or team
   - Each clickable → shows details + suggested actions

5. **Recent Activity Feed**:
   - Chronological list of recent changes (last 10 items):
     - "Task 'Homepage design' marked complete by Sarah"
     - "Budget increased $5K by Ahmed"
     - "Client feedback received: 'Approve design, proceed to dev'"
     - "Over-capacity warning: Team at 95% utilization"

---

### 4.3 Project Tabs (When in Project Mode, Sidebar Updates)

**Sidebar in Project Mode**:
```
Qentrah > [Client] > [Project]

MAIN MENU
─ Project Overview
─ Project Tasks (was "Tasks")
─ Project Calendar (was "Calendar")
─ Project Team
─ Project Files
─ Project Activity
─ Client Portal (share)
```

**Tabs Explained**:

#### Tab: Project Overview
- (Covered above)

#### Tab: Project Tasks
- **Layout**: Same as global Tasks page but filtered to this project
- **Components**:
  - View options: Kanban | List | Timeline (default: Kanban)
  - Filter by assignee, priority, due date, status, tags
  - All tasks in this project visible

- **Create Task in Project Mode**:
  - [+ New Task] button
  - Opens Create Task modal (project pre-filled)
  - See "Creation Flows" section for full details

#### Tab: Project Calendar
- **Layout**: Same as global Calendar but showing only project events
- **Components**:
  - Month/Week/Day view
  - Events: Milestones, deadlines, team meetings, deliverables
  - [+ New Event] creates event scoped to project

#### Tab: Project Team
- **Components**:
  - Table: Team Member | Role | Hours Allocated | Hours Used | Utilization
  - Team member cards with:
    - Avatar + name
    - Role/title
    - Tasks assigned (count)
    - Capacity bar (visual utilization)
    - Skills/expertise tags

- **Actions**:
  - [+ Add Team Member] → Dialog to assign existing team members or invite new
  - [Reassign Workload] → AI suggests task reassignments based on capacity
  - Click member → View member details (availability, skills, past projects, performance)

#### Tab: Project Files
- **Components**:
  - Folder structure (default folders: Design, Copywriting, Development, Deliverables, Client Feedback)
  - File upload area (drag-drop + [+ Upload])
  - File list: Name | Type | Size | Uploaded by | Date | AI tag (e.g., "Final Deliverable", "Feedback")

- **Features**:
  - Preview for images, PDFs, videos
  - Version history (if file updated)
  - Comments on files (threaded)
  - AI auto-tagging (e.g., "This is a logo design")

#### Tab: Project Activity
- **Components**:
  - Chronological feed of all project activity:
    - Task updates (created, completed, reassigned, status changed)
    - Project info changes (budget, timeline, team, status)
    - File uploads/updates
    - Team comments/discussions
    - Client interactions
  - Filter by type (tasks, budget, team, files, comments)
  - Search within activity

---

## 5. Core Entity Pages & Components

### 5.1 Tasks (Detailed Component Spec)

**Task Detail Modal** (when clicking a task):
```
┌──────────────────────────────────────┐
│ [X] Task Title                       │
├──────────────────────────────────────┤
│ [Status dropdown] [Priority] [Due]   │
│                                      │
│ Description (editable)               │
│                                      │
│ Assignee: [Avatar] [Name]            │
│ Project: [Project Name] (link)       │
│ Tags: [Tag 1] [Tag 2] [+ Add]        │
│                                      │
│ Subtasks (if any)                    │
│ ☐ Subtask 1 - Sarah                  │
│ ☑ Subtask 2 - Mark                   │
│                                      │
│ Files (attached):                    │
│ [File 1] [File 2]                    │
│                                      │
│ Comments (threaded)                  │
│ [Comment form]                       │
│ [Comment 1] by Sarah                 │
│ [Reply] [Comment 2] by Ahmed         │
└──────────────────────────────────────┘
```

**Fields**:
- **Title** (text, required)
- **Description** (rich text, optional)
- **Status** (dropdown: To Do | In Progress | In Review | Done)
- **Priority** (dropdown: Low | Medium | High | Critical)
- **Assignee** (single person select, optional)
- **Due Date** (date picker, optional)
- **Project** (auto-filled, can change)
- **Tags** (multi-select, optional)
- **Subtasks** (add inline)
- **Files** (drag-drop or file picker)
- **Comments** (threaded discussion)

**AI Features**:
- [AI Break into Subtasks] button: "I'll break this into smaller tasks for you. Approve to create."
  - AI suggests subtask list (e.g., "Research competitors" → "Design mockups" → "Get client approval" → "Refine")
- [AI Assign] button: "Suggest assignee based on availability and skills"
- [AI Estimate] button: "Estimate task duration based on similar past tasks"

**Actions**:
- [Save] → Saves task
- [Complete] → Marks as Done + archives from active view
- [Duplicate] → Create identical task (useful for templates)
- [Delete] → Archive task
- [Close] → Close modal

---

### 5.2 Clients (Detailed Component Spec)

**Client Card** (Grid view):
```
┌────────────────────────────┐
│ [Company Logo/Avatar]      │
│                            │
│ Acme Corporation           │
│ 2 Projects | 1 Opp         │
│                            │
│ Primary: John Smith        │
│ john@acme.com              │
│                            │
│ Next Event: Design Review  │
│ Feb 15, 2:00 PM            │
│                            │
│ AI: "Best performing       │
│ client, 100% on-time, $200K│
│ annual ARR"                │
│                            │
│ [View] [Edit] [New Project]│
└────────────────────────────┘
```

**Contact List** (within Client detail):
```
┌─────────────────────────────────┐
│ Contacts [+ New Contact]         │
├─────────────────────────────────┤
│ Name | Role | Email | Phone    │
│ John Smith | CMO | j@acm... |  │
│ Mary Jones | Designer | m@... │
└─────────────────────────────────┘
```

---

### 5.3 Opportunities (Detailed Component Spec)

**Opportunity Detail Modal**:
```
┌─────────────────────────────────────┐
│ [X] Opportunity Title               │
├─────────────────────────────────────┤
│ [Stage dropdown]  [Probability]     │
│ Client: [Dropdown]  Value: $[Input] │
│                                     │
│ Description (editable)              │
│                                     │
│ Expected Close Date: [Date]         │
│ Owner: [Person dropdown]            │
│ Key Decision-Makers: [People]       │
│                                     │
│ Contacts: [Multi-select]            │
│ Tags: [Tag 1] [Tag 2]               │
│                                     │
│ Next Steps:                         │
│ ☐ Send proposal by Feb 15           │
│ ☐ Schedule demo                     │
│ ☐ Get pricing sign-off              │
│                                     │
│ [Convert to Project] [Delete]       │
└─────────────────────────────────────┘
```

**Convert to Project Flow**:
1. Click [Convert to Project]
2. Modal appears: "Ready to create project?"
3. Pre-fill fields:
   - Project Name: Use opportunity title
   - Client: Use client from opportunity
   - Budget: Use opportunity value
   - Template: User selects (Website Build, Marketing Campaign, etc.)
4. Click [Create Project]
5. Project created, opportunity marked as "Won" (or moved to closed state)
6. Switch to Project Mode automatically

---

## 6. Creation Flows (Extremely Detailed)

### 6.1 Create Project Flow

**Entry Points**:
- [+ New Project] button on Projects page
- [+ Project] on Project Switcher dropdown
- [+ New Project] on Client detail page (client pre-filled)
- [Convert to Project] from Opportunity

**Flow**:
```
Step 1: Basic Info
  ├─ Project Name (required, text)
  ├─ Client (required, dropdown - searchable)
  ├─ Description (optional, rich text)
  ├─ Status (Active | On Hold | Planning)
  └─ [Next]

Step 2: Template & Scope
  ├─ Select Template (or Start Blank):
  │  ├─ Website Build (default tasks, timeline, team roles)
  │  ├─ Marketing Campaign
  │  ├─ Consulting Retainer
  │  ├─ Creative Review Cycle
  │  └─ Recruitment Intake
  ├─ Template Preview (shows default tasks, milestones)
  ├─ [Customize Template] (optional)
  └─ [Next]

Step 3: Timeline & Budget
  ├─ Start Date (date picker, default today)
  ├─ Due Date (date picker, default 30 days out)
  ├─ Budget (currency input, optional but recommended)
  ├─ Billing Type (Hourly | Fixed-Fee | Retainer)
  ├─ Team Allocation Estimate (hours or capacity %)
  └─ [Next]

Step 4: Team & Responsibilities
  ├─ Add Team Members (multi-select)
  │  ├─ Show availability
  │  ├─ Show skills
  │  ├─ Assign roles (Project Manager, Designer, Developer, etc.)
  ├─ Workload Distribution (AI can suggest)
  └─ [Next]

Step 5: Review & Create
  ├─ Summary of all info
  ├─ [Generate AI Suggested Tasks & Timeline]
  │  └─ AI proposes:
  │     - Task breakdown based on template + scope
  │     - Timeline with milestones and dependencies
  │     - Team assignments optimized by capacity
  │     - Risk flags ("Timeline aggressive given team availability")
  ├─ Review + approve AI suggestions
  ├─ [Create Project]
  └─ Success state:
     ├─ Project created
     ├─ Tasks populated (if AI suggestions approved)
     ├─ Team assigned
     ├─ [View Project] button switches to Project Mode
     ├─ [Invite Client to Portal] (optional)
     └─ Close modal
```

**UI Details**:
- Progress bar at top (Step 1/5 ... Step 5/5)
- [Back] button on each step
- [Cancel] always available (confirm unsaved changes)
- Form validation (show errors inline, prevent [Next] if required fields missing)
- Keyboard navigation (Tab, Enter, Esc)

---

### 6.2 Create Task Flow

**Entry Points**:
- [+ New Task] on Tasks page (global) or Project Tasks tab
- Quick-add in task Kanban (+ button in column)
- [AI Break into Subtasks] approval flow

**Flow (Minimal Modal)**:
```
┌──────────────────────────────┐
│ New Task                     │
├──────────────────────────────┤
│ Title: [Text input]          │
│ Description: [Text area]     │
│ Assign to: [Person dropdown] │
│ Due Date: [Date picker]      │
│ Priority: [Low/Med/High/Crit]│
│ Project: [Dropdown]          │
│                              │
│ [Create] [Cancel]            │
└──────────────────────────────┘
```

**Alternative: Inline Quick-Add** (in Kanban):
```
+ New Task in [Status]
[Task name input, Enter to create]
```

**AI Integration**:
- After creating task, offer: "[AI] Break into subtasks?"
- "Assistant estimates 2-3 hours. Approve?"
- "Assign to Sarah (85% available)?"

---

### 6.3 Create Client Flow

**Entry Point**: [+ New Client] on Dashboard or Clients page

**Flow**:
```
┌─────────────────────────────────┐
│ New Client                      │
├─────────────────────────────────┤
│ Company Name: [Text]            │
│ Industry: [Dropdown]            │
│ Website: [URL]                  │
│ Logo/Avatar: [Upload]           │
│                                 │
│ Primary Contact:                │
│ ├─ Name: [Text]                 │
│ ├─ Email: [Email]               │
│ ├─ Phone: [Phone]               │
│ ├─ Title/Role: [Text]           │
│                                 │
│ Tags: [Multi-select + create]   │
│ Custom Fields: [If defined]     │
│                                 │
│ [Create] [Cancel]               │
└─────────────────────────────────┘
```

**Post-Creation**:
- Client created, added to list
- Success toast: "Client created. [View] [Create Project]"

---

### 6.4 Create Opportunity Flow

**Entry Point**: [+ New Opportunity] on Dashboard or Opportunities page

**Flow**:
```
Step 1: Basic Info
  ├─ Opportunity Title (required)
  ├─ Client (required, dropdown)
  ├─ Description (optional)
  └─ [Next]

Step 2: Deal Details
  ├─ Deal Value ($)
  ├─ Expected Close Date
  ├─ Stage (Prospecting / Qualification / Proposal / Negotiation / Won)
  ├─ Win Probability (0-100% slider, optional)
  └─ [Next]

Step 3: Contacts & Stakeholders
  ├─ Key Decision-Makers (multi-select from client contacts)
  ├─ Primary Owner (person from team)
  ├─ Influencers (optional, multi-select)
  └─ [Create]

Step 4: Review & Create
  ├─ Summary
  ├─ [Create Opportunity]
  └─ Success: "Opportunity created. [View] [Convert to Project]"
```

---

## 7. AI Integration Patterns

### 7.1 Global AI Chat

**When in Global Mode**:
- AI has context of **all business data**
- User asks broad questions:
  - "Which client has the lowest profitability?"
  - "Flag all overdue tasks across the agency"
  - "Suggest team reassignments to balance workload"
  - "Summarize last week's activity"
- AI responds with filtered data, actionable suggestions, and [Approve] buttons to create tasks or automations

**Chat Interface**:
```
┌─────────────────────────────┐
│ AI Assistant                │
├─────────────────────────────┤
│ [Chat history...]           │
│                             │
│ "Low profitability clients: │
│ - Design Co (32% margin)    │
│ - Tech Startup (28% margin) │
│                             │
│ Suggestion: Re-scope or     │
│ increase rates?"            │
│                             │
│ [Approve] [Dismiss]         │
│                             │
│ [Input: Ask me anything...] │
└─────────────────────────────┘
```

### 7.2 Project Mode AI

**When in Project Mode**:
- AI context **scoped to project**
- User asks about this specific engagement:
  - "Are we on budget?"
  - "What's next?"
  - "Flag any risks"
  - "Summarize client feedback"
- AI responds with project-specific insights and actionable recommendations

---

## 8. Templates & Standardization

### 8.1 Project Templates (Agency-Specific)

**Website Build Template**:
- Default Tasks:
  - Requirements gathering (1-2 days)
  - Design kickoff (1 day)
  - Mockups v1 (3-5 days)
  - Client review (2 days)
  - Revisions (2-3 days)
  - Development setup (1 day)
  - Frontend dev (5-10 days)
  - Backend dev (5-10 days)
  - QA testing (2-3 days)
  - Client UAT (3-5 days)
  - Launch prep (1 day)
  - Launch (1 day)
- Default Milestones: Kickoff, Design Approved, Development Start, QA Start, Launch
- Default Team Roles: Project Manager, Designer, Frontend Dev, Backend Dev, QA
- Default Budget Estimate Range: $10K - $50K

**Marketing Campaign Template**:
- Default Tasks:
  - Strategy workshop (1 day)
  - Audience research (2 days)
  - Content calendar (1-2 days)
  - Creative development (5-10 days)
  - Copywriting (2-3 days)
  - Platform setup (1 day)
  - Campaign launch (1 day)
  - Performance monitoring (ongoing)
  - Mid-campaign optimization (3 days)
  - Final reporting (1 day)
- Default Team Roles: Campaign Manager, Strategist, Designer, Copywriter, Media Buyer
- Default Budget Range: $5K - $25K

**[Similar for Consulting Retainer, Creative Review Cycle, Recruitment Intake]**

---

## 9. Component Integration & Data Relationships

### 9.1 Context Provider Architecture

**ProjectContextProvider**:
- Maintains current scope (Global | Project)
- Broadcasts scope changes to all subscribed components
- Maintains filters, sorts, date ranges, user preferences
- Manages URL state syncing

**Data Flow**:
```
ProjectContextProvider
├─ scope: "global" | "project:123"
├─ projectId: null | "123"
├─ clientId: null | "456"
├─ filters: {}
├─ sorts: {}
└─ useContext(ProjectContext) hook available to all components
   └─ Components automatically refetch data when context changes
```

### 9.2 Real-Time Updates (WebSocket)

**Subscriptions**:
- When in Global Mode: Subscribe to all changes
- When in Project Mode: Subscribe only to changes in that project + global announcements
- When in Client detail: Subscribe to client + related projects/opportunities

**Update Examples**:
- Task status changed → refetch task list
- Budget updated → refetch project health dashboard
- Team member added → refetch team roster
- New file uploaded → refetch project files

### 9.3 Custom Fields System

**Definition**:
- Workspace-level or Template-level
- Applies to: Clients, Opportunities, Projects, Tasks
- Types: Text, Number, Dropdown, Date, Multi-select, Rich Text, URL
- Required | Optional

**Usage**:
- Displayed in detail pages as additional sections
- Filterable in list views
- Stored in flexible key-value structure

---

## 10. Accessibility & Performance

### 10.1 Keyboard Navigation
- Tab through form fields
- Enter to submit
- Esc to close modals
- Arrow keys in Kanban/dropdowns
- Shift+Cmd+K opens AI chat (global shortcut)

### 10.2 ARIA Labels & Semantic HTML
- All interactive elements labeled
- Form validation error messages linked to inputs
- Skip-to-main-content link
- Color not the only indicator (use icons + text)

### 10.3 Performance Targets
- Dashboard load: < 1s
- Project Mode transition: < 300ms (no reload)
- Task creation: < 500ms
- Search results: < 300ms
- Real-time updates: < 100ms latency

---

## Implementation Roadmap (Solo Builder)

### Phase 1: Foundation
- [ ] Navigation system (Top bar + Sidebar + Project Switcher)
- [ ] Global Workspace Dashboard
- [ ] Clients CRUD (list + detail)
- [ ] Basic Project CRUD + Project Mode scoping

### Phase 2: Core Workflows
- [ ] Tasks full CRUD + Kanban view
- [ ] Opportunities pipeline
- [ ] Calendar view
- [ ] Project Templates + Create Project flow

### Phase 3: Advanced Features
- [ ] AI chat integration (global + project-scoped)
- [ ] Advanced filtering & Super Search
- [ ] Automations + Rules
- [ ] Client Portal
- [ ] Real-time WebSocket updates

### Phase 4: Polish & Scale
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Advanced analytics & reporting
- [ ] Team collaboration features (comments, mentions, @)
- [ ] Integrations (Slack, email, calendar)

---

**END OF PRODUCT SPECIFICATION**
