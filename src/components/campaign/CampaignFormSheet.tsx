import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  AudienceFilter,
  Campaign,
  CampaignChannel,
} from '@/types/CampaignTypes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import AudienceFilterFields from '@/components/campaign/AudienceFilterFields';
import AudiencePreview from '@/components/campaign/AudiencePreview';
import ScheduleFields from '@/components/campaign/ScheduleFields';
import type { ScheduleValue } from '@/components/campaign/ScheduleFields';
import useSaveCampaign from '@/hooks/useSaveCampaign';
import useEmailTemplates from '@/hooks/useEmailTemplates';

type CampaignFormSheetProps = {
  /** Provide to edit; omit to create. */
  campaign?: Campaign;
  /** Channel for a new campaign; ignored when editing. */
  defaultChannel: CampaignChannel;
  trigger: ReactNode;
};

const EMPTY_SCHEDULE: ScheduleValue = {
  schedule_kind: 'immediate',
  scheduled_at: '',
  cron_expression: '',
};

export default function CampaignFormSheet({
  campaign,
  defaultChannel,
  trigger,
}: CampaignFormSheetProps) {
  const isEdit = Boolean(campaign);
  const channel = campaign?.channel ?? defaultChannel;
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [subjectOverride, setSubjectOverride] = useState('');
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [audience, setAudience] = useState<AudienceFilter>({ all: true });
  const [schedule, setSchedule] = useState<ScheduleValue>(EMPTY_SCHEDULE);

  const { templates } = useEmailTemplates({
    limit: 200,
    enabled: open && channel === 'email',
  });

  useEffect(() => {
    if (!open) return;
    setName(campaign?.name ?? '');
    setDescription(campaign?.description ?? '');
    setTemplateId(campaign?.template_id ?? '');
    setSubjectOverride(campaign?.subject_override ?? '');
    setPushTitle(campaign?.push_title ?? '');
    setPushBody(campaign?.push_body ?? '');
    setAudience(campaign?.audience ?? { all: true });
    setSchedule({
      schedule_kind: campaign?.schedule_kind ?? 'immediate',
      scheduled_at: campaign?.scheduled_at ?? '',
      cron_expression: campaign?.cron_expression ?? '',
    });
  }, [open, campaign]);

  const { saveCampaign, isSavingCampaign } = useSaveCampaign({
    campaignId: campaign?.id,
    onSuccess: () => setOpen(false),
  });

  const canSubmit = useMemo(() => {
    if (name.trim() === '' || isSavingCampaign) return false;
    if (channel === 'email' && !templateId) return false;
    if (channel === 'push' && (pushTitle.trim() === '' || pushBody.trim() === ''))
      return false;
    if (schedule.schedule_kind === 'one_off' && !schedule.scheduled_at)
      return false;
    if (
      schedule.schedule_kind === 'recurring' &&
      schedule.cron_expression.trim() === ''
    )
      return false;
    return true;
  }, [name, isSavingCampaign, channel, templateId, pushTitle, pushBody, schedule]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    saveCampaign({
      // channel is immutable after create, so only send it when creating.
      ...(isEdit ? {} : { channel }),
      name: name.trim(),
      description: description.trim() || undefined,
      template_id: channel === 'email' ? templateId : undefined,
      subject_override:
        channel === 'email' ? subjectOverride.trim() || undefined : undefined,
      push_title: channel === 'push' ? pushTitle.trim() : undefined,
      push_body: channel === 'push' ? pushBody.trim() : undefined,
      audience,
      schedule_kind: schedule.schedule_kind,
      scheduled_at:
        schedule.schedule_kind === 'one_off'
          ? schedule.scheduled_at
          : undefined,
      cron_expression:
        schedule.schedule_kind === 'recurring'
          ? schedule.cron_expression.trim()
          : undefined,
    });
  };

  const title = isEdit
    ? 'Edit campaign'
    : channel === 'email'
      ? 'New email campaign'
      : 'New push campaign';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0">
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {channel === 'email'
              ? 'Compose an email blast to a preset audience. New campaigns start as a draft.'
              : 'Compose a push notification to a preset audience. New campaigns start as a draft.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Name</Label>
            <Input
              id="campaign-name"
              placeholder="Internal name, e.g. July savings nudge"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">
              Description{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="campaign-description"
              placeholder="What is this campaign for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {channel === 'email' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-template">Email template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger id="campaign-template" className="w-full">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Manage templates under Communication → Email Templates.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign-subject">
                  Subject override{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="campaign-subject"
                  placeholder="Leave blank to use the template subject"
                  value={subjectOverride}
                  onChange={(e) => setSubjectOverride(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="push-title">Notification title</Label>
                <Input
                  id="push-title"
                  placeholder="e.g. Your savings are growing 🌱"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="push-body">Notification body</Label>
                <Textarea
                  id="push-body"
                  placeholder="The message shown in the notification"
                  value={pushBody}
                  onChange={(e) => setPushBody(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Audience</Label>
            <AudienceFilterFields value={audience} onChange={setAudience} />
          </div>

          <AudiencePreview audience={audience} channel={channel} />

          <div className="space-y-2 border-t border-border pt-5">
            <Label>Schedule</Label>
            <ScheduleFields value={schedule} onChange={setSchedule} />
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSavingCampaign}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSavingCampaign
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create campaign'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
