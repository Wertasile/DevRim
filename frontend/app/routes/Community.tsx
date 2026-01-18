import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { Community, Blog } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import BlogPostCard from '~/components/blogPostCard';
import { Search, Users, Calendar, Film, FlaskConical, Briefcase, Edit, Trash2, FilterIcon, SortAscIcon, SortDescIcon, PlusIcon, Pin } from 'lucide-react';
import type { Route } from './+types/Community';
import BlogPostSmall from '~/components/blogPostSmall';
import leaveCommunity from '~/apiCalls/Community/leaveCommunity';
import joinCommunity from '~/apiCalls/Community/joinCommunity';
import TopicPill from '~/components/TopicPill';
import EditCommunityModal from '~/components/EditCommunityModal';
import { Skeleton, BlogPostCardSkeleton } from '~/components/SkeletonLoader';

const API_URL = import.meta.env.VITE_API_URL;

export default function Community({ params }: Route.ComponentProps) {
  const { user } = useUser();
  const [community, setCommunity] = useState<Community | null>(null);
  const [otherCommunities, setOtherCommunities] = useState<Community[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const response = await fetch(`${API_URL}/communities/${params.id}`, {
          method: 'get',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCommunity(data);
        }
      } catch (error) {
        console.error('Failed to fetch community:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOtherCommunities = async () => {
      try {
        const response = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          // Exclude current community
          const filtered = data.filter((comm: Community) => comm._id !== params.id);
          setOtherCommunities(filtered.slice(0, 4)); // Show top 4
        }
      } catch (error) {
        console.error('Failed to fetch other communities:', error);
      }
    };

    fetchCommunity();
    fetchOtherCommunities();
  }, [params.id]);

  const formatMemberCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}mil`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCommunityIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('tech')) {
      return <div className="w-12 h-12 rounded-full bg-[#E95444] flex items-center justify-center border-2 border-[#000000]">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-black rounded-full" />
          ))}
        </div>
      </div>;
    } else if (lowerTitle.includes('travel')) {
      return <Briefcase size={24} className="text-black" />;
    } else if (lowerTitle.includes('movie')) {
      return <Film size={24} className="text-black" />;
    } else if (lowerTitle.includes('beauty')) {
      return <FlaskConical size={24} className="text-black" />;
    }
    return <Users size={24} className="text-black" />;
  };

  // Check if user is creator or moderator
  const isCreatorOrModerator = community && user && (
    (typeof community.creator === 'string' ? community.creator : community.creator._id) === user._id ||
    (community.moderators || []).some((mod: any) => 
      (typeof mod === 'string' ? mod : mod._id) === user._id
    )
  );

  // Get pinned post IDs for checking
  const pinnedPostIds = community?.pinnedPosts?.map((p: Blog) => 
    typeof p === 'string' ? p : p._id
  ) || [];
  
  // Include all posts (pinned and regular) in the feed
  const allPosts = community?.posts || [];

  const filteredPosts = allPosts.filter((post: Blog) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const postTitle = typeof post === 'string' ? '' : post.title;
    const postSummary = typeof post === 'string' ? '' : (post.summary || '');
    return (
      postTitle.toLowerCase().includes(query) ||
      postSummary.toLowerCase().includes(query)
    );
  }) || [];

  // Sort posts: pinned posts first, then by date
  const sortedPosts = [...filteredPosts].sort((a: Blog, b: Blog) => {
    // Skip sorting if posts are strings (shouldn't happen, but safety check)
    if (typeof a === 'string' || typeof b === 'string') return 0;
    
    const aId = a._id;
    const bId = b._id;
    const aIsPinned = pinnedPostIds.includes(aId);
    const bIsPinned = pinnedPostIds.includes(bId);
    
    // Pinned posts come first
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    
    // If both pinned or both not pinned, sort by date (newest first)
    const aDate = new Date(a.releaseDate || 0).getTime();
    const bDate = new Date(b.releaseDate || 0).getTime();
    return bDate - aDate;
  });

  const filteredPinnedPosts = (community?.pinnedPosts || []).filter((post: Blog) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const postTitle = typeof post === 'string' ? '' : post.title;
    const postSummary = typeof post === 'string' ? '' : (post.summary || '');
    return (
      postTitle.toLowerCase().includes(query) ||
      postSummary.toLowerCase().includes(query)
    );
  }) || [];

  // Get user's posts in this community
  const userPosts = community?.posts?.filter((post: Blog) => {
    const postUserId = typeof post.user === 'string' ? post.user : post.user._id;
    return user && postUserId === user._id;
  }) || [];

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeletingPostId(postId);
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'delete',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete post' }));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // Refresh community data
      const response = await fetch(`${API_URL}/communities/${params.id}`, {
        method: 'get',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCommunity(data);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete post. Please try again.');
    } finally {
      setDeletingPostId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-row gap-6 px-6 py-8">
        <Sidebar />
        <div className="flex-grow flex flex-col gap-4">
          <Skeleton width="50%" height={36} />
          <div className="flex gap-3 items-center">
            <Skeleton circle width={60} height={60} />
            <Skeleton width={160} height={20} />
          </div>
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <BlogPostCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDEDE9]">
        <h3 className="text-black">COMMUNITY NOT FOUND</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

              {/* Edit Community Modal */}
      <EditCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={async () => {
          // Refresh community data
          const response = await fetch(`${API_URL}/communities/${params.id}`, {
            method: 'get',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setCommunity(data);
          }
          setIsEditModalOpen(false);
        }}
        community={community}
      />

      <div className="flex flex-row justify-between gap-[10px] px-6 py-8 mx-auto">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-[30px] max-w-[1028px]">
          {/* Cover Image */}
          {community.coverImage && (
            <div className="w-full flex items-center justify-center overflow-hidden">
              <img
                src={community.coverImage}
                alt={`${community.title} cover`}
                className="w-full h-auto object-cover"
                style={{ 
                  aspectRatio: '4/1', 
                  maxWidth: '1028px',
                  maxHeight: '256px'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Community Header */}
          <div className='flex justify-between items-center'>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#E95444] flex items-center justify-center flex-shrink-0 border-2 border-[#000000]">
                {community.picture ? (
                <img src={community.picture} alt={community.title.toUpperCase()} className="w-full h-full border-[1px] border-[#000000] object-cover" />
                ) : (
                getCommunityIcon(community.title)
                )}
              </div>
              <h1>{community.title.toUpperCase()}</h1>
            </div>
            {user?.communities?.some((c: Community | string) => (typeof c === 'string' ? c : c._id) === community._id) ? (
              <div className='flex gap-[10px]'>
              {isCreatorOrModerator && (
                <button 
                  className='icon bg-[#E95444]' 
                  onClick={() => setIsEditModalOpen(true)}
                  title="Edit Community"
                >
                  <Edit size={20} />
                </button>
              )}
              <button className='primary-btn bg-[#E95444] hover:bg-[#d84333] text-black transition-all duration-200' onClick={() => leaveCommunity(community._id)}>LEAVE</button>
              <button className='icon bg-[#E95444]' onClick={() => window.location.href = `/blog/new?communityId=${community._id}`}><PlusIcon size={20} /></button>
              </div>
            ) : (
              <div className='flex gap-[10px]'>
              <button className='primary-btn bg-[#E95444] hover:bg-[#d84333] text-black transition-all duration-200' onClick={() => joinCommunity(community._id)}>JOIN</button>
              </div>
            )}
          </div>


          {/* Search Bar */}
          <div className="flex gap-[10px]">
            <input
              type="text"
              placeholder={`Search in ${community.title}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-decor"
            />
            <button className='icon bg-[#E95444]'><FilterIcon size={20} /></button>
            <button className='icon bg-[#E95444]'><SortDescIcon size={20} /></button>
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col gap-6">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post: Blog, index: number) => {
                // Skip if post is a string (shouldn't happen, but safety check)
                if (typeof post === 'string') return null;
                
                const postId = post._id;
                const isPinned = pinnedPostIds.includes(postId);
                
                return (
                  <div key={post._id} className="relative">
                    {isPinned && (
                      <div className="absolute -top-2 -left-2 z-10 bg-[#4DD499] border-2 border-[#000000] rounded-full p-1 shadow-lg">
                        <Pin size={16} className="text-black" />
                      </div>
                    )}
                    <BlogPostCard
                      id={post._id}
                      title={post.title}
                      releaseDate={post.releaseDate}
                      summary={post.summary || ''}
                      postUser={post.user}
                      comments={post.comments || []}
                      likes={post.likes || []}
                      content={post.content}
                      visualIndex={index}
                      coverImage={post.coverImage}
                      community={post.community || (community ? { _id: community._id, title: community.title } : undefined)}
                      isModerator={isCreatorOrModerator || false}
                      communityId={community._id}
                      isPinned={isPinned}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center text-[#979797] py-8">
                {searchQuery ? 'No posts found matching your search.' : 'No posts yet in this community.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-[10px]">
          {/* Your Communities Section */}



            {/* Current Community Details */}
            <div className="bg-[#EDEDE9] border-[3px] border-[#000000] gap-[10px] flex flex-col p-[10px] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
              <h3 className="text-black">{community.title}</h3>
              <div className="text-small leading-relaxed mb-3 text-black">
                {community.description || 'A community for like-minded people'}
              </div>
              <div className="text-small">                 
                Created on {formatDate(community.createdAt)}
              </div>
              <div className="text-small">                 
                {formatMemberCount(community.members?.length || 0)} members
              </div>
              {/* Topics */}
              {community.topics && community.topics.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {community.topics.map((topicName) => (
                      <TopicPill
                        key={topicName}
                        topicName={topicName}
                        size="medium"
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Announcements Section */}
            {community.announcements && community.announcements.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] p-[10px] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                <h3 className="text-black mb-3 font-semibold">ANNOUNCEMENTS</h3>
                <div className="flex flex-col gap-3">
                  {community.announcements.map((announcement: any) => {
                    const announcementData = typeof announcement === 'object' ? announcement : null;
                    if (!announcementData) return null;
                    return (
                      <div key={announcementData._id} className="p-3 bg-[#E95444]/20 border-b-[1px] rounded-[5px] border-[#979797]">
                        <h4 className="font-semibold text-black mb-1">{announcementData.title}</h4>
                        <p className="text-small text-black mb-2">{announcementData.content}</p>
                        <p className="text-mini text-[#979797]">
                          By {typeof announcementData.createdBy === 'object' ? announcementData.createdBy.name : 'Unknown'} • {new Date(announcementData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pinned Posts Section */}
            {filteredPinnedPosts.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] p-[10px] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                <h3 className="text-black mb-3 font-semibold flex items-center gap-2">
                  📌 PINNED POSTS
                </h3>
                <div className="flex flex-col gap-2">
                  {filteredPinnedPosts.map((post: Blog) => (
                    <BlogPostSmall key={post._id} blog={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Rules Section */}
            {community.rules && community.rules.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] p-[10px] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                <h3 className="text-black mb-3 font-semibold">RULES</h3>
                <ul className="list-decimal list-inside space-y-2 text-small text-black">
                  {community.rules.map((rule: string, index: number) => (
                    <li key={index} className="text-black/90">{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Your Posts Section */}
            {user && userPosts.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] p-[10px] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                <h3 className="text-black mb-3">YOUR POSTS</h3>
                <div className="flex flex-col gap-2">
                  {userPosts.map((post: Blog) => {
                    const postUserId = typeof post.user === 'string' ? post.user : post.user._id;
                    const isOwnPost = user && postUserId === user._id;
                    
                    if (!isOwnPost) return null;
                    
                    return (
                      <BlogPostSmall key={post._id} blog={post} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Communities
            {otherCommunities.length > 0 && (
              <div className='bg-[#EDEDE9] border-[3px] border-[#000000] p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-6'>
                <h3 className="text-black mb-3">OTHER COMMUNITIES</h3>
                <div className='flex flex-col gap-[10px]'>
                  {otherCommunities.map((comm: Community) => (
                    <div 
                      key={comm._id}
                      className="p-3 bg-[#D6D6CD] border border-[#000000] rounded-lg cursor-pointer hover:bg-[#C6C6BD] transition-colors"
                      onClick={() => window.location.href = `/community/${comm._id}`}
                    >
                      <h4 className="font-semibold text-black">{comm.title}</h4>
                      <p className="text-mini text-[#979797]">{comm.members?.length || 0} members</p>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
        </aside>
      </div>
    </div>
  );
};


