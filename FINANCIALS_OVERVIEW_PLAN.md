# Financials Overview — Page Plan

> The Financials section's landing page. Answers one question on open: **"where does the
> business stand right now?"** — how much money is moving, whether we're net inflow or outflow,
> what we're earning, whether the treasury covers what we owe users, and whether anything is on
> fire. Every section is a snapshot with a "View all →" into its dedicated deep page.

## Two directives baked in

1. **KPI cards use `StatCard`** (`src/components/shared/StatCard.tsx`) — the exact card in the
   User Management screenshot: colored top accent strip, uppercase label, icon chip top-right,
   big `text-3xl` number, colored subline. No bespoke tiles.
2. **Overview becomes the first item in the Financials nav**, before Ledger. New route
   `/financials` (index). Nav order: **Overview** · Ledger · Reconciliation · Treasury &
   Internal · Provider Config · Withdrawals.

---

## Route & nav

- New route file `src/routes/_admin/financials/index.tsx` → `/financials`.
- `src/static/adminLayoutStatic.tsx`: prepend `{ title: 'Overview', url: '/financials' }` to the
  Financials `items[]`. Keep the group's parent link pointing at `/financials`.

---

## Data — one composing endpoint

`GET /admin/financials/overview?range=24h|7d|30d|all&currency=all|NGN|USDT`

One endpoint, one hook (`useFinancialsOverview`), one range/currency control, one loading state —
exactly the shape of the existing `/admin/overview`. It **composes** the Phase 3/5 services
rather than re-querying, so the overview and the deep pages can never disagree:

```jsonc
{
  "period": { "from", "to", "range", "currency", "timezone": "Africa/Lagos" },
  "kpis": {
    "total_volume":     { "NGN","USDT","converted_total","delta_pct" },
    "net_revenue":      { "NGN","USDT","converted_total","take_rate_bps" },
    "treasury_balance": { "NGN","USDT","converted_total","coverage_ratio" },
    "throughput":       { "success_rate","completed","pending","failed","stuck" }
  },
  "money_series":   [{ "bucket","deposits","withdrawals","net" }],       // per currency, bucketed
  "flow_breakdown": [{ "flow","currency","count","volume" }],
  "status_funnel":  [{ "flow","pending","completed","failed","reversed","success_rate" }],
  "revenue":        { "by_flow":[…], "net_revenue":[…], "take_rate_bps":[…], "gaps":[…] },
  "treasury":       { "system_wallets":[…], "user_liability", "coverage":[…],
                      "pending_exposure", "missing_wallets":[], "orphaned_wallets":[] },
  "rail_health":    [{ "provider","count","volume","success_rate","p95_latency_proxy" }],
  "integrity":      { "stuck_pending","unbalanced","duplicate_refs","zero_entry_completed",
                      "webhook_failed","worst_severity" }
}
```

**Graceful degradation:** `rail_health` and `integrity` come from Phase 5 services. Until those
land, the endpoint returns them as `null`, and the UI simply hides those two strips. So the
Overview ships complete against Phase 3 (money-movement + revenue + treasury) and gets richer
when Phase 5 arrives — no rework.

---

## Page layout (top → bottom)

Executive read order: is anything on fire → the standing → the trend → the detail.

### 0. Header

Title **"Financial Overview"** + one-line subtitle. Right side: range `Select`
(24h / 7d / 30d / All) + currency `Select` (All / NGN / USDT) + a refresh button. Copy the header
block from `AdminOverviewPage.tsx` verbatim — same controls, same widths.

### 1. Integrity alert banner — _conditional_

A slim destructive-tinted strip, shown **only when `integrity.worst_severity` is not clear**:

> ⚠ 3 stuck pending · 1 duplicate reference · webhook failed set: 12 — **Review →**

Links to `/financials/reconciliation`. This is the "is anything on fire" signal and it sits above
the numbers on purpose. When everything is clean it renders nothing (no permanent green bar —
that trains people to stop looking).

### 2. KPI row — four `StatCard`s

`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4` (the screenshot's 4-across).

| Card                 | Value                                             | Subline                                         | Accent                         | Icon             |
| -------------------- | ------------------------------------------------- | ----------------------------------------------- | ------------------------------ | ---------------- |
| **Total Volume**     | converted total moved this period (e.g. `₦52.4M`) | `$31.2K USDT · ₦4.1M NGN` + `▲ 22% vs previous` | brand indigo                   | `ArrowLeftRight` |
| **Net Revenue**      | fees earned − processor − VAT                     | `Take rate 41 bps`                              | emerald                        | `TrendingUp`     |
| **Treasury Balance** | float held (converted)                            | `Covers 98% of user liability` (amber if <100%) | blue                           | `Landmark`       |
| **Throughput**       | success rate `98.0%`                              | `412 completed · 8 failed · 3 stuck`            | emerald, amber if success <95% | `CheckCircle2`   |

Money KPIs honour the `StatCard` single-value shape: **converted total is the big number**, the
per-currency split rides in the subline. Under a currency filter (NGN/USDT), the big number
becomes that currency and the split drops. `delta_pct` colours the subline green/red via
`subValueClassName`.

### 3. Money movement — the hero chart (2/3) + flow mix (1/3)

`grid xl:grid-cols-[minmax(0,1fr)_360px] gap-4`, both in `Card` (rounded-lg, bordered header).

- **Left — Deposits vs Withdrawals over time** (recharts): stacked/grouped bars for inflow vs
  outflow per bucket, plus a **net-flow line** overlaid. The single most important chart — it
  answers "are we net taking money in or paying it out". Bucketing follows the range
  (hour → day → week), computed server-side in `Africa/Lagos`. Source: `money_series`.
- **Right — Flow mix** (recharts donut or horizontal bars): share of volume by flow (deposit,
  withdrawal, swap, transfer, locker, cabal). Source: `flow_breakdown`. `View ledger →` link.

### 4. Status funnel — full width

One `Card`. Per-flow horizontal stacked bar: completed / pending / failed / (reversed), with a
success-rate figure per row. Source: `status_funnel`. Carries a small legend note: _"Reversals
are currently recorded as `failed` — see Todo.md"_, so the permanently-zero `reversed` segment is
self-explaining rather than confusing.

### 5. Revenue (1/2) + Treasury coverage (1/2)

`grid lg:grid-cols-2 gap-4`.

- **Revenue** — fees earned by flow (small bars), net-revenue figure, and a **swap-spread gap
  callout**: `Swaps moved ₦82M · 0 bps captured → est. ₦410K foregone at 50bps`, linking to
  Provider Config. Turns the "we book no swap spread" finding into a one-click decision. Source:
  `revenue`.
- **Treasury coverage** — a coverage bar/gauge (treasury assets vs user liability) per currency,
  system-wallet balances (treasury / fee / VAT), pending exposure. Red banner if
  `missing_wallets` or `orphaned_wallets` is non-empty (the ~₦51K orphaned-legacy-wallet finding
  surfaces here). Source: `treasury`. `View treasury →` link to `/financials/internal`.

### 6. Rail health — full-width strip — _conditional (Phase 5)_

A compact row of per-provider mini-cards or a small table: Busha · PalmPay · Yellow Card · Lenco ·
Paystack, each with period volume, success rate, and p95 settlement-latency (proxy). A failing
rail reads red. Source: `rail_health`. `View reconciliation →`.

---

## Components to build

`src/components/financials/overview/`

- `FinancialsOverviewPage.tsx` — orchestrates; range/currency state; one hook; skeleton.
- `OverviewKpiCards.tsx` — the four `StatCard`s.
- `IntegrityAlertBanner.tsx` — conditional strip.
- `MoneyMovementChart.tsx` — hero inflow/outflow + net line.
- `FlowMixChart.tsx` — donut/bars.
- `StatusFunnelCard.tsx` — per-flow success bars.
- `RevenueSummaryCard.tsx` — fees by flow + spread-gap callout.
- `TreasuryCoverageCard.tsx` — coverage gauge + wallet balances + missing/orphaned banner.
- `RailHealthStrip.tsx` — per-provider mini-cards.
- `financialsChartConfig.ts` — the one place flow/direction → colour token mapping lives.

`src/hooks/useFinancialsOverview.ts` · types added to `src/types/FinancialsTypes.ts`.

---

## Chart colours — token-driven

`--chart-1..5` already exist in `styles.css` (indigo family) — fine for the categorical **flow
mix**. But money has _direction_ semantics the indigo ramp can't carry, so add three semantic
tokens to `styles.css` (both light and dark blocks) and reference only these in
`financialsChartConfig.ts`:

- `--chart-inflow` — emerald (deposits)
- `--chart-outflow` — amber (withdrawals)
- `--chart-net` — brand navy (net-flow line)

No hex in any component (DESIGN_SYSTEM golden rule #1). Note in Todo.md that `OverviewCharts.tsx`
should migrate to these same tokens (it currently hardcodes hexes).

---

## Design constraints (non-negotiable)

- `StatCard` for KPIs; `Card` (rounded-lg, bordered header) for chart panels. **No
  cards-inside-cards** — a chart panel is one card, its content sits directly inside.
- Squarish; tokens only; recharts via the shadcn `ChartContainer` wrapper (`ui/chart.tsx`).
- Every deep section links out rather than trying to be the deep page.
- Skeleton while loading (copy `OverviewSkeleton` shape), `ApiError` on failure.

---

## Build order

1. **Phase 3 backend** (money-movement, revenue, treasury services + standalone endpoints) — the
   overview's data sources.
2. **Composing endpoint** `GET /admin/financials/overview` — reuses those services; returns the
   curated payload above; `rail_health`/`integrity` null until Phase 5.
3. **Overview UI** as the new first nav item (this document).
4. Treasury/Internal deep page (`/financials/internal`).
5. Phase 5 lands → `rail_health` + `integrity` populate → the two conditional strips light up with
   zero UI rework.

## Verification

- Backend: exercise `GET /admin/financials/overview` against the real DB; cross-check KPI totals
  against independent `psql` aggregates (as in Phase 1).
- UI: `browser-screenshot` at desktop + mobile widths; confirm StatCards match the screenshot,
  charts render in both light/dark, and the integrity/rail strips hide cleanly when null.
