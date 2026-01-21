'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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

interface RequestMoreInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => void;
}

interface FormData {
  title: string;
  content: string;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
});

export default function RequestMoreInfoDialog({
  open,
  onOpenChange,
  onSubmit,
}: RequestMoreInfoDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data.title, data.content);
    reset();
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Request More Information</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <RequiredLabel>Title</RequiredLabel>
            <InputField<FormData>
              fieldName="title"
              register={register}
              error={errors.title?.message}
              placeHolderText="e.g., Additional document required"
              showPlaceholder
            />
          </div>

          <div>
            <RequiredLabel>Content</RequiredLabel>
            <TextAreaInput<FormData>
              fieldName="content"
              register={register}
              error={errors.content?.message}
              placeHolderText="Please provide details about what additional information is needed..."
              showPlaceholder
              className="h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" className='w-[160px]' variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
