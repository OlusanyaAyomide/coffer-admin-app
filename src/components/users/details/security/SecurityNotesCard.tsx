import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import AddAdminNoteDialog from '../AddAdminNoteDialog';
import ViewAllNotesDialog from '../ViewAllNotesDialog';
import type { AdminNote } from '@/types/UserTypes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeDateTime } from '@/services/TimeServices';
import handleOptionalData from '@/services/emptyDataServices';
import usePostRequest from '@/hooks/usePostRequests';

interface SecurityNotesCardProps {
  notes: Array<AdminNote>;
  userId: string;
  latestKycSubmissionId?: string;
  onSuccess: () => void;
}

interface NoteForm {
  title?: string;
  content: string;
}

export default function SecurityNotesCard({
  notes,
  userId,
  latestKycSubmissionId,
  onSuccess,
}: SecurityNotesCardProps) {
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  const displayNotes = [...notes].slice(0, 4);

  const { mutate: addNote, isPending } = usePostRequest<void, NoteForm & { kycId?: string }>({
    URL: `/admin/customer/${userId}/notes`,
    mutationKey: ['add-admin-note', userId],
    showErrorToast: true,
    successText: 'Note added successfully',
    onSuccess: () => {
      setIsAddNoteOpen(false);
      onSuccess();
    },
  });

  const handleAddNote = (data: NoteForm) => {
    addNote({
      ...data,
      kycId: latestKycSubmissionId,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col">
      <div className="p-5 pb-4 flex flex-row items-center justify-between border-b border-border/50">
        <h3 className="text-base font-semibold">Security Notes</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary brightness-105 hover:bg-primary/10 h-auto py-1 px-2 text-xs font-medium"
          onClick={() => setIsAddNoteOpen(true)}
        >
          ADD NOTE
        </Button>
      </div>

      <div className="p-5 pt-4 flex-col">
        {displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notes yet</p>
          </div>
        ) : (
          <div className="space-y-5 flex-1">
            {displayNotes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarFallback className="text-white text-xs bg-primary">
                    {note.author_initial}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full min-w-0">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{note.author_name}</span>
                      {note.title && (
                        <span className='text-xs font-medium text-foreground/80 mt-0.5 truncate'>
                          {handleOptionalData(note.title)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap self-start mt-0.5">
                      {formatRelativeDateTime(note.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {note.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {notes.length > 4 && (
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
      </div>

      <AddAdminNoteDialog
        open={isAddNoteOpen}
        onOpenChange={setIsAddNoteOpen}
        onSubmit={handleAddNote}
        isSubmitting={isPending}
      />

      <ViewAllNotesDialog
        open={isViewAllOpen}
        onOpenChange={setIsViewAllOpen}
        notes={notes}
      />
    </div>
  );
}
