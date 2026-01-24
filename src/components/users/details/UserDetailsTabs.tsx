import OverviewTab from './OverviewTab';
import WalletLedgerTab from './WalletLedgerTab';
import CofferPlansTab from './coffer/CofferPlansTab';
import CofferPlansContextProvider from './coffer/CofferPlansContextProvider';
import TransactionHistoryTab from './transactions/TransactionHistoryTab';
import TransactionHistoryContextProvider from './transactions/TransactionHistoryContextProvider';
import SecurityVerificationTab from './security/SecurityVerificationTab';
import KycInformationTab from './kyc/KycInformationTab';
import UserActivityLogTab from './activityLogs/UserActivityLogTab';
import ActivityLogContextProvider from './activityLogs/ActivityLogContextProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UserDetailsTabs({ userId }: { userId: string }) {
  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <div className="sticky top-16 z-30 bg-background pt-2 -mt-2 overflow-x-auto -mx-1 px-1">
        <TabsList className="w-max min-w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none space-x-6 flex-nowrap">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Wallet & Ledger
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Coffer Plans
          </TabsTrigger>
          <TabsTrigger
            value="locker"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Locker (MMF)
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Transactions History
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            Security & Verification
          </TabsTrigger>
          <TabsTrigger
            value="kyc"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            KYC Information
          </TabsTrigger>
          <TabsTrigger
            value="logs"
            className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
          >
            User Logs
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" className="space-y-6 mt-6">
        <OverviewTab userId={userId} />
      </TabsContent>

      <TabsContent value="wallet" className="space-y-6 mt-6">
        <WalletLedgerTab userId={userId} />
      </TabsContent>

      <TabsContent value="plans" className="mt-6">
        <CofferPlansContextProvider>
          <CofferPlansTab userId={userId} />
        </CofferPlansContextProvider>
      </TabsContent>
      <TabsContent value="locker" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Locker (MMF) Content</p>
        </div>
      </TabsContent>
      <TabsContent value="transactions" className="mt-6">
        <TransactionHistoryContextProvider>
          <TransactionHistoryTab userId={userId} />
        </TransactionHistoryContextProvider>
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <SecurityVerificationTab />
      </TabsContent>
      <TabsContent value="kyc" className="mt-6">
        <KycInformationTab />
      </TabsContent>
      <TabsContent value="logs" className="mt-6">
        <ActivityLogContextProvider>
          <UserActivityLogTab />
        </ActivityLogContextProvider>
      </TabsContent>
    </Tabs>
  );
}
