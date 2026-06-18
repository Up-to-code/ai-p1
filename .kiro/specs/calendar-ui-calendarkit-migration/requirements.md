# Requirements Document

## Introduction

This document specifies the requirements for migrating the Qentrah calendar UI from the current custom implementation using react-big-calendar to CalendarKit (calendarkit-basic package). The migration aims to maintain all existing functionality while improving code maintainability, reducing complexity, and leveraging CalendarKit's modern component architecture. The new implementation must preserve full feature parity with the current system, including multiple calendar views, event management, internationalization support, and seamless integration with the Qentrah design system.

## Glossary

- **Calendar_System**: The complete calendar module responsible for displaying and managing calendar events
- **CalendarKit**: Third-party calendar component library (calendarkit-basic package) providing pre-built calendar views
- **Event**: A calendar entry with properties including title, owner, date, time, type, and status
- **View_Mode**: One of three calendar display modes: Month, Week, or Day
- **Event_Type**: Classification of events: meeting, deadline, reminder, milestone, or focusBlock
- **Event_Status**: Lifecycle state of events: confirmed, pending, or draft
- **Design_System**: Qentrah's design token system using CSS custom properties (--q-* variables)
- **Workspace**: The organizational context that contains calendar events
- **RTL**: Right-to-left text direction for Arabic language support
- **Event_Dialog**: Modal interface for viewing detailed event information
- **Day_Dialog**: Modal interface showing all events for a specific date
- **Business_Schedule_Dialog**: Form interface for creating or editing events
- **Calendar_Store**: Zustand state management for current date and view mode
- **Event_CRUD**: Create, Read, Update, Delete operations for calendar events

## Requirements

### Requirement 1: Calendar View Display

**User Story:** As a user, I want to view my calendar in multiple formats, so that I can see my schedule at different levels of detail.

#### Acceptance Criteria

1. THE Calendar_System SHALL support three View_Modes: Month, Week, and Day
2. WHEN displaying Month view, THE Calendar_System SHALL show a full month grid with 42 cells (6 weeks × 7 days)
3. WHEN displaying Week view, THE Calendar_System SHALL show seven consecutive days from Sunday to Saturday
4. WHEN displaying Day view, THE Calendar_System SHALL show time slots from 08:00 to 20:30 in 30-minute increments
5. WHEN rendering any view, THE Calendar_System SHALL use CalendarKit components instead of react-big-calendar
6. WHEN a View_Mode changes, THE Calendar_System SHALL preserve the current date context
7. THE Calendar_System SHALL display calendar header with current period label and view controls

### Requirement 2: Event Display and Styling

**User Story:** As a user, I want events to be visually distinguished by type and status, so that I can quickly identify different kinds of activities.

#### Acceptance Criteria

1. WHEN displaying an Event, THE Calendar_System SHALL apply color coding based on Event_Type
2. THE Calendar_System SHALL use amber styling for meeting events (bg-amber-50, border-amber-200, text-amber-800 in light mode)
3. THE Calendar_System SHALL use emerald styling for deadline events (bg-emerald-50, border-emerald-200, text-emerald-800 in light mode)
4. THE Calendar_System SHALL use sky styling for reminder events (bg-sky-50, border-sky-200, text-sky-800 in light mode)
5. THE Calendar_System SHALL use teal styling for milestone events (bg-teal-50, border-teal-200, text-teal-800 in light mode)
6. THE Calendar_System SHALL use violet styling for focusBlock events (bg-violet-50, border-violet-200, text-violet-800 in light mode)
7. WHEN displaying Event_Status, THE Calendar_System SHALL show status pills with appropriate tone (success for confirmed, warning for pending, neutral for draft)
8. WHEN rendering events in Month view, THE Calendar_System SHALL display up to 3 events per day with compact chips
9. WHEN more than 3 events exist for a date, THE Calendar_System SHALL show "+N more" indicator
10. WHEN rendering events in Week view, THE Calendar_System SHALL display events as stacked cards within each day column
11. WHEN rendering events in Day view, THE Calendar_System SHALL place events in their corresponding 30-minute time slots

### Requirement 3: Event Interaction

**User Story:** As a user, I want to interact with calendar events, so that I can view details and manage my schedule.

#### Acceptance Criteria

1. WHEN a user clicks an Event in any view, THE Calendar_System SHALL open the Event_Dialog showing full event details
2. WHEN a user clicks a date cell in Month view, THE Calendar_System SHALL open the Day_Dialog for that date
3. WHEN a user clicks a day header in Week view, THE Calendar_System SHALL open the Day_Dialog for that date
4. WHEN a user clicks the "Add" button, THE Calendar_System SHALL open the Business_Schedule_Dialog in create mode
5. WHEN a user clicks edit in Event_Dialog, THE Calendar_System SHALL open the Business_Schedule_Dialog in edit mode with pre-filled data
6. WHEN a user clicks delete in Event_Dialog, THE Calendar_System SHALL show confirmation and remove the event upon confirmation
7. WHEN the Event_Dialog is open, THE Calendar_System SHALL display event title, owner, date, time, type, status, and optional fields (clientName, assetTitle, location, notes, customFields)

### Requirement 4: Calendar Navigation

**User Story:** As a user, I want to navigate through different time periods, so that I can view past and future events.

#### Acceptance Criteria

1. WHEN a user clicks the previous navigation button, THE Calendar_System SHALL move back by one period (month, week, or day depending on current view)
2. WHEN a user clicks the next navigation button, THE Calendar_System SHALL move forward by one period
3. WHEN a user clicks the "Today" button, THE Calendar_System SHALL navigate to the current date
4. WHEN navigating, THE Calendar_System SHALL update the header label to reflect the new period
5. WHEN in Month view navigation, THE Calendar_System SHALL move by calendar month
6. WHEN in Week view navigation, THE Calendar_System SHALL move by 7 days
7. WHEN in Day view navigation, THE Calendar_System SHALL move by 1 day
8. THE Calendar_System SHALL persist the current date in Calendar_Store

### Requirement 5: Event Creation and Editing

**User Story:** As a user, I want to create and edit calendar events, so that I can manage my schedule.

#### Acceptance Criteria

1. WHEN creating an Event, THE Calendar_System SHALL collect required fields: title, owner, date, time, type, and status
2. WHEN creating an Event, THE Calendar_System SHALL support optional fields: clientId, assetId, projectId, taskId, location, notes, and customFields
3. WHEN editing an Event, THE Calendar_System SHALL pre-fill the form with existing event data
4. WHEN saving an Event, THE Calendar_System SHALL validate data against calendarEventSchema
5. WHEN validation fails, THE Calendar_System SHALL display error messages without closing the dialog
6. WHEN validation succeeds for new Event, THE Calendar_System SHALL call createCalendarEventRequest with organizationId
7. WHEN validation succeeds for existing Event, THE Calendar_System SHALL call updateCalendarEventRequest with organizationId and event ID
8. WHEN save succeeds, THE Calendar_System SHALL close the dialog and refresh the events list
9. WHEN the Business_Schedule_Dialog is open, THE Calendar_System SHALL load client and task options for pickers
10. THE Calendar_System SHALL support location selection via LocationPicker component

### Requirement 6: Event Deletion

**User Story:** As a user, I want to delete calendar events, so that I can remove cancelled or incorrect entries.

#### Acceptance Criteria

1. WHEN a user initiates event deletion, THE Calendar_System SHALL display a DeleteRecordDialog with event title
2. WHEN deletion is confirmed, THE Calendar_System SHALL call deleteCalendarEventRequest with organizationId and event ID
3. WHEN deletion succeeds, THE Calendar_System SHALL close all related dialogs and refresh the events list
4. WHEN deletion fails, THE Calendar_System SHALL display an error message within the dialog
5. THE Calendar_System SHALL prevent deletion when no organization is selected

### Requirement 7: Data Loading and Query

**User Story:** As a system, I want to efficiently load calendar data, so that users see relevant events for the current view.

#### Acceptance Criteria

1. WHEN the Calendar_System initializes, THE Calendar_System SHALL query workspace status from account context
2. WHEN workspace status is not "ready", THE Calendar_System SHALL display WorkspaceQueryState message
3. WHEN workspace is ready, THE Calendar_System SHALL calculate visible date range based on current date and View_Mode
4. THE Calendar_System SHALL call useCalendarIndexRangeQueryResult with organizationId, startAt, and endAt timestamps
5. WHEN query is loading, THE Calendar_System SHALL display loading state
6. WHEN query errors, THE Calendar_System SHALL display HttpQueryState error message
7. WHEN query succeeds, THE Calendar_System SHALL render events in the current view
8. THE Calendar_System SHALL group events by date for efficient lookup
9. WHEN View_Mode or current date changes, THE Calendar_System SHALL recalculate range and refetch events

### Requirement 8: Statistics Display

**User Story:** As a user, I want to see summary statistics about my events, so that I can understand my schedule at a glance.

#### Acceptance Criteria

1. THE Calendar_System SHALL display four statistics in AppStatsGrid component
2. THE Calendar_System SHALL show total events count with CalendarDays icon
3. THE Calendar_System SHALL show confirmed events count with emerald dot indicator
4. THE Calendar_System SHALL show pending events count with amber dot indicator
5. THE Calendar_System SHALL show unique owners count with User icon
6. WHEN events query is loading, THE Calendar_System SHALL display "..." as placeholder values
7. WHEN events data is available, THE Calendar_System SHALL compute statistics from query results

### Requirement 9: Internationalization and Localization

**User Story:** As a user, I want the calendar to display in my preferred language with proper text direction, so that I can use it naturally.

#### Acceptance Criteria

1. THE Calendar_System SHALL support English (en) and Arabic (ar) locales
2. WHEN locale is Arabic, THE Calendar_System SHALL render text in right-to-left (RTL) direction
3. WHEN locale is English, THE Calendar_System SHALL render text in left-to-right (LTR) direction
4. THE Calendar_System SHALL use next-intl translations for all user-facing text
5. THE Calendar_System SHALL format dates using locale-appropriate formats (enUS or arSA from date-fns)
6. THE Calendar_System SHALL translate weekday labels: sun, mon, tue, wed, thu, fri, sat
7. THE Calendar_System SHALL translate view labels: month, week, day
8. THE Calendar_System SHALL translate status labels: confirmed, pending, draft
9. THE Calendar_System SHALL translate event type labels: meeting, deadline, reminder, milestone, focusBlock
10. THE Calendar_System SHALL translate UI labels: today, more, add, delete.title, delete.desc
11. WHEN displaying dates, THE Calendar_System SHALL use calendarHeaderLabel, calendarLongDayLabel, and other locale-aware formatters

### Requirement 10: Design System Integration

**User Story:** As a developer, I want the calendar to use Qentrah design tokens, so that it maintains visual consistency with the rest of the application.

#### Acceptance Criteria

1. THE Calendar_System SHALL use Qentrah CSS custom properties for all color values
2. THE Calendar_System SHALL use --q-bg, --q-card, --q-border, --q-text-primary, --q-text-secondary, --q-text-muted for base styling
3. THE Calendar_System SHALL use --q-accent, --q-accent-hover, --q-accent-active for interactive elements
4. THE Calendar_System SHALL support both light and dark themes through CSS custom property values
5. THE Calendar_System SHALL use Tailwind CSS classes that map to design system tokens
6. THE Calendar_System SHALL use shadcn/ui components (Button, Dialog, Sheet, Select, Textarea, TextInput) styled with design tokens
7. THE Calendar_System SHALL apply rounded-[24px] border radius to main calendar container
8. THE Calendar_System SHALL use transition utilities for smooth hover and interaction effects
9. THE Calendar_System SHALL apply consistent spacing using Tailwind spacing scale
10. THE Calendar_System SHALL maintain visual hierarchy with font weights (font-black for headers, font-bold for secondary text)

### Requirement 11: Responsive Design

**User Story:** As a mobile user, I want the calendar to work on small screens, so that I can manage my schedule on any device.

#### Acceptance Criteria

1. WHEN viewport width is below sm breakpoint, THE Calendar_System SHALL adjust header layout to stack vertically
2. WHEN viewport width is below lg breakpoint, THE Calendar_System SHALL adjust controls layout
3. THE Calendar_System SHALL set min-width of 760px for Month view grid to enable horizontal scrolling on small screens
4. THE Calendar_System SHALL set min-width of 860px for Week view grid to enable horizontal scrolling on small screens
5. THE Calendar_System SHALL use responsive grid classes (sm:, lg:) for adaptive layouts
6. THE Calendar_System SHALL use Sheet component for Day_Dialog on mobile and Dialog on desktop
7. THE Calendar_System SHALL ensure touch targets are minimum 44px for mobile interaction

### Requirement 12: CalendarKit Integration

**User Story:** As a developer, I want to use CalendarKit components, so that I can reduce custom code and leverage a maintained library.

#### Acceptance Criteria

1. THE Calendar_System SHALL import components from calendarkit-basic package
2. THE Calendar_System SHALL remove all react-big-calendar imports and usage
3. THE Calendar_System SHALL remove custom Month/Week/Day view implementations when CalendarKit provides equivalent functionality
4. THE Calendar_System SHALL adapt CalendarKit components to use Qentrah design tokens
5. THE Calendar_System SHALL pass events data to CalendarKit in the required format
6. THE Calendar_System SHALL handle CalendarKit callbacks for date selection and event clicks
7. THE Calendar_System SHALL maintain existing view switching logic while using CalendarKit views
8. WHEN CalendarKit components require styling customization, THE Calendar_System SHALL use CSS modules or styled-components to override defaults

### Requirement 13: State Management Preservation

**User Story:** As a developer, I want to maintain the existing state management approach, so that the migration has minimal architectural impact.

#### Acceptance Criteria

1. THE Calendar_System SHALL continue using useCalendarStore for view and date state
2. THE Calendar_System SHALL preserve Calendar_Store interface with currentDate, view, setCurrentDate, and setView
3. THE Calendar_System SHALL continue using useAccountContext for workspace and organization access
4. THE Calendar_System SHALL maintain existing query hooks: useCalendarIndexRangeQueryResult, useClientOptionsQuery, useClientTaskOptionsQuery
5. THE Calendar_System SHALL maintain existing mutation functions: createCalendarEventRequest, updateCalendarEventRequest, deleteCalendarEventRequest
6. THE Calendar_System SHALL preserve useOperationState for managing delete operation states
7. THE Calendar_System SHALL maintain all existing TypeScript types: CalendarEvent, CalendarEventFormValues, CalendarView

### Requirement 14: Performance and Code Quality

**User Story:** As a developer, I want the calendar code to be maintainable and performant, so that it's easy to modify and provides a good user experience.

#### Acceptance Criteria

1. THE Calendar_System SHALL reduce total component lines of code by at least 30% compared to current implementation (from 1939 lines)
2. THE Calendar_System SHALL use useMemo for expensive computations: visibleCalendarRange, eventsByDate, ordered events
3. THE Calendar_System SHALL avoid unnecessary re-renders by properly memoizing callbacks
4. THE Calendar_System SHALL lazy load picker options only when dialogs are open
5. THE Calendar_System SHALL maintain clear separation of concerns between view components and business logic
6. THE Calendar_System SHALL use TypeScript strict mode with no type errors
7. THE Calendar_System SHALL follow React best practices for hooks and component composition
8. THE Calendar_System SHALL maintain accessibility with proper ARIA labels and keyboard navigation

### Requirement 15: Dialog Management

**User Story:** As a user, I want modal dialogs to behave predictably, so that I have a clear understanding of system state.

#### Acceptance Criteria

1. WHEN any dialog is open, THE Calendar_System SHALL block interaction with underlying calendar
2. WHEN a dialog is closed, THE Calendar_System SHALL clear related state (selectedEvent, editingEvent, drawerDate, deleting)
3. THE Calendar_System SHALL ensure only one modal dialog is open at a time
4. WHEN Event_Dialog edit button is clicked, THE Calendar_System SHALL close Event_Dialog before opening Business_Schedule_Dialog
5. WHEN Business_Schedule_Dialog save succeeds, THE Calendar_System SHALL close the dialog automatically
6. WHEN Day_Dialog event is clicked, THE Calendar_System SHALL close Day_Dialog before opening Event_Dialog
7. THE Calendar_System SHALL use controlled open/onOpenChange pattern for all dialogs
8. THE Calendar_System SHALL support ESC key and overlay click for closing dialogs

### Requirement 16: Migration Path and Backward Compatibility

**User Story:** As a developer, I want a clear migration path, so that I can transition smoothly from the old implementation.

#### Acceptance Criteria

1. THE Calendar_System SHALL remove @import "react-big-calendar/lib/css/react-big-calendar.css" from globals.css
2. THE Calendar_System SHALL remove react-big-calendar, dateFnsLocalizer imports from calendar-screen.tsx
3. THE Calendar_System SHALL maintain all existing API contracts for event creation, update, and deletion
4. THE Calendar_System SHALL preserve all existing event data schema and validation
5. THE Calendar_System SHALL maintain compatibility with existing calendar API endpoints
6. THE Calendar_System SHALL keep all existing utility functions in calendar-view-model.ts unless replaced by CalendarKit equivalents
7. THE Calendar_System SHALL document any breaking changes or API differences
8. THE Calendar_System SHALL ensure no data loss during migration

## Notes

- The calendarkit-basic package should be evaluated for feature completeness before implementation begins
- If CalendarKit doesn't provide full Month/Week/Day view implementations, custom views may need to be maintained
- CalendarKit component styling should be customizable enough to match Qentrah design system
- Performance testing should be conducted to compare CalendarKit vs. current implementation
- Consider creating a feature flag to toggle between old and new implementations during transition
