import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';
import { AlertTriangle } from 'lucide-react';

import type { EmailTemplate } from '@/types/EmailTemplateTypes';
import { ALLOWED_PLACEHOLDERS, PLACEHOLDER_GROUPS } from '@/types/EmailTemplateTypes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TemplateEditor from '@/components/campaign/TemplateEditor';
import { buildBrandPreviewDoc } from '@/components/campaign/brandPreview';
import useSaveEmailTemplate from '@/hooks/useSaveEmailTemplate';
import { validatePlaceholders } from '@/components/campaign/placeholderValidation';

type EmailTemplateFormSheetProps = {
  template?: EmailTemplate;
  trigger: ReactNode;
};

const ALLOWED_TOKENS = ALLOWED_PLACEHOLDERS.map((p) => p.token);

export default function EmailTemplateFormSheet({
  template,
  trigger,
}: EmailTemplateFormSheetProps) {
  const isEdit = Boolean(template);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(template?.name ?? '');
    setSubject(template?.subject ?? '');
    setHtmlBody(template?.html_body ?? '');
  }, [open, template]);

  const { saveTemplate, isSavingTemplate } = useSaveEmailTemplate({
    templateId: template?.id,
    onSuccess: () => setOpen(false),
  });

  const issues = useMemo(() => validatePlaceholders(htmlBody), [htmlBody]);
  const previewDoc = useMemo(
    () => buildBrandPreviewDoc(subject, htmlBody),
    [subject, htmlBody],
  );

  const canSubmit =
    name.trim() !== '' &&
    subject.trim() !== '' &&
    htmlBody.trim() !== '' &&
    htmlBody !== '<p></p>' &&
    issues.length === 0 &&
    !isSavingTemplate;

  const insertPlaceholder = (token: string) => {
    editorRef.current?.chain().focus().insertContent(`{{${token}}}`).run();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    saveTemplate({
      name: name.trim(),
      subject: subject.trim(),
      html_body: htmlBody,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0">
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? 'Edit template' : 'New email template'}</SheetTitle>
          <SheetDescription>
            Compose the email body with the editor — no HTML needed. The Coffer
            header and footer are added automatically; you only write the
            content in between. Insert variables for per-recipient values.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="template-name">Name</Label>
              <Input
                id="template-name"
                placeholder="Internal name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input
                id="template-subject"
                placeholder="Email subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Insert a variable</Label>
            <div className="space-y-2.5 rounded-lg border border-border p-3">
              {PLACEHOLDER_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                    <span className="ml-2 font-normal normal-case tracking-normal">
                      {group.description}
                    </span>
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {group.items.map((p) => (
                      <button
                        key={p.token}
                        type="button"
                        onClick={() => insertPlaceholder(p.token)}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition-colors hover:border-brand hover:bg-brand/10 hover:text-brand"
                        title={`{{${p.token}}}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Body</Label>
              <TemplateEditor
                value={htmlBody}
                onChange={setHtmlBody}
                onEditorReady={(editor) => {
                  editorRef.current = editor;
                }}
                allowedPlaceholders={ALLOWED_TOKENS}
              />
            </div>
            <div className="space-y-2">
              <Label>Live preview</Label>
              <iframe
                title="Email preview"
                className="h-[420px] w-full rounded-md border border-border bg-white"
                sandbox=""
                srcDoc={previewDoc}
              />
            </div>
          </div>

          {issues.length > 0 && (
            <div className="flex gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <ul className="space-y-0.5">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSavingTemplate}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSavingTemplate
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create template'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
