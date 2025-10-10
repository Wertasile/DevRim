import React, { useDeferredValue, useCallback, useEffect, useState, useRef } from 'react'
import BlogPostCard from '../components/blogPostCard'
import type { Blog } from '~/types/types'
import Search from '~/components/Search'
import { NavLink, useLocation } from 'react-router'
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import topics from "../data/searchFilters/topics.json"
import frameworks from "../data/searchFilters/frameworks.json"
import { useUser } from '~/context/userContext'

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogHome() {

    const {user} = useUser()

    const [blogs, setBlogs] = useState<Blog []>([])
    const [searchResults, setSearchResults] = useState<Blog[]>([])

    // Panel control
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"topic" | "framework" | "date" | null>(null);
    const [showContent, setShowContent] = useState(false); // controls when content appears

    const [dateRange, setDateRange] = useState({from: new Date(2025, 7, 31), to: new Date(Date.now())})

    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const [categories, setCategories] = useState<string[]>([])

    const [section, setSection] = useState<"For You" | "Featured" | "Search Results">("For You")

    useGSAP(() => {
        const panel = document.querySelector<HTMLElement>(".filter-panel");
        if (!panel) return;

        // Create timeline only once
        if (!tlRef.current) {
            tlRef.current = gsap.timeline({ paused: true })
                .to(panel, {
                    height: "400px",
                    width: "100%",
                    zIndex: 20,
                    position: "absolute",
                    left: 0,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => setShowContent(true),
                    onReverseComplete: () => setShowContent(false),
                });
        }

        // Control timeline based on isOpen
        if (isOpen) {
            tlRef.current.play();
        } else {
            tlRef.current.reverse();
        }
    }, [isOpen]);

    {/* ----------------------- TO RECEIVE STATE(SEARCH RESULTS FROM LAYOUT) ----------------------------------------------------------------------------------------- */}  
    
    const location = useLocation();
    useEffect(() => {
        if (location.state?.section === 'Search Results') {
        setSection('Search Results');
        }

        if (location.state?.searchResults) {
        setSearchResults(location.state.searchResults);
        }
    }, [location.state]);

    {/* ----------------------- TO GET BLOGS ON INITIAL PAGE LOAD ---------------------------------------------------------------------------------------------------- */}   

    const getBlogs = async () => {
        const response = await fetch(`${API_URL}/posts/`, {
            method: "get",
            credentials: "include",
        });
        const data = await response.json();
        setBlogs(data);
        
    };

    useEffect(() => {
        getBlogs();
    }, []);

    return (
        <>
            

            {/* ----------------------- THE BLOGS! ---------------------------------------------------------------------------------------------------- */}   

            <div id="blogs">
                <div className='border-b-[1px] flex gap-5'>
                    <div className={`${section == "For You" ? ("bg-[#229197]") : ("")} p-2 cursor-pointer`} onClick={() => {setSection('For You')}}>For you</div>
                    <div className={`${section == "Featured" ? ("bg-[#229197]") : ("")} p-2 cursor-pointer`} onClick={() => {setSection('Featured')}}>Featured</div>
                    <div className={`${section == "Search Results" ? ("bg-[#229197]") : ("")} p-2 cursor-pointer`} onClick={() => {setSection('Search Results')}}>Search Results</div>
                </div>
                
                {section == "For You" && blogs.map((b) => (
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
                    />
                ))}

                {section == "Search Results" && searchResults.map((b:Blog) => (
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
                    />
                ))}
            </div>
        </>
    );
}
