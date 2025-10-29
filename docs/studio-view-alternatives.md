# Studio – Alternatives to Map View (Mock UI Concepts)

These options let users step through events without a map. Implementation can reuse existing data structures (event: id, title, start, end, coords?, type, notes, images, attachments, warnings).

## 1) Vertical Story Timeline
- Full-height vertical list ordered by time
- Large time chips; expand-on-click for notes, images, attachments, transfer ETA (stub)
- Inline warnings: overlaps, <30m gap
- Mobile-friendly, scroll-to-current

## 2) Card Carousel
- Swipe/arrow through cards (one event per card)
- Card: title, window (start–end), gallery strip, quick actions (open-in-maps, export, attach)
- Great for quick review/reorder (future: drag to re-time)

## 3) Agenda (Dense Day List)
- Compact list grouped by hour slots with sticky headers
- Icons per layer, inline chips for warnings and attachments
- Best for planner/editor workflows

## 4) Gantt‑Lite (Duration Bands)
- Horizontal bars per layer (no map)
- Highlights current and next; exposes overlaps/gaps clearly
- Shares logic with existing timeline tracks

## 5) Storyboard (Media‑First)
- Image tiles per event with time captions and quick actions
- Click opens right-side drawer with full details
- Best when events include photos/tickets

## 6) Kanban by Category
- Columns: Accommodation, Activities, Food, Transport, Other
- Cards sorted by time; drag between columns to change layer
- Clean structural reorganization view

## 7) Calendar Day/Week
- Day/Week grid similar to Google Calendar (read‑only mock)
- Click to open event drawer; supports export parity later

## 8) Compare / Split Mode
- Split: left = Agenda/Timeline, right = Details pane
- Power-user flow; keeps context while editing

## Global UX
- View switcher: Map | Timeline | Cards | Agenda | Gantt | Calendar
- Persist preferred view (localStorage for now)
- Consistent actions: export to calendar, attach files, warnings, re-time, re-layer
- Same highlight API as Map: hover/focus scrolls to event and pulses its card/row

## Data / Future Hooks
- Minimal: start, end, title, type, notes, images, attachments[], warnings
- Later: transferETA from routing APIs to replace the dummy <30m gap rule


