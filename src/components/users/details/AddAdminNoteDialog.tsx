'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Resolver } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RequiredLabel from '@/components/shared/RequiredLabel';
import InputField from '@/components/shared/InputField';
import TextAreaInput from '@/components/shared/TextAreaInput';
import { validateOptionalString, validateRequiredString } from '@/services/ValidationServices';
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge';

interface AddAdminNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title?: string; content: string }) => void;
  isSubmitting?: boolean;
}

interface NoteFormValues {
  title?: string;
  content: string;
}

const schema = yup.object().shape({
  title: validateOptionalString(),
  content: validateRequiredString("content")
});

export default function AddAdminNoteDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddAdminNoteDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoteFormValues>({
    resolver: yupResolver(schema) as Resolver<NoteFormValues>,
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const handleFormSubmit = (data: NoteFormValues) => {
    onSubmit({
      title: data.title || undefined,
      content: data.content,
    });
    // Reset handled by parent or on close to allow error handling preservation if needed
    // But typically we reset on success. Here we'll reset when closing.
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Add Admin Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <div className="mb-2">Title <span className="text-muted-foreground text-xs font-normal ml-1">(Optional)</span></div>
            <InputField<NoteFormValues>
              fieldName="title"
              register={register}
              error={errors.title?.message}
              placeHolderText="e.g., Verification Update"
              showPlaceholder
            />
          </div>

          <div>
            <RequiredLabel>Content</RequiredLabel>
            <TextAreaInput<NoteFormValues>
              fieldName="content"
              register={register}
              error={errors.content?.message}
              placeHolderText="Enter note content..."
              showPlaceholder
              className="h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" className='w-[160px]' variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button className='w-[160px]' type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoadingIconSmall /> : "Add Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
