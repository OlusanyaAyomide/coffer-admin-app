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

interface RejectKycDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => void;
  userName: string;
}

interface FormData {
  title: string;
  content: string;
}

const schema = yup.object().shape({
  title: yup.string().required('Rejection title is required'),
  content: yup.string().required('Rejection reason is required').min(10, 'Reason must be at least 10 characters'),
});

export default function RejectKycDialog({
  open,
  onOpenChange,
  onSubmit,
  userName,
}: RejectKycDialogProps) {
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
          <DialogTitle>Reject KYC Submission</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Rejecting <strong>{userName}'s</strong> KYC submission
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <RequiredLabel>Rejection Title</RequiredLabel>
            <InputField<FormData>
              fieldName="title"
              register={register}
              error={errors.title?.message}
              placeHolderText="e.g., Document verification failed"
              showPlaceholder
            />
          </div>

          <div>
            <RequiredLabel>Rejection Reason</RequiredLabel>
            <TextAreaInput<FormData>
              fieldName="content"
              register={register}
              error={errors.content?.message}
              placeHolderText="Please provide detailed reason for rejecting this KYC submission..."
              showPlaceholder
              className="h-[120px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" className='w-[160px]' variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject KYC
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
