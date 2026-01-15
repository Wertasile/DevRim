import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  rounded = false,
  circle = false 
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  const roundedClass = circle ? 'rounded-full' : rounded ? 'rounded-lg' : '';
  
  return (
    <div 
      className={`skeleton ${roundedClass} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
      aria-live="polite"
    />
  );
};

export const BlogPostCardSkeleton: React.FC = () => {
  return (
    <div className="blog-card p-[10px] flex flex-col gap-[10px]">
      <div className="flex gap-[10px] items-center">
        <Skeleton circle width={40} height={40} />
        <Skeleton width={120} height={16} />
      </div>
      <Skeleton width="85%" height={20} />
      <Skeleton width="65%" height={14} />
    </div>
  );
};

export const BlogPostSmallSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2 p-2">
      <Skeleton width={50} height={50} rounded />
      <div className="flex-1 flex flex-col gap-1">
        <Skeleton width="75%" height={14} />
        <Skeleton width="55%" height={12} />
      </div>
    </div>
  );
};

export const CommunityCardSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2 p-2">
      <Skeleton circle width={32} height={32} />
      <div className="flex-1 flex flex-col gap-1">
        <Skeleton width="65%" height={14} />
        <Skeleton width="45%" height={12} />
      </div>
    </div>
  );
};

export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 w-[200px]">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} width="100%" height={36} rounded />
      ))}
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <Skeleton circle width={80} height={80} />
        <div className="flex flex-col gap-2">
          <Skeleton width={180} height={20} />
          <Skeleton width={120} height={14} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} width="100%" height={80} rounded />
        ))}
      </div>
    </div>
  );
};

export const ConnectionCardSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col gap-3 p-3'>
      <div className='flex flex-col gap-2 items-center'>
        <Skeleton circle width={50} height={50} />
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} />
      </div>
      <Skeleton width="100%" height={32} rounded />
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col items-center p-3 gap-2'>
      <Skeleton width={50} height={28} />
      <Skeleton width={80} height={12} />
    </div>
  );
};

export const PostStatSkeleton: React.FC = () => {
  return (
    <div className='p-3 flex flex-col gap-2'>
      <Skeleton width="70%" height={18} />
      <div className='flex gap-3'>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} width={40} height={14} />
        ))}
      </div>
    </div>
  );
};

export const RequestCardSkeleton: React.FC = () => {
  return (
    <div className='p-3 flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <Skeleton circle width={40} height={40} />
        <div className='flex flex-col flex-1 gap-1'>
          <Skeleton width="65%" height={14} />
          <Skeleton width="45%" height={12} />
        </div>
      </div>
      <div className='flex gap-2'>
        <Skeleton width="48%" height={32} rounded />
        <Skeleton width="48%" height={32} rounded />
      </div>
    </div>
  );
};

export const CommentCardSkeleton: React.FC = () => {
  return (
    <div className='p-3 flex flex-col gap-2'>
      <div className='flex items-start gap-2'>
        <Skeleton circle width={32} height={32} />
        <div className='flex-1 flex flex-col gap-1'>
          <Skeleton width="55%" height={14} />
          <Skeleton width="90%" height={12} />
          <Skeleton width="75%" height={12} />
        </div>
      </div>
      <Skeleton width={80} height={12} />
    </div>
  );
};


