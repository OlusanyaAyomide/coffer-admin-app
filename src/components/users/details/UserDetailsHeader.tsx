import { Button } from '@/components/ui/button';
import { Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function UserDetailsHeader({ userId }: { userId: string }) {
  // Mock data for now
  const user = {
    name: 'Alex Sterling',
    id: '88203',
    status: 'Active',
    region: 'Nigeria',
    tier: 'Tier 3 Verified',
    lastActive: 'Today, 10:42 AM',
    avatarUrl: 'https://i.pravatar.cc/150?u=alex',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-background">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>AS</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{user.name}</h1>
            <span className="text-sm text-muted-foreground">ID: {user.id}</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
              {user.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>Region: {user.region}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{user.tier}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Last active: {user.lastActive}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Button className="bg-primary w-[160px] hover:bg-primary/80 text-white gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </div>
    </div>
  );
}
