import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle2, Circle, Clock, Mail, Send, Share2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import useGetRequest from '@/hooks/useGetRequests';
import usePostRequest from '@/hooks/usePostRequests';
import type { AccountOverviewData } from '@/types/UserTypes';
import type { QueryError } from '@/types/ResponseTypes';
import { formatDateToReadableShort, formatRelativeDateTime } from '@/services/TimeServices';
import handleOptionalData from '@/services/emptyDataServices';
import AddAdminNoteDialog from './AddAdminNoteDialog';
import ViewAllNotesDialog from './ViewAllNotesDialog';

type AccountOverviewResponse = {
  success: boolean;
  data: AccountOverviewData;
};

export default function OverviewTab({ userId }: { userId: string }) {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetRequest<AccountOverviewResponse, QueryError>({
    URL: `/admin/customer/${userId}/account-overview`,
    queryKey: ['user-account-overview', userId],
  });

  const { mutate: addNote, isPending: isAddingNote } = usePostRequest({
    URL: `/admin/customer/${userId}/notes`,
    mutationKey: ['add-admin-note', userId],
    successText: 'Note added successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-account-overview', userId] });
      setIsAddNoteOpen(false);
    },
  });

  const handleAddNote = (noteData: { title?: string; content: string }) => {
    addNote({
      title: noteData.title,
      content: noteData.content,
    });
  };

  const accountData = data?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Account Overview Skeleton */}
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Skeleton */}
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Notes Skeleton */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border h-full">
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const adminNotes = accountData?.admin_notes || [];
  const kycTiers = accountData?.kyc_tiers || [];
  const displayNotes = [...adminNotes].slice(0, 4).reverse();

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
                  <span className="text-sm font-medium">
                    {accountData?.joining_date ? formatDateToReadableShort(accountData.joining_date) : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EMAIL VERIFICATION</span>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className={cn("h-4 w-4", accountData?.email_verified ? "text-green-500" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", accountData?.email_verified ? "text-green-500" : "text-muted-foreground")}>
                    {accountData?.email_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">REFERRAL STATUS</span>
                <div className="mt-1 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {accountData?.referral_status?.is_referred
                      ? `Referred by ${accountData.referral_status.referrer_coffer_id}`
                      : 'No referral'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LAST LOGIN</span>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {accountData?.last_login
                      ? (
                        <>
                          {formatRelativeDateTime(accountData.last_login.date)}
                          {accountData.last_login.ip_address && (
                            <span className="text-muted-foreground font-normal text-xs ml-1">
                              ({accountData.last_login.ip_address})
                            </span>
                          )}
                        </>
                      )
                      : 'Never logged in'}
                  </span>
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coffer Id</span>
                <span className='text-sm font-medium'>{accountData?.user_header.coffer_id}</span>
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
              {/* Vertical Line */}
              <div className="absolute left-[18px] top-3 bottom-8 w-[2px] bg-border/60"></div>

              {kycTiers.map((tier, index) => {
                const isCompleted = tier.status === 'completed';
                const isPending = tier.status === 'pending';
                const isLast = index === kycTiers.length - 1;

                return (
                  <div key={tier.tier} className={cn("relative flex gap-4", !isLast && "mb-8")}>
                    <div className="relative z-10">
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 border-background shadow-sm flex items-center justify-center",
                        isCompleted ? "bg-primary" : isPending ? "bg-yellow-500" : "bg-muted"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className={cn("flex-1 pt-0.5", !isCompleted && !isPending && "opacity-50")}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {tier.tier === 'band_c' ? 'Band C' : tier.tier === 'band_b' ? 'Band B' : 'Band A'}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isCompleted ? `Verified - ${tier.label}` : isPending ? `Pending - ${tier.label}` : `Not Completed - ${tier.label}`}
                          </p>
                        </div>
                        {isCompleted && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary brightness-105 px-2 -mr-2">
                            View
                          </Button>
                        )}
                      </div>
                      {tier.completed_at && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeDateTime(tier.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Notes */}
      <div className="lg:col-span-1">
        <Card className="bg-card border-border h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-medium">Admin Notes</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary brightness-105 hover:bg-primary/10 h-auto py-1 px-2 text-xs font-medium"
              onClick={() => setIsAddNoteOpen(true)}
            >
              ADD NOTE
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {displayNotes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="p-3 rounded-full bg-muted/50 mb-3">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No notes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add a note to track user activity</p>
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {displayNotes.map((note) => (
                  <div key={note.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="text-white text-xs bg-primary">
                        {note.author_initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{note.author_name}</span>
                          {note.title && (
                            <span className='text-xs font-medium text-foreground/80 mt-0.5'>
                              {handleOptionalData(note.title)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap self-start mt-1">
                          {formatRelativeDateTime(note.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adminNotes.length > 4 && (
              <div className="mt-4 text-center">
                <Button variant="link" size="sm" onClick={() => setIsViewAllOpen(true)}>
                  View All Notes
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a note..."
                  className="w-full bg-secondary/50 border border-border rounded-lg py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  onFocus={() => setIsAddNoteOpen(true)}
                  readOnly
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-primary" onClick={() => setIsAddNoteOpen(true)}>
                  <Send className="h-3 w-3 rotate-45" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddAdminNoteDialog
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        onSubmit={handleAddNote}
        isSubmitting={isAddingNote}
      />

      <ViewAllNotesDialog
        open={isViewAllOpen}
        onOpenChange={setIsViewAllOpen}
        notes={adminNotes}
      />
    </div>
  );
}
