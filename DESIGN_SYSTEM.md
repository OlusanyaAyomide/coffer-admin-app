# Coffer Admin — Design System

**Read this before building any admin UI.** It is the single source of truth for
look & feel. The aesthetic is a clean, **squarish**, light-content / **navy-brand**
admin (reference: the Applydeck dashboard). Build new screens to this spec and migrate
old ones toward it.

> **Golden rules**
> 1. **Never hardcode** a hex/rgb/oklch in a component. Use a token (below). If a color
>    is missing, add it to [src/styles.css](src/styles.css) and reference it.
> 2. **Popups are side Sheets, never centered Dialogs.** (see §5.1)
> 3. **Squarish only** — no `rounded-full`/`rounded-3xl` on buttons, inputs, badges,
>    cards. No hover-scale on cards.
> 4. Tokens & shared components already encode this — prefer them over bespoke markup.

---

## 1. Foundations — tokens in [src/styles.css](src/styles.css)

### Typeface
- **Outfit** (Google Fonts `@import`) → `--font-sans`. Everything inherits it.
- Headings: `font-semibold tracking-tight`, `text-foreground` (near-black).
- Body / labels: `text-muted-foreground` (slate `#475862`), 14px.

### Color tokens
| Token | Class | Value | Use |
|-------|-------|-------|-----|
| `--brand` / `--sidebar` | `bg-brand` / `bg-sidebar` | `#0D1332` navy | Sidebar, dark surfaces, **data-table headers** |
| `--primary` | `bg-primary` `text-primary` | indigo `oklch(38.887% .144 271)` | Primary buttons, active states, links, pagination active |
| `--background` | `bg-background` | soft off-white | App content background |
| `--card` | `bg-card` | white | Cards, tables, sheets, inputs |
| `--foreground` | `text-foreground` | near-black | Headings, key numbers |
| `--muted-foreground` | `text-muted-foreground` | `#475862` slate | Body, labels, secondary text |
| `--muted` | `bg-muted` | pale gray | Subtle fills, icon chips |
| `--accent` | `bg-accent` | tinted indigo | Selected rows, hover highlights |
| `--border` | `border-border` | light gray | All borders/dividers |
| `--destructive` | `text-destructive` | red | Errors, danger |

### Geometry — squarish
`--radius: 0.5rem` (8px) base. Components scale up:
- Buttons / inputs / badges → `rounded-md` (~6px)
- Cards / sheets / search field → `rounded-xl` / `rounded-lg` (~10–12px)
- **Never** `rounded-full` / `rounded-3xl` except true circles (avatars, status dots).

### Elevation
Subtle only: `shadow-[0px_1px_2px_0px_rgba(13,19,50,0.05)]` (also `shadow-sm`/`shadow-xs`).
No hover-scale, no heavy drop shadows.

---

## 2. Brand & per-product color system

The Coffer brand color is **navy `#0D1332`** (sidebar) + **indigo `--primary`** (actions).

**Locker products each own a hue** — used on its card accent strip, icon chip, and
update-sheet band. Defined in
[src/types/LockerTypes.ts](src/types/LockerTypes.ts) → `LOCKER_TYPE_THEME`. **Always
pull from there; never re-pick colors.**

| Product | Hue | accent | text | chip |
|---------|-----|--------|------|------|
| **Self-Lock** | blue | `bg-blue-600` | `text-blue-600` | `bg-blue-50` |
| **Goal-Lock** | purple/pink | `bg-purple-600` | `text-purple-600` | `bg-purple-50` |
| **Cabal** | deep yellow | `bg-yellow-500` | `text-yellow-600` | `bg-yellow-50` |

Use `LOCKER_TYPE_LABELS` for display names (`Self-Lock`, `Goal-Lock`, `Cabal`).

---

## 3. Logo — `CofferLogo`
- Light surfaces (auth, light headers): default blue mark `public/coffer-logo.png`.
- Dark surfaces (navy sidebar): **`<CofferLogo white />`** → `public/logowhite.png`.
  **No light chip/wrapper** — the white mark stands on navy directly.

---

## 4. Components (already on-system — inherit automatically)

- **Button** ([ui/button.tsx](src/components/ui/button.tsx)) — `rounded-md`. `default`
  = solid indigo; `outline` = white + border + subtle shadow; `ghost` = transparent.
  Sizes `sm` (h-9) · `default` (h-10) · `lg` (h-11). For a light edit affordance use
  `variant="outline" size="sm"` labeled simply **“Edit”**.
- **Card** ([ui/card.tsx](src/components/ui/card.tsx)) — `rounded-xl`, border, soft
  shadow, no hover-scale.
- **StatCard** ([shared/StatCard.tsx](src/components/shared/StatCard.tsx)) — the KPI/
  summary tile. Anatomy: **colored top accent strip** (`accentClassName`), uppercase
  label, **icon chip** (`bg-muted` rounded-lg), big `text-3xl font-semibold` number,
  optional `subValue` (color via `subValueClassName`). **Cards are wider than tall** —
  keep them compact; don’t stack long lists inside.
- **Badge** ([ui/badge.tsx](src/components/ui/badge.tsx)) — `rounded-md`. Variants:
  `default` (indigo), `secondary`, `outline`, `destructive`, **`success`** (green).
  **Active / on / healthy → `variant="success"`** (optionally with a leading
  `size-1.5 rounded-full bg-emerald-500` dot). “Not set”/neutral → `outline`.
- **Table** ([ui/table.tsx](src/components/ui/table.tsx)) — uppercase `text-xs` header
  labels, `px-4 py-3.5` cells, hover `bg-muted/40`, light row borders.
- **Data tables** ([shared/BaseDataTable.tsx](src/components/shared/BaseDataTable.tsx),
  `CustomizableTable`) — **navy header (`bg-brand` + white text)**, zebra rows, trailing
  actions cell with an outline **View/Edit** button that opens a **Sheet**.
- **Input / Textarea** ([ui/input.tsx](src/components/ui/input.tsx)) — `rounded-md`,
  `bg-card`, border, indigo focus ring. **Search** (`TableSearch`) = `rounded-lg`,
  `max-w-md`, leading search icon.
- **Tabs** ([ui/tabs.tsx](src/components/ui/tabs.tsx)) — underline style: transparent
  triggers, active = `border-b-2 border-primary text-primary`. Use for per-entity
  sub-views (e.g. rate change-history split by product).
- **Pagination** ([shared/TablePaginator.tsx](src/components/shared/TablePaginator.tsx))
  — squarish; active page is `variant="default"` (brand indigo).

---

## 5. Patterns

### 5.1 Popups → side-sliding Sheet (NEVER centered Dialog)
All modals / detail panels / forms slide from the **right** using
[ui/sheet.tsx](src/components/ui/sheet.tsx). Reference:
[components/locker/UpdateRateDialog.tsx](src/components/locker/UpdateRateDialog.tsx).

Anatomy:
- Optional **brand color band** at the very top (`h-1.5` strip in the entity’s hue) —
  use `LOCKER_TYPE_THEME[type].accent` for locker sheets. Set `p-0` on `SheetContent`
  so the band is flush, then pad header/body/footer.
- `SheetHeader` (title + description, `border-b`), scrollable body
  (`flex-1 overflow-y-auto px-6 py-5 space-y-5`), `SheetFooter` (`border-t`,
  right-aligned actions).

**Width — panels are wide.** The shared `SheetContent` default is `sm:max-w-2xl`
(set globally in [ui/sheet.tsx](src/components/ui/sheet.tsx) so no sheet is cramped);
**forms use `sm:max-w-3xl`/`4xl`**, detail drawers `sm:max-w-4xl`. Pass a plain
`sm:max-w-*` on `SheetContent` to override — it now merges cleanly over the default.
Use a narrower `sm:max-w-md` only for deliberately compact panels (e.g. Select Columns).

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>{trigger}</SheetTrigger>
  <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
    <div className={cn('h-1.5 w-full shrink-0', theme.accent)} />
    <SheetHeader className="border-b border-border">…</SheetHeader>
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">…</div>
    <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

Migrated so far: rate update sheet, table **Select Columns** sheet
([shared/CustomizableTable.tsx](src/components/shared/CustomizableTable.tsx)).

### 5.2 Summary / entity cards
Use the **StatCard anatomy**: accent strip on top (brand or entity hue), label, optional
icon chip / status badge, big value, one short subline. **Wider than tall.** Don’t pack
secondary lists into the card — put detail in a Sheet or a table below.

### 5.3 Forms
- Labels with `Label`; mark optional fields explicitly: `Reason / note (optional)`.
- Only block submit on genuinely required fields. Show derived hints under inputs
  (e.g. “≈ X% per day”) and consequence notes in muted text.
- Footer: `Cancel` (outline) + primary action; disable while pending, show “Saving…”.

### 5.4 Tables & filters
- Lists use the navy-header data tables. Status → `Badge` (`success` for active).
- Filters ([shared/FilterButtons.tsx](src/components/shared/FilterButtons.tsx)) — chip
  triggers, squarish checkboxes, indigo **Apply**.
- Toolbar: left = `TableSearch`, right = Filter + Export/actions.

---

## 6. Migration checklist for existing screens
1. `Dialog` → `Sheet` (right side, wide, brand band if entity-scoped).
2. Bespoke stat tiles → `StatCard` (accent strip + chip, wider-than-tall).
3. Tables via shared primitives (navy header) — don’t restyle headers locally.
4. Status pills → `Badge variant="success"` (active) / `outline` (neutral).
5. Remove `rounded-full`/`rounded-3xl` on buttons/inputs/badges and card hover-scale.
6. Replace any inline color with a token (`bg-brand`, `text-primary`, `LOCKER_TYPE_THEME`).
