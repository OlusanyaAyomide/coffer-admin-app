import { Button } from '@/components/ui/button';

type CalendarFooterType = {
  onDateSelect: (date: Date | undefined) => void;
  selectedDate?: Date;
  onCancel: () => void;
};

export default function CalendarFooter({
  onDateSelect,
  selectedDate,
  onCancel,
}: CalendarFooterType) {
  return (
    <tbody className="mt-2 border-t border-border pt-2">
      <tr>
        <td className="flex w-full justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="
              mr-2 h-8 rounded-full px-3
              text-muted-foreground
              hover:text-foreground
            "
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={() => onDateSelect(selectedDate)}
            size="icon"
            className="
              h-8 w-8 rounded-full
              bg-primary text-primary-foreground
              hover:bg-primary/90
            "
          >
            OK
          </Button>
        </td>
      </tr>
    </tbody>
  );
}
