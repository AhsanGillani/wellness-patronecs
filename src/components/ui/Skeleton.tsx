import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = 'md',
  animate = true 
}) => {
  const baseClasses = 'bg-gray-200';
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  const animateClasses = animate ? 'animate-pulse' : '';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${roundedClasses[rounded]} ${animateClasses} ${className}`}
      style={style}
    />
  );
};

// Predefined skeleton components
export const SkeletonText = ({ lines = 1, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height={16} 
        width={i === lines - 1 ? '75%' : '100%'} 
        className="h-4"
      />
    ))}
  </div>
);

export const SkeletonTitle = ({ className = '' }: { className?: string }) => (
  <Skeleton height={28} width="60%" className={`h-7 ${className}`} />
);

export const SkeletonAvatar = ({ size = 40, className = '' }: { size?: number; className?: string }) => (
  <Skeleton 
    width={size} 
    height={size} 
    rounded="full" 
    className={className}
  />
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`p-6 border border-gray-200 rounded-lg ${className}`}>
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonAvatar size={48} />
      <div className="flex-1 space-y-2">
        <SkeletonTitle />
        <SkeletonText lines={2} />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonButton = ({ className = '' }: { className?: string }) => (
  <Skeleton height={40} width={120} className={`h-10 ${className}`} />
);

export const SkeletonInput = ({ className = '' }: { className?: string }) => (
  <Skeleton height={40} className={`h-10 ${className}`} />
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }: { rows?: number; columns?: number; className?: string }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height={20} width={`${100 / columns}%`} className="h-5" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} height={16} width={`${100 / columns}%`} className="h-4" />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
