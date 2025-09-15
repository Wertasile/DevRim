import React, { useDeferredValue, useCallback, useEffect, useState, useRef } from 'react'
import BlogPostCard from '../components/blogPostCard'
import type { Blog } from '~/types/types'
import Search from '~/components/Search'
import { NavLink } from 'react-router'
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

    const [searchInput, setSearchInput] = useState<string>("")
    const deferredInput = useDeferredValue(searchInput)

    // Panel control
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"topic" | "framework" | "date" | null>(null);
    const [showContent, setShowContent] = useState(false); // controls when content appears

    const [dateRange, setDateRange] = useState({from: new Date(2025, 7, 31), to: new Date(Date.now())})

    const tlRef = useRef<gsap.core.Timeline | null>(null);

    const [categories, setCategories] = useState<string[]>([])

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

    const handleSearch = useCallback((text: string, categories: string[]) => {
        const searchedBlogs = blogs.filter((b) =>
            b.title.toLowerCase().includes(text.toLowerCase())
        );

        const filteredBlogs = searchedBlogs.filter((b) =>
            categories.length === 0 || categories.some((cat) => b.categories.includes(cat))
        );

        setSearchResults(filteredBlogs);
    }, [blogs, categories]);

    useEffect( () => {
        handleSearch(searchInput, categories)
    }, [categories])

    const getBlogs = async () => {
        const response = await fetch(`${API_URL}/posts/`, {
            method: "get",
            credentials: "include",
        });
        const data = await response.json();
        setBlogs(data);
        setSearchResults(data);
    };

    useEffect(() => {
        getBlogs();
    }, []);

    useEffect( () => {
        console.log(dateRange)
    }, [dateRange])

    return (
        <>
            <div className="max-w-[1000px] flex flex-col gap-3 mx-auto my-0">
                <div className="flex gap-3">
                    <Search 
                        categories={categories} 
                        onChange={(text) => 
                            {
                                handleSearch(text, categories)
                                setSearchInput(text)
                            }
                        } 
                    />
                    <button className="primary-btn w-[150px]">
                        <NavLink to="/blog/new">
                            <span>ADD POST</span>
                        </NavLink>
                    </button>
                </div>
                <div className="gap-3 flex flex-row justify-between relative">
                    <div
                        className="primary-btn filter h-fit"
                        onClick={() => {
                            if (activeFilter == "topic"){
                                setIsOpen(!isOpen);
                            }else{
                                setActiveFilter("topic");
                                setIsOpen(true); // force open when switching
                            }
                            
                        }}
                    >
                        Select Topics, Themes
                    </div>
                    <div
                        className="primary-btn filter h-fit"
                        onClick={() => {
                            if (activeFilter == "framework"){
                                setIsOpen(!isOpen);
                            }else{
                                setActiveFilter("framework");
                                setIsOpen(true); // force open when switching
                            }
                        }}
                    >
                        Select Frameworks, Tools and Technologies
                    </div>
                    <div
                        className="primary-btn filter h-fit"
                        onClick={() => {
                            if (activeFilter == "date"){
                                setIsOpen(!isOpen);
                            }else{
                                setActiveFilter("date");
                                setIsOpen(true); // force open when switching
                            }
                        }}
                    >
                        Select Date(s)
                    </div>
                    <div
                        className="secondary-btn h-fit"
                        onClick={() => {
                            setIsOpen(false);
                            setActiveFilter(null);
                            setCategories([])
                        }}
                    >
                        X Remove Filters
                    </div>

                    <div className="filter-panel absolute left-0 top-full w-full bg-[#111] border-solid border-[0.5px] border-[#353535] rounded-[20px] mt-1 shadow-lg overflow-hidden h-0 ">
                            <div className="filter-panel-content p-4">
                                {activeFilter === "topic" && 
                                <div className='flex flex-row justify-between'>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>Software Development</h3>
                                        <ul className='text-sm'>
                                            {topics.Topics.SoftwareDevelopmentProgramming.map( (topic, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        if (categories.includes(topic)) {
                                                            setCategories( (prev) => prev.filter( p => p !== topic))
                                                        }else{
                                                            setCategories( (prev) => [...prev, topic])}
                                                        }
                                                    }
                                                    className={`${categories.includes(topic) && ("bg-[#white] text-[#111]")}`}
                                                >
                                                    {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>Career & Community</h3>
                                        <ul className='text-sm'>
                                            {topics.Topics.CareerCommunityIndustry.map( (topic, index) => (
                                                <li 
                                                    key={index}
                                                        onClick={() => {
                                                        if (categories.includes(topic)) {
                                                            setCategories( (prev) => prev.filter( p => p !== topic))
                                                        }else{
                                                            setCategories( (prev) => [...prev, topic])}
                                                        }
                                                    }
                                                >
                                                {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>AI and Emerging Tech</h3>
                                        <ul className='text-sm'>
                                            {topics.Topics.AICloudEmergingTech.map( (topic, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        if (categories.includes(topic)) {
                                                            setCategories( (prev) => prev.filter( p => p !== topic))
                                                        }else{
                                                            setCategories( (prev) => [...prev, topic])}
                                                        }
                                                    }
                                                >
                                                {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                }

                                {activeFilter === "framework" && 
                                <div className='flex flex-row justify-between'>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>Frameworks</h3>
                                        <ul className='text-sm'>
                                            {frameworks.Frameworks.FrameworksLibraries.map( (f, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        if (categories.includes(f)) {
                                                            setCategories( (prev) => prev.filter( p => p !== f))
                                                        }else{
                                                            setCategories( (prev) => [...prev, f])}
                                                        }
                                                    }
                                                >
                                                {f}
                                                </li>
                                            ) )}
                                        </ul>
                                    </div>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>Languages</h3>
                                        <ul className='text-sm'>
                                            {frameworks.Frameworks.Languages.map( (f, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        if (categories.includes(f)) {
                                                            setCategories( (prev) => prev.filter( p => p !== f))
                                                        }else{
                                                            setCategories( (prev) => [...prev, f])}
                                                        }
                                                    }
                                                >
                                                {f}
                                                </li>
                                            ) )}
                                        </ul>
                                    </div>
                                    <div className=''>
                                        <h3 className='mb-[5px] border-b-[1px] border-solid border-[#353535]'>DevOps</h3>
                                        <ul className='text-sm'>
                                            {frameworks.Frameworks.CloudDevOps.map( (f, index) => (
                                                <li 
                                                    key={index}
                                                    onClick={() => {
                                                        if (categories.includes(f)) {
                                                            setCategories( (prev) => prev.filter( p => p !== f))
                                                        }else{
                                                            setCategories( (prev) => [...prev, f])}
                                                        }
                                                    }
                                                >
                                                {f}
                                                </li>
                                            ) )}
                                        </ul>
                                    </div>
                                </div>
                                }

                                {activeFilter === "date" && 
                                <div className='flex flex-col gap-3'>
                                    <div>
                                        <label htmlFor="start-date">From:</label>
                                        <input 
                                            type="date" 
                                            id="start-date" 
                                            onChange={(e) => setDateRange( prev => ({...prev, from:new Date(e.target.value)}))} 
                                            name="start-date"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="end-date">To:</label>
                                        <input 
                                            type="date" 
                                            id="end-date"
                                            onChange={(e) => setDateRange((prev) => ({...prev, to: new Date(e.target.value)}))} 
                                            
                                            name="end-date"
                                        />
                                    </div>
                                    <div className='gap-3 flex'>
                                        <button className='primary-btn'><span>SAVE</span></button>
                                        <button className='secondary-btn'>REMOVE</button>
                                    </div>
                                </div>
                                }
                            </div>
                    </div>
                </div>
            </div>

            <section id="blogs">
                {searchResults.map((b) => (
                    <BlogPostCard
                        key={b._id}
                        id={b._id}
                        user={b.user}
                        title={b.title}
                        releaseDate={b.releaseDate}
                        summary={b.summary}
                        content={b.content}
                        comments={b.comments}
                        likes={b.likes}
                    />
                ))}
            </section>
        </>
    );
}
