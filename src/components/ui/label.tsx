import * as React from 'react';
import { cn } from '@/lib/utils'; // adjust path if needed

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-foreground mb-1', className)}
      {...props}
    />
  )
);

Label.displayName = 'Label';

export { Label };