import React, { useEffect, useState, useRef } from 'react'
import type { Route } from '../+types/root';
import type { Blog, Comment, List, User } from '~/types/types';

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { ListItem } from '@tiptap/extension-list';
import Image from '@tiptap/extension-image';
import { useUser } from '~/context/userContext';
import { Bookmark, SendIcon, CirclePlusIcon, CircleXIcon, MessageSquare, Share, Share2, ThumbsDown, ThumbsUp, ChevronRight, ChevronDown, ChevronUp, X, Trash2, MoreVertical, Edit, PlusIcon } from 'lucide-react';
import gsap from 'gsap';
import getAllList from '~/apiCalls/list/getAllLists';
import AddToList from '~/apiCalls/list/addToList';
import RemoveFromList from '~/apiCalls/list/removeFromList';
import follow from '~/apiCalls/user/follow';
import unfollow from '~/apiCalls/user/unfollow';
import connect from '~/apiCalls/user/connect';
import disconnect from '~/apiCalls/user/disconnect';
import logEvent from '~/utils/logEvent';
import Sidebar from '~/components/Sidebar';
import { Skeleton } from '~/components/SkeletonLoader';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogPost({ params }: Route.ComponentProps) {

  const [blog, setBlog] = useState<Blog>()
  const [blogUser, setBlogUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const { user } = useUser()

  const [comments, setComments] = useState<Comment[]>([])

  const [comment, setComment] = useState<string>()

  const [like, setLike] = useState<boolean>(false)
  const [noLikes, setNoLikes] = useState<number>(0)

  const [listModal, setListModal] = useState<boolean>(false)
  const [usersLists, setUsersLists] = useState<List[]>([])

  const [following, setFollowing] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean>(false)
  
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [replyText, setReplyText] = useState<string>("")
  const [showDeleteMenu, setShowDeleteMenu] = useState<boolean>(false)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const commentsPanel = useRef<HTMLDivElement>(null)

  {/* ----------------------- TRACKING ACTIVITY ---------------------------------------------------------------------------------------------------- */}

  useEffect(() => {
    let active = true
    let lastActivity = Date.now()

    const updateActivity = () => {
      lastActivity = Date.now()
    }

    const activityInterval = setInterval(async() => {
      if (Date.now() - lastActivity < 60000){
        await fetch(`${API_URL}/userAction`, {
          method: 'post',
          headers: {
            "Content-Type":"application/json"
          },
          credentials: "include",
          body: JSON.stringify({action: "view", blog:blog })
        })
      }
    }, (30000))

    window.addEventListener("mousemove", updateActivity)
    window.addEventListener("keydown", updateActivity)
    window.addEventListener("scroll", updateActivity)

    return () => {
      window.addEventListener("mousemove", updateActivity)
      window.addEventListener("keydown", updateActivity)
      window.addEventListener("scroll", updateActivity)

      clearInterval(activityInterval)
    }
  })

  // view_post, like_post, comment_post, bookmark_post, follow_user, connect_user, send_message
  useEffect(() => {
    if (blog && blog._id){
      logEvent("view_blog" , {
        blog: blog?._id
      })
    }
    
  }, [blog])
  
  
  {/* ----------------------- LOADING BLOG IN ---------------------------------------------------------------------------------------------------- */}
  
  const getBlog = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts/${params.id}`, {
        method: 'post',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Failed to load blog post');
      }
      const data = await response.json()
      setBlog(data)
      setComments(data.comments || [])

      const userResponse = await fetch(`${API_URL}/users/${data.user}`, {
        method: 'get',
        credentials: 'include'
      })
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setBlogUser(userData)
      }
      
      if (user?._id) {
        const lists = await getAllList(user._id)
        setUsersLists(lists)
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      alert('Failed to load blog post. Redirecting...');
      window.location.href = '/blog';
    } finally {
      setIsLoading(false);
    }
  }

  {/* ----------------------- LIKES AND DISLIKES ---------------------------------------------------------------------------------------------------- */}

  const handleLike = async () => {
    if (!blog?._id) return
    
    const method = like ? 'delete' : 'put'

    const res = await fetch(`${API_URL}/users/like/${blog._id}`, {
      method,
      credentials: 'include'
    })

    if (!res.ok) return
    const updated = await res.json()
    
    // Use backend’s latest like count if it returns it
    setLike(!like)
    setNoLikes(prev => like ? prev - 1 : prev + 1)
  }


  {/* ----------------------- ADDING COMMENTS ---------------------------------------------------------------------------------------------------- */}

  const addComment = async () => {
    if (!comment?.trim()) return
    
    const response = await fetch(`${API_URL}/comments/${blog?._id}`, {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        comment: comment,
        replyTo: replyingTo?._id || null
      })
    })

    if (!response.ok){
      console.error("Comment not added")
      return
    }

    const data = await response.json()
    console.log(data)
    setComments( prev => [...(prev ?? []), data])
    setComment("")
    setReplyingTo(null)
    setReplyText("")
  }

  const addReply = async (parentCommentId: string, replyText: string) => {
    if (!replyText?.trim()) return
    
    const response = await fetch(`${API_URL}/comments/${blog?._id}`, {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        comment: replyText,
        replyTo: parentCommentId
      })
    })

    if (!response.ok){
      console.error("Reply not added")
      return
    }

    const data = await response.json()
    setComments( prev => [...(prev ?? []), data])
    setReplyingTo(null)
    setReplyText("")
  }

  const handleNavProfile = () => {
    window.location.href = `/profile/${blogUser?._id}`
  }

  const handleDelete = async () => {
    if (!blog?._id) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/posts/${blog._id}`, {
        method: 'delete',
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to delete post' }));
        throw new Error(errorData.error || 'Failed to delete post');
      }

      // Redirect to blog home after successful deletion
      window.location.href = '/blog';
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteMenu(false);
    }
  };

  const isOwnPost = user?._id === blogUser?._id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteMenu) {
        setShowDeleteMenu(false);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDeleteMenu]);

  {/* ----------------------- LOAD USERS LISTS WHEN THEY LOAD IN ---------------------------------------------------------------------------------------------------- */}

  useEffect(() => {
    if (user?._id) {
      (async () => {
        const lists = await getAllList(user._id)
        console.log(lists)
        setUsersLists(lists)
      })()
    }
  }, [user, blog])

  useEffect(() => {
    getBlog()
  }, [])

  useEffect(() => {
    if (blogUser && user?.following && blogUser._id){
      if (Array.isArray(user.following) && user.following.some((f: User | string) => {
        const id = typeof f === 'string' ? f : f._id;
        return id === blogUser._id;
      })){
        setFollowing(true)
      }
    }
    if (blogUser && user?.connections && blogUser._id){
      if (user.connections.includes(blogUser._id)){
        setConnected(true)
      }
    }
  },[user, blogUser])

  useEffect(() => {
    if (blog && user?._id) {
      const isLiked = blog.likes.some((like: User | string) => {
        const likeId = typeof like === 'string' ? like : like._id;
        return likeId === user._id;
      });
      setLike(isLiked);
      setNoLikes(blog.likes.length)
    }
  }, [blog, user])

  {/* ----------------------- HANDLING FOLLOW CLICKS ---------------------------------------------------------------------------------------------------- */}

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

  {/* ----------------------- HANDLING CONNECT CLICKS ---------------------------------------------------------------------------------------------------- */}


  const handleConnect = async () => {
    if (!blogUser?._id) return

    if (connected){
      await disconnect(blogUser?._id)
      setConnected(false)
    } else{
      await connect(blogUser?._id)
      await follow(blogUser?._id)
      setConnected(true)
      setFollowing(true)
    }
  }

  {/* ----------------------- COMMENTS PANEL ANIMATION ---------------------------------------------------------------------------------------------------- */}

  const openCommentsPanel = () => {
    setCommentsOpen(true)
    gsap.to(commentsPanel.current, {
      x: "0%",
      duration: 0.6
    })
  }

  const closeCommentsPanel = () => {
    setCommentsOpen(false)
    gsap.to(commentsPanel.current, {
      x: "100%",
      duration: 0.6
    })
  }

  if (isLoading || !blog) {
    return (
      <div id='blog-post' className='min-h-screen flex flex-row gap-6 px-6 py-8' role="status" aria-live="polite" aria-label="Loading blog post">
        <Sidebar/>
        <div className='flex-grow flex flex-col gap-4 max-w-[1200px] mx-auto'>
          <Skeleton width="70%" height={36} />
          <div className='flex items-center gap-2'>
            <Skeleton circle width={32} height={32} />
            <Skeleton width={100} height={14} />
          </div>
          <Skeleton width="100%" height={200} rounded />
          <Skeleton width="85%" height={16} />
          <Skeleton width="90%" height={16} />
          <Skeleton width="80%" height={16} />
        </div>
      </div>
    );
  }

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
    <div id='blog-post' className='min-h-screen flex flex-row gap-8 px-6 py-12'>

      <Sidebar/>
      

      {/* ----------------------- MAIN CONTENT AREA ---------------------------------------------------------------------------------------------------- */}
      <div className='flex-grow flex flex-col gap-8 max-w-[1200px] mx-auto'>
        {/* ----------------------- TITLE SECTION ---------------------------------------------------------------------------------------------------- */}
          <h1 className='text-4xl font-bold leading-tight'>{blog.title}</h1>
          

        {/* Author and Date */}
        <div className='flex items-center gap-3 text-sm text-black/70'>
          <img 
            src={blogUser?.picture} 
            className='rounded-full border-2 border-[#000000]' 
            width={40} 
            height={40}
            alt={blogUser?.name}
          />
          <div>
            <div className='font-medium text-black'>{blogUser?.name}</div>
            <div className='text-xs'>
              {blog?.releaseDate ? new Date(blog.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </div>
          </div>
        </div>

        {/* ----------------------- COVER IMAGE SECTION ---------------------------------------------------------------------------------------------------- */}
        {blog.coverImage && (
          <div className='-mx-6'>
            <img 
              src={blog.coverImage} 
              alt={blog.title}
              className='w-full object-cover rounded-lg'
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* ----------------------- SUMMARY SECTION ---------------------------------------------------------------------------------------------------- */}
        {blog.summary && blog.summary.trim() && (
          <div className='text-xl text-black/80 leading-relaxed font-medium'>
            {blog.summary}
          </div>
        )}

        {/* ----------------------- ACTUAL BLOG POST CONTENT ---------------------------------------------------------------------------------------------------- */}
        <div className='prose prose-lg max-w-none'>
          <div 
            className='text-black leading-relaxed text-lg'
            style={{ lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>

        
      </div>
      
      {/* ----------------------- INTERACTION BUTTONS - STICKY RIGHT BAR ---------------------------------------------------------------------------------------------------- */}   
      <div className='sticky top-24 self-start flex flex-col gap-4 items-center px-2 py-4 h-fit'>
        {/* Like Button */}
        <button 
          onClick={handleLike}
          className='flex flex-col items-center gap-1 p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#E95444] focus:ring-offset-2'
          title={like ? "Unlike this post" : "Like this post"}
          aria-label={like ? "Unlike this post" : "Like this post"}
          aria-pressed={like}
        >
          <ThumbsUp size={20} className={like ? 'fill-black text-black' : 'text-black/60'}/>
          <span className='text-xs text-black'>{noLikes}</span>
        </button>

        {/* Comments Button */}
        <button 
          onClick={() => {
            (!commentsOpen) ? (openCommentsPanel()) : (closeCommentsPanel())
          }}
          className='flex flex-col items-center gap-1 p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#E95444] focus:ring-offset-2'
          title={commentsOpen ? "Close comments" : "Open comments"}
          aria-label={commentsOpen ? "Close comments" : "Open comments"}
          aria-expanded={commentsOpen}
        >
          <MessageSquare size={20} className='text-black/60'/>
          <span className='text-xs text-black'>{comments.length}</span>
        </button>
        
        {/* Bookmark Button */}
        <div className="relative">
          {(() => {
            const isInCollection = usersLists?.some(list => 
              list.blogs?.some(b => b._id === blog._id)
            );
            
            return (
              <>
                <button
                  onClick={() => setListModal(!listModal)} 
                  className='flex flex-col items-center gap-1 p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#E95444] focus:ring-offset-2'
                  title={isInCollection ? "Remove from collections" : "Save to collection"}
                  aria-label={isInCollection ? "Remove from collections" : "Save to collection"}
                  aria-expanded={listModal}
                >
                  <Bookmark 
                    className={isInCollection ? 'fill-black text-black' : 'text-black/60'}
                    size={20}
                  />
                </button>
                {listModal && (
                  <div className="absolute -top-10 right-full mr-4 flex flex-col bg-[#EDEDE9] border-[3px] border-[#000000] shadow-xl gap-[10px] p-[10px] w-[250px] text-center text-sm z-50 max-h-[400px] overflow-y-auto">
                    {(() => {
                      const collectionsWithPost = usersLists?.filter(list => 
                        list.blogs?.some(b => b._id === blog._id)
                      ) || [];
                      const isInAnyCollection = collectionsWithPost.length > 0;
                      
                      return (
                        <>
                          {isInAnyCollection && (
                            <div className="mb-2 pb-2 border-b flex flex-col gap-[10px] border-[#979797]">
                              <h3>IN COLLECTIONS:</h3>
                              <div className="flex flex-col gap-1">
                                {collectionsWithPost.map((list) => (
                                  <div 
                                    key={list._id}
                                    className="flex items-center justify-between p-2 bg-[#D6D6CD] rounded text-left"
                                  >
                                    <span className="text-black text-xs flex-1 truncate">{list.name}</span>
                                    <button
                                      onClick={async () => {
                                        await RemoveFromList(list._id, blog._id);
                                        const updatedLists = await getAllList(user?._id || null);
                                        setUsersLists(updatedLists);
                                      }}
                                      className="ml-2 p-1 hover:bg-[#C6C6BD] rounded transition-colors"
                                      title="Remove from collection"
                                    >
                                      <CircleXIcon size={14} className="text-red-600" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* <h3 className='text-black mb-2 text-xs font-semibold'>
                            {isInAnyCollection ? 'ADD TO MORE COLLECTIONS:' : 'ADD BLOG TO COLLECTION:'}
                          </h3> */}
                          <div>
                            <button className='primary-btn w-full bg-[#E95444]'>Create Collection</button>
                          </div>
                          <div className='flex flex-col gap-[10px] p-[10px]'>
                          {usersLists && usersLists.length > 0 ? (
                            usersLists.map((list, index) => {
                              const isInThisCollection = list.blogs?.some(b => b._id === blog._id);
                              if (isInThisCollection) return null;
                              
                              return (
                                <div 
                                  key={list._id ?? index}
                                  className='flex gap-2 justify-between items-center'
                                >
                                  <h3>{list.name}</h3>
                                  <div 
                                    className='highlight-btn'
                                    onClick={async () => {
                                      await AddToList(list._id, blog._id);
                                      const updatedLists = await getAllList(user?._id || null);
                                      setUsersLists(updatedLists);
                                    }}
                                  >
                                    <PlusIcon size={16}/>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-black/60 text-xs py-2">No collections yet</div>
                          )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Share Button */}
        <button 
          className='flex flex-col items-center gap-1 p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors'
          title="Share"
        >
          <Share2 size={20} className='text-black/60'/>
        </button>

        {/* Edit and Delete Buttons - Only show if user owns the post */}
        {isOwnPost && (
          <div className='flex flex-col gap-2 pt-4 border-t border-black/20'>
            <button
              onClick={() => window.location.href = `/edit/${blog?._id}`}
              className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors'
              title="Edit post"
            >
              <Edit size={18} className='text-black/60'/>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors disabled:opacity-50'
              title="Delete post"
            >
              <Trash2 size={18} className='text-black/60'/>
            </button>
          </div>
        )}
      </div>
      {/* ----------------------- COMMENTS PANEL - RIGHT SIDE ---------------------------------------------------------------------------------------------------- */}
      <div 
        ref={commentsPanel}
        className='fixed top-0 right-0 self-start w-[400px] h-screen bg-white border-l-2 border-[#000000] flex flex-col overflow-hidden z-50 shadow-2xl'
        style={{transform: "translateX(100%)"}}
      >
        <div className='flex items-center justify-between p-6 border-b-2 border-[#000000] bg-white'>
          <h3 className='text-black font-semibold'>
            Comments ({comments.filter(c => {
              const replyToId = typeof c.replyTo === 'string' ? c.replyTo : c.replyTo?._id;
              return !replyToId;
            }).length})
          </h3>
          <button 
            onClick={closeCommentsPanel}
            className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors'
          >
            <X size={20} className='text-black' />
          </button>
        </div>
          
          <div className='flex flex-col gap-6 overflow-y-auto p-6 bg-white'>
            {/* Add Comment Form */}
            <div className='flex flex-col gap-3'>
              {replyingTo && (
                <div className='p-3 bg-[#EDEDE9] rounded-lg border-2 border-[#000000]'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='text-sm text-black/70'>Replying to <span className='font-medium text-black'>{replyingTo.user.name}</span></span>
                    <button 
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText("")
                      }}
                      className='p-1 hover:bg-[#D6D6CD] rounded transition-colors'
                    >
                      <X size={14} className='text-black' />
                    </button>
                  </div>
                  <p className='text-sm text-black/60 truncate'>{replyingTo.comment}</p>
                </div>
              )}
              
              <div className='flex gap-2'>
                <input 
                  className='form-input flex-1'
                  placeholder={replyingTo ? 'Write a reply...' : 'What are your thoughts?'}
                  value={replyingTo ? replyText : (comment ?? "")}
                  onChange={(e) => replyingTo ? setReplyText(e.target.value) : setComment(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey){
                      event.preventDefault()
                      if (replyingTo) {
                        addReply(replyingTo._id, replyText)
                      } else {
                        addComment()
                      }
                    }
                  }}
                />
                <button 
                  className='icon bg-[#4DD499] hover:bg-[#3BC088] text-black transition-all duration-200'
                  onClick={() => {
                    if (replyingTo) {
                      addReply(replyingTo._id, replyText)
                    } else {
                      addComment()
                    }
                  }}
                >
                  <SendIcon size={16} />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className='flex flex-col gap-6'>
              {comments.filter(c => {
                // Filter out comments that are replies (have a replyTo field)
                const replyToId = typeof c.replyTo === 'string' ? c.replyTo : c.replyTo?._id;
                return !replyToId;
              }).map((comment, index) => {
                // Get replies for this comment - handle both string ID and object
                const replies = comments.filter(c => {
                  const replyToId = typeof c.replyTo === 'string' ? c.replyTo : c.replyTo?._id;
                  return replyToId === comment._id;
                })
                const isExpanded = expandedReplies.has(comment._id);
                
                return (
                  <div key={comment._id} className={`flex flex-col gap-4 ${index > 0 ? 'pt-6 border-t border-black/20' : ''}`}>
                    <div className='flex gap-3'>
                      <img 
                        src={comment.user.picture} 
                        className="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-[#000000]" 
                        width={40} 
                        height={40}
                        alt={comment.user.name}
                      />
                      <div className='flex-grow'>
                        <div className='flex items-center gap-2 mb-2'>
                          <div className='font-medium text-black'>{comment.user.name}</div>
                          <div className='text-xs text-black/60'>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <p className='text-black leading-relaxed mb-3'>{comment.comment}</p>
                        <div className='flex items-center gap-4'>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(comment);
                            }}
                            className='text-xs text-black/70 hover:text-black font-medium transition-colors'
                          >
                            Reply
                          </button>
                          {replies.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newExpanded = new Set(expandedReplies);
                                if (isExpanded) {
                                  newExpanded.delete(comment._id);
                                } else {
                                  newExpanded.add(comment._id);
                                }
                                setExpandedReplies(newExpanded);
                              }}
                              className='text-xs text-black/70 hover:text-black font-medium transition-colors flex items-center gap-1'
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={12} />
                                  Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} />
                                  View {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Replies - Accordion */}
                    {replies.length > 0 && isExpanded && (
                      <div className='ml-13 flex flex-col gap-4 pl-6 border-l-2 border-black/20'>
                        {replies.map((reply) => (
                          <div key={reply._id} className='flex gap-3'>
                            <img 
                              src={reply.user.picture} 
                              className="flex-shrink-0 w-8 h-8 rounded-full object-cover border-2 border-[#000000]" 
                              width={32} 
                              height={32}
                              alt={reply.user.name}
                            />
                            <div className='flex-grow'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-black font-medium text-sm'>{reply.user.name}</span>
                                <span className='text-black/60 text-xs'>
                                  {new Date(reply.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                              <p className='text-black text-sm mb-2 leading-relaxed'>{reply.comment}</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingTo(reply);
                                }}
                                className='text-xs text-black/70 hover:text-black font-medium transition-colors'
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              {comments.length === 0 && (
                <div className='text-center text-black/60 py-12'>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}
