import type { AdminNote } from '@/types/UserTypes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface LatestNoteCardProps {
  note: AdminNote | null;
  onViewAllNotes?: () => void;
}

export default function LatestNoteCard({ note, onViewAllNotes }: LatestNoteCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold mb-4">Latest Note</h3>

      {note ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {note.author_initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{note.author_name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateToReadableShort(note.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                {note.content}
              </p>
            </div>
          </div>

          {onViewAllNotes && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-transparent p-0 h-auto font-medium"
              onClick={onViewAllNotes}
            >
              VIEW ALL NOTES
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      )}
    </div>
  );
}
