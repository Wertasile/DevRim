import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { Community } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import { Search, Compass, Settings, Heart, Users, Plus, PlusIcon, X } from 'lucide-react';
import CreateCommunityModal from '~/components/CreateCommunityModal';
import joinCommunity from '~/apiCalls/Community/joinCommunity';
import leaveCommunity from '~/apiCalls/Community/leaveCommunity';
import { TOPICS } from '~/constants/topics';
import TopicPill from '~/components/TopicPill';
import CommunityCard from '~/components/communityCard';

const API_URL = import.meta.env.VITE_API_URL;

const CommunityHub = () => {
  const { user } = useUser();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      const url = selectedTopic 
        ? `${API_URL}/communities?topic=${encodeURIComponent(selectedTopic)}`
        : `${API_URL}/communities`;
      const response = await fetch(url, {
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
  }, [user, selectedTopic]);

  useEffect(() => {
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

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
      
      <div className='flex flex-row gap-6 px-6 py-8'>
        {/* Left Sidebar */}
        <Sidebar />

                {/* Central Content Area */}
                <div className='flex-grow flex flex-col gap-6 max-w-[1600px] mx-auto'>
          {/* Search Bar and Create Button */}
          <div className='flex gap-3'>
            <div className='relative flex-1'>
              <input
                type="text"
                placeholder="Search for Communities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input hover:border-[#E95444] focus:border-[#E95444] transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="primary-btn flex gap-[10px] items-center bg-gradient-to-r from-[#E95444] to-[#5D64F4] hover:from-[#5D64F4] hover:to-[#E95444] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Plus size={20} />
              CREATE COMMUNITY
            </button>
          </div>

          {/* Topic Filter */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-black text-sm font-medium bg-gradient-to-r from-[#5D64F4] via-[#E95444] to-[#5D64F4] bg-clip-text text-transparent'>Filter by Topic:</span>
              {TOPICS.map((topic) => (
                <TopicPill
                  key={topic.id}
                  topicName={topic.name}
                  onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                  size="medium"
                  variant={selectedTopic === topic.name ? 'selected' : 'unselected'}
                  className={selectedTopic === topic.name ? 'font-semibold ring-2 ring-[#E95444] shadow-md' : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-[#E95444]/50 transition-all duration-200'}
                />
              ))}
              {selectedTopic && (
                <button
                  onClick={() => setSelectedTopic(null)}
                  className='px-3 py-1 rounded-lg text-sm bg-gradient-to-r from-[#EDEDE9] to-[#F5F5F1] border border-[#000000] text-[#979797] hover:border-[#E95444] hover:text-[#E95444] hover:bg-gradient-to-r hover:from-[#E95444]/10 hover:to-[#5D64F4]/10 flex items-center gap-1 transition-all duration-300 hover:scale-105'
                >
                  <X size={14} />
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          {/* Community Cards */}
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
            {filteredCommunities.map((community) => {
              return (
                <CommunityCard key={community._id} community={community} />
              );
            })}
          </div>

          {filteredCommunities.length === 0 && (
            <div className='text-[#9aa4bd] text-center py-12 bg-gradient-to-br from-[#EDEDE9] to-[#F5F5F1] rounded-lg border border-[#000000] p-8'>
              No communities found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;