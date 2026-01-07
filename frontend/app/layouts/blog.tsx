import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { Filter, MenuIcon, NotebookPenIcon, SlidersHorizontalIcon } from 'lucide-react';
import React, { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import FetchOwnDetails from '~/apiCalls/user/fetchOwnDetails';
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

    const [dateRange, setDateRange] = useState({from: new Date(2025, 7, 31), to: new Date(Date.now())})

    const [showFilters, setShowFilters] = useState(false)
    const [categories, setCategories] = useState<string[]>([])

    const navigate = useNavigate()

    {/* ----------------------- HANDLING USER INPUT ON SEARCH ---------------------------------------------------------------------------------------------------- */}   
    const handleKeyDown = (e:any) => {
        if (e.key === "Enter" && searchInput.trim()){
            navigate('/blog', { 
                state: 
                {
                    searchResults: searchResults,
                    section: "Search Results"
                },
                
            })
            setSearchResults([]);
        }
    }
    
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
        handleSearch(deferredInput, categories)
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
            const response = await fetch(`${API_URL}/logout`, {
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
        const data = await FetchOwnDetails()
        setUser(data)
    }

    useEffect( () => {
        fetchUser()
    }, [])

  return (
    <>      
            <header className='w-full bg-[#EDEDE9] border-solid border-b-[1px] border-[#000000] sticky top-0 flex justify-between items-center p-3 z-[2] mb-5'>

                
                <a href='/' className='flex gap-2 items-center'>
                    <img src="/Images/DevRim_Logo_0.png" width="48"/>
                    <h3>DevRim</h3>
                </a>
                

                <div className='flex items-center gap-2 relative'>
                    <Search
                        categories={categories} 
                        onChange={(text) => 
                            {
                                handleSearch(text, categories)
                                setSearchInput(text)
                            }
                        }
                        onKeyDown={handleKeyDown} 
                    />
                    <FilterModal categories={categories} setCategories={setCategories}/>
                    
                    {
                    (searchResults.length !== 0 && searchInput) && 
                    <div className='absolute top-[64px] w-[400px] h-fit flex flex-col gap-2 bg-[#EDEDE9] rounded-[5px] border-solid border-[0.5px] border-[#000000] shadow-md p-3'>
                        {searchResults.map((result, index) => (
                            <div 
                                className="bg-[#EDEDE9] rounded-[5px] border-solid border-[0.5px] border-[#000000] shadow-md p-1 flex cursor-pointer hover:bg-[#D6D6CD] duration-200 ease-in flex-col gap-2" 
                                key={index}
                                onClick={() => {window.location.href = `/blog/${result._id}`}}
                            >
                                <div>{result.title}</div>
                                <i className='text-sm text-[#979797]'>{result.summary}</i>
                            </div>    
                        ))}
                    </div>
                    }
                </div>

                <nav className='hidden sm:flex relative items-center gap-7'>
                    <NavLink to="/blog/new" target="_self" className='flex gap-1 cursor-pointer'><NotebookPenIcon  strokeWidth={'1.25px'}/></NavLink>
                    <NavLink to="/blog" target="_self">Blogs</NavLink>
                    <NavLink to="/chats" target="_self">Message</NavLink>
                    {user ? 
                        (<img 
                            src={user?.picture} 
                            width={48}
                            onClick={() => {setMenu(!menu)}}
                            className='rounded-3xl relative cursor-pointer hover:border-[3px] hover:border-solid hover:border-[#000000] ease-in-out duration-100'
                            ></img>
                                
                        ):
                        (<NavLink to="/login" className="primary-btn"><span>LOGIN</span></NavLink>)
                    }

                    {menu && 
                        <div className='absolute p-2 flex flex-col bg-[#EDEDE9] border-solid border-[1px] border-[#000000] rounded-3xl shadow-md right-0 top-20 gap-3 p-2 w-[200px]'>
                            <a className="hover:bg-[#D6D6CD] p-2 px-5 rounded-3xl cursor-pointer" href={`/profile/${user?._id}`}>Profile</a>
                            <a className="hover:bg-[#D6D6CD] p-2 px-5 rounded-3xl cursor-pointer">Settings</a>
                            <a className="hover:bg-[#D6D6CD] p-2 px-5 rounded-3xl cursor-pointer">Help</a>
                            <div className="hover:bg-[#D6D6CD] p-2 px-5 rounded-3xl cursor-pointer" onClick={handleLogout}>SignOut</div>
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

            <footer className='bg-[#EDEDE9] text-[#000000] flex flex-wrap flex-col sm:flex-row justify-around items-center px-[10px] py-[20px] bottom-0 mt-[20px] border-t border-[#000000]'>
                                       
                <a href="emailto:ahmedmharfan@gmail.com" target="_blank" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Email Developer(s)</a>
                <a href="https://github.com/Wertasile" target="_blank" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>GitHub</a>
                <a href="https://www.linkedin.com/in/ahmed-mohamed-haniffa-arfan-989267202/" target="_blank" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>LinkedIn</a>
                <a href="https://ahmedarfan.netlify.app" target="_blank" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Developer's Website</a>
                
                <a href="#" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Policies</a>
                <a href="#" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Terms of Use</a>
                <a href="#" className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Code of Conduct</a>
                <a href="#"className='hover:text-[#5D64F4] hover:duration-[200ms] hover:ease-in-out'>Privacy</a> 
                
            </footer>
    </>
  )
}

export default Blog