import { Users } from 'lucide-react';

import type { AudienceFilter, CampaignChannel } from '@/types/CampaignTypes';
import { Button } from '@/components/ui/button';
import usePreviewAudience from '@/hooks/usePreviewAudience';

type AudiencePreviewProps = {
  audience: AudienceFilter;
  channel: CampaignChannel;
};

/** On-demand "how many will this reach" panel for the campaign builder. */
export default function AudiencePreview({
  audience,
  channel,
}: AudiencePreviewProps) {
  const { previewAudience, preview, isPreviewing } = usePreviewAudience();

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-brand" />
          Audience preview
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPreviewing}
          onClick={() => previewAudience({ audience, channel })}
        >
          {isPreviewing ? 'Checking…' : 'Preview reach'}
        </Button>
      </div>

      {preview && (
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            <span className="text-2xl font-semibold text-brand">
              {preview.matched_count.toLocaleString()}
            </span>{' '}
            user{preview.matched_count === 1 ? '' : 's'} match this audience on{' '}
            {channel === 'email' ? 'email' : 'push'}.
          </p>
          {preview.sample_users.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Sample recipients:</p>
              <ul className="space-y-0.5">
                {preview.sample_users.map((u) => (
                  <li key={u.id} className="truncate">
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') ||
                      u.coffer_id}{' '}
                    — {u.email}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
