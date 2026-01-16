import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import WalletLedgerTab from './WalletLedgerTab';

export default function UserDetailsTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none space-x-6">
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
          value="profile"
          className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
        >
          Profile & Contact
        </TabsTrigger>
        <TabsTrigger
          value="logs"
          className="rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
        >
          Admin Actions & Logs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-6">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="wallet" className="space-y-6 mt-6">
        <WalletLedgerTab />
      </TabsContent>

      {/* Placeholders for other tabs */}
      <TabsContent value="plans" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Coffer Plans Content</p>
        </div>
      </TabsContent>
      <TabsContent value="locker" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Locker (MMF) Content</p>
        </div>
      </TabsContent>
      <TabsContent value="transactions" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Transactions History Content</p>
        </div>
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Security & Verification Content</p>
        </div>
      </TabsContent>
      <TabsContent value="profile" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Profile & Contact Content</p>
        </div>
      </TabsContent>
      <TabsContent value="logs" className="mt-6">
        <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">Admin Actions & Logs Content</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
