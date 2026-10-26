import * as React from 'react';
import { cn } from '@/lib/utils';

// Same field treatment as Input (DESIGN §9), growing with its content.
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-28 w-full rounded-sm border border-input bg-surface-1 px-3 py-2 text-3 text-on-surface-1 transition-colors placeholder:text-on-surface-3 focus-visible:border-accent-1 focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
