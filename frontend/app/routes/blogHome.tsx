import React, { useEffect, useState } from 'react';
import BlogPostCard from '../components/blogPostCard';
import type { Blog, Community, Trending } from '~/types/types';
import { useLocation } from 'react-router';
import { useUser } from '~/context/userContext';
import {
    Bell,
    Compass,
    Headphones,
    Heart,
    MessageCircle,
    Plus,
    TrendingUp,
    Video,
} from 'lucide-react';
import Sidebar from '~/components/Sidebar';
import BlogPostSmall from '~/components/blogPostSmall';
import getUserCommunities from '~/apiCalls/Community/getUserCommunities';
import CommunityIcon from '~/components/communityIcon';
import CommunityCardSmall from '~/components/CommunityCardSmall';
import { BlogPostCardSkeleton, BlogPostSmallSkeleton, CommunityCardSkeleton, Skeleton } from '~/components/SkeletonLoader';
import WelcomeScreen from '~/components/WelcomeScreen';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogHome() {

    const {user} = useUser();

    const [blogs, setBlogs] = useState<Blog []>([]);
    const [recommendations, setRecommendations] = useState<Blog []>([]);
    const [trending, setTrending] = useState<Trending[]>([]);
    const [searchResults, setSearchResults] = useState<Blog[]>([]);
    const [section, setSection] = useState<"For You" | "Featured" | "Search Results" | "Latest">("For You");
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(true);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState<boolean>(true);
    const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(true);
    
    const location = useLocation();
    useEffect(() => {
        if (location.state?.section === 'Search Results') {
        setSection('Search Results');
        }

        if (location.state?.searchResults) {
        setSearchResults(location.state.searchResults);
        }
    }, [location.state]);

    useEffect(() => {
        if (user?._id) {
            getUserCommunities(user._id).then((data: Community[]) => {
                setUserCommunities(data);
                console.log(data);
            }).catch((err) => {
                console.error(err);
            });
        }
    }, [user]);

    const getBlogs = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/`, {
                method: "get",
                credentials: "include",
            });
            const data = await response.json();
            setBlogs(data);
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getRecommendations = async () => {
        setIsLoadingRecommendations(true);
        try {
            const response = await fetch(`${API_URL}/analytics/recommendations`, {
                method: "get",
                credentials: 'include'
            })
            const data = await response.json()
            setRecommendations(data);
        } catch (err) {
            console.error(err);
            setRecommendations([]);
        } finally {
            setIsLoadingRecommendations(false);
        }
    }

    const getTrending = async () => {
        setIsLoadingTrending(true);
        try {
            const response = await fetch(`${API_URL}/analytics/trending`, {
                method: "get",
                credentials: 'include'
            })
            const data = await response.json()
            setTrending(data);
        } catch (err) {
            console.error('Failed to fetch trending:', err);
            setTrending([]);
        } finally {
            setIsLoadingTrending(false);
        }
    }

    const getTrendingCommunities = async () => {
        setIsLoadingCommunities(true);
        try {
            const response = await fetch(`${API_URL}/communities/`, {
                method: "get",
                credentials: 'include'
            })
            const data: Community[] = await response.json()
            
            // Sort communities by member count and post count to determine trending
            const sorted = data.sort((a, b) => {
                const aMembers = a.members?.length || 0;
                const bMembers = b.members?.length || 0;
                const aPosts = a.posts?.length || 0;
                const bPosts = b.posts?.length || 0;
                
                // Calculate a score: members * 2 + posts (members weighted more)
                const aScore = aMembers * 2 + aPosts;
                const bScore = bMembers * 2 + bPosts;
                
                return bScore - aScore;
            });
            
            // Limit to top 5
            setTrendingCommunities(sorted.slice(0, 5));
        } catch (err) {
            console.error("Failed to fetch trending communities:", err);
            setTrendingCommunities([]);
        } finally {
            setIsLoadingCommunities(false);
        }
    }

    useEffect(() => {
        console.log("user context value:", user);
        if (!user) return;

        getBlogs();
        getTrending();
        getRecommendations();
        getTrendingCommunities();
    }, [user]);

    const trendingPosts = (trending?.[0]?.posts ?? []).slice(0, 5);

    const renderSection = () => {
        const isLoadingSection = 
            (section === "For You" && isLoadingRecommendations) ||
            (section === "Latest" && isLoading) ||
            (section === "Search Results" && searchResults.length === 0 && isLoading);

        if (isLoadingSection) {
            return (
                <>
                    {[...Array(3)].map((_, i) => (
                        <BlogPostCardSkeleton key={`skeleton-${i}`} />
                    ))}
                </>
            );
        }

        if (section === "For You") {
            if (recommendations.length === 0) {
                return (
                    <div className="text-center py-8 text-[#979797]" role="status" aria-live="polite">
                        <p>No recommendations available yet. Check back later!</p>
                    </div>
                );
            }
            return recommendations.map((b, idx) => (
                <BlogPostCard
                    key={b._id}
                    id={b._id}
                    postUser={b.user}
                    title={b.title}
                    releaseDate={b.releaseDate}
                    summary={b.summary}
                    content={b.content}
                    comments={b.comments}
                    likes={b.likes}
                    visualIndex={idx}
                    coverImage={b.coverImage}
                    community={b.community}
                />
            ));
        }

        if (section === "Search Results") {
            if (searchResults.length === 0) {
                return (
                    <div className="text-center py-8 text-[#979797]" role="status" aria-live="polite">
                        <p>No search results found.</p>
                    </div>
                );
            }
            return searchResults.map((b, idx) => (
                <BlogPostCard
                    key={b._id}
                    id={b._id}
                    postUser={b.user}
                    title={b.title}
                    releaseDate={b.releaseDate}
                    summary={b.summary}
                    content={b.content}
                    comments={b.comments}
                    likes={b.likes}
                    visualIndex={idx}
                    coverImage={b.coverImage}
                    community={b.community}
                />
            ));
        }

        if (blogs.length === 0) {
            return (
                <div className="text-center py-8 text-[#979797]" role="status" aria-live="polite">
                    <p>No posts available yet.</p>
                </div>
            );
        }

        return blogs.map((b, idx) => (
            <BlogPostCard
                key={b._id}
                id={b._id}
                postUser={b.user}
                title={b.title}
                releaseDate={b.releaseDate}
                summary={b.summary}
                content={b.content}
                comments={b.comments}
                likes={b.likes}
                visualIndex={idx}
                coverImage={b.coverImage}
                community={b.community}
            />
        ));
    };

        // Show loading skeleton while checking authentication
    const { isLoading: userLoading } = useUser();
    
    if (userLoading) {
        return (
            <div className="blog-home min-h-screen px-6 py-8">
                <div className="flex gap-6">
                    <Sidebar />
                    <section className="flex flex-col flex-grow gap-4">
                        <Skeleton width={180} height={28} />
                        <div className="flex gap-3">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} width={90} height={36} rounded />
                            ))}
                        </div>
                        <div className="feed-list flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <BlogPostCardSkeleton key={`loading-${i}`} />
                            ))}
                        </div>
                    </section>
                    <aside className="flex gap-4 flex-col">
                        <Skeleton width={300} height={200} rounded />
                        <Skeleton width={300} height={200} rounded />
                    </aside>
                </div>
            </div>
        );
    }
    
    // Redirect or show login page if not logged in (only after loading is complete)
    if (!user) {
        return <WelcomeScreen />
    }
    

    return (
        <div className="blog-home min-h-screen">
            <div className="flex gap-[50px] justify-between p-[25px]">

                <Sidebar />

                <section className="flex flex-col flex-grow gap-[10px] max-w-[1028px]">

                    <div className='flex justify-between items-center max-w-[1028px]'>
                        <h1>DASHBOARD</h1>
                        <div className='flex gap-[10px]'>
                            <button 
                                className='icon bg-[#FEC72F] hover:bg-[#FEC72F] transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#FEC72F] focus:ring-offset-2' 
                                onClick={() => window.location.href = '/blog/new'}
                                aria-label="Create new blog post"
                                title="Create new blog post"
                            >
                                <Plus size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {userCommunities.length > 0 && (
                    <div className='flex gap-[25px] p-[25px] overflow-x-auto pb-2'>
                        {userCommunities.map((community) => (
                            <CommunityIcon key={community._id} title={community.title} img={community.picture} />
                            ))}
                        </div>
                    )}

                    <div className="flex flex-row gap-4 border-[1px] w-fit border-black bg-[#EDEDE9] border-[2px] overflow-hidden shadow-md" role="tablist" aria-label="Content sections">
                        {(["For You", "Search Results", "Latest"] as const).map((label,index) => (
                            <button
                                key={label}
                                onClick={() => setSection(label)}
                                role="tab"
                                aria-selected={section === label}
                                aria-controls={`${label.toLowerCase().replace(' ', '-')}-panel`}
                                id={`${label.toLowerCase().replace(' ', '-')}-tab`}
                                className={`cursor-pointer px-4 py-2 transition-all duration-150 relative ${
                                    section === label 
                                        ? "bg-[#FEC72F] border-b-[3px] border-black" 
                                        : "hover:bg-[#FEC72F]/30 border-b-[3px] border-transparent"
                                }`}
                            >
                                <div className='text-body'>{label.toUpperCase()}</div>
                                {section === label && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]" aria-hidden="true"></div>
                                )}
                            </button>
                        ))}
 
                    </div>

                    <div className="feed-list" role="tabpanel" id={`${section.toLowerCase().replace(' ', '-')}-panel`} aria-labelledby={`${section.toLowerCase().replace(' ', '-')}-tab`}>
                        {renderSection()}
                    </div>
                </section>

                <aside className="flex gap-[20px] flex-col" aria-label="Trending content">
                    <div className="w-[400px] flex border-[3px] bg-[#EDEDE9] border-solid border-[#000000] p-[10px] flex-col gap-[10px] shadow-lg hover:shadow-xl transition-all duration-300">
                        <h3>TRENDING POSTS</h3>
                        <div className='flex flex-col gap-[10px]' role="list" aria-label="Trending posts">
                            {isLoadingTrending ? (
                                [...Array(5)].map((_, i) => (
                                    <BlogPostSmallSkeleton key={`trending-skeleton-${i}`} />
                                ))
                            ) : user && trendingPosts.length > 0 ? (
                                trendingPosts.map((b: any) => (
                                    <BlogPostSmall key={b.blog?._id} blog={b.blog} />
                                ))
                            ) : (
                                <div className="text-[#979797] italic" role="status" aria-live="polite">Trending posts appear here once available.</div>
                            )}
                        </div>
                    </div>

                    <div className="w-[400px] bg-[#EDEDE9] flex border-[3px] border-solid border-[#000000] flex-col gap-[10px] p-[10px] shadow-lg">
                        <h3>TRENDING COMMUNITIES</h3>
                        <div className='flex flex-col gap-[10px]' role="list" aria-label="Trending communities">
                            {isLoadingCommunities ? (
                                [...Array(5)].map((_, i) => (
                                    <CommunityCardSkeleton key={`community-skeleton-${i}`} />
                                ))
                            ) : trendingCommunities.length > 0 ? (
                                trendingCommunities.map((community) => (
                                    <CommunityCardSmall key={community._id} community={community} />
                                ))
                            ) : (
                                <div className="text-[#979797] italic" role="status" aria-live="polite">Trending communities appear here once available.</div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
    
}
