import React, { useEffect, useState } from 'react'
import type { Route } from '../+types/root';
import type { Blog, Comment, User } from '~/types/types';

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
  const [blogUser, setBlogUser] = useState<User | null>(null)

  const { user } = useUser()

  const [comments, setComments] = useState<Comment[]>([])

  const [comment, setComment] = useState<string>()

  const [like, setLike] = useState<boolean>(false)
  const [noLikes, setNoLikes] = useState<number>(0)

  const getBlog = async () => {
    const response = await fetch(`${API_URL}/posts/${params.id}`, {
      method: 'post'
    })
    const data = await response.json()
    console.log(data)
    setBlog(data)
    setComments(data.comments)

    const userResponse = await fetch(`${API_URL}/users/${data.user}`, {
      method: 'get'
    })
    const userData = await userResponse.json()

    setBlogUser(userData)
    setNoLikes(data.likes.length)
    console.log("USER IS")
    console.log(userData)
  }

  const handleLike = async () => {
    const res = await fetch(`${API_URL}/users/like/${blog?._id}`, {
      method: 'put',
      credentials: 'include'
    })
    const data = await res.json()
    setNoLikes(noLikes + 1)
    setLike(!like)
  }

  const handleDislike = async () => {
    const res = await fetch(`${API_URL}/users/like/${blog?._id}`, {
      method: 'delete',
      credentials: 'include'
    })
    const data = await res.json()
    setNoLikes(noLikes - 1)
    setLike(!like)
  }

  const addComment = async () => {
    const response = await fetch(`${API_URL}/comments/${blog?._id}`, {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({comment: comment})
    })

    if (!response.ok){
      console.error("Comment not added")
      return
    }

    const data = await response.json()
    console.log(data)

    setComments( prev => [...(prev ?? []), data])
    setComment("")
  }

  const handleNavProfile = () => {
    window.location.href = `/profile/${blogUser?._id}`
  }

  useEffect(() => {
    getBlog()
  }, [])

  useEffect(() => {
    if (blog && user) {
      console.log(`like status : ${user?.liked?.includes(blog)}`)
    }
  }, [blog, user])


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
        <img src={blogUser?.picture} className='rounded-3xl' width={48} onClick={handleNavProfile}/>
        <div onClick={handleNavProfile}>{blogUser?.name}</div>
        <div>{blog.releaseDate.split("T")[0]}</div>
      </div>
      <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] text-[#979797] p-6'>
        <div className='flex gap-2'>
          {like ? (
            <>
              <ThumbsUp className='text-black' onClick={handleDislike}/>
              <b className='text-black'>{noLikes}</b>
            </>
          ) : (
            <>
              <ThumbsUp className='' onClick={handleLike}/>
              {noLikes}
            </>
          )}
          
        </div>
        
        <Share2/>
        <a href="#comments"><MessageSquare/></a>
        <Bookmark/>
      </div>

      {/* Render full content */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] p-6'>
        <div>
          <img onClick={handleNavProfile} src={blogUser?.picture} className='rounded-3xl' width={64}/>
        </div>
        <div className='flex flex-col flex-grow'>
          <div onClick={handleNavProfile}>{blogUser?.name}</div>
          <div>Computer Engineering Graduate, Ex-IT Analyst.</div>
        </div>
        <div>
          <button className='primary-btn'>FOLLOW</button>
        </div>
      </div>

      <div id="comments">
        <h2>Comments</h2>
        <label id="comment" htmlFor='comment' className='hidden'>Comment</label>
        <input 
          id='comment' 
          name='comment' 
          placeholder='What are your thoughts?'
          value={comment ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter"){
              event.preventDefault()
              addComment()
            }
          }}
          onChange={(event) => (setComment(event.target.value))}
        />
        <button className='primary-btn' onClick={() => {addComment()}}>Send</button>
        <button className='primary-btn'>Clear</button>
        <div className='flex flex-col'>
          {comments.map( (comment, index) => (
            <div key={index} className='border-solid border-b-[2px] py-5 flex flex-col'>
              <div className='flex gap-5 items-center'>
                <img src={comment.user.picture} className="rounded-3xl" width={48}/>
                <h3>{comment.user.name}</h3>
              </div>
              <div className='ml-[64px]'>
                <p>{comment.comment}</p>
              </div>   
              
            </div>
          ) )}
        </div>
      </div>
      
    </div>
  )
}
