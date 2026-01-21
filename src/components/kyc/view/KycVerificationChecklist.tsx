'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface ChecklistState {
  document_clear: boolean;
  info_matches: boolean;
  not_expired: boolean;
  face_matches: boolean;
  no_tampering: boolean;
}

interface KycVerificationChecklistProps {
  checklist: ChecklistState;
  onToggle: (key: keyof ChecklistState) => void;
}

const checklistItems: Array<{ key: keyof ChecklistState; label: string }> = [
  { key: 'document_clear', label: 'Document is clear & readable' },
  { key: 'info_matches', label: 'Information matches profile' },
  { key: 'not_expired', label: 'Document is not expired' },
  { key: 'face_matches', label: 'Face matches selfie' },
  { key: 'no_tampering', label: 'No signs of tampering' },
];

export default function KycVerificationChecklist({
  checklist,
  onToggle,
}: KycVerificationChecklistProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold mb-4">Verification Checklist</h3>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={checklist[item.key]}
              onCheckedChange={() => onToggle(item.key)}
              className="h-5 w-5"
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
