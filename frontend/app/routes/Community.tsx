import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { Community, Blog } from '~/types/types';
import Sidebar from '~/components/Sidebar';
import BlogPostCard from '~/components/blogPostCard';
import { Search, Users, Calendar, Film, FlaskConical, Briefcase, Edit, Trash2 } from 'lucide-react';
import type { Route } from './+types/Community';

const API_URL = import.meta.env.VITE_API_URL;

export default function Community({ params }: Route.ComponentProps) {
  const { user } = useUser();
  const [community, setCommunity] = useState<Community | null>(null);
  const [otherCommunities, setOtherCommunities] = useState<Community[]>([]);
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
      return <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-white rounded-full" />
          ))}
        </div>
      </div>;
    } else if (lowerTitle.includes('travel')) {
      return <Briefcase size={24} className="text-white" />;
    } else if (lowerTitle.includes('movie')) {
      return <Film size={24} className="text-white" />;
    } else if (lowerTitle.includes('beauty')) {
      return <FlaskConical size={24} className="text-white" />;
    }
    return <Users size={24} className="text-white" />;
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
      <div className="min-h-screen bg-[#0a1118] flex items-center justify-center">
        <div className="text-[#9aa4bd]">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-[#0a1118] flex items-center justify-center">
        <div className="text-[#9aa4bd]">Community not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1118]">
      <div className="flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Search Bar */}
          <div className="relative">
            {/* <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9aa4bd] pointer-events-none z-10" /> */}
            <input
              type="text"
              placeholder={`Search in ${community.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f] transition-colors relative z-0"
            />
          </div>

          {/* Community Header */}
          <div className="bg-[#0f1926] border border-[#1f2735] rounded-lg p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              {community.picture ? (
                <img src={community.picture} alt={community.title} className="w-full h-full rounded-full object-cover" />
              ) : (
                getCommunityIcon(community.title)
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-white text-2xl font-bold mb-1">{community.title}</h1>
              <p className="text-[#9aa4bd] text-sm">
                {formatMemberCount(community.members?.length || 0)} members
              </p>
            </div>
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
              <div className="text-[#9aa4bd] text-center py-12 bg-[#0f1926] border border-[#1f2735] rounded-lg">
                {searchQuery ? 'No posts found matching your search.' : 'No posts yet in this community.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 flex-shrink-0 flex flex-col gap-6">
          {/* Your Communities Section */}
          <div className="bg-[#0f1926] border border-[#1f2735] rounded-lg p-4">


            {/* Current Community Details */}
            <div className="mb-6 pb-6 border-b border-[#1f2735]">
              <div className="flex items-center gap-3 mb-3">
                {community.picture ? (
                  <img src={community.picture} alt={community.title} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {getCommunityIcon(community.title)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{community.title}</h3>
                  <p className="text-[#9aa4bd] text-xs">
                    {formatMemberCount(community.members?.length || 0)} members
                  </p>
                </div>
              </div>
              <p className="text-[#9aa4bd] text-xs leading-relaxed mb-3">
                {community.description || 'A community for like-minded people'}
              </p>
              <div className="text-[#9aa4bd] text-xs space-y-1">
                <p>Creator: @{community.creator?.name || 'Unknown'}</p>
                <p className="flex items-center gap-1">
                  <Calendar size={12} />
                  Date Created: {formatDate(community.createdAt)}
                </p>
              </div>
            </div>

            {/* Rules Section */}
            {community.rules && community.rules.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold text-sm mb-3">RULES:</h3>
                <ol className="list-decimal list-inside space-y-2 text-[#9aa4bd] text-xs">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="leading-relaxed">{rule}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Your Posts Section */}
            {user && userPosts.length > 0 && (
              <div className="mb-6 pb-6 border-b border-[#1f2735]">
                <h3 className="text-white font-semibold text-sm mb-3">YOUR POSTS</h3>
                <div className="space-y-2">
                  {userPosts.map((post: Blog) => {
                    const postUserId = typeof post.user === 'string' ? post.user : post.user._id;
                    const isOwnPost = user && postUserId === user._id;
                    
                    if (!isOwnPost) return null;
                    
                    return (
                      <div
                        key={post._id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-[#121b2a] transition-colors group"
                      >
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => window.location.href = `/blog/${post._id}`}
                        >
                          <h4 className="text-white text-sm font-medium truncate">{post.title}</h4>
                          <p className="text-[#9aa4bd] text-xs truncate">
                            {post.summary || 'No summary'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/edit/${post._id}`;
                            }}
                            className="p-1.5 hover:bg-[#1f2735] rounded transition-colors"
                            title="Edit post"
                          >
                            <Edit size={14} className="text-[#9aa4bd] hover:text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post._id);
                            }}
                            disabled={deletingPostId === post._id}
                            className="p-1.5 hover:bg-[#1f2735] rounded transition-colors disabled:opacity-50"
                            title="Delete post"
                          >
                            <Trash2 size={14} className="text-red-400 hover:text-red-300" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Communities */}
            {otherCommunities.length > 0 && (
              <div>
                <h3 className="text-white font-semibold text-sm mb-3">OTHER COMMUNITIES</h3>
                <div className="space-y-3">
                  {otherCommunities.map((comm) => (
                    <div
                      key={comm._id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-[#121b2a] p-2 rounded-lg transition-colors"
                      onClick={() => window.location.href = `/community/${comm._id}`}
                    >
                      {comm.picture ? (
                        <img src={comm.picture} alt={comm.title} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          {getCommunityIcon(comm.title)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{comm.title}</h4>
                        <p className="text-[#9aa4bd] text-xs">
                          {formatMemberCount(comm.members?.length || 0)} members
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

