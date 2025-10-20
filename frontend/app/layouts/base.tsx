import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useGoogleLogin, GoogleLogin, googleLogout } from '@react-oauth/google'
import { AppProvider, UserProvider, useUser } from '../context/userContext'
import CustomButton from '~/components/customButton';
import { HamburgerIcon, MenuIcon } from 'lucide-react';
import MenuBar from '~/components/tiptap/menuBar';

const API_URL = import.meta.env.VITE_API_URL;

const base = () => {
  
    const { user, setUser } = useUser()
    // const {accessToken, setAccessToken, refreshToken, setRefreshToken} = useToken()
    const [ menu, setMenu ] = useState(false)

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
        
        
            <header className='w-full lg:w-[1000px] bg-[#0606061a] border-solid border-[1px] border-[#353535] rounded-3xl sticky top-0 flex justify-between items-center p-3 backdrop-blur-sm z-[2] my-5 mx-auto'>
                <div className='flex gap-2 items-center'>
                    <a href='/'><img src="/Images/DevRim_Logo_0.png" width="48"/></a>
                    <h3>DevRim</h3>
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
                        <div className='absolute p-2 flex flex-col bg-[#111] rounded-3xl shadow-md right-0 top-20 gap-3 p-2 w-[200px]'>
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

            <footer className='bg-[#211F2D] text-white gap-5 sm:gap-2 flex flex-col sm:flex-row justify-around items-center px-[10px] py-[20px] bottom-0 mt-[20px]'>
                <div>
                    <div className='flex gap-2 items-center'>
                        <img src="/Images/DevRim_Logo_0.png" height="64"/>
                        <h2>DevRim</h2>
                    </div>
                    
                    <i>A platform for developers</i>
                </div>
                    
                <div style={{display:'flex', gap:100}}>    
                    <div style={{display:'flex', flexDirection:'column'}}>
                        CONTACT
                        <a href="emailto:ahmedmharfan@gmail.com" target="_blank">Email Developer(s)</a>
                        <a href="https://github.com/Wertasile" target="_blank">GitHub</a>
                        <a href="https://www.linkedin.com/in/ahmed-mohamed-haniffa-arfan-989267202/" target="_blank">LinkedIn</a>
                        <a href="https://ahmedarfan.netlify.app" target="_blank">Developer's Website</a>
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

export default base