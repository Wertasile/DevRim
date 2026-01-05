import React from 'react'
import type { Community } from '~/types/types'
import TopicPill from './TopicPill';

const CommunityCard = ({ community }: { community: Community }) => {
    
    const formatMemberCount = (count: number) => {
        if (count >= 1000000) {
          return `${(count / 1000000).toFixed(1)}mil`;
        } else if (count >= 1000) {
          return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
      };

  return (
    <div
        key={community._id}
        className='bg-[#EDEDE9] border border-[#1f2735] overflow-hidden cursor-pointer hover:border-[#31415f] transition-all group'
        onClick={() => window.location.href = `/community/${community._id}`}
    >
        

        {/* Card Content */}
        <div className='flex flex-col gap-3'>
        <div className='flex items-start gap-[10px]'>
            <div className='w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg'>
            <img 
                src={community.picture} 
                alt={community.title}
                className='w-full h-full object-cover'
            />
            </div>
            <div className='flex flex-col'>
            <div className='flex gap-[10px] items-center'>
                <h3>{community.title}</h3>
                <div className='text-mini text-[#9aa4bd]'>{formatMemberCount(community.members?.length)} members</div>
            </div>  

            <div className='text-small'>
                {community.description || 'Join this community to connect with like-minded people'}
            </div>
            {/* Topics */}
            {community.topics && community.topics.length > 0 && (
                <div className='flex flex-wrap gap-1 mt-2'>
                {community.topics.map((topicName) => (
                    <TopicPill
                    key={topicName}
                    topicName={topicName}
                    
                    size="small"
                    variant="default"
                    />
                ))}
                </div>
            )}
            </div>
        </div>
        </div>
    </div>
  )
}

export default CommunityCard