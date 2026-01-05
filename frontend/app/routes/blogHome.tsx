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

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogHome() {

    const {user} = useUser();

    const [blogs, setBlogs] = useState<Blog []>([]);
    const [recommendations, setRecommendations] = useState<Blog []>([]);
    const [trending, setTrending] = useState<Trending[]>([]);
    const [searchResults, setSearchResults] = useState<Blog[]>([]);
    const [section, setSection] = useState<"For You" | "Featured" | "Search Results" | "Latest">("For You");
    const [userCommunities, setUserCommunities] = useState<Community[]>([]);
    
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

    useEffect(() => {
        console.log("user context value:", user);
        if (!user) return;

        getBlogs();
        getTrending();
        getRecommendations();
    }, [user]);

    const trendingPosts = trending?.[0]?.posts ?? [];

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
                            <button className='icon' onClick={() => window.location.href = '/blog/new'}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {userCommunities.length > 0 && (
                    <div className='flex gap-[25px] overflow-x-auto'>
                        {userCommunities.map((community) => (
                            <CommunityIcon key={community._id} title={community.title} img={community.picture} />
                            ))}
                        </div>
                    )}

                    <div className="w-fit flex ">
                        {(["For You", "Search Results", "Latest"] as const).map((label,index) => (
                            <button
                                key={label}
                                onClick={() => setSection(label)}
                                className={`tab ${section === label ? "bg-[#E95444]" : "bg-[#FFFFFF]"}`}
                            >
                                {label}
                            </button>
                        ))}
 
                    </div>

                    <div className="feed-list">
                        {renderSection()}
                    </div>
                </section>

                <aside className="flex gap-[20px] flex-col">
                    <div className="w-[400px] flex border-[3px] bg-[#EDEDE9] border-solid border-[#000000] p-[10px] flex-col gap-[10px]">
                        <h3>TRENDING POSTS</h3>
                        <div className='flex flex-col gap-[10px]'>
                            {user && trendingPosts.map((b: any) => (
                                // <div key={b.blog._id} className="bg-[#EDEDE9] p-[5px] border-[1px] border-[#000000]" onClick={() => window.location.href = `/blog/${b.blog._id}`}>
                                //     <div className="text-small">{b.blog.title}</div>
                                //     <div className="flex gap-[10px]">
                                //         <span><Heart size={14}/> {b.blog.likes?.length ?? 0}</span>
                                //         <span><MessageCircle size={14}/> {b.blog.comments?.length ?? 0}</span>
                                //     </div>
                                // </div>
                                <BlogPostSmall blog={b.blog} />
                            ))}

                            {!trendingPosts.length && (
                                <div>Trending posts appear here once available.</div>
                            )}
                        </div>
                    </div>

                    <div className="w-[400px] bg-[#EDEDE9] flex border-[3px] border-solid border-[#000000] flex-col gap-[10px]">
                        <h3>TRENDING COMMUNITIES</h3>
                        <div>
                            {user.communities.map((chip, idx) => (
                                <div key={idx}>
                                    {chip.icon}
                                    <span>{chip.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
    
}
