import { createFileRoute } from '@tanstack/react-router';
import { ArrowRight, BadgePercent, Settings2 } from 'lucide-react';

import TransitionLink from '@/components/layout/TransitionLink';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/_admin/locker/config')({
  component: LockerConfigPage,
});

const CONFIG_ITEMS = [
  {
    title: 'Rates',
    description:
      'Configure annual savings rates for Self-Lock, Goal-Lock, and Cabal.',
    href: '/locker/rates',
    icon: BadgePercent,
  },
  {
    title: 'Maturity Penalty',
    description:
      'Manage Goal-Lock pre-liquidation penalty ranges before maturity.',
    href: '/locker/maturity-penalty',
    icon: Settings2,
  },
];

function LockerConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">
          Locker Configuration
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage product-level settings that control locker rates and early
          withdrawal rules.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONFIG_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.href} className="p-0">
              <div className="h-1 w-full bg-brand" />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm">
                  <TransitionLink to={item.href}>
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </TransitionLink>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
