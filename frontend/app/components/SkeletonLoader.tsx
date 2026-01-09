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
      <div className="flex justify-between items-start">
        <div className="flex gap-[10px] items-center">
          <Skeleton circle width={48} height={48} />
          <div className="flex flex-col gap-2">
            <Skeleton width={120} height={16} />
            <Skeleton width={80} height={12} />
          </div>
        </div>
        <Skeleton width={16} height={16} rounded />
      </div>
      <Skeleton width="90%" height={24} />
      <Skeleton width="70%" height={16} />
      <div className="flex gap-[25px]">
        <Skeleton width={40} height={16} />
        <Skeleton width={40} height={16} />
        <Skeleton width={40} height={16} />
      </div>
    </div>
  );
};

export const BlogPostSmallSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2 p-2 border border-[#000000] rounded-lg">
      <Skeleton width={60} height={60} rounded />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton width="80%" height={14} />
        <Skeleton width="60%" height={12} />
      </div>
    </div>
  );
};

export const CommunityCardSkeleton: React.FC = () => {
  return (
    <div className="flex gap-2 p-2 border border-[#000000] rounded-lg">
      <Skeleton circle width={40} height={40} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} />
      </div>
    </div>
  );
};

export const SidebarSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 w-[200px]">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} width="100%" height={40} rounded />
      ))}
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 items-center">
        <Skeleton circle width={120} height={120} />
        <div className="flex flex-col gap-2">
          <Skeleton width={200} height={24} />
          <Skeleton width={150} height={16} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} width="100%" height={100} rounded />
        ))}
      </div>
    </div>
  );
};

export const ConnectionCardSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col bg-[#EDEDE9] border-2 border-[#000000] rounded-lg p-4'>
      <div className='flex flex-col gap-3 items-center mb-3'>
        <Skeleton circle width={64} height={64} />
        <div className='text-center w-full'>
          <Skeleton width="80%" height={16} className="mx-auto mb-2" />
          <Skeleton width="60%" height={12} className="mx-auto" />
        </div>
      </div>
      <Skeleton width="100%" height={40} rounded />
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className='flex flex-col items-center p-4 bg-white border-2 border-[#000000] rounded-lg'>
      <Skeleton width={24} height={24} rounded className="mb-2" />
      <Skeleton width={60} height={32} className="mb-2" />
      <Skeleton width={100} height={14} />
    </div>
  );
};

export const PostStatSkeleton: React.FC = () => {
  return (
    <div className='bg-white border-2 border-[#000000] rounded-lg p-4'>
      <div className='flex items-center justify-between mb-3'>
        <Skeleton width="60%" height={20} />
        <Skeleton width={100} height={20} rounded />
      </div>
      <div className='flex gap-4'>
        {[...Array(3)].map((_, i) => (
          <div key={i} className='flex flex-col items-center'>
            <Skeleton width={20} height={20} rounded className="mb-1" />
            <Skeleton width={40} height={16} className="mb-1" />
            <Skeleton width={50} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const RequestCardSkeleton: React.FC = () => {
  return (
    <div className='p-4 border-2 border-[#000000] rounded-lg bg-[#EDEDE9]'>
      <div className='flex items-center gap-3 mb-3'>
        <Skeleton circle width={48} height={48} />
        <div className='flex flex-col flex-1 gap-2'>
          <Skeleton width="70%" height={16} />
          <Skeleton width="50%" height={12} />
        </div>
      </div>
      <div className='flex gap-2'>
        <Skeleton width="50%" height={36} rounded />
        <Skeleton width="50%" height={36} rounded />
      </div>
    </div>
  );
};

export const CommentCardSkeleton: React.FC = () => {
  return (
    <div className='bg-[#EDEDE9] border-2 border-[#000000] rounded-lg p-4'>
      <div className='flex items-start gap-3 mb-3'>
        <Skeleton circle width={40} height={40} />
        <div className='flex-1'>
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="100%" height={14} className="mb-1" />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
      <div className='flex items-center gap-2 mb-2'>
        <Skeleton width={120} height={14} />
        <Skeleton width={80} height={14} />
      </div>
      <Skeleton width={100} height={32} rounded />
    </div>
  );
};

