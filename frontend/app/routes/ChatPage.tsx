import { googleLogout, useGoogleLogin } from '@react-oauth/google'
import { CircleQuestionMark, LayoutGrid, MessageSquare, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ChatMenu from '~/components/ChatMenu'
import { useChat, useUser } from '~/context/userContext'
import type { Chat, Message } from '~/types/types'

const API_URL = import.meta.env.VITE_API_URL;

const ChatPage = () => {

    const { user, setUser } = useUser()
    const { chat, setChat } = useChat()
    // const {accessToken, setAccessToken, refreshToken, setRefreshToken} = useToken()
    const [ menu, setMenu ] = useState(false)
    const [ chats, setChats] = useState<Chat[]>()
    const [ messages, setMessages] = useState<Message[]>()

    const [ currentChat, setCurrentChat] = useState<Chat>()

    const [ newMessage, setNewMessage] = useState<string>()

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

        fetchChats()
    }

    const fetchChats = async() => {

        const chatRes = await fetch(`${API_URL}/chats/`, {
            method: 'get',
            credentials: 'include'
        })

        const chatData = await chatRes.json()
        console.log(chatData)
        setChats(chatData)
    }

    useEffect( () => {
        fetchUser()
    }, [])

  return (
    <div className='flex flex-row h-[100vh]'>

        <div className='w-[110px] flex flex-col items-center h-full border-r-[1px] border-solid border-[#979797] justify-between py-5'>
            
            <div className='flex flex-col gap-5'>
                <a href='/'><img src="/Images/DevRim_Logo_0.png" width={48} className='rouned-3xl'/></a>
                <MessageSquare className='w-[48px] text-[#979797]'/>
                <User className='w-[48px] text-[#979797]'/>
            </div>

            <div className='flex flex-col gap-5'>
                <CircleQuestionMark className='w-[48px] text-[#979797]'/>
                <LayoutGrid className='w-[48px] text-[#979797]'/>
                <img src={user?.picture} width={48} className='rounded-3xl'/>
            </div>

        </div>

        <div className='w-[400px] flex flex-col border-r-[1px] border-solid border-[#979797]'>

            <div className='h-[50px] border-b-[1px] border-solid border-[#979797]'>
                
            </div>

            <div className='flex flex-col gap-5 p-5'>
                {chats?.map( (chat, index) => (
                    <ChatMenu key={index}  Chat={chat}/>
                ))}
                
            </div>

        </div>

        <div className='flex-grow flex flex-col justify-between h-[100vh]'>

            <h1 className='h-[50px] border-b-[1px] border-solid border-[#979797] px-5'>
                {chat?.chatName === "sender" ? (chat.users.filter((u) => u._id !== user?._id).map( (otherUser) => <h2>{otherUser.name}</h2>)) : (<h3>{chat?._id}</h3>)}
            </h1>

            <div className='flex-end flex flex-col gap-2px px-5'>
                {messages?.map( (message, index) => (
                    <div key={index}/>
                ))}

            </div>

            <div>
                <label htmlFor='message' id="message" className='hidden'>Message</label>
                <input placeholder="Send Message" id="message" name="message" className='mx-5 my-1' onChange={(event) => {setNewMessage(event.target.value)}}/>
            </div>
            

        </div>

    </div>
  )
}

export default ChatPage