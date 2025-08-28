import React, { useEffect, useState } from 'react'
import { userContext } from '~/context/userContext'
import BlogPost from './blogPost'
import type { Route } from '../+types/root'
import type { Blog, User } from '~/types/types'
import BlogPostCard from '~/components/blogPostCard'
import fetchUser from '../apiCalls/fetchUser'


const API_URL = import.meta.env.VITE_API_URL;

const profile = ({params}: Route.ComponentProps) => {

    const [profile, setProfile] = useState<User>()
    const [blogs, setBlogs] = useState<Blog []>([])

    const getProfile = async () => {
        if (!params?.id) return  // ✅ type-safe guard
        const data = await fetchUser(params.id) // ✅ await the call
        console.log(data)
        setProfile(data)
    }
    useEffect( () => {
        getProfile()
        
    }, [])

    useEffect( () => {
        getBlogs()
        
    }, [profile])

    const getBlogs = async () => {
        const response = await fetch(`${API_URL}/posts/${profile?._id}`, {
            method: 'get',
            credentials: 'include',
        })
        const data = await response.json()
        console.log("POST DATA")
        console.log(data)
        setBlogs(data)
    }

  return (
    <div className='flex flex-col md:flex-row p-2 sm:p-10'>
        <div className='w-[400px] md:border-r-[2px] border-black border-solid flex flex-col gap-3 p-2 '>
            <img className="rounded-3xl " src={profile?.picture} width={64} height={64}/>
            <div>
                <p>{profile?.picture}</p>
                <h3>{profile?.name}</h3>
                <i>{profile?.email}</i>
            </div>

            <p>About</p>
        </div>
        <div className='p-2 flex-grow'>
            <h1 className='hidden md:block'>{profile?.name}</h1>
            <h1 className='hidden md:block'>BLOGPOSTS</h1>
            {blogs.map((b) => (
                    <BlogPostCard key={b._id} id={b._id} title={b.title} releaseDate={b.releaseDate} summary={b.summary}/>
                ))}
        </div>
    </div>
  )
}

export default profile