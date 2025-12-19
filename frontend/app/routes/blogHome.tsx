import React, { useEffect, useState } from 'react';
import BlogPostCard from '../components/blogPostCard';
import type { Blog, Trending } from '~/types/types';
import { useLocation } from 'react-router';
import { useUser } from '~/context/userContext';
import {
    Bell,
    Compass,
    Headphones,
    Heart,
    MessageCircle,
    TrendingUp,
    Video,
} from 'lucide-react';
import Sidebar from '~/components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogHome() {

    const {user} = useUser();

    const [blogs, setBlogs] = useState<Blog []>([]);
    const [recommendations, setRecommendations] = useState<Blog []>([]);
    const [trending, setTrending] = useState<Trending[]>([]);
    const [searchResults, setSearchResults] = useState<Blog[]>([]);
    const [section, setSection] = useState<"For You" | "Featured" | "Search Results" | "Latest">("Latest");

    const communityChips = [
        { label: "Travel", icon: <Compass size={16} /> },
        { label: "Tech", icon: <TrendingUp size={16} /> },
        { label: "Movies", icon: <Video size={16} /> },
        { label: "Beauty", icon: <Headphones size={16} /> },
    ];
    
    const location = useLocation();
    useEffect(() => {
        if (location.state?.section === 'Search Results') {
        setSection('Search Results');
        }

        if (location.state?.searchResults) {
        setSearchResults(location.state.searchResults);
        }
    }, [location.state]);

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
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0e0e1a] text-white text-center p-6">
            <h1 className="text-3xl font-bold mb-4">Welcome to DevRim</h1>
            <p className="text-lg mb-6 text-gray-300">
            Please <span className="text-[#5D64F4] font-semibold">log in</span> or <span className="text-[#5D64F4] font-semibold">sign up</span> to explore personalized blog recommendations and trending posts.
            </p>
            <div className="flex gap-4">
            <a
                href="/login"
                className="px-6 py-2 bg-[#5D64F4] text-white rounded hover:bg-[#444BEE] transition-all duration-300"
            >
                Log In
            </a>
            <a
                href="/register"
                className="px-6 py-2 border border-[#5D64F4] text-[#5D64F4] rounded hover:bg-[#5D64F4] hover:text-white transition-all duration-300"
            >
                Sign Up
            </a>
            </div>
        </div>
        )
    }
    

    return (
        <div className="blog-home min-h-screen bg-[#0a1118]">
            <div className="blog-shell">
                <Sidebar />

                <section className="blog-feed">
                    <div className="feed-header">
                        <div className="feed-tabs">
                            {["For You", "Search Results", "Latest"].map((label) => (
                                <button
                                    key={label}
                                    onClick={() => setSection(label as typeof section)}
                                    className={`feed-tab ${section === label ? "is-active" : ""}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="feed-actions">
                            <button className="pill-btn"><Bell size={16}/> Alerts</button>
                            <button className="pill-btn"><Compass size={16}/> Explore</button>
                        </div>
                    </div>

                    <div className="feed-list">
                        {renderSection()}
                    </div>
                </section>

                <aside className="blog-right">
                    <div className="top-picks">
                        <div className="top-picks__header">
                            <h3>Top Picks</h3>
                            <TrendingUp size={18}/>
                        </div>
                        <div className="top-picks__list">
                            {user && trendingPosts.map((b: any) => (
                                <button
                                    key={b.blog._id}
                                    className="top-picks__item"
                                    onClick={() => window.location.href = `/blog/${b.blog._id}`}
                                >
                                    <div className="top-picks__title">{b.blog.title}</div>
                                    <div className="top-picks__meta">
                                        <span><Heart size={14}/> {b.blog.likes?.length ?? 0}</span>
                                        <span><MessageCircle size={14}/> {b.blog.comments?.length ?? 0}</span>
                                    </div>
                                </button>
                            ))}
                            {!trendingPosts.length && (
                                <div className="top-picks__empty">Trending posts appear here once available.</div>
                            )}
                        </div>
                    </div>

                    <div className="community-rail">
                        <div className="community-rail__title">Your Communities</div>
                        <div className="community-rail__list">
                            {communityChips.map((chip, idx) => (
                                <div key={idx} className="community-chip">
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
