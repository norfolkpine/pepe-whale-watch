import { cn } from '@/utils';
import React from 'react';

export const BaseContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="w-full">
      <div className={cn('mx-auto w-full max-w-7xl p-3', className)}>{children}</div>
    </div>
  );
};
