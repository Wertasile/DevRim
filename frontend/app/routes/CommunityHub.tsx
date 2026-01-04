import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { Community } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import { Search, Compass, Settings, Heart, Users, Plus, PlusIcon } from 'lucide-react';
import CreateCommunityModal from '~/components/CreateCommunityModal';
import joinCommunity from '~/apiCalls/Community/joinCommunity';
import leaveCommunity from '~/apiCalls/Community/leaveCommunity';

const API_URL = import.meta.env.VITE_API_URL;

const CommunityHub = () => {
  const { user } = useUser();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`${API_URL}/communities`, {
        method: 'get',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  const fetchUserCommunities = async () => {
    if (user?._id) {
      try {
        // Try to fetch user's communities - if endpoint doesn't exist, filter from all communities
        const response = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        if (response.ok) {
          const allCommunities = await response.json();
          // Filter communities where user is a member
          const userComms = allCommunities.filter((comm: Community) => 
            comm.members?.some((member: any) => 
              (typeof member === 'string' ? member : member._id) === user._id
            )
          );
          setUserCommunities(userComms);
        }
      } catch (error) {
        console.error('Failed to fetch user communities:', error);
      }
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchUserCommunities();
  }, [user]);

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}mil`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const filteredCommunities = communities.filter(community =>
    community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCommunityCreated = () => {
    fetchCommunities();
    fetchUserCommunities();
  };

  return (
    <div className='min-h-screen'>
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCommunityCreated}
      />
      
      <div className='flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]'>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Central Content Area */}
        <div className='flex-grow flex flex-col gap-6'>
          {/* Search Bar and Create Button */}
          <div className='flex gap-3'>
            <div className='relative flex-1'>
              <input
                type="text"
                placeholder="Search for Communities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="primary-btn flex gap-[10px] items-center"
            >
              <Plus size={20} />
              CREATE COMMUNITY
            </button>
          </div>

          {/* Community Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCommunities.map((community) => {
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCommunities.length === 0 && (
            <div className='text-[#9aa4bd] text-center py-12'>
              No communities found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;