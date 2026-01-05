import React from 'react'
import type { Community } from '~/types/types'
import TopicPill from './TopicPill'

const CommunityCardSmall = ({ community }: { community: Community }) => {
    // const formatMemberCount = (count: number) => {
    //     if (count >= 1000000) {
    //       return `${(count / 1000000).toFixed(1)}mil`;
    //     } else if (count >= 1000) {
    //       return `${(count / 1000).toFixed(1)}k`;
    //     }
    //     return count.toString();
    //   };

  return (
    <div
        key={community._id}
        className='bg-[#EDEDE9] border border-[#1f2735] overflow-hidden cursor-pointer rounded-[5px] p-[5px] hover:border-[#31415f] transition-all group'
        onClick={() => window.location.href = `/community/${community._id}`}
    >
        

        {/* Card Content */}
        <div className='flex flex-col gap-3'>
        <div className='flex items-start gap-[10px]'>
            <img 
                src={community.picture} 
                alt={community.title}
                className='w-[64px] h-[64px] object-cover'
            />
            <div className='flex flex-col'>
            <div className='flex gap-[10px] items-center'>
                <div className='text-small'>{community.title}</div>
                {/* <div className='text-mini text-[#9aa4bd]'>{formatMemberCount(community.members?.length)} members</div> */}
            </div>  

            <div className='text-mini'>
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

export default CommunityCardSmall