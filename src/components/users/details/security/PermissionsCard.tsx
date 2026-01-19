import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  disabled?: boolean;
}

interface PermissionsCardProps {
  permissions: Array<Permission>;
  onToggle: (id: string, enabled: boolean) => void;
}

export default function PermissionsCard({ permissions, onToggle }: PermissionsCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-base font-semibold mb-4">Permissions</h3>

      <div className="space-y-4">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className={cn(
              'flex items-center justify-between',
              permission.disabled && 'opacity-50'
            )}
          >
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-medium text-foreground">{permission.name}</p>
              {permission.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
              )}
            </div>
            <Switch
              checked={permission.enabled}
              onCheckedChange={(checked) => onToggle(permission.id, checked)}
              disabled={permission.disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
