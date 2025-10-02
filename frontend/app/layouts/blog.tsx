import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { Filter, MenuIcon, SlidersHorizontalIcon } from 'lucide-react';
import React, { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import FilterModal from '~/components/filterModal';
import Search from '~/components/Search';
import { useUser } from '~/context/userContext'
import type { Blog } from '~/types/types';

const API_URL = import.meta.env.VITE_API_URL;

const Blog = () => {

    const {user, setUser} = useUser();

    const [ menu, setMenu ] = useState(false)

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

    const [showFilters, setShowFilters] = useState(false)
    const [categories, setCategories] = useState<string[]>([])

    

    {/* ----------------------- HANDLING USER INPUT ON SEARCH ---------------------------------------------------------------------------------------------------- */}   
    const handleSearch = useCallback((text: string, categories: string[]) => {
        const searchedBlogs = blogs.filter((b) =>
            b.title.toLowerCase().includes(text.toLowerCase())
        );

        const filteredBlogs = searchedBlogs.filter((b) =>
            categories.length === 0 || categories.some((cat) => b.categories.includes(cat))
        );

        setSearchResults(filteredBlogs);
    }, [blogs, categories]);

    {/* ----------------------- WHEN FILTERS (CATEGORIES) ARE ADDED, TRIGGER SEARCH AGAIN BASED ON FILTERS ---------------------------------------------------------------------------------------------------- */}   

    useEffect( () => {
        handleSearch(searchInput, categories)
    }, [categories])

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

    useEffect( () => {
        console.log(dateRange)
    }, [dateRange])

    const login = 
        useGoogleLogin({
            onSuccess : async (code ) => {

                // login, get tokens from backend which is sent in response as cookies
                const tokens = await fetch(`${API_URL}/auth/google`, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ code }),
                })

                // fetch user details
                await fetchUser()
            },
            onError: () => {
                console.error('Connecting to Google Failed')
            }, 
            flow: 'auth-code',

                          
        })
    
    function handleLogin() {
        login()
    }

    async function handleLogout() {
        try {
            const res = await fetch(`${API_URL}/logout`, {
                method:'post',
                credentials: 'include'
            })
        } catch (error) {
            console.warn("LOGOUT ERROR", error)
        }
        
        googleLogout();
        setUser(null);
        setMenu(!menu)
        alert("You've been logged out")
        window.location.href = "/"
    }

    const fetchUser = async () => {

        const user = await fetch(`${API_URL}/me`, {
            method:'get',
            credentials: 'include'
        })

        if (!user.ok) {
            console.error("Failed to fetch user info")
            return
        }

        const userData = await user.json()
        console.log(userData)
        setUser(userData)
    }

    useEffect( () => {
        fetchUser()
    }, [])
  return (
    <>      
            <header className='w-full bg-[#111111] border-solid border-[1px] border-[#353535] sticky top-0 flex justify-between items-center p-3 z-[2] mb-5'>

                
                <div className='flex gap-2 items-center'>
                    <a href='/'><img src="/Images/DevRim_Logo_0.png" width="48"/></a>
                    <h3>DevRim</h3>
                </div>

                <div className='flex items-center gap-2 relative'>
                    <Search
                        categories={categories} 
                        onChange={(text) => 
                            {
                                handleSearch(text, categories)
                                setSearchInput(text)
                            }
                        } 
                    />
                    <FilterModal categories={categories} setCategories={setCategories}/>
                    
                    {
                    (searchResults.length !== 0 && searchInput) && 
                    <div className='absolute top-[64px] w-[400px] h-fit flex flex-col gap-2 bg-[#111] rounded-3xl border-solid border-[0.5px] border-[#353535] shadow-md p-3'>
                        {searchResults.map((result, index) => (
                            <div className="bg-[#111] rounded-[5px] border-solid border-[0.5px] border-[#353535] shadow-md p-1 flex flex-col gap-2" key={index}>
                                <div>{result.title}</div>
                                <i className='text-sm text-[#979797]'>{result.summary}</i>
                            </div>    
                        ))}
                    </div>
                    }
                </div>

                <nav className='hidden sm:flex relative items-center gap-7'>
                    <NavLink to="/blog" target="_self">BLOGS</NavLink>
                    {/* <NavLink to="/projects" target="_self">PROJECTS</NavLink> */}
                    {/* <a href="projects/projects.html" target="_self">Projects</a> */}
                    <NavLink to="/about" target="_self">ABOUT</NavLink>
                    <NavLink to="/chats" target="_self">MESSAGE</NavLink>
                    {/* <a href="../Login/login.html" target="_self">Log In</a> */}
                    {user ? 
                        (<img 
                            src={user?.picture} 
                            width={48}
                            onClick={() => {setMenu(!menu)}}
                            className='rounded-3xl relative cursor-pointer hover:border-[3px] hover:border-solid hover:border-white ease-in-out duration-100'
                            ></img>
                                
                        ):
                        (<button className="primary-btn" onClick={handleLogin}><span>LOGIN</span></button>)
                    }

                    {menu && 
                        <div className='absolute p-2 flex flex-col bg-[#111] rounded-3xl border-solid border-[0.5px] border-[#353535] shadow-md right-0 top-14 gap-3 p-2 w-[200px]'>
                            <a className="primary-btn" href={`/profile/${user?._id}`}>Profile</a>
                            <a className="primary-btn">Settings</a>
                            <a className="primary-btn">Help</a>
                            <div className="primary-btn" onClick={handleLogout}>SignOut</div>
                        </div>
                    } 
                    
                </nav>

                <div className='sm:hidden'>
                    <MenuIcon/>
                </div>
            </header>

            <main>
                <Outlet/>
            </main>

            <footer className='bg-[#393E46] text-white flex justify-around items-center px-[10px] py-[20px] bottom-0 mt-[20px]'>
                <div>
                    <img src="/Images/DevRim_Logo.png" height="64"/>
                    <p>A platform for developers</p>
                </div>
                    
                <div style={{display:'flex', gap:100}}>    
                    <div style={{display:'flex', flexDirection:'column'}}>
                        CONTACT
                        <a href="emailto:ahmedmharfan@gmail.com" target="_blank">Email Developer(s)</a>
                        <a href="github.com/Wertasile" target="_blank">GitHub</a>
                        <a href="https://www.linkedin.com/in/ahmed-mohamed-haniffa-arfan-989267202/" target="_blank">LinkedIn</a>
                        <a href="ahmedarfan.netlify.app" target="_blank">Developer's Website</a>
                    </div>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        Terms & Policies
                        <a>Policies</a>
                        <a>Terms of Use</a>
                        <a>Code of Conduct</a>
                        <a>Privacy</a>
                    </div>
                </div>
            </footer>
    </>
  )
}

export default Blog