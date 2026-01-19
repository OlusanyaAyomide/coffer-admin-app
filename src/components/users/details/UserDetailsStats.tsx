import { Wallet, ArrowDownLeft, ArrowUpRight, Coins, Users, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function UserDetailsStats() {
  const stats = [
    {
      title: 'USDT BALANCE',
      value: '$12,450.00',
      icon: Wallet,
      iconColor: 'bg-primary/10 text-primary',
    },
    {
      title: 'NGN BALANCE',
      value: '₦4,500,200.00',
      icon: Coins,
      iconColor: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'TOTAL SENT',
      value: '$5,320.00',
      icon: ArrowUpRight,
      iconColor: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'REFERRAL EARNINGS',
      value: '$1,200.00',
      icon: Users,
      iconColor: 'bg-indigo-500/10 text-indigo-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
