import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function CloseToast() {
  return (
    <div className="grow flex justify-end">
      <button aria-label="Close-toast" type="button" onClick={() => { toast.dismiss(); }}>
        <X className="scale-[80%] hover:scale-[100%] transition-transform duration-150" />
      </button>
    </div>
  );
}
