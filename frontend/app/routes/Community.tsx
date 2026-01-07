import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { Community, Blog } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import BlogPostCard from '~/components/blogPostCard';
import { Search, Users, Calendar, Film, FlaskConical, Briefcase, Edit, Trash2, FilterIcon, SortAscIcon, SortDescIcon, PlusIcon } from 'lucide-react';
import type { Route } from './+types/Community';
import BlogPostSmall from '~/components/blogPostSmall';
import leaveCommunity from '~/apiCalls/Community/leaveCommunity';
import joinCommunity from '~/apiCalls/Community/joinCommunity';
import TopicPill from '~/components/TopicPill';

const API_URL = import.meta.env.VITE_API_URL;

export default function Community({ params }: Route.ComponentProps) {
  const { user } = useUser();
  const [community, setCommunity] = useState<Community | null>(null);
  const [otherCommunities, setOtherCommunities] = useState<Community[]>([]);
  const [pinnedPosts, setPinnedPosts] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

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

  const filteredPosts = community?.posts?.filter((post: Blog) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      (post.summary && post.summary.toLowerCase().includes(query))
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
      <div className="min-h-screen flex items-center justify-center bg-[#EDEDE9]">
        <h3 className="text-black">LOADING COMMUNITY</h3>
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
      <div className="flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Community Header */}
          <div className='flex justify-between items-center'>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E95444] flex items-center justify-center flex-shrink-0 border-2 border-[#000000]">
                {community.picture ? (
                <img src={community.picture} alt={community.title.toUpperCase()} className="w-full h-full rounded-full border-2 border-[#000000] object-cover" />
                ) : (
                getCommunityIcon(community.title)
                )}
              </div>
              <h1>{community.title.toUpperCase()}</h1>
            </div>
            {user?.communities?.includes(community._id) ? (
              <div className='flex gap-[10px]'>
              <button className='primary-btn bg-[#E95444] hover:bg-[#d84333] text-black transition-all duration-200' onClick={() => leaveCommunity(community._id)}>LEAVE</button>
              <button className='icon bg-[#FEC72F] hover:bg-[#E95444] text-black transition-all duration-200 hover:scale-110 hover:shadow-lg' onClick={() => window.location.href = `/blog/new?communityId=${community._id}`}><PlusIcon size={20} /></button>
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
              className="flex-1 py-3 px-4 bg-[#D6D6CD] border-2 border-[#000000] rounded-lg focus:outline-none focus:border-[#E95444] transition-all duration-200 text-black placeholder:text-[#979797]"
            />
            <button className='icon bg-[#FEC72F] hover:bg-[#E95444] text-black transition-all duration-200 hover:scale-110 hover:shadow-lg'><FilterIcon size={20} /></button>
            <button className='icon bg-[#FEC72F] hover:bg-[#E95444] text-black transition-all duration-200 hover:scale-110 hover:shadow-lg'><SortDescIcon size={20} /></button>
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post: Blog, index: number) => (
                <BlogPostCard
                  key={post._id}
                  id={post._id}
                  title={post.title}
                  releaseDate={post.releaseDate}
                  summary={post.summary || ''}
                  postUser={post.user}
                  comments={post.comments || []}
                  likes={post.likes || []}
                  content={post.content}
                  visualIndex={index}
                />
              ))
            ) : (
              <div className="text-center text-[#979797] py-8">
                {searchQuery ? 'No posts found matching your search.' : 'No posts yet in this community.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
          {/* Your Communities Section */}



            {/* Current Community Details */}
            <div className="bg-[#EDEDE9] border-[3px] border-[#000000] rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
              <div className="flex items-center gap-3 mb-3">
                {community.picture ? (
                  <img src={community.picture} alt={community.title} className="w-10 h-10 rounded-full object-cover border-2 border-[#000000]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E95444] flex items-center justify-center border-2 border-[#000000]">
                    {getCommunityIcon(community.title)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-black">{community.title}</h3>
                  <p className="text-[#979797] text-xs">
                    {formatMemberCount(community.members?.length || 0)} members
                  </p>
                </div>
              </div>
              <div className="text-small leading-relaxed mb-3 text-black">
                {community.description || 'A community for like-minded people'}
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
              <div className="text-small text-black">
                <p>Creator: @{community.creator?.name || 'Unknown'}</p>
                <p className="flex items-center gap-1 text-[#979797]">
                  <Calendar size={12} />
                  Date Created: {formatDate(community.createdAt)}
                </p>
              </div>
            </div>

            {/* Announcements Section */}
            {community.rules && community.rules.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                <h3 className="text-black mb-3">ANNOUNCEMENTS</h3>
                <ul className="list-disc list-inside space-y-2 text-small text-black">
                  {(community.announcements && community.announcements.length > 0) ? (community.announcements?.map((announcement: any, index: number) => (
                    <li key={index}>{announcement.title}</li>
                  ))) : (
                    <li className="text-[#979797]">No announcements yet</li>
                  )}
                </ul>
              </div>
            )}

            {/* Your Posts Section */}
            {user && userPosts.length > 0 && (
              <div className="bg-[#EDEDE9] border-[3px] border-[#000000] rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
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

            {/* Pinned Posts */}
            {otherCommunities.length > 0 && (
              <div className='bg-[#EDEDE9] border-[3px] border-[#000000] rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 mb-6'>
                <h3 className="text-black mb-3">PINNED POSTS</h3>
                <div className='flex flex-col gap-[10px]'>
                  {user && pinnedPosts.length > 0 ? (
                    pinnedPosts.map((b: any) => (
                      <BlogPostSmall key={b.blog?._id} blog={b.blog} />
                    ))
                  ) : (
                    <div className="text-[#979797] italic">Pinned posts appear here once available.</div>
                  )}
                </div>
              </div>
            )}
        </aside>
      </div>
    </div>
  );
};

