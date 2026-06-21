import { useId, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ImageIcon, Loader2, Search, UploadCloud } from 'lucide-react';
import {
  DynamicIcon,
  dynamicIconImports,
  iconNames,
} from 'lucide-react/dynamic';
import { renderToStaticMarkup } from 'react-dom/server';
import type { LucideIcon } from 'lucide-react';
import type { IconName } from 'lucide-react/dynamic';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import CloseToast from '@/components/shared/CloseToast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useCloudinaryUpload, {
  getCloudinaryUploadFolder,
} from '@/hooks/useCloudinaryUpload';
import { cn } from '@/lib/utils';

type LucideIconPickerProps = {
  value: string;
  onChange: (url: string) => void;
  onClear: VoidFunction;
  label?: string;
  helpText?: string;
  folderSuffix?: string;
};

const MAX_ICON_BYTES = 2 * 1024 * 1024;
const ICON_FILE_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

function buildIconSvg(IconComponent: LucideIcon) {
  return renderToStaticMarkup(
    <IconComponent
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#0D1332"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
  );
}

function validateIconFile(file: File) {
  if (!ICON_FILE_TYPES.has(file.type)) {
    return 'Upload an SVG, PNG, JPG, JPEG, GIF, or WebP icon.';
  }

  if (file.size > MAX_ICON_BYTES) {
    return 'Maximum icon size is 2 MB.';
  }

  return null;
}

export default function LucideIconPicker({
  value,
  onChange,
  onClear,
  label = 'Icon',
  helpText = 'Select a Lucide icon, confirm upload, then save the category.',
  folderSuffix = 'icon',
}: LucideIconPickerProps) {
  const uploadInputId = useId();
  const [search, setSearch] = useState('');
  const [selectedIconName, setSelectedIconName] = useState<IconName | ''>('');
  const [pendingIconName, setPendingIconName] = useState<IconName | ''>('');
  const [activeUpload, setActiveUpload] = useState<'lucide' | 'file' | null>(null);
  const { isPending: isUploading, uploadInfo, uploadToCloudinary } =
    useCloudinaryUpload();

  const filteredIcons = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return iconNames
      .filter((name) => name.toLowerCase().includes(needle))
      .slice(0, 48);
  }, [search]);

  const handleConfirmUpload = async () => {
    if (!pendingIconName) return;

    setActiveUpload('lucide');

    try {
      const IconComponent = (await dynamicIconImports[pendingIconName]()).default;
      const svg = buildIconSvg(IconComponent);
      const file = new File([svg], `${pendingIconName}.svg`, {
        type: 'image/svg+xml',
      });
      const result = await uploadToCloudinary({
        file,
        folder: getCloudinaryUploadFolder(folderSuffix),
      });
      onChange(result.secure_url);
      setSelectedIconName(pendingIconName);
      setPendingIconName('');
      toast.success('Icon uploaded', { action: <CloseToast /> });
    } catch {
      // useCloudinaryUpload owns the user-facing error toast.
    } finally {
      setActiveUpload(null);
    }
  };

  const handleIconFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateIconFile(file);
    if (validationError) {
      toast.error(validationError, { action: <CloseToast /> });
      event.target.value = '';
      return;
    }

    setActiveUpload('file');

    try {
      const result = await uploadToCloudinary({
        file,
        folder: getCloudinaryUploadFolder(folderSuffix),
      });
      onChange(result.secure_url);
      setSelectedIconName('');
      setPendingIconName('');
      toast.success('Icon uploaded', { action: <CloseToast /> });
    } catch {
      // useCloudinaryUpload owns the user-facing error toast.
    } finally {
      setActiveUpload(null);
      event.target.value = '';
    }
  };

  const previewIconName = pendingIconName || selectedIconName;

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          {previewIconName ? (
            <DynamicIcon
              name={previewIconName}
              className="h-5 w-5 text-foreground"
            />
          ) : value ? (
            <img
              src={value}
              alt=""
              className="h-6 w-6 object-contain"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {previewIconName || (value ? `Uploaded ${label.toLowerCase()}` : `No ${label.toLowerCase()} selected`)}
          </p>
          <p className="text-xs text-muted-foreground">
            {helpText}
          </p>
        </div>
        {pendingIconName && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              void handleConfirmUpload();
            }}
            disabled={isUploading}
            className="gap-2"
          >
            {activeUpload === 'lucide' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            Upload icon
          </Button>
        )}
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedIconName('');
              setPendingIconName('');
              onClear();
            }}
            disabled={isUploading}
          >
            Clear
          </Button>
        )}
      </div>

      <Tabs defaultValue="lucide" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lucide">Lucide</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="lucide" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search icons"
              className="pl-9"
            />
          </div>

          <div className="grid max-h-64 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-border p-2 sm:grid-cols-8">
            {filteredIcons.map((name) => {
              const isSelected = previewIconName === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={cn(
                    'flex h-12 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent',
                    isSelected && 'border-primary bg-accent',
                  )}
                  title={name}
                  aria-label={`Select ${name} icon`}
                  onClick={() => {
                    setPendingIconName(name);
                  }}
                  disabled={isUploading}
                >
                  <DynamicIcon
                    name={name}
                    className={cn(
                      'h-5 w-5 text-foreground',
                      pendingIconName === name && 'text-primary',
                    )}
                  />
                </button>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <label
            htmlFor={uploadInputId}
            className={cn(
              'flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-accent/50',
              isUploading && 'pointer-events-none opacity-70',
            )}
          >
            {activeUpload === 'file' ? (
              <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <UploadCloud className="mb-3 h-6 w-6 text-muted-foreground" />
            )}
            <p className="text-sm font-medium text-foreground">
              {activeUpload === 'file'
                ? `Uploading ${uploadInfo?.progress ?? 0}%`
                : 'Upload icon artwork'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              SVG, PNG, JPG, JPEG, GIF, or WebP up to 2 MB.
            </p>
            <input
              id={uploadInputId}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/gif,image/webp"
              className="hidden"
              onChange={handleIconFileUpload}
              disabled={isUploading}
            />
          </label>
        </TabsContent>
      </Tabs>
    </div>
  );
}
