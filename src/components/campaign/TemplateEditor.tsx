import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceholderHighlight } from '@/components/campaign/PlaceholderHighlight';
import '@/components/campaign/template-editor.css';

type TemplateEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
  allowedPlaceholders?: ReadonlyArray<string>;
  className?: string;
};

/**
 * WYSIWYG email-body editor. Admins format text with the toolbar instead of
 * writing HTML; `{{placeholders}}` are highlighted inline. `getHTML()` output
 * is the body content only — it is wrapped in the Coffer brand layout on send.
 */
export default function TemplateEditor({
  value,
  onChange,
  onEditorReady,
  allowedPlaceholders = [],
  className,
}: TemplateEditorProps) {
  const editor = useEditor(
    {
      extensions: [
        // StarterKit bundles a Link extension in v3; disable it so our
        // explicitly-configured Link (below) doesn't collide.
        StarterKit.configure({ link: false }),
        Link.configure({
          openOnClick: false,
          autolink: false,
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer',
            style: 'color:#2B3990;text-decoration:underline;',
          },
        }),
        PlaceholderHighlight.configure({ allowed: allowedPlaceholders }),
      ],
      content: value || '<p></p>',
      onUpdate: ({ editor }) => onChange(editor.getHTML()),
    },
    [allowedPlaceholders.join('|')],
  );

  // Sync external value changes (e.g. loading an existing template).
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        'campaign-editor overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', previous ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        ariaLabel="Bold">
        <Bold className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        ariaLabel="Italic">
        <Italic className="size-3.5" />
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        ariaLabel="Heading 1">
        <Heading1 className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        ariaLabel="Heading 2">
        <Heading2 className="size-3.5" />
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        ariaLabel="Bullet list">
        <List className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        ariaLabel="Numbered list">
        <ListOrdered className="size-3.5" />
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        onClick={setLink}
        active={editor.isActive('link')}
        ariaLabel="Link">
        <LinkIcon className="size-3.5" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        'h-7 w-7 p-0',
        active && 'bg-primary/10 text-primary hover:bg-primary/15',
      )}>
      {children}
    </Button>
  );
}

function Separator() {
  return <div className="mx-1 h-4 w-px bg-border" />;
}
