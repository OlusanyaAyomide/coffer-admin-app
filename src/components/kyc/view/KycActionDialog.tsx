'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { Resolver } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RequiredLabel from '@/components/shared/RequiredLabel';
import TextAreaInput from '@/components/shared/TextAreaInput';
import { validateRequiredString } from '@/services/ValidationServices';
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge';

export type KycActionType = 'approve' | 'reject' | 'more_info' | null;

interface KycActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: KycActionType;
  onSubmit: (data: { reason?: string }) => void;
  isSubmitting?: boolean;
}

interface ActionFormValues {
  reason: string;
}

export default function KycActionDialog({
  open,
  onOpenChange,
  actionType,
  onSubmit,
  isSubmitting = false,
}: KycActionDialogProps) {

  // Dynamic schema based on actionType
  const schema = yup.object().shape({
    reason: actionType === 'approve'
      ? yup.string()
      : validateRequiredString(actionType === 'more_info' ? 'Message' : 'Reason')
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ActionFormValues>({
    resolver: yupResolver(schema) as Resolver<ActionFormValues>,
    defaultValues: {
      reason: '',
    },
  });

  // Reset form when dialog opens/closes or action type changes
  useEffect(() => {
    if (open) {
      reset({ reason: '' });
    }
  }, [open, actionType, reset]);

  const handleFormSubmit = (data: ActionFormValues) => {
    onSubmit({
      reason: data.reason || undefined,
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (actionType) {
      case 'approve': return 'Approve KYC';
      case 'reject': return 'Reject KYC';
      case 'more_info': return 'Request More Info';
      default: return '';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'approve': return "Are you sure you want to approve this KYC submission? The user's account tier will be updated.";
      case 'reject': return "Please provide a reason for rejection.";
      case 'more_info': return "Specify the additional information required from the user.";
      default: return '';
    }
  };

  const getButtonVariant = () => {
    return actionType === 'reject' ? 'destructive' : 'default';
  };

  if (!actionType) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {actionType !== 'approve' && (
            <div>
              <RequiredLabel>
                {actionType === 'more_info' ? 'Message to User (Reason)' : 'Rejection Reason'}
              </RequiredLabel>
              <TextAreaInput<ActionFormValues>
                fieldName="reason"
                register={register}
                error={errors.reason?.message}
                placeHolderText="Enter details..."
                showPlaceholder
                className="h-[120px]"
              />
            </div>
          )}

          <DialogFooter>
            <Button className='w-[180px]' type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className='w-[180px]'
              variant={getButtonVariant()}
              disabled={isSubmitting}
            >
              {isSubmitting ? <LoadingIconSmall /> : 'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
