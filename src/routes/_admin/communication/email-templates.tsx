import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';

import type { EmailTemplate } from '@/types/EmailTemplateTypes';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import BaseDataTable from '@/components/shared/BaseDataTable';
import { TableSearch } from '@/components/shared/TableSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import EmailTemplateFormSheet from '@/components/campaign/EmailTemplateFormSheet';
import useEmailTemplates from '@/hooks/useEmailTemplates';
import useDeleteEmailTemplate from '@/hooks/useDeleteEmailTemplate';

export const Route = createFileRoute('/_admin/communication/email-templates')({
  component: EmailTemplatesPage,
});

const ITEMS_PER_PAGE = 20;

function TemplateRowActions({ template }: { template: EmailTemplate }) {
  const { deleteTemplate, isDeletingTemplate } = useDeleteEmailTemplate({
    templateId: template.id,
  });

  return (
    <div className="flex items-center justify-end gap-2">
      <EmailTemplateFormSheet
        template={template}
        trigger={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        }
      />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{template.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Campaigns already referencing this template keep their copy, but it
              can no longer be selected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTemplate}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteTemplate(undefined);
              }}
              disabled={isDeletingTemplate}
            >
              {isDeletingTemplate ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmailTemplatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { templates, meta, isTemplatesLoading } = useEmailTemplates({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
  });

  const columns = useMemo<Array<ExtendedColumnDef<EmailTemplate>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Template',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        meta: { className: 'max-w-[24vw]' },
        cell: ({ row }) => (
          <span className="truncate text-sm text-muted-foreground">
            {row.original.subject}
          </span>
        ),
      },
      {
        accessorKey: 'declared_variables',
        header: 'Placeholders',
        cell: ({ row }) => {
          const count = row.original.declared_variables.length;
          return count ? (
            <Badge variant="outline">
              {count} placeholder{count === 1 ? '' : 's'}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          );
        },
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: { className: 'text-right' },
        cell: ({ row }) => <TemplateRowActions template={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Email Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Reusable HTML email bodies referenced by email campaigns.
          </p>
        </div>
        <EmailTemplateFormSheet
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New template
            </Button>
          }
        />
      </div>

      <TableSearch
        placeholder="Search templates by name…"
        searchTerm={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        className="sm:max-w-md"
      />

      <BaseDataTable
        columns={columns}
        data={templates}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isTemplatesLoading}
        showOnMobile
      />
    </div>
  );
}
