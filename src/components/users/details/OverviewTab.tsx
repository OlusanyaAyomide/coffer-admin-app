import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, Smartphone, Share2, User } from 'lucide-react';
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

  const riskScore = 96;

  const adminNotes = [
    {
      author: 'Sarah Admin',
      date: 'Nov 12, 10:00 AM',
      content: 'User requested withdrawal limit increase. Approved based on tenure and clean history.',
      avatarColor: 'bg-blue-500',
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
                  <Share2 className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">{accountInfo.referralStatus}</span>
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

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PHONE VERIFICATION</span>
                <div className="mt-1 flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-500">Verified ({accountInfo.phoneNumber})</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ACCOUNT TYPE</span>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{accountInfo.accountType}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium">Risk Assessment</h3>
                <p className="text-sm text-muted-foreground max-w-lg mt-1">
                  User has passed all Tier 3 KYC checks. No suspicious login activity detected in the last 90 days.
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{riskScore}/100</div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">TRUST SCORE</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-medium mb-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 uppercase">
                  Low Risk
                </Badge>
                <div className="flex gap-8 text-muted-foreground">
                  <span className="text-foreground">Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-green-500 via-green-400 to-green-500 rounded-full"
                  style={{ width: `${riskScore}%` }}
                />
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
            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 h-auto py-1 px-2 text-xs font-medium">
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
                  <Share2 className="h-3 w-3 rotate-45" /> {/* Using Share as send icon placeholder */}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
