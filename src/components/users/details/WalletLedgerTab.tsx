import { useState } from 'react';
import TotalPortfolioCard from './wallet-ledger/TotalPortfolioCard';
import CofferBalanceCard from './wallet-ledger/CofferBalanceCard';
import LockerBalanceCard from './wallet-ledger/LockerBalanceCard';
import CurrencyDistributionChart from './wallet-ledger/CurrencyDistributionChart';
import AssetAllocationChart from './wallet-ledger/AssetAllocationChart';
import { BalanceCardSkeleton, ChartSkeleton, TotalPortfolioSkeleton } from './wallet-ledger/WalletLedgerSkeletons';
import type { QueryError } from '@/types/ResponseTypes';
import type { CurrencyType, WalletLedgerResponse } from '@/types/UserTypes';
import useGetRequest from '@/hooks/useGetRequests';

interface WalletLedgerTabProps {
  userId: string;
}

export default function WalletLedgerTab({ userId }: WalletLedgerTabProps) {
  const [portfolioCurrency, setPortfolioCurrency] = useState<CurrencyType>('USD');
  const [cofferCurrency, setCofferCurrency] = useState<CurrencyType>('USD');
  const [lockerCurrency, setLockerCurrency] = useState<CurrencyType>('USD');
  const [assetAllocationCurrency, setAssetAllocationCurrency] = useState<CurrencyType>('USD');

  const { data, isLoading } = useGetRequest<WalletLedgerResponse, QueryError>({
    URL: `/admin/customer/${userId}/wallet-ledger`,
    queryKey: ['user-wallet-ledger', userId],
  });

  const walletData = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TotalPortfolioSkeleton />
          <BalanceCardSkeleton />
          <BalanceCardSkeleton />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Failed to load wallet data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Balance Card */}
        <TotalPortfolioCard
          data={walletData}
          currency={portfolioCurrency}
          onCurrencyChange={setPortfolioCurrency}
        />

        {/* Coffer Balance Card */}
        <CofferBalanceCard
          data={walletData}
          currency={cofferCurrency}
          onCurrencyChange={setCofferCurrency}
        />

        {/* Locker Balance Card */}
        <LockerBalanceCard
          data={walletData}
          currency={lockerCurrency}
          onCurrencyChange={setLockerCurrency}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Distribution Chart */}
        <CurrencyDistributionChart data={walletData} currency={portfolioCurrency} />

        {/* Asset Allocation Chart */}
        <AssetAllocationChart
          data={walletData}
          currency={assetAllocationCurrency}
          onCurrencyChange={setAssetAllocationCurrency}
        />
      </div>
    </div>
  );
}
