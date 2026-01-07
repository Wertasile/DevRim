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
        className='bg-gradient-to-br from-[#EDEDE9] via-[#F5F5F1] to-[#EDEDE9] border border-[#1f2735] overflow-hidden cursor-pointer transition-all duration-300 rounded-lg p-4 hover:border-[#E95444] hover:shadow-xl hover:transform hover:-translate-y-2 hover:bg-gradient-to-br hover:from-[#F5F5F1] hover:via-[#EDEDE9] hover:to-[#F5F5F1] group'
        onClick={() => window.location.href = `/community/${community._id}`}
    >
        {/* Card Content */}
        <div className='flex flex-col gap-3'>
        <div className='flex items-start gap-[10px]'>
            <div className='w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-transparent group-hover:border-[#E95444] transition-all duration-300 group-hover:ring-4 group-hover:ring-[#E95444]/30'>
            <img 
                src={community.picture} 
                alt={community.title}
                className='w-full h-full object-cover rounded-full'
            />
            </div>
            <div className='flex flex-col'>
            <div className='flex gap-[10px] items-center'>
                <h3 className='group-hover:text-[#E95444] transition-colors duration-200'>{community.title}</h3>
                <div className='text-mini text-[#9aa4bd] group-hover:text-[#E95444]/70 transition-colors duration-200'>{formatMemberCount(community.members?.length)} members</div>
            </div>  

            <div className='text-small group-hover:text-gray-700 transition-colors duration-200'>
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