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
        const response = await fetch(`${API_URL}/posts/`, {
            method: "get",
            credentials: "include",
        });
        const data = await response.json();
        setBlogs(data);
        
    };

    const getRecommendations = async () => {
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
        }

    }

    const getTrending = async () => {
        const response = await fetch(`${API_URL}/analytics/trending`, {
            method: "get",
            credentials: 'include'
        })
        const data = await response.json()
        setTrending(data);
    }

    const getTrendingCommunities = async () => {
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
        if (section === "For You") {
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
                />
            ));
        }

        if (section === "Search Results") {
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
                />
            ));
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
            />
        ));
    };

        // Redirect or show login page if not logged in
    if (!user) {
        return (
        <div className="flex flex-col gap-[10px] items-center justify-center min-h-screen bg-[#D6D6CD] text-center p-6">
            <h1>Welcome to DevRim</h1>
            <p>
            Please <span className="text-[#5D64F4] font-semibold">log in</span> or <span className="text-[#5D64F4] font-semibold">sign up</span> to explore personalized blog recommendations and trending posts.
            </p>
            <div className="flex gap-4">
            <a
                href="/login"
                className="primary-btn"
            >
                Log In
            </a>
            <a
                href="/register"
                className="secondary-btn"
            >
                Sign Up
            </a>
            </div>
        </div>
        )
    }
    

    return (
        <div className="blog-home min-h-screen px-[25px]">
            <div className="flex gap-[20px]">

                <Sidebar />

                <section className="flex flex-col flex-grow gap-[10px]">

                <div className='flex justify-between items-center'>
                        <h1>DASHBOARD</h1>
                        <div className='flex gap-[10px]'>
                            <button 
                                className='icon bg-[#FEC72F] hover:bg-[#FEC72F] transition-all duration-300 hover:scale-110 hover:shadow-lg' 
                                onClick={() => window.location.href = '/blog/new'}
                            >
                                <Plus size={16} />
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

                    <div className="flex flex-row gap-4 border-[1px] w-fit border-black bg-[#EDEDE9] rounded-lg overflow-hidden shadow-md">
                        {(["For You", "Search Results", "Latest"] as const).map((label,index) => (
                            <button
                                key={label}
                                onClick={() => setSection(label)}
                                className={`cursor-pointer px-4 py-2 transition-all duration-300 relative ${
                                    section === label 
                                        ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                                        : "hover:bg-[#FEC72F]/30 hover:font-medium"
                                }`}
                            >
                                {label}
                                {section === label && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                                )}
                            </button>
                        ))}
 
                    </div>

                    <div className="feed-list">
                        {renderSection()}
                    </div>
                </section>

                <aside className="flex gap-[20px] flex-col">
                    <div className="w-[400px] flex border-[3px] bg-[#EDEDE9] border-solid border-[#000000] p-[10px] flex-col gap-[10px] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                        <h3>TRENDING POSTS</h3>
                        <div className='flex flex-col gap-[10px]'>
                            {user && trendingPosts.length > 0 ? (
                                trendingPosts.map((b: any) => (
                                    <BlogPostSmall key={b.blog?._id} blog={b.blog} />
                                ))
                            ) : (
                                <div className="text-gray-500 italic">Trending posts appear here once available.</div>
                            )}
                        </div>
                    </div>

                    <div className="w-[400px] bg-[#EDEDE9] flex border-[3px] border-solid border-[#000000] flex-col gap-[10px] p-[10px] rounded-lg shadow-lg">
                        <h3>TRENDING COMMUNITIES</h3>
                        <div className='flex flex-col gap-[10px]'>
                            {trendingCommunities.length > 0 ? (
                                trendingCommunities.map((community) => (
                                    <CommunityCardSmall key={community._id} community={community} />
                                ))
                            ) : (
                                <div className="text-gray-500 italic">Trending communities appear here once available.</div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
    
}
