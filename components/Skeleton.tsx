
import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const baseClasses = "animate-pulse bg-brand-navy/10";
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>
  );
};
