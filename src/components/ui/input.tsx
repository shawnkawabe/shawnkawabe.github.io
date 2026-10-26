import * as React from 'react';
import { cn } from '@/lib/utils';

// DESIGN §9 Inputs: 44px, surface-1, border-2, radius-sm; focus adds accent border + glow.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-sm border border-input bg-surface-1 px-3 text-3 text-on-surface-1 transition-colors placeholder:text-on-surface-3 focus-visible:border-accent-1 focus-visible:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
