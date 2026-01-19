import { Calendar, CheckCircle2, Circle, Clock, Mail, Send, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


export default function OverviewTab() {
  const accountInfo = {
    joiningDate: 'Oct 24, 2023',
    lastLogin: 'Today, 10:42 AM',
    lastLoginIp: '192.168.1.1',
    emailVerified: true,
    phoneVerified: true,
    phoneNumber: '+44 7700 900077',
    referralStatus: 'Referred by ID:9912',
    accountType: 'Premium Individual',
  };

  const adminNotes = [
    {
      author: 'Sarah Admin',
      date: 'Nov 12, 10:00 AM',
      content: 'User requested withdrawal limit increase. Approved based on tenure and clean history.',
      avatarColor: 'bg-primary',
    },
    {
      author: 'System Bot',
      date: 'Oct 26, 02:30 PM',
      content: 'Flagged login from new device (iPhone 14 Pro). User verified via 2FA SMS.',
      avatarColor: 'bg-indigo-500',
    },
    {
      author: 'Mike Compliance',
      date: 'Oct 24, 09:18 AM',
      content: 'Initial KYC approved. Tier 3 documents verified manually.',
      avatarColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Account Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Account Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">JOINING DATE</span>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{accountInfo.joiningDate}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EMAIL VERIFICATION</span>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Verified</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">REFERRAL STATUS</span>
                <div className="mt-1 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{accountInfo.referralStatus}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LAST LOGIN</span>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {accountInfo.lastLogin} <span className="text-muted-foreground font-normal text-xs">({accountInfo.lastLoginIp})</span>
                  </span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* KYC Tier Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">KYC Tier Progress</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              View All KYC
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="relative pl-2">
              {/* Vertical Line - Centered through the 24px circles */}
              <div className="absolute left-[18px] top-3 bottom-8 w-[2px] bg-border/60"></div>

              {/* Band C (Completed) */}
              <div className="relative flex gap-4 mb-8">
                <div className="relative z-10">
                  <div className="h-6 w-6 rounded-full bg-primary border-2 border-background shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Band C</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Verified - Basic Identity</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary brightness-105 px-2 -mr-2">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>Oct 24, 2023, 10:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Band B (Completed) */}
              <div className="relative flex gap-4 mb-8">
                <div className="relative z-10">
                  <div className="h-6 w-6 rounded-full bg-primary border-2 border-background shadow-sm flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Band B</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Verified - Address Proof</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:primary px-2 -mr-2">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>Oct 25, 2023, 02:30 PM</span>
                  </div>
                </div>
              </div>

              {/* Band A (Not Completed - Grayed Out) */}
              <div className="relative flex gap-4">
                <div className="relative z-10">
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background shadow-sm flex items-center justify-center">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 opacity-50 pt-0.5">
                  <h4 className="font-semibold text-sm text-foreground">Band A</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Not Completed - Advanced Due Diligence</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Notes */}
      <div className="lg:col-span-1">
        <Card className="bg-card border-border h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-medium">Admin Notes</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary brightness-105 hover:bg-primary/10 h-auto py-1 px-2 text-xs font-medium">
              ADD NOTE
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              {adminNotes.map((note, i) => (
                <div key={i} className="flex gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className={cn("text-white text-xs", note.avatarColor)}>
                      {note.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-medium">{note.author}</span>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">{note.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a note..."
                  className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-primary">
                  <Send className="h-3 w-3 rotate-45" /> {/* Using Share as send icon placeholder */}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
