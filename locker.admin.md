# Locker Admin Implementation Plan

Last read-through: 2026-06-26

Scope: admin surfaces for Locker across Self-Lock, Goal-Lock, and Cabal, grounded in the current backend (`coffer/`), admin app (`coffer-admin/`), mobile cabal discovery flow, `workflow/LockerSpec.md`, and `coffer-admin/DESIGN_SYSTEM.md`.

## Product Goal

Admin should be able to:

- See platform-level Locker analytics over a filterable time range.
- Inspect every locker created across Self-Lock, Goal-Lock, and Cabal.
- Open a user and see that user's Self-Locks, Goal-Locks, and Cabal memberships.
- Curate Cabals shown in the mobile "Coffer picks" rail.
- Manually create and manage platform/company Cabals from admin.

## Current Flow Read

### User/mobile locker flow

The user Locker backend is under `coffer/src/user/locker`.

- Self-Lock: solo savings with `SelfLock`, `locked_amount`, `total_deposited`, `interest_earned`, `maturity_date`, and `status`.
- Goal-Lock: solo recurring goal with `GoalLock`, target/contribution schedule fields, failed debit fields, and same savings balances.
- Cabal: group savings with `GroupSaving` plus `GroupSavingMember`. The mobile discovery flow reads public/featured Cabals from `/locker/cabal/overview` and `/locker/cabal/public`, where featured Cabals are public active/pending Cabals with `is_featured = true`, sorted by `importance`.
- Interest and audit events are tracked through `SavingsLog`.
- Automation is already in queue workflows for self-lock, goal-lock, and cabal interest/accrual/maturity flows.

The mobile design shown maps directly to `GroupSaving.is_featured` and `importance`: "Coffer picks" should be admin-curated Cabals, not a separate content model unless product wants editorial cards detached from real Cabals.

### Admin backend flow

The admin Locker backend is under `coffer/src/admin/locker`.

Already available:

- Rates:
  - `GET /admin/locker/rates`
  - `GET /admin/locker/rates/history/:type`
  - `POST /admin/locker/rate`
- Pre-liquidation policy:
  - `GET /admin/locker/pre-liquidation-penalty/:type`
  - `PUT /admin/locker/pre-liquidation-penalty/:type`
  - Currently enforced as Goal-Lock only.
- Categories:
  - `GET /admin/locker/categories`
  - `GET /admin/locker/category/:id`
  - `POST /admin/locker/category`
  - `PUT /admin/locker/category/:id`
  - `DELETE /admin/locker/category/:id`
- Cabals:
  - `GET /admin/locker/cabals`
  - `GET /admin/locker/cabal/:id`
  - `POST /admin/locker/cabal`
  - `PATCH /admin/locker/cabal/:id`
  - `PATCH /admin/locker/cabal/:id/feature`
  - `PATCH /admin/locker/cabal/:id/close`
  - `PATCH /admin/locker/cabal/:cabalId/member/:memberId/status`
  - `PATCH /admin/locker/cabal/:cabalId/member/:memberId/role`

Missing backend:

- No platform-wide locker analytics endpoint.
- No admin listing/detail endpoints for Self-Locks and Goal-Locks.
- No per-user locker endpoint under `admin/customer`.
- Wallet ledger still hardcodes locker balances to zero in `AdminOverviewService.getWalletLedger`.
- Admin docs are not fully updated for newer Cabal list/detail/action endpoints.

### Admin frontend flow

The admin app is under `coffer-admin`.

Already available:

- `/_admin/locker/config`: links to Rates and Maturity Penalty.
- `/_admin/locker/rates`: built rate manager.
- `/_admin/locker/maturity-penalty`: built Goal-Lock penalty editor.
- `/_admin/locker/categories`: built category management.
- `/_admin/locker/cabals`: built Cabal directory with search, filters, sorting, preview sheet, and "New cabal".
- `/_admin/locker/cabals/$cabalId`: built Cabal detail page with stats, members, invitations, activity, edit config, feature/unfeature, close, member suspend/reinstate, and role changes.

Missing frontend:

- `/_admin/locker/analytics` is still `Locker Analytics (Not Implemented)`.
- `/_admin/locker/rules` is still `Auto-Save Rules (Not Implemented)`.
- User detail tab `Locker (MMF)` is a placeholder and does not show Self-Lock, Goal-Lock, or Cabal membership data.
- Wallet ledger locker card still renders zero because the backend returns zero.

## Clarifying Questions

1. Should "interest paid out" mean only interest already paid to users on matured/closed locks, while "interest accrued" means current unpaid liability on active/matured-but-unpaid locks?
2. Should platform analytics convert NGN and USDT into one reporting currency, or always show split values plus optional converted totals?
3. For time filters, should analytics use `created_at`, deposit date from `SavingsLog`, maturity date, or payout/closure date depending on the metric?
4. Should admins be able to manually create Self-Locks or Goal-Locks for a user, or only inspect them?
5. For Cabal "top picks", should admin enforce the existing backend cap of 5 featured Cabals, or should this cap become configurable?
6. Should admin-created Cabals always remain public company/system Cabals, as the current backend forces, or should admins also create private/regular Cabals?
7. Should the user detail Locker tab allow operational actions, such as disabling auto-debit, suspending a lock, or forcing closure, or should it be read-only in this phase?

## Data Definitions

Use these source fields consistently:

- Self-Lock capital: `SelfLock.locked_amount` or `SelfLock.total_deposited` depending on whether we need current principal or lifetime deposits.
- Goal-Lock capital: `GoalLock.locked_amount` or `GoalLock.total_deposited`.
- Cabal member capital: `GroupSavingMember.total_contributed`.
- Accrued interest/liability: `interest_earned` on active/matured Self-Locks, Goal-Locks, and active Cabal members.
- Interest paid: derive from payout/withdrawal events in `SavingsLog` and/or transaction entries once confirmed.
- Deposits: `SavingsLog.event = deposit` and/or `Entry` records linked to the lock/member.
- Failed debit health: `failed_debit_count`, `last_failed_debit_at`, `re_attempt_date_at`, and `SavingsLog.event = debit_failed`.

## Step-by-Step Approach

### Phase 1: Backend analytics foundation

Add a new admin service, for example `LockerAnalyticsService`, under `coffer/src/admin/locker/service`.

Add:

- `GET /admin/locker/analytics/overview`
- Query params:
  - `from`
  - `to`
  - `currency`
  - `type` (`self_lock`, `goal_lock`, `cabal`, or all)
  - optional `status`
  - optional `category_id`

Return:

- Total current capital in locker, split by NGN/USDT.
- Total interest accrued/unpaid, split by NGN/USDT.
- Total interest paid out, once payout source is confirmed.
- Active, matured/completed, closed, suspended counts by product.
- New lockers created over time.
- Deposits over time.
- Maturities over time.
- Failed debit count and failed debit rate.
- Cabal-specific summary: featured count, company group count, total members, average consistency score, promotional bonus exposure.

Implementation notes:

- Aggregate Self-Lock and Goal-Lock directly from their models.
- Aggregate Cabal money from `GroupSavingMember`, joined to `GroupSaving` for category/status/date filters.
- Use `SavingsLog` for event-based time series.
- Keep NGN and USDT split in the backend response. Add converted totals only if a reliable reporting rate is available.

### Phase 2: Backend admin listing/detail for Self-Lock and Goal-Lock

Add endpoints:

- `GET /admin/locker/self-locks`
- `GET /admin/locker/self-lock/:id`
- `GET /admin/locker/goal-locks`
- `GET /admin/locker/goal-lock/:id`

List filters:

- `page`, `limit`, `search`
- `user_id`
- `currency`
- `status`
- `category_id`
- `created_from`, `created_to`
- `maturity_from`, `maturity_to`
- `sort_by`, `order`

Detail payload should include:

- Core lock fields.
- User summary (`id`, `coffer_id`, name, email, status).
- Category.
- Financial summary: principal/current capital, total deposits, interest earned, estimated daily interest if active.
- Auto-debit fields for Goal-Lock.
- Recent `SavingsLog` timeline.
- Linked entries/transactions if needed for audit.

### Phase 3: Backend per-user locker view

Add a customer-module endpoint:

- `GET /admin/customer/:id/locker`

Return:

- Overview totals by product and currency.
- `self_locks[]`
- `goal_locks[]`
- `cabals[]` representing `GroupSavingMember` records with nested Cabal summary.
- Recent combined `SavingsLog` timeline.

Recommended response shape:

```ts
{
  overview: {
    ngn: { capital: string; interest_accrued: string; total: string };
    usdt: { capital: string; interest_accrued: string; total: string };
    counts: { self_lock: number; goal_lock: number; cabal: number };
  };
  self_locks: Array<...>;
  goal_locks: Array<...>;
  cabals: Array<...>;
  recent_activity: Array<...>;
}
```

Then update `AdminOverviewService.getWalletLedger`:

- Replace `lockerNgn = 0` and `lockerUsdt = 0`.
- Compute locker balances from active/matured Self-Lock + Goal-Lock + active Cabal memberships.
- Return `locker_balance_ngn` and `locker_balance_usdt` as real values.

Then update `coffer-admin/src/services/WalletLedgerService.ts`:

- Make `getLockerBalance` read `data.locker_balance_ngn` and `data.locker_balance_usdt`.
- Remove the placeholder zero logic.

### Phase 4: Admin UI for platform analytics

Build `coffer-admin/src/routes/_admin/locker/analytics.tsx` using the design system.

Screen structure:

- Header: "Locker Analytics".
- Filter bar:
  - Date range.
  - Product type.
  - Currency.
  - Status.
  - Category.
- KPI cards using `StatCard`:
  - Total capital locked.
  - Interest accrued/liability.
  - Interest paid out.
  - Active lockers.
  - Failed debit rate.
  - Cabal members.
- Tabs:
  - Overview.
  - Self-Lock.
  - Goal-Lock.
  - Cabal.
- Tables:
  - Recent lockers.
  - Maturing soon.
  - Failed debit queue.
  - Top Cabals by members/contributions.

Design constraints from `DESIGN_SYSTEM.md`:

- Use tokens and shared components.
- Use navy-header data tables.
- Use right-side Sheets for details.
- Use `LOCKER_TYPE_THEME` for per-product color.
- Avoid centered dialogs and rounded-pill styling.

### Phase 5: Admin UI for all lockers

Either:

- Add separate routes:
  - `/locker/self-locks`
  - `/locker/goal-locks`
  - keep `/locker/cabals`

Or:

- Add a single `/locker/locks` page with product tabs.

Recommended: a single `/locker/locks` page after analytics, because admins need one place to search through all locker instruments.

Page behavior:

- Tabs: Self-Lock, Goal-Lock, Cabal.
- Shared filters: search, status, currency, category, date range.
- Product-specific columns:
  - Self-Lock: user, title, amount, interest, maturity, status.
  - Goal-Lock: user, title, target, contribution schedule, failed debits, next debit, status.
  - Cabal: reuse existing Cabal table or link to `/locker/cabals`.
- Detail Sheet for Self-Lock and Goal-Lock.
- Cabal continues to use existing full detail page.

### Phase 6: User detail Locker tab

Replace the placeholder in `coffer-admin/src/components/users/details/UserDetailsTabs.tsx`.

Add:

- `LockerTab` component.
- `useUserLocker` hook calling `/admin/customer/:id/locker`.
- Summary cards:
  - Total locker balance.
  - Self-Lock count/value.
  - Goal-Lock count/value.
  - Cabal membership count/value.
  - Interest accrued.
- Product tabs:
  - Self-Lock table.
  - Goal-Lock table.
  - Cabal memberships table.
  - Activity timeline.
- Detail Sheets:
  - Self-Lock details.
  - Goal-Lock details.
  - Cabal membership details with link to Cabal page.

This directly fixes the current issue: admin can open a user and see all lockers tied to that user.

### Phase 7: Cabal curation polish

Most Cabal admin functionality already exists. Polish and verify:

- Confirm the `/locker/cabals` list includes `is_company_group` filter in UI if needed.
- Make `importance` editable from the quick feature action, not only the full edit form.
- Show "Coffer picks" preview order somewhere in admin:
  - filter `is_featured = true`
  - sort `importance desc`
  - show rank 1 to 5
- Preserve backend cap `MAX_FEATURED_CABALS = 5` unless product changes it.
- Ensure the Cabal image shown in admin is the same image mobile uses in "Coffer picks".
- Update the Cabal docs in `coffer/src/admin/locker/Locker.md` for list/detail/feature/member actions if incomplete.

### Phase 8: Testing and verification

Backend tests:

- Analytics aggregation for each product.
- Currency split behavior.
- Date range behavior.
- Per-user locker totals.
- Wallet ledger locker balance.
- Cabal featured cap and ordering.

Frontend checks:

- Analytics renders loading/empty/error/data states.
- Filters change query params and invalidate/refetch correctly.
- User Locker tab handles users with no lockers.
- User Locker tab handles mixed Self-Lock, Goal-Lock, and Cabal records.
- Cabal create/edit still creates public company/system Cabals.
- Cabal top-pick toggle updates list/detail and mobile-facing fields.

## Suggested Implementation Order

1. Build backend per-user locker endpoint.
2. Fix wallet ledger locker balances.
3. Build user detail Locker tab.
4. Build backend analytics endpoint.
5. Build analytics page.
6. Add Self-Lock and Goal-Lock admin list/detail endpoints.
7. Build all-lockers admin listing.
8. Polish Cabal top-pick controls and docs.

This order fixes the most visible admin gap first: user detail pages currently cannot show a user's locker activity.

## Files Most Likely To Change

Backend:

- `coffer/src/admin/locker/locker.controller.ts`
- `coffer/src/admin/locker/locker.module.ts`
- `coffer/src/admin/locker/dto/locker.dto.ts`
- `coffer/src/admin/locker/service/*`
- `coffer/src/admin/customer/customer.controller.ts`
- `coffer/src/admin/customer/customer.module.ts`
- `coffer/src/admin/customer/services/overview.action.service.ts`
- New `coffer/src/admin/customer/services/customer.locker.service.ts`

Admin frontend:

- `coffer-admin/src/routes/_admin/locker/analytics.tsx`
- New `coffer-admin/src/routes/_admin/locker/locks.tsx` or per-product routes.
- `coffer-admin/src/components/users/details/UserDetailsTabs.tsx`
- New `coffer-admin/src/components/users/details/locker/*`
- `coffer-admin/src/types/LockerTypes.ts`
- `coffer-admin/src/types/UserTypes.ts`
- `coffer-admin/src/services/WalletLedgerService.ts`
- New hooks such as `useLockerAnalytics`, `useUserLocker`, `useAdminSelfLocks`, and `useAdminGoalLocks`.

Navigation:

- `coffer-admin/src/static/adminLayoutStatic.tsx`
  - Add "All Lockers" if using `/locker/locks`.
  - Keep "Cabals" as a direct curation/admin route.

## Done Criteria

- Admin analytics page answers: total capital in locker, interest accrued, interest paid, active counts, failed debit health, and Cabal top-pick performance over a selected time range.
- User detail page shows Self-Lock, Goal-Lock, and Cabal membership data.
- Wallet ledger locker balances are no longer zero placeholders.
- Admin can search/filter all lockers.
- Admin can create a Cabal and mark/unmark Cabals as Coffer picks/top picks.
- Admin UI follows `coffer-admin/DESIGN_SYSTEM.md`.
- Backend and frontend tests cover aggregation and core display states.
