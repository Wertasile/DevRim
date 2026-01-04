import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useGoogleLogin, GoogleLogin, googleLogout } from '@react-oauth/google'
import { AppProvider, UserProvider, useSession, useUser } from '../context/userContext'
import CustomButton from '~/components/customButton';
import { HamburgerIcon, MenuIcon } from 'lucide-react';
import MenuBar from '~/components/tiptap/menuBar';
import { authClient } from '~/lib/auth-client';

const API_URL = import.meta.env.VITE_API_URL;

const base = () => {
  
    const { user, setUser } = useUser()
    const { session, setSession} = useSession()

    // const {accessToken, setAccessToken, refreshToken, setRefreshToken} = useToken()
    const [ menu, setMenu ] = useState(false)
    const [ otherMenu, setOtherMenu ] = useState(false)

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

    async function getSession () {
        try {
            const session = await authClient.getSession()
            setSession(session.data)
            console.log(session.data)      
        } catch (error) {
            console.log("error getting session")
        }
    }

    async function logout() {
        try {
            await authClient.signOut()
            window.location.href = "/"
        } catch (error) {
            console.log("error logging out from session")
        }
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
        getSession()
    }, [])
    
    return (
        <div className="layout-shell">
            <header className='w-full sticky top-0 flex justify-between items-start px-3 py-1 backdrop-blur-lg z-50'>
                
                <a href='/' className='flex gap-2 items-center'>
                    <img src="/Images/DevRim_Logo_0.png" width="32"/>
                    <h2>MIRVED</h2>
                </a>

                <nav className='hidden sm:flex relative items-center gap-[20px]'>
                    <NavLink to="/dashboard" target="_self" className=""><p>Dashboard</p></NavLink>
                    <NavLink to="/chats" target="_self" className=""><p>Chats</p></NavLink>
                    <NavLink to="/chats" target="_self" className=""><p>About</p></NavLink>
                    <NavLink to="/chats" target="_self" className=""><p>Help</p></NavLink>
                    {user ? 
                        (<img 
                            src={user?.picture} 
                            width={32}
                            onClick={() => {setMenu(!menu)}}
                            className='rounded-3xl relative cursor-pointer hover:border-[3px] hover:border-solid hover:border-white ease-in-out duration-100'
                            ></img>
                                
                        ):
                        (<button className="primary-btn" onClick={handleLogin}><span>LOGIN</span></button>)
                    }
                    {/* {session ? 
                        (<div
                            onClick={() => {setOtherMenu(!otherMenu)}}
                            className='rounded-3xl relative cursor-pointer hover:border-[3px] hover:border-solid hover:border-white ease-in-out duration-100'
                            >
                            PROFILE
                        </div>
                                
                        ):
                        (<a className="primary-btn"href='/login'><span>G-LOGIN</span></a>)
                    } */}
                    
                    {menu && 
                        <div className='absolute p-2 flex flex-col bg-[#111] border-solid border-[1px] border-[#353535] rounded-3xl shadow-md right-0 top-20 gap-3 p-2 w-[200px]' style={{ fontFamily: "'Space Grotesk', 'Arial Narrow', Arial, sans-serif" }}>
                            <a className="" href={`/profile/${user?._id}`}>Profile</a>
                            <a className="" href="/settings">Settings</a>
                            <a className="">Help</a>
                            <div className="" onClick={handleLogout}>Sign Out</div>
                        </div>
                    }

                    {otherMenu && 
                        <div className='absolute p-2 flex flex-col bg-[#111] border-solid border-[1px] border-[#353535] rounded-3xl shadow-md right-0 top-20 gap-3 p-2 w-[200px]' style={{ fontFamily: "'Space Grotesk', 'Arial Narrow', Arial, sans-serif" }}>
                            <a className="" href={`/profile/${user?._id}`}>Profile</a>
                            <a className="" href="/settings">Settings</a>
                            <a className="">Help</a>
                            <div className="" onClick={logout}>Sign Out</div>
                        </div>
                    }  
                    
                </nav>

                <div className='sm:hidden'>
                    <MenuIcon/>
                </div>
            </header>

            <main className="layout-main">
                <Outlet/>
            </main>

            {/* <footer className='bg-[#211F2D] text-[gray] flex flex-wrap flex-col sm:flex-row justify-around items-center px-[10px] py-[20px] bottom-0'>
                                       
                <a href="emailto:ahmedmharfan@gmail.com" target="_blank" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Email Developer(s)</a>
                <a href="https://github.com/Wertasile" target="_blank" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>GitHub</a>
                <a href="https://www.linkedin.com/in/ahmed-mohamed-haniffa-arfan-989267202/" target="_blank" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>LinkedIn</a>
                <a href="https://ahmedarfan.netlify.app" target="_blank" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Developer's Website</a>
                
                <a href="#" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Policies</a>
                <a href="#" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Terms of Use</a>
                <a href="#" className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Code of Conduct</a>
                <a href="#"className='hover:text-white hover:duration-[200ms] hover:ease-in-out'>Privacy</a> 
            </footer> */}
        </div>
    )
}

export default base