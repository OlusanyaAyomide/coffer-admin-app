import { describe, expect, it } from 'vitest'

import { investmentDisplayStatus } from './cofferFormat'
import type { AdminInvestmentStatus } from '@/types/InvestmentTypes'

/**
 * The badge rule: inventory outranks the lifecycle, but only where units are
 * still the point. "Active" next to `5000 / 5000` claims there is something left
 * to sell; "Matured" on a finished plan is more meaningful than "Sold out".
 */
describe('investmentDisplayStatus', () => {
  const investment = (
    status: AdminInvestmentStatus,
    units_sold: number,
    total_units = 100,
  ) => ({ status, units_sold, total_units })

  it('reads Sold out for an active plan with no units left', () => {
    expect(investmentDisplayStatus(investment('active', 100)).label).toBe(
      'Sold out',
    )
  })

  it('reads Sold out for an awaiting_start plan with no units left', () => {
    expect(
      investmentDisplayStatus(investment('awaiting_start', 100)).label,
    ).toBe('Sold out')
  })

  it('keeps Active while units remain', () => {
    expect(investmentDisplayStatus(investment('active', 99)).label).toBe(
      'Active',
    )
  })

  it('treats oversold units as sold out', () => {
    expect(investmentDisplayStatus(investment('active', 101)).label).toBe(
      'Sold out',
    )
  })

  it('keeps Matured for a finished plan, even with no units left', () => {
    expect(investmentDisplayStatus(investment('matured', 100)).label).toBe(
      'Matured',
    )
  })

  it('keeps Cancelled for a cancelled plan with no units left', () => {
    expect(investmentDisplayStatus(investment('cancelled', 100)).label).toBe(
      'Cancelled',
    )
  })

  it('badges Sold out neutrally rather than as a failure', () => {
    expect(investmentDisplayStatus(investment('active', 100)).variant).toBe(
      'secondary',
    )
  })

  it('keeps the normal status variant when not sold out', () => {
    expect(investmentDisplayStatus(investment('active', 0)).variant).toBe(
      'default',
    )
  })

  it('reads a zero-unit plan as sold out', () => {
    // `0 >= 0` holds, so a plan configured with no units at all reads as sold
    // out. Documenting rather than guarding: total_units is required and
    // positive on create, so this is a degenerate state, and "Sold out" is a
    // fair description of a plan with nothing to sell.
    expect(investmentDisplayStatus(investment('active', 0, 0)).label).toBe(
      'Sold out',
    )
  })
})
