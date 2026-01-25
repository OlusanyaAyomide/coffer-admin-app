/**
 * Wallet Ledger Service
 * Utility functions for wallet ledger calculations and conversions
 */

import type { CurrencyType, WalletLedgerData } from '@/types/UserTypes';

export type { CurrencyType };

/**
 * Get total portfolio balance in the selected currency
 * Values are pre-calculated on the server
 *
 * @example
 * User has: 1 USDT + 500 NGN, Rate: 1500 NGN/USD
 * Server calculates:
 * - In USD: 1 + (500/1500) = 1.333 USD
 * - In NGN: (1 * 1500) + 500 = 2000 NGN
 */
export function getTotalPortfolio(params: {
  data: WalletLedgerData;
  currency: CurrencyType;
}): number {
  const { data, currency } = params;

  if (currency === 'USD') {
    return parseFloat(data.total_portfolio_in_usd) || 0;
  } else {
    return parseFloat(data.total_portfolio_in_ngn) || 0;
  }
}

/**
 * Get Coffer (investment) balance in selected currency
 * Shows ACTUAL user balance without conversion
 */
export function getCofferBalance(params: {
  data: WalletLedgerData;
  currency: CurrencyType;
}): { total: number; locked: number; available: number } {
  const { data, currency } = params;

  if (currency === 'USD') {
    const total = parseFloat(data.investment_wallet_usdt) || 0;
    // For now, all investment is locked
    return { total, locked: total, available: 0 };
  } else {
    const total = parseFloat(data.investment_wallet_ngn) || 0;
    return { total, locked: total, available: 0 };
  }
}

/**
 * Get Locker balance in selected currency
 * Returns 0 for now as feature is not implemented
 */
export function getLockerBalance(params: {
  data: WalletLedgerData;
  currency: CurrencyType;
}): { total: number; locked: number; available: number } {
  const { currency } = params;

  // TODO: Update when locker feature is implemented
  return { total: 0, locked: 0, available: 0 };
}

/**
 * Format currency with proper symbol and decimal places
 */
export function formatCurrency(params: {
  amount: number;
  currency: CurrencyType;
}): string {
  const { amount, currency } = params;

  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/**
 * Get currency distribution data for chart
 * Uses pre-calculated equivalent values from server
 */
export function getCurrencyDistribution(params: {
  data: WalletLedgerData;
  currency: CurrencyType;
}): { ngn: number; usd: number } {
  const { data, currency } = params;

  if (currency === 'USD') {
    // Both values already converted to USD equivalent
    return {
      ngn: parseFloat(data.currency_distribution_usd.ngn) || 0,
      usd: parseFloat(data.currency_distribution_usd.usd) || 0,
    };
  } else {
    // Both values already converted to NGN equivalent
    return {
      ngn: parseFloat(data.currency_distribution_ngn.ngn) || 0,
      usd: parseFloat(data.currency_distribution_ngn.usd) || 0,
    };
  }
}

/**
 * Get asset allocation data for chart
 * Shows ACTUAL balances by currency (not converted)
 */
export function getAssetAllocation(params: {
  data: WalletLedgerData;
  currency: CurrencyType;
}): { wallet: number; coffer: number; locker: number } {
  const { data, currency } = params;

  if (currency === 'USD') {
    // Show actual USD balances
    const wallet = parseFloat(data.crypto_wallet_balance_usdt) || 0;
    const coffer = parseFloat(data.investment_wallet_usdt) || 0;
    // TODO: Update when locker feature is implemented
    const locker = parseFloat(data.locker_balance_usdt) || 0;
    return { wallet, coffer, locker };
  } else {
    // Show actual NGN balances
    const wallet = parseFloat(data.fiat_wallet_balance_ngn) || 0;
    const coffer = parseFloat(data.investment_wallet_ngn) || 0;
    // TODO: Update when locker feature is implemented
    const locker = parseFloat(data.locker_balance_ngn) || 0;
    return { wallet, coffer, locker };
  }
}
