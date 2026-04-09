# My Life Control Tower — Claude Instructions

This file tells Claude Code what must NEVER be changed or deleted without explicit user permission.

---

## Critical Rules

1. **Never remove existing features.** If asked to modify a component, only change what was explicitly requested. Do not refactor, simplify, or "clean up" surrounding code.
2. **Never remove fields from `useFirebaseSync.ts`.** Every store field must be synced in BOTH the `onSnapshot` (read) and `setDoc` (write) blocks, AND in the dependency array.
3. **Never remove fields from `useStore.ts`.** Only add new fields. Removing a field destroys persisted user data.
4. **Never remove routes from `App.tsx` or nav items from `Sidebar.tsx`.**
5. **Always run `npm run build` before committing** to catch TypeScript errors.

---

## Pages & Features (must all exist)

| Route | Component | Key Features |
|---|---|---|
| `/dashboard` | Dashboard | Domain scores, D-Day cards, quick stats |
| `/life-compass` | LifeCompass | Mission, Vision, Core Values, Principles, Roles (with sub-items) |
| `/annual-goals` | AnnualGoals | Goals per domain, milestones, progress |
| `/monthly-plan` | MonthlyPlan | Monthly goals linked to annual goals, plan items checklist, self-feedback textarea |
| `/weekly-plan` | WeeklyPlan | Weekly tasks per day, plan items checklist, self-feedback textarea |
| `/daily-plan` | DailyPlan | Top 3 priorities, task list, gratitude/affirmation/reflection, mood |
| `/time-block` | TimeBlock | Hourly schedule grid, domain color blocks, memo per slot |
| `/miracle21` | Miracle21 | 21-day habit steps, daily completion checkboxes, feedback |
| `/mind-map` | MindMap | Tree-style mind map documents |
| `/mandalart` | Mandalart | 3×3 Mandalart grid, multiple documents |
| `/domain-tracker` | DomainTracker | Weekly table per domain, domain scores |
| `/wannabe-list` | WannabeList | Items with domain category select (NOT free text), Notes textarea at bottom |
| `/journal` | Journal | Issue-tracker style, month tabs Jan–Dec, year selector, Open/Done status, domain badge, expand/collapse content |
| `/dday` | DDay | Countdown cards (D-N/D+N), color picker, domain badge, edit feature |
| `/achievements` | Achievements | Completed goals summary |

---

## Store Fields (all must remain in useStore.ts AND useFirebaseSync.ts)

```
lifeCompass
annualGoals
monthlyGoals
monthlyPlanItems
weeklyTasks
weeklyPlanItems
dailyPlans
timeBlocks
timeBlockMemos
miracle21Habits
habits (legacy — keep for backward compatibility, do not use in UI)
mindMaps (Mandalart)
mindMapDocs (Mind Map tree)
domainEntries
domainScores
wannabeItems
wannabeNotes
annualFeedbacks
monthlyFeedbacks
weeklyFeedbacks
journalEntries
ddayItems
```

---

## Tech Stack

- React 18 + TypeScript (Vite)
- Zustand with `persist` middleware (localStorage key: `life-control-tower-storage`)
- Firebase Firestore for cross-device sync (via `useFirebaseSync` hook)
- React Router v6 (HashRouter)
- Tailwind CSS
- `DOMAIN_CONFIG` in `src/types/index.ts` is the single source of truth for domain colors/labels/emojis

## Domain Keys

`output | input | system | relation | monetization | care | maintenance`

All domain selects in forms must use these keys (not free text, not label strings).
`TRACKER_DOMAINS` excludes `maintenance`.

---

## When Adding New Features

1. Add type to `src/types/index.ts`
2. Add state + actions to `src/store/useStore.ts`
3. Add BOTH read and write to `src/hooks/useFirebaseSync.ts` (and dependency array)
4. Create component in `src/components/<FeatureName>/`
5. Add route to `src/App.tsx`
6. Add nav item to `src/components/Layout/Sidebar.tsx`
7. Update this file (CLAUDE.md)
