import { createFileRoute } from '@tanstack/react-router';

import InvestmentsTable from '@/components/coffer/InvestmentsTable';

export const Route = createFileRoute('/_admin/coffer/active')({
  component: ActiveCoffersPage,
});

function ActiveCoffersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Active Coffers</h1>
        <p className="text-muted-foreground">
          Investments that have started and are accruing returns for investors.
        </p>
      </div>

      <InvestmentsTable fixedStatus="active" />
    </div>
  );
}
