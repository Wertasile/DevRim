import React, { useEffect, useState } from 'react';
import { useUser } from '~/context/userContext';
import type { User, Blog, Comment } from '~/types/types';
import fetchUser from '~/apiCalls/fetchUser';
import accept from '~/apiCalls/user/accept';
import decline from '~/apiCalls/user/decline';
import disconnect from '~/apiCalls/user/disconnect';
import { UserXIcon, X, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, ExternalLink, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import Sidebar from '~/components/Sidebar';
import { Skeleton, ConnectionCardSkeleton, StatsCardSkeleton, PostStatSkeleton, RequestCardSkeleton, CommentCardSkeleton } from '~/components/SkeletonLoader';

const API_URL = import.meta.env.VITE_API_URL;

const Connections = () => {
  const { user, setUser } = useUser();
  
  const [connectionUsers, setConnectionUsers] = useState<User[]>([]);
  const [requestReceivedUsers, setRequestReceivedUsers] = useState<User[]>([]);
  const [requestSentUsers, setRequestSentUsers] = useState<User[]>([]);
  
  // Pagination for connections
  const [connectionsPage, setConnectionsPage] = useState(1);
  const [requestsReceivedPage, setRequestsReceivedPage] = useState(1);
  const [requestsSentPage, setRequestsSentPage] = useState(1);
  const connectionsPerPage = 12;
  const requestsPerPage = 10;
  
  // Statistics
  const [userPosts, setUserPosts] = useState<Blog[]>([]);
  const [postStats, setPostStats] = useState<Array<{
    post: Blog;
    views: number;
    likes: number;
    comments: number;
    community: { _id: string; title: string } | null;
  }>>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalPosts: 0
  });

  // Modal states
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [followersPage, setFollowersPage] = useState(1);
  const [followingPage, setFollowingPage] = useState(1);
  const itemsPerPage = 10;
  
  // User comments
  const [userComments, setUserComments] = useState<Array<{
    comment: Comment;
    post: Blog;
    replies: Comment[];
  }>>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [expandedCommentThreads, setExpandedCommentThreads] = useState<Set<string>>(new Set());
  const commentsPerPage = 10;
  
  // Active section tracking
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Navigation view state
  const [view, setView] = useState<'stats' | 'connections' | 'comments'>('stats');
  
  // Loading states
  const [isLoadingConnections, setIsLoadingConnections] = useState<boolean>(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingComments, setIsLoadingComments] = useState<boolean>(true);

  const fetchConnections = async () => {
    setIsLoadingConnections(true);
    try {
      if (user?.connections) {
        const fetchedUsers: User[] = [];
        for (const connection of user.connections) {
          const userData = await fetchUser(connection);
          fetchedUsers.push(userData);
        }
        setConnectionUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const fetchRequestsSent = async () => {
    try {
      if (user?.requestsSent) {
        const fetchedUsers: User[] = [];
        for (const request of user.requestsSent) {
          const userData = await fetchUser(request);
          fetchedUsers.push(userData);
        }
        setRequestSentUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch requests sent:', error);
    }
  };

  const fetchRequestsReceived = async () => {
    try {
      if (user?.requestsReceived) {
        const fetchedUsers: User[] = [];
        for (const request of user.requestsReceived) {
          const userData = await fetchUser(request);
          fetchedUsers.push(userData);
        }
        setRequestReceivedUsers(fetchedUsers);
      }
    } catch (error) {
      console.error('Failed to fetch requests received:', error);
    }
  };

  const fetchAllRequests = async () => {
    setIsLoadingRequests(true);
    try {
      await Promise.all([fetchRequestsSent(), fetchRequestsReceived()]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch user posts and calculate statistics
  const fetchUserPosts = async () => {
    if (!user?._id) return;
    setIsLoadingStats(true);
    
    try {
      const response = await fetch(`${API_URL}/posts/${user._id}`, {
        method: 'get',
        credentials: 'include',
      });
      const posts: Blog[] = await response.json();
      setUserPosts(posts);

      // Calculate total statistics
      const totalLikes = posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
      const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
      
      // Fetch views for user's posts (not views by the user)
      try {
        const postIds = posts.map(post => post._id);
        
        // Fetch views for each post
        const viewsResponse = await fetch(`${API_URL}/analytics/post-views`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ postIds })
        });
        
        let viewsByPost: { [key: string]: number } = {};
        let totalViews = 0;
        
        if (viewsResponse.ok) {
          viewsByPost = await viewsResponse.json();
          totalViews = Object.values(viewsByPost).reduce((sum: number, count: any) => sum + count, 0);
        }

        setStats({
          totalViews,
          totalLikes,
          totalComments,
          totalPosts: posts.length
        });

        // Fetch communities and build individual post statistics
        const communitiesResponse = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        
        let communities: any[] = [];
        if (communitiesResponse.ok) {
          communities = await communitiesResponse.json();
        }

        // Build post statistics with community info
        const postsWithStats = posts.map(post => {
          // Find which community this post belongs to
          const postCommunity = communities.find(comm => 
            comm.posts && comm.posts.some((p: any) => 
              (typeof p === 'string' ? p : p._id) === post._id
            )
          );

          return {
            post,
            views: viewsByPost[post._id] || 0,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            community: postCommunity ? { _id: postCommunity._id, title: postCommunity.title } : null
          };
        });

        setPostStats(postsWithStats);
      } catch (error) {
        console.error('Failed to fetch post statistics:', error);
        // If analytics fails, just use 0 for views
        setStats({
          totalViews: 0,
          totalLikes,
          totalComments,
          totalPosts: posts.length
        });
        
        // Still build post stats without views
        const communitiesResponse = await fetch(`${API_URL}/communities`, {
          method: 'get',
          credentials: 'include',
        });
        
        let communities: any[] = [];
        if (communitiesResponse.ok) {
          communities = await communitiesResponse.json();
        }

        const postsWithStats = posts.map(post => {
          const postCommunity = communities.find(comm => 
            comm.posts && comm.posts.some((p: any) => 
              (typeof p === 'string' ? p : p._id) === post._id
            )
          );

          return {
            post,
            views: 0,
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            community: postCommunity ? { _id: postCommunity._id, title: postCommunity.title } : null
          };
        });

        setPostStats(postsWithStats);
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch followers list
  const fetchFollowers = async () => {
    if (!user?.followers) return;
    
    const fetchedUsers: User[] = [];
    for (const follower of user.followers) {
      try {
        const followerId = typeof follower === 'string' ? follower : follower._id;
        const userData = await fetchUser(followerId);
        fetchedUsers.push(userData);
      } catch (error) {
        console.error(`Failed to fetch follower:`, error);
      }
    }
    setFollowersList(fetchedUsers);
  };

  // Fetch following list
  const fetchFollowing = async () => {
    if (!user?.following) return;
    
    const fetchedUsers: User[] = [];
    for (const following of user.following) {
      try {
        const followingId = typeof following === 'string' ? following : following._id;
        const userData = await fetchUser(followingId);
        fetchedUsers.push(userData);
      } catch (error) {
        console.error(`Failed to fetch following:`, error);
      }
    }
    setFollowingList(fetchedUsers);
  };

  const acceptConnection = async (userId: string) => {
    await accept(userId);
    // Refresh user data
    const userResponse = await fetch(`${API_URL}/me`, {
      method: 'get',
      credentials: 'include',
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
    }
    fetchRequestsReceived();
    fetchConnections();
  };

  const declineConnection = async (userId: string) => {
    await decline(userId);
    setRequestReceivedUsers((prev) => prev.filter(user => user._id !== userId));
  };

  const handleDisconnect = async (userId: string) => {
    await disconnect(userId);
    setConnectionUsers((prev) => prev.filter(user => user._id !== userId));
    // Refresh user data
    const userResponse = await fetch(`${API_URL}/me`, {
      method: 'get',
      credentials: 'include',
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
    }
  };

  // Pagination helpers
  const getPaginatedFollowers = () => {
    const start = (followersPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return followersList.slice(start, end);
  };

  const getPaginatedFollowing = () => {
    const start = (followingPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return followingList.slice(start, end);
  };

  const totalFollowersPages = Math.ceil(followersList.length / itemsPerPage);
  const totalFollowingPages = Math.ceil(followingList.length / itemsPerPage);
  
  // Pagination helpers for connections and requests
  const getPaginatedConnections = () => {
    const start = (connectionsPage - 1) * connectionsPerPage;
    const end = start + connectionsPerPage;
    return connectionUsers.slice(start, end);
  };
  
  const getPaginatedRequestsReceived = () => {
    const start = (requestsReceivedPage - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    return requestReceivedUsers.slice(start, end);
  };
  
  const getPaginatedRequestsSent = () => {
    const start = (requestsSentPage - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    return requestSentUsers.slice(start, end);
  };
  
  const totalConnectionsPages = Math.ceil(connectionUsers.length / connectionsPerPage);
  const totalRequestsReceivedPages = Math.ceil(requestReceivedUsers.length / requestsPerPage);
  const totalRequestsSentPages = Math.ceil(requestSentUsers.length / requestsPerPage);
  
  // Fetch user comments
  const fetchUserComments = async () => {
    if (!user?._id) return;
    setIsLoadingComments(true);
    try {
      // Fetch all posts
      const postsResponse = await fetch(`${API_URL}/posts/`, {
        method: 'get',
        credentials: 'include',
      });
      const allPosts: Blog[] = await postsResponse.json();
      
      // For each post, fetch comments and filter by user
      const commentsWithPosts: Array<{
        comment: Comment;
        post: Blog;
        replies: Comment[];
      }> = [];
      
      for (const post of allPosts) {
        try {
          const commentsResponse = await fetch(`${API_URL}/comments/${post._id}`, {
            method: 'get',
            credentials: 'include',
          });
          
          if (commentsResponse.ok) {
            const postComments: Comment[] = await commentsResponse.json();
            
            // Filter comments by current user
            const userPostComments = postComments.filter(comment => {
              const commentUserId = typeof comment.user === 'string' ? comment.user : comment.user?._id;
              return commentUserId === user._id;
            });
            
            // For each user comment, get its replies
            for (const comment of userPostComments) {
              const commentId = comment._id;
              const replies = postComments.filter(c => {
                const replyToId = typeof c.replyTo === 'string' ? c.replyTo : c.replyTo?._id;
                return replyToId === commentId;
              });
              
              commentsWithPosts.push({
                comment,
                post,
                replies
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch comments for post ${post._id}:`, error);
        }
      }
      
      // Sort by most recent first
      commentsWithPosts.sort((a, b) => {
        const dateA = new Date(a.comment.createdAt || 0).getTime();
        const dateB = new Date(b.comment.createdAt || 0).getTime();
        return dateB - dateA;
      });
      
      setUserComments(commentsWithPosts);
    } catch (error) {
      console.error('Failed to fetch user comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };
  
  const getPaginatedComments = () => {
    const start = (commentsPage - 1) * commentsPerPage;
    const end = start + commentsPerPage;
    return userComments.slice(start, end);
  };
  
  const totalCommentsPages = Math.ceil(userComments.length / commentsPerPage);
  
  const toggleCommentThread = (commentId: string) => {
    const newExpanded = new Set(expandedCommentThreads);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedCommentThreads(newExpanded);
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchAllRequests();
      fetchUserPosts();
      fetchUserComments();
    }
  }, [user]);

  useEffect(() => {
    if (showFollowersModal) {
      fetchFollowers();
      setFollowersPage(1);
    }
  }, [showFollowersModal, user?.followers]);

  useEffect(() => {
    if (showFollowingModal) {
      fetchFollowing();
      setFollowingPage(1);
    }
  }, [showFollowingModal, user?.following]);

  // Intersection Observer for active section highlighting
  useEffect(() => {
    const sections = ['stats', 'connections', 'comments'].filter(id => {
      if (id === 'stats' && stats.totalPosts === 0) return false;
      return true;
    });

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observers: IntersectionObserver[] = [];

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        }, observerOptions);

        observer.observe(element);
        observers.push(observer);
      }
    });

    // Set initial active section
    if (sections.length > 0) {
      const firstSection = document.getElementById(sections[0]);
      if (firstSection) {
        const rect = firstSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.2) {
          setActiveSection(sections[0]);
        }
      }
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [stats.totalPosts]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className='min-h-screen'>
      <div className='flex flex-row gap-6 px-6 py-8'>
        {/* Left Sidebar */}
        <Sidebar/>

        {/* Main Content Area */}
        <div className='flex-grow flex flex-col gap-[50px]'>

          {/* Navigation Tabs */}
          <div className='flex flex-row gap-4 border-[1px] w-fit border-black bg-[#EDEDE9] border-[3px] overflow-hidden shadow-md'>
            {stats.totalPosts > 0 && (
              <button 
                className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                  view === "stats" 
                    ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                    : "hover:bg-[#FEC72F]/30 hover:font-medium"
                }`}
                onClick={() => setView("stats")}
              >
                <h4>Stats</h4>
                {view === "stats" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                )}
              </button>
            )}
            <button 
              className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                view === "connections" 
                  ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                  : "hover:bg-[#FEC72F]/30 hover:font-medium"
              }`}
              onClick={() => setView("connections")}
            >
              <h4>Connections</h4>
              {view === "connections" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
              )}
            </button>
            <button 
              className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                view === "comments" 
                  ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                  : "hover:bg-[#FEC72F]/30 hover:font-medium"
              }`}
              onClick={() => setView("comments")}
            >
              <h4>My Comments</h4>
              {view === "comments" && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
              )}
            </button>
          </div>

          {/* Stats Section */}
          {view === "stats" && (isLoadingStats ? (
            <div id="stats" className='flex flex-col gap-4 scroll-mt-8' role="status" aria-live="polite" aria-label="Loading statistics">
              <div className='p-4 flex flex-col gap-3'>
                <Skeleton width={160} height={24} />
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  {[...Array(4)].map((_, i) => (
                    <StatsCardSkeleton key={`stat-${i}`} />
                  ))}
                </div>
              </div>
              <div className='p-4 flex flex-col gap-3'>
                <Skeleton width={160} height={24} />
                <div className='flex flex-col gap-3'>
                  {[...Array(3)].map((_, i) => (
                    <PostStatSkeleton key={`post-stat-${i}`} />
                  ))}
                </div>
              </div>
            </div>
          ) : stats.totalPosts > 0 && (
            <div id="stats" className='flex flex-col gap-[50px] scroll-mt-8'>
               <div className='flex flex-col justify-center items-center gap-[10px]'>
                 <h2>YOUR STATISTICS</h2>
                 <div className='flex gap-[10px] w-fit'>
                   <div className='relative flex flex-col min-w-[200px] items-center p-4 bg-gradient-to-br from-[#4DD499]/10 via-[#4DD499]/5 to-white border-2 border-[#000000] rounded-lg overflow-hidden'>
                     <Eye 
                       size={100}
                       className='absolute -right-[30px] top-1/2 -translate-y-1/2 text-[#4DD499]/15' 
                       style={{ filter: 'blur(3px)' }}
                       aria-hidden="true"
                     />
                     <div className='text-2xl font-bold relative z-10'>{stats.totalViews}</div>
                     <div className='text-small relative z-10'>VIEWS</div>
                   </div>
                   <div className='relative flex flex-col min-w-[200px] items-center p-4 bg-gradient-to-br from-[#E95444]/10 via-[#E95444]/5 to-white border-2 border-[#000000] rounded-lg overflow-hidden'>
                     <Heart 
                       size={100}
                       className='absolute -right-[30px] top-1/2 -translate-y-1/2 text-[#E95444]/15' 
                       style={{ filter: 'blur(3px)' }}
                       aria-hidden="true"
                     />
                     <div className='text-2xl font-bold relative z-10'>{stats.totalLikes}</div>
                     <div className='text-small relative z-10'>LIKES</div>
                   </div>
                   <div className='relative flex flex-col min-w-[200px] items-center p-4 bg-gradient-to-br from-[#5D64F4]/10 via-[#5D64F4]/5 to-white border-2 border-[#000000] rounded-lg overflow-hidden'>
                     <MessageCircle 
                       size={100}
                       className='absolute -right-[30px] top-1/2 -translate-y-1/2 text-[#5D64F4]/15' 
                       style={{ filter: 'blur(3px)' }}
                       aria-hidden="true"
                     />
                     <div className='text-2xl font-bold relative z-10'>{stats.totalComments}</div>
                     <div className='text-small relative z-10'>COMMENTS</div>
                   </div>
                   <div className='relative flex flex-col min-w-[200px] items-center p-4 bg-gradient-to-br from-[#FEC72F]/10 via-[#FEC72F]/5 to-white border-2 border-[#000000] rounded-lg overflow-hidden'>
                     <FileText 
                       size={100}
                       className='absolute -right-[30px] top-1/2 -translate-y-1/2 text-[#FEC72F]/15' 
                       style={{ filter: 'blur(3px)' }}
                       aria-hidden="true"
                     />
                     <div className='text-2xl font-bold relative z-10'>{stats.totalPosts}</div>
                     <div className='text-small relative z-10'>POSTS</div>
                   </div>
                 </div>
               </div>

              {/* Individual Post Statistics */}
              <div className=''>
                <h2 className='text-2xl font-semibold mb-4'>POST STATISTICS</h2>
                <div className='grid lg:grid-cols-3 grid-cols-1 md:grid-cols-2 gap-4'>
                  {postStats.map((postStat) => (
                    <div 
                      key={postStat.post._id}
                      className='bg-white border-2 border-[#000000] rounded-lg p-4 hover:shadow-lg transition-all duration-200'
                    >
                      <div className='flex flex-col gap-3'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-black mb-1'>{postStat.post.title}</h3>
                            {postStat.community && (
                              <div className='text-sm text-black/70'>
                                Community: <span className='font-medium'>{postStat.community.title}</span>
                              </div>
                            )}
                            {!postStat.community && (
                              <div className='text-sm text-black/50 italic'>No community</div>
                            )}
                          </div>
                        </div>
                        <div className='grid grid-cols-3 gap-4 pt-3 border-t border-black/20'>
                          <div className='flex flex-col items-center'>
                            <Eye size={20} className='text-[#4DD499] mb-1' />
                            <div className='text-lg font-bold'>{postStat.views}</div>
                            <div className='text-xs text-black/70'>Views</div>
                          </div>
                          <div className='flex flex-col items-center'>
                            <Heart size={20} className='text-[#E95444] mb-1' />
                            <div className='text-lg font-bold'>{postStat.likes}</div>
                            <div className='text-xs text-black/70'>Likes</div>
                          </div>
                          <div className='flex flex-col items-center'>
                            <MessageCircle size={20} className='text-[#5D64F4] mb-1' />
                            <div className='text-lg font-bold'>{postStat.comments}</div>
                            <div className='text-xs text-black/70'>Comments</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Connections Section */}
          {view === "connections" && (
          <div id="connections" className='flex flex-col gap-6 scroll-mt-8'>
            {/* Count Cards */}
            <div className='flex flex-row gap-4 justify-center'>
              {/* Connections */}
              <div 
                className='border-2 border-[#000000] bg-[#EDEDE9] flex flex-col items-center p-6 rounded-lg cursor-pointer hover:bg-[#E0E0DC] transition-all duration-200 hover:shadow-lg'
              >
                <h2 className='text-4xl font-bold'>{user?.connections?.length || 0}</h2>
                <h3 className='text-sm font-semibold mt-2'>CONNECTIONS</h3>
              </div>
              {/* Following - Clickable */}
              <div 
                onClick={() => {
                  if (user?.following && user.following.length > 0) {
                    setShowFollowingModal(true);
                  }
                }}
                className={`border-2 border-[#000000] bg-[#EDEDE9] flex flex-col items-center p-6 rounded-lg transition-all duration-200 hover:shadow-lg ${
                  user?.following && user.following.length > 0 ? 'cursor-pointer hover:bg-[#E0E0DC]' : ''
                }`}
              >
                <h2 className='text-4xl font-bold'>{user?.following?.length || 0}</h2>
                <h3 className='text-sm font-semibold mt-2'>FOLLOWING</h3>
              </div>
              {/* Followers - Clickable */}
              <div 
                onClick={() => {
                  if (user?.followers && user.followers.length > 0) {
                    setShowFollowersModal(true);
                  }
                }}
                className={`border-2 border-[#000000] bg-[#EDEDE9] flex flex-col items-center p-6 rounded-lg transition-all duration-200 hover:shadow-lg ${
                  user?.followers && user.followers.length > 0 ? 'cursor-pointer hover:bg-[#E0E0DC]' : ''
                }`}
              >
                <h2 className='text-4xl font-bold'>{user?.followers?.length || 0}</h2>
                <h3 className='text-sm font-semibold mt-2'>FOLLOWERS</h3>
              </div>
            </div>

            {/* Connections List */}
            <div>
              <h2 className='text-2xl font-semibold mb-4'>
                MY CONNECTIONS ({isLoadingConnections ? '...' : connectionUsers.length})
              </h2>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {isLoadingConnections ? (
                [...Array(8)].map((_, i) => (
                  <ConnectionCardSkeleton key={`connection-skeleton-${i}`} />
                ))
              ) : getPaginatedConnections().length > 0 ? (
                getPaginatedConnections().map((connection) => (
                  <div 
                    key={connection._id}
                    className='flex flex-col bg-[#EDEDE9] border-2 border-[#000000] rounded-lg p-4 hover:shadow-lg transition-all duration-200'
                  >
                    <div 
                      className='flex flex-col gap-3 items-center cursor-pointer mb-3'
                      onClick={() => window.location.href = `/profile/${connection._id}`}
                    >
                      <img 
                        className="rounded-full border-2 border-[#000000] object-cover" 
                        src={connection.picture} 
                        width={64} 
                        height={64}
                        alt={connection.name}
                      />
                      <div className='text-center'>
                        <div className='font-semibold text-black'>{connection.name}</div>
                        {connection.byline && (
                          <div className='text-xs text-black/70 mt-1'>{connection.byline}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnect(connection._id)}
                      className='icon bg-red-500 hover:bg-red-600 text-white transition-all duration-200'
                      title="Disconnect"
                    >
                      <UserXIcon size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <div className='text-black/60 text-center py-8 col-span-full'>No connections yet</div>
              )}
            </div>
            {totalConnectionsPages > 1 && (
              <div className='flex items-center justify-center gap-4 mt-6'>
                <button
                  onClick={() => setConnectionsPage(prev => Math.max(1, prev - 1))}
                  disabled={connectionsPage === 1}
                  className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronLeft size={18} />
                </button>
                <span className='text-black font-medium'>
                  Page {connectionsPage} of {totalConnectionsPages}
                </span>
                <button
                  onClick={() => setConnectionsPage(prev => Math.min(totalConnectionsPages, prev + 1))}
                  disabled={connectionsPage === totalConnectionsPages}
                  className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            </div>

            {/* Requests Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Requests Received */}
            <div>
              <h2 className='text-2xl font-semibold mb-4'>
                REQUESTS RECEIVED ({isLoadingRequests ? '...' : requestReceivedUsers.length})
              </h2>
              <div className='flex flex-col gap-3'>
                {isLoadingRequests ? (
                  [...Array(3)].map((_, i) => (
                    <RequestCardSkeleton key={`request-received-skeleton-${i}`} />
                  ))
                ) : getPaginatedRequestsReceived().length > 0 ? (
                  getPaginatedRequestsReceived().map((requestUser) => (
                    <div 
                      key={requestUser._id}
                      className='p-4 border-2 border-[#000000] rounded-lg bg-[#EDEDE9]'
                    >
                      <div className='flex items-center gap-3 mb-3'>
                        <img 
                          className="rounded-full border-2 border-[#000000] object-cover" 
                          src={requestUser.picture} 
                          width={48} 
                          height={48}
                          alt={requestUser.name}
                        />
                        <div className='flex flex-col flex-1'>
                          <div className='font-semibold text-black'>{requestUser.name}</div>
                          {requestUser.byline && (
                            <div className='text-xs text-black/70'>{requestUser.byline}</div>
                          )}
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button 
                          className="flex-1 primary-btn bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200" 
                          onClick={() => acceptConnection(requestUser._id)}
                        >
                          <span>ACCEPT</span>
                        </button>
                        <button 
                          className="flex-1 secondary-btn hover:bg-[#D6D6CD] transition-all duration-200" 
                          onClick={() => declineConnection(requestUser._id)}
                        >
                          DECLINE
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-black/60 text-center py-8'>No requests received</div>
                )}
              </div>
              {totalRequestsReceivedPages > 1 && (
                <div className='flex items-center justify-center gap-4 mt-6'>
                  <button
                    onClick={() => setRequestsReceivedPage(prev => Math.max(1, prev - 1))}
                    disabled={requestsReceivedPage === 1}
                    className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className='text-black font-medium'>
                    Page {requestsReceivedPage} of {totalRequestsReceivedPages}
                  </span>
                  <button
                    onClick={() => setRequestsReceivedPage(prev => Math.min(totalRequestsReceivedPages, prev + 1))}
                    disabled={requestsReceivedPage === totalRequestsReceivedPages}
                    className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {/* Requests Sent */}
            <div>
              <h2 className='text-2xl font-semibold mb-4'>
                REQUESTS SENT ({isLoadingRequests ? '...' : requestSentUsers.length})
              </h2>
              <div className='flex flex-col gap-3'>
                {isLoadingRequests ? (
                  [...Array(3)].map((_, i) => (
                    <RequestCardSkeleton key={`request-sent-skeleton-${i}`} />
                  ))
                ) : getPaginatedRequestsSent().length > 0 ? (
                  getPaginatedRequestsSent().map((requestUser) => (
                    <div 
                      key={requestUser._id}
                      className='p-4 border-2 border-[#000000] rounded-lg bg-[#EDEDE9] cursor-pointer hover:shadow-lg transition-all duration-200'
                      onClick={() => window.location.href = `/profile/${requestUser._id}`}
                    >
                      <div className='flex items-center gap-3'>
                        <img 
                          className="rounded-full border-2 border-[#000000] object-cover" 
                          src={requestUser.picture} 
                          width={48} 
                          height={48}
                          alt={requestUser.name}
                        />
                        <div className='flex flex-col flex-1'>
                          <div className='font-semibold text-black'>{requestUser.name}</div>
                          {requestUser.byline && (
                            <div className='text-xs text-black/70'>{requestUser.byline}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-black/60 text-center py-8'>No requests sent</div>
                )}
              </div>
              {totalRequestsSentPages > 1 && (
                <div className='flex items-center justify-center gap-4 mt-6'>
                  <button
                    onClick={() => setRequestsSentPage(prev => Math.max(1, prev - 1))}
                    disabled={requestsSentPage === 1}
                    className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className='text-black font-medium'>
                    Page {requestsSentPage} of {totalRequestsSentPages}
                  </span>
                  <button
                    onClick={() => setRequestsSentPage(prev => Math.min(totalRequestsSentPages, prev + 1))}
                    disabled={requestsSentPage === totalRequestsSentPages}
                    className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
          )}
          
          {/* User Comments Section */}
          {view === "comments" && (
          <div id="comments" className='scroll-mt-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              MY COMMENTS ({isLoadingComments ? '...' : userComments.length})
            </h2>
            <div className='flex flex-col gap-4'>
              {isLoadingComments ? (
                [...Array(3)].map((_, i) => (
                  <CommentCardSkeleton key={`comment-skeleton-${i}`} />
                ))
              ) : getPaginatedComments().length > 0 ? (
                getPaginatedComments().map(({ comment, post, replies }) => {
                  const isExpanded = expandedCommentThreads.has(comment._id);
                  const commentUser = typeof comment.user === 'string' ? null : comment.user;
                  
                  return (
                    <div 
                      key={comment._id}
                      className='bg-[#EDEDE9] border-2 border-[#000000] rounded-lg p-4 hover:shadow-lg transition-all duration-200'
                    >
                      {/* Post Info */}
                      <div className='mb-4 pb-4 border-b border-black/20'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='flex-1'>
                            <h3 className='text-lg font-semibold text-black mb-1'>{post.title}</h3>
                            <p className='text-sm text-black/70 line-clamp-2'>{post.summary}</p>
                          </div>
                          <button
                            onClick={() => window.location.href = `/blog/${post._id}`}
                            className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black transition-all duration-200 flex-shrink-0'
                            title="Go to post"
                          >
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Comment */}
                      <div className='flex gap-3 mb-3'>
                        <img 
                          src={commentUser?.picture || user?.picture} 
                          className="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-[#000000]" 
                          width={40} 
                          height={40}
                          alt={commentUser?.name || user?.name}
                        />
                        <div className='flex-grow'>
                          <div className='flex items-center gap-2 mb-2'>
                            <div className='font-medium text-black'>{commentUser?.name || user?.name}</div>
                            <div className='text-xs text-black/60'>
                              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <p className='text-black leading-relaxed mb-2'>{comment.comment}</p>
                          {replies.length > 0 && (
                            <button
                              onClick={() => toggleCommentThread(comment._id)}
                              className='text-xs text-black/70 hover:text-black font-medium transition-colors flex items-center gap-1'
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={12} />
                                  Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} />
                                  View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Replies Thread */}
                      {replies.length > 0 && isExpanded && (
                        <div className='ml-13 flex flex-col gap-3 pl-6 border-l-2 border-black/20 mt-2'>
                          {replies.map((reply) => {
                            const replyUser = typeof reply.user === 'string' ? null : reply.user;
                            return (
                              <div key={reply._id} className='flex gap-3'>
                                <img 
                                  src={replyUser?.picture || ''} 
                                  className="flex-shrink-0 w-8 h-8 rounded-full object-cover border-2 border-[#000000]" 
                                  width={32} 
                                  height={32}
                                  alt={replyUser?.name || ''}
                                />
                                <div className='flex-grow'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <span className='text-black font-medium text-sm'>{replyUser?.name || 'Unknown'}</span>
                                    <span className='text-black/60 text-xs'>
                                      {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ''}
                                    </span>
                                  </div>
                                  <p className='text-black text-sm leading-relaxed'>{reply.comment}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className='text-black/60 text-center py-8'>No comments yet</div>
              )}
            </div>
            {totalCommentsPages > 1 && (
              <div className='flex items-center justify-center gap-4 mt-6'>
                <button
                  onClick={() => setCommentsPage(prev => Math.max(1, prev - 1))}
                  disabled={commentsPage === 1}
                  className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronLeft size={18} />
                </button>
                <span className='text-black font-medium'>
                  Page {commentsPage} of {totalCommentsPages}
                </span>
                <button
                  onClick={() => setCommentsPage(prev => Math.min(totalCommentsPages, prev + 1))}
                  disabled={commentsPage === totalCommentsPages}
                  className='icon bg-[#FEC72F] hover:bg-[#FEC72F] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4' onClick={() => setShowFollowersModal(false)}>
          <div className='bg-[#EDEDE9] border-2 border-[#000000] rounded-lg w-full max-w-[500px] max-h-[80vh] flex flex-col shadow-2xl' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between p-6 border-b-2 border-[#000000]'>
              <h2 className='text-2xl font-semibold'>FOLLOWERS ({followersList.length})</h2>
              <button 
                onClick={() => setShowFollowersModal(false)}
                className='p-2 hover:bg-[#D6D6CD] rounded-lg transition-colors'
              >
                <X size={20} className='text-black' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-6'>
              {getPaginatedFollowers().length > 0 ? (
                <div className='flex flex-col gap-3'>
                  {getPaginatedFollowers().map((follower) => (
                    <div 
                      key={follower._id}
                      className='flex items-center gap-3 p-3 bg-white border-2 border-[#000000] rounded-lg cursor-pointer hover:shadow-md transition-all duration-200'
                      onClick={() => window.location.href = `/profile/${follower._id}`}
                    >
                      <img 
                        className="rounded-full border-2 border-[#000000] object-cover" 
                        src={follower.picture} 
                        width={48} 
                        height={48}
                        alt={follower.name}
                      />
                      <div className='flex flex-col flex-1'>
                        <div className='font-semibold text-black'>{follower.name}</div>
                        {follower.byline && (
                          <div className='text-xs text-black/70'>{follower.byline}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-black/60 text-center py-8'>No followers</div>
              )}
            </div>
            {totalFollowersPages > 1 && (
              <div className='flex items-center justify-between p-4 border-t-2 border-[#000000]'>
                <button
                  onClick={() => setFollowersPage(prev => Math.max(1, prev - 1))}
                  disabled={followersPage === 1}
                  className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronLeft size={18} />
                </button>
                <span className='text-black font-medium'>
                  Page {followersPage} of {totalFollowersPages}
                </span>
                <button
                  onClick={() => setFollowersPage(prev => Math.min(totalFollowersPages, prev + 1))}
                  disabled={followersPage === totalFollowersPages}
                  className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4' onClick={() => setShowFollowingModal(false)}>
          <div className='bg-[#EDEDE9] border-2 border-[#000000] rounded-lg w-full max-w-[500px] max-h-[80vh] flex flex-col shadow-2xl' onClick={(e) => e.stopPropagation()}>
            <div className='flex items-center justify-between p-6 border-b-2 border-[#000000]'>
              <h2 className='text-2xl font-semibold'>FOLLOWING ({followingList.length})</h2>
              <button 
                onClick={() => setShowFollowingModal(false)}
                className='p-2 hover:bg-[#D6D6CD] rounded-lg transition-colors'
              >
                <X size={20} className='text-black' />
              </button>
            </div>
            <div className='flex-1 overflow-y-auto p-6'>
              {getPaginatedFollowing().length > 0 ? (
                <div className='flex flex-col gap-3'>
                  {getPaginatedFollowing().map((following) => (
                    <div 
                      key={following._id}
                      className='flex items-center gap-3 p-3 bg-white border-2 border-[#000000] rounded-lg cursor-pointer hover:shadow-md transition-all duration-200'
                      onClick={() => window.location.href = `/profile/${following._id}`}
                    >
                      <img 
                        className="rounded-full border-2 border-[#000000] object-cover" 
                        src={following.picture} 
                        width={48} 
                        height={48}
                        alt={following.name}
                      />
                      <div className='flex flex-col flex-1'>
                        <div className='font-semibold text-black'>{following.name}</div>
                        {following.byline && (
                          <div className='text-xs text-black/70'>{following.byline}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-black/60 text-center py-8'>Not following anyone</div>
              )}
            </div>
            {totalFollowingPages > 1 && (
              <div className='flex items-center justify-between p-4 border-t-2 border-[#000000]'>
                <button
                  onClick={() => setFollowingPage(prev => Math.max(1, prev - 1))}
                  disabled={followingPage === 1}
                  className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronLeft size={18} />
                </button>
                <span className='text-black font-medium'>
                  Page {followingPage} of {totalFollowingPages}
                </span>
                <button
                  onClick={() => setFollowingPage(prev => Math.min(totalFollowingPages, prev + 1))}
                  disabled={followingPage === totalFollowingPages}
                  className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
