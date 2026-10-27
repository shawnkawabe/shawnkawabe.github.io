import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from 'radix-ui';

// DESIGN §9 Button: pill, 40/48px, brand / neutral / ghost. Focus uses the global ring.
// L-32: a slight press on click, and a trailing icon (arrow) nudges forward on hover.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border border-transparent font-body text-2 font-medium whitespace-nowrap transition-[color,background-color,border-color,scale] duration-150 ease-standard select-none active:scale-[0.98] [&_svg:last-child]:transition-transform [&_svg:last-child]:duration-250 [&_svg:last-child]:ease-standard hover:[&_svg:last-child]:translate-x-0.5 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        brand: 'bg-accent-1 text-on-accent hover:bg-accent-1-strong',
        neutral: 'border-border-1 bg-surface-3 text-on-surface-1 hover:border-border-2',
        ghost: 'text-on-surface-2 hover:bg-surface-2 hover:text-on-surface-1',
      },
      size: {
        md: 'h-10 px-5',
        lg: 'h-12 px-5 text-3',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'brand',
      size: 'md',
    },
  },
);

function Button({
  className,
  variant = 'brand',
  size = 'md',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
