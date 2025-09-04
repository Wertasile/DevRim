import React, { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useGoogleLogin, GoogleLogin, googleLogout } from '@react-oauth/google'
import { AppProvider, UserProvider, useUser } from '../context/userContext'
import CustomButton from '~/components/customButton';

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
        
        
            <header className='w-full sticky top-0 flex justify-between p-3 text-black backdrop-blur-sm'>
                <a href='/'><img src="/Images/DevRim_Logo_0.png" height="16"/></a>
                <nav className='relative flex items-center gap-7'>
                    <NavLink to="/blog" target="_self">BLOGS</NavLink>
                    <NavLink to="/projects" target="_self">PROJECTS</NavLink>
                    {/* <a href="projects/projects.html" target="_self">Projects</a> */}
                    <NavLink to="/about" target="_self">ABOUT</NavLink>
                    <NavLink to="/chats" target="_self">MESSAGE</NavLink>
                    {/* <a href="../Login/login.html" target="_self">Log In</a> */}
                    {user ? 
                        (<img 
                            src={user?.picture} 
                            width={48}
                            onClick={() => {setMenu(!menu)}}
                            className='rounded-3xl relative'
                            ></img>
                                
                        ):
                        (<CustomButton onClick={handleLogin}>LOGIN</CustomButton>)
                    }
                    {menu && 
                        <div className='absolute shadow-lg right-0 bg-white top-20 flex text-black flex-col gap-5 p-3 rounded-3xl w-[200px]'>
                            <a href={`/profile/${user?._id}`}>Profile</a>
                            <a>Your Posts</a>
                            <a>Your Library</a>
                            <a>Settings</a>
                            <a>Help</a>
                            <div onClick={handleLogout}>SignOut</div>
                        </div>
                    } 
                    
                </nav>
            </header>

            <main>
                <Outlet/>
            </main>

            <footer className='bg-[#191919] text-white flex justify-around items-center px-[10px] py-[20px] bottom-0 mt-[20px]'>
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

export default base