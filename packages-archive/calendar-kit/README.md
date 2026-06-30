# @qentrah/calendar-kit

**Qentrah's production React calendar scheduler** — Month, Week, and Day views with full TypeScript support, RTL layout, and Qentrah design-system integration.

[![npm version](https://badge.fury.io/js/%40qentrah%2Fcalendar-kit.svg)](https://www.npmjs.com/package/@qentrah/calendar-kit)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

---

## Installation

```bash
npm install @qentrah/calendar-kit
# or
pnpm add @qentrah/calendar-kit
# or
yarn add @qentrah/calendar-kit
```

---

## Quick start

```tsx
import { BasicScheduler } from "@qentrah/calendar-kit";
import "@qentrah/calendar-kit/styles";
import { useState } from "react";

function MyCalendar() {
  const [events, setEvents] = useState([]);
  const [view, setView]     = useState("week");
  const [date, setDate]     = useState(new Date());

  return (
    <div style={{ height: "700px" }}>
      <BasicScheduler
        events={events}
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        onEventCreate={(ev) =>
          setEvents((prev) => [...prev, { ...ev, id: crypto.randomUUID() }])
        }
        onEventUpdate={(ev) =>
          setEvents((prev) => prev.map((e) => (e.id === ev.id ? ev : e)))
        }
        onEventDelete={(id) =>
          setEvents((prev) => prev.filter((e) => e.id !== id))
        }
      />
    </div>
  );
}
```

---

## Core API

| Prop | Type | Default | Description |
|---|---|---|---|
| `events` | `CalendarEvent[]` | `[]` | Events to display |
| `view` | `'month' \| 'week' \| 'day'` | `'week'` | Active view |
| `onViewChange` | `(v: ViewType) => void` | — | View changed |
| `date` | `Date` | `new Date()` | Focused date |
| `onDateChange` | `(d: Date) => void` | — | Date changed |
| `onEventCreate` | `(e: Partial<CalendarEvent>) => void` | — | Slot clicked |
| `onEventUpdate` | `(e: CalendarEvent) => void` | — | Event dragged/resized |
| `onEventDelete` | `(id: string) => void` | — | Delete triggered |
| `onEventClick` | `(e: CalendarEvent) => void` | — | Event clicked |
| `weekStartsOn` | `0–6` | `0` | First day of week (0=Sun, 1=Mon, 6=Sat) |
| `readOnly` | `boolean` | `false` | Disable all mutations |
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `renderEvent` | `(props) => ReactNode` | — | Custom event renderer |
| `renderEventForm` | `(props) => ReactNode` | — | Replace built-in modal |

### CalendarEvent type

```typescript
interface CalendarEvent {
  id:          string;
  title:       string;
  start:       Date;
  end:         Date;
  color?:      string;   // hex colour
  calendarId?: string;
  description?: string;
  allDay?:     boolean;
}
```

---

## Replacing the built-in modal

Use `renderEventForm` to intercept slot and event clicks and open your own drawer:

```tsx
<BasicScheduler
  renderEventForm={({ isOpen, onClose, event, initialDate }) => {
    // Close the library overlay immediately
    if (isOpen) {
      onClose();
      if (event)       openEditDrawer(event);
      else if (initialDate) openCreateDrawer(initialDate);
    }
    return null; // render nothing — your drawer handles the UI
  }}
/>
```

---

## RTL support

```tsx
<div dir="rtl">
  <BasicScheduler weekStartsOn={6} /* Saturday */ events={events} />
</div>
```

---

## Theming

Override CSS variables on your wrapper:

```css
.my-calendar-wrapper {
  --background:  #0f0f0f;
  --foreground:  #fafafa;
  --primary:     #6366f1;
  --border:      #27272a;
  --radius:      12px;
}
```

---

## License

MIT — see [LICENSE](./LICENSE).

Based on [calendarkit-basic](https://github.com/Zesor/calendarkit-basic) (MIT, Copyright © 2025 CalendarKit).
Maintained and extended by [Qentrah Team](https://qentrah.com).
