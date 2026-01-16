import { Wallet, ArrowDownLeft, ArrowUpRight, Coins, Users, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function UserDetailsStats() {
  const stats = [
    {
      title: 'MAIN BALANCE',
      value: '$12,450.00',
      change: '+2.5%',
      isPositive: true,
      icon: Wallet,
      iconColor: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'TOTAL DEPOSITS',
      value: '$45,200.00',
      change: '+12%',
      isPositive: true,
      icon: ArrowDownLeft,
      iconColor: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'WITHDRAWALS',
      value: '$10,150.00',
      subtext: 'Avg',
      icon: ArrowUpRight,
      iconColor: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'PAYMENTS',
      value: '$5,320.00',
      change: '+1.2%',
      isPositive: true,
      icon: Coins,
      iconColor: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'REF. EARNINGS',
      value: '$1,200.00',
      change: '+8%',
      isPositive: true,
      icon: Users,
      iconColor: 'bg-indigo-500/10 text-indigo-500',
    },
    {
      title: 'ACTIVE PRODUCTS',
      value: '3',
      subtext: 'Standard Plan',
      icon: Layers,
      iconColor: 'bg-gray-500/10 text-gray-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-card border-border overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={cn("p-1.5 rounded-md", stat.iconColor)}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">{stat.value}</span>
              <div className="text-xs flex items-center gap-1">
                {stat.change ? (
                  <span className={cn(
                    "font-medium",
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  )}>
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{stat.subtext}</span>
                )}
                {stat.change && (
                  <ArrowUpRight className={cn(
                    "h-3 w-3",
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  )} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
