import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import InvestmentsTable from '@/components/coffer/InvestmentsTable';
import InvestmentFormSheet from '@/components/coffer/InvestmentFormSheet';

export const Route = createFileRoute('/_admin/coffer/marketplace')({
  component: MarketplacePage,
});

function MarketplacePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Marketplace</h1>
        <p className="text-muted-foreground">
          Create and manage every investment asset. Open one to manage media,
          dividends, status and investors.
        </p>
      </div>

      <InvestmentsTable
        action={
          <InvestmentFormSheet
            onSaved={(id) => {
              if (id) {
                navigate({
                  to: '/coffer/$investmentId',
                  params: { investmentId: id },
                });
              }
            }}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New investment
              </Button>
            }
          />
        }
      />
    </div>
  );
}
