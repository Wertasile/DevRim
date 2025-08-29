import React, { useEffect, useState } from 'react'
import type { Route } from '../+types/root';
import type { Blog, User } from '~/types/types';

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { ListItem } from '@tiptap/extension-list';
import Image from '@tiptap/extension-image';
import { useUser } from '~/context/userContext';
import { Bookmark, MessageSquare, Share, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogPost({ params }: Route.ComponentProps) {

  const [blog, setBlog] = useState<Blog>()
  const [user, setUser] = useState<User | null>(null)

  const getBlog = async () => {
    const response = await fetch(`${API_URL}/posts/${params.id}`, {
      method: 'post'
    })
    const data = await response.json()
    console.log(data)
    setBlog(data)

    const userResponse = await fetch(`${API_URL}/users/${data.user}`, {
      method: 'get'
    })
    const userData = await userResponse.json()
    setUser(userData)
    console.log("USER IS")
    console.log(userData)
  }

  const handleNavProfile = () => {
    window.location.href = `/profile/${user?._id}`
  }

  useEffect(() => {
    getBlog()
  }, [])

  if (!blog) return <p>Loading...</p>

  // Generate full HTML from Tiptap JSON using StarterKit
  const html = generateHTML(blog.content, [
    StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3"
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3"
          }
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ListItem,
      Highlight,
      Image,
      
  ])

  return (
    <div id='blog-post' className='flex gap-7 flex-col my-5 mx-auto w-[1000px] h-full'>
      <h1><b>{blog.title}</b></h1>
      <h3>
        <i style={{ color: 'gray' }}>{blog.summary}</i>
      </h3>
      <div className='flex gap-5 items-center'>
        <img src={user?.picture} className='rounded-3xl' width={48} onClick={handleNavProfile}/>
        <div onClick={handleNavProfile}>{user?.name}</div>
        <div>{blog.releaseDate.split("T")[0]}</div>
      </div>
      <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] text-[#979797] p-6'>
        <ThumbsUp/>
        <ThumbsDown/>
        <Share2/>
        <MessageSquare/>
        <Bookmark/>
      </div>

      {/* Render full content */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] p-6'>
        <div>
          <img onClick={handleNavProfile} src={user?.picture} className='rounded-3xl' width={64}/>
        </div>
        <div className='flex flex-col flex-grow'>
          <div onClick={handleNavProfile}>{user?.name}</div>
          <div>Computer Engineering Graduate, Ex-IT Analyst.</div>
        </div>
        <div>
          <button className='primary-btn'>FOLLOW</button>
        </div>
      </div>
      
    </div>
  )
}
