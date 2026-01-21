import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { formatDateToReadableShort } from '@/services/TimeServices';
import TextAreaInput from '@/components/shared/TextAreaInput';

interface AdminNote {
  id: string;
  content: string;
  created_at: string;
  admin_name: string;
}

interface KycAdminNotesProps {
  notes: Array<AdminNote>;
  onAddNote?: (content: string) => void;
}

interface FormData {
  note: string;
}

const schema = yup.object().shape({
  note: yup.string().required('Note content is required').min(5, 'Note must be at least 5 characters'),
});

export default function KycAdminNotes({ notes, onAddNote }: KycAdminNotesProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      note: '',
    },
  });

  const handleAddNote = (data: FormData) => {
    if (onAddNote) {
      onAddNote(data.note.trim());
      reset();
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold mb-4">Admin Notes</h3>

      {/* Add Note Input */}
      <form onSubmit={handleSubmit(handleAddNote)} className="space-y-3">
        <TextAreaInput<FormData>
          fieldName="note"
          register={register}
          error={errors.note?.message}
          placeHolderText="Add review notes here..."
          showPlaceholder
          className="max-h-[130px] bg-secondary/30 border-border resize-none"
        />
        <Button type="submit" size="sm">
          Add Note
        </Button>
      </form>

      {/* Existing Notes */}
      {notes.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Previous Notes</h4>
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <p className="text-sm">{note.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{note.admin_name}</span>
                <span>•</span>
                <span>{formatDateToReadableShort(note.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
