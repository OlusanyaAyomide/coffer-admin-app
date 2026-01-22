'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRelativeDateTime } from '@/services/TimeServices';
import handleOptionalData from '@/services/emptyDataServices';
import type { AdminNote } from '@/types/UserTypes';

interface ViewAllNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: AdminNote[];
}

export default function ViewAllNotesDialog({
  open,
  onOpenChange,
  notes,
}: ViewAllNotesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>All Admin Notes</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-4">
            {notes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No notes found.</p>
            ) : (
              [...notes].reverse().map((note) => (
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
                          <span className="text-xs font-medium text-foreground/80 mt-0.5">
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
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
