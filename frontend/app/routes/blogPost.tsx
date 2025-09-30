import React, { useEffect, useState } from 'react'
import type { Route } from '../+types/root';
import type { Blog, Comment, List, User } from '~/types/types';

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { ListItem } from '@tiptap/extension-list';
import Image from '@tiptap/extension-image';
import { useUser } from '~/context/userContext';
import { Bookmark, CirclePlusIcon, CircleXIcon, MessageSquare, Share, Share2, ThumbsDown, ThumbsUp } from 'lucide-react';
import getAllList from '~/apiCalls/list/getAllLists';
import AddToList from '~/apiCalls/list/addToList';
import RemoveFromList from '~/apiCalls/list/removeFromList';
import follow from '~/apiCalls/user/follow';
import unfollow from '~/apiCalls/user/unfollow';
import connect from '~/apiCalls/user/connect';
import disconnect from '~/apiCalls/user/disconnect';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogPost({ params }: Route.ComponentProps) {

  const [blog, setBlog] = useState<Blog>()
  const [blogUser, setBlogUser] = useState<User | null>(null)

  const { user } = useUser()

  const [comments, setComments] = useState<Comment[]>([])

  const [comment, setComment] = useState<string>()

  const [like, setLike] = useState<boolean>(false)
  const [noLikes, setNoLikes] = useState<number>(0)

  const [listModal, setListModal] = useState<boolean>(false)
  const [usersLists, setUsersLists] = useState<List[]>()

  const [following, setFollowing] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean>(false)

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


    
    if (user?._id) {
      const lists = await getAllList(user._id)
      setUsersLists(lists)
    }

    
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
    if (blogUser && user?.following.includes(blogUser?._id)){
      setFollowing(true)
    }
    if (blogUser && user?.connections.includes(blogUser?._id)){
      setConnected(true)
    }
  },[user, blogUser])

  useEffect(() => {
    if (blog && user) {
      console.log(`like status : ${user?.liked?.includes(blog)}`)
      
    }
  }, [blog, user])

  useEffect(() => {
    if (user?._id) {
      (async () => {
        const lists = await getAllList(user._id)
        console.log(lists)
        setUsersLists(lists)
      })()
    }
  }, [user])

  const handleFollow = async () => {
    if (!blogUser?._id) return

    if (following){
      await unfollow(blogUser?._id)
      setFollowing(false)
    } else{
      await follow(blogUser?._id)
      setFollowing(true)
    }

  }

    const handleConnect = async () => {
    if (!blogUser?._id) return

    if (connected){
      await disconnect(blogUser?._id)
      setConnected(false)
    } else{
      await connect(blogUser?._id)
      setConnected(true)
    }

  }



  if (!blog) return <p>Loading...</p>

  {/* ----------------------- CONFIG TIPTAP STARTER KIT ---------------------------------------------------------------------------------------------------- */}   

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
    <div id='blog-post' className='flex gap-7 flex-col my-5 mx-auto max-w-[1000px] h-full'>

{/* ----------------------- HEADING SECTION ---------------------------------------------------------------------------------------------------- */}

      <h1>{blog.title}</h1>
      <h3>
        <i style={{ color: 'gray' }}>{blog.summary}</i>
      </h3>
      <div className='flex gap-5 items-center'>
        <img src={blogUser?.picture} className='rounded-3xl' width={48} onClick={handleNavProfile}/>
        <div onClick={handleNavProfile}>{blogUser?.name}</div>
        <div>{blog.releaseDate.split("T")[0]}</div>
      </div>

{/* ----------------------- INTERACTION BUTTONS ---------------------------------------------------------------------------------------------------- */}   

      <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] text-[#979797] p-6'>   
        <div className='flex gap-2'>
          {like ? (
            <>
              <ThumbsUp className='text-black cursor-pointer' onClick={handleDislike}/>
              <b className='text-black'>{noLikes}</b>
            </>
          ) : (
            <>
              <ThumbsUp className='cursor-pointer' onClick={handleLike}/>
              {noLikes}
            </>
          )}
          
        </div>
        
        <Share2 className='cursor-pointer'/>
        <a href="#comments" className='cursor-pointer'><MessageSquare/></a>
        <div className="relative">
          <Bookmark onClick={() => setListModal(!listModal)} className="cursor-pointer" />

          {listModal && (
            <div className="absolute top-15 left-0 flex flex-col bg-[#111] rounded-3xl shadow-md  gap-3 p-2 w-[250px] text-center text-sm">
              <h3>ADD BLOG TO : </h3>
              {
                usersLists?.map((list, index) => (
                  <div 
                    key={list._id ?? index} // ✅ key here!
                    className='flex gap-2 justify-between'
                  >
                    <div 
                      className="primary-btn hover:none w-full"
                      onClick={() => {}}
                    >
                      {list.name}
                    </div>

                    {list.blogs.some(b => b._id === blog._id) ? (
                      <div 
                        className='primary-btn h-fit' 
                        onClick={() => {
                          RemoveFromList(list._id, blog._id)
                          setListModal(false)
                        }}
                      >
                        <CircleXIcon/>
                      </div>
                    ) : (
                      <div 
                        className='primary-btn h-fit'
                        onClick={() => {
                          AddToList(list._id, blog._id) 
                          setListModal(false)
                        }}
                      >
                        <CirclePlusIcon/>
                      </div>
                    )} 
                  </div>
                ))
              }
              <div></div>
            </div>
          )}
        </div>

      </div>

{/* ----------------------- ACTUAL BLOG POST ---------------------------------------------------------------------------------------------------- */}

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
        {!user && 
        <div className='gap-2 flex h-fit'>
          <button 
            className='primary-btn' 
            onClick={handleFollow}
          >
              {following ? (<span>UNFOLLOW</span>) : (<span>FOLLOW</span>)}
            </button>
          <button 
            className='primary-btn'
            onClick={handleConnect}
          >
            {connected ? (<span>DISCONNECT</span>) : (<span>CONNECT</span>)}
          </button>
        </div>
        }

      </div>

{/* ----------------------- COMMENTS ---------------------------------------------------------------------------------------------------- */}

      <div id="comments">
        <h2>Comments</h2>
        <div className='flex gap-5'>  
          <label id="comment" htmlFor='comment' className='hidden'>Comment</label>
          <input 
            id='comment' 
            name='comment' 
            className='flex-grow'
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
          <button className='primary-btn' onClick={() => {addComment()}}><span>SEND</span></button>
          <button className='secondary-btn' onClick={() => setComment("")}>CLEAR</button>
        </div>
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
