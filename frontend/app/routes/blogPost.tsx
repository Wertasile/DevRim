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
import { Bookmark, SendIcon, CirclePlusIcon, CircleXIcon, MessageSquare, Share, Share2, ThumbsDown, ThumbsUp, ChevronRight, ChevronDown, ChevronUp, X, Trash2, MoreVertical, Edit } from 'lucide-react';
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
    
    if (user?._id) {
      const lists = await getAllList(user._id)
      setUsersLists(lists)
    }
    console.log("USER IS")
    console.log(userData)
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
    <div id='blog-post' className='min-h-screen flex flex-row gap-6 px-6 py-8 mx-auto max-w-[1400px]'>

      <Sidebar/>
      

      {/* ----------------------- MAIN CONTENT AREA ---------------------------------------------------------------------------------------------------- */}
      <div className='flex-grow flex flex-col gap-6'>
        {/* ----------------------- TITLE SECTION ---------------------------------------------------------------------------------------------------- */}
        <div className='pb-6 border-b border-[#1f2735]'>
          <div className='flex items-start justify-between gap-4'>
            <h1>{blog.title}</h1>
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="p-2 hover:bg-[#121b2a] rounded-lg transition-colors"
                  aria-label="Post options"
                >
                  <MoreVertical size={20} className="text-[#9aa4bd]" />
                </button>
                {showDeleteMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-[#0f1926] border border-[#1f2735] rounded-lg shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={() => {
                        setShowDeleteMenu(false);
                        window.location.href = `/edit/${blog?._id}`;
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-[#121b2a] rounded-t-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      Edit Post
                    </button>
                    <div className="border-t border-[#1f2735]"></div>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#121b2a] rounded-b-lg flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {isDeleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ----------------------- SUMMARY SECTION ---------------------------------------------------------------------------------------------------- */}
        {blog.summary && blog.summary.trim() && (
          <div className='pb-6 border-b border-[#1f2735]'>
            <h3 className='leading-relaxed'>
              {blog.summary}
            </h3>
          </div>
        )}

        {/* ----------------------- ACTUAL BLOG POST CONTENT ---------------------------------------------------------------------------------------------------- */}
        <div className='pt-4 prose prose-invert '>
          <div 
            className='leading-relaxed'
            dangerouslySetInnerHTML={{ __html: html }} 
          />
        </div>
        <div className='flex gap-5 border-y-[1px] border-solid border-[#979797] p-6'>
          <div>
            <img onClick={handleNavProfile} src={blogUser?.picture} className='rounded-3xl cursor-pointer' width={64}/>
          </div>
          <div className='flex flex-col flex-grow'>
            <div className='cursor-pointer' onClick={handleNavProfile}>{blogUser?.name}</div>
            <div>About user</div>
          </div>
          {user?._id !== blogUser?._id && 
            <div className='gap-2 flex h-fit'>
              <button 
                className='primary-btn' 
                onClick={handleFollow}
              >
                  {user?.following && blogUser?._id && user.following.some((f: User | string) => {
                    const id = typeof f === 'string' ? f : f._id;
                    return id === blogUser._id;
                  }) ? (<span>UNFOLLOW</span>) : (<span>FOLLOW</span>)}
                </button>
              <button 
                className='primary-btn'
                onClick={handleConnect}
              >
                {connected ? (
                  <span>DISCONNECT</span>
                ) : user?.requestsReceived && blogUser?._id && user.requestsReceived.includes(blogUser._id) ? (
                  <span>ACCEPT</span>
                ) : user?.requestsSent && blogUser?._id && user.requestsSent.includes(blogUser._id) ? (
                  <span>PENDING</span>
                ) : (
                  <span>CONNECT</span>
                )}
              </button>
            </div>
          }
        </div>

        
      </div>
      
      {/* ----------------------- INTERACTION BUTTONS - STICKY RIGHT BAR ---------------------------------------------------------------------------------------------------- */}   
      <div className='sticky top-24 self-start flex flex-col gap-6 items-center px-2 py-1 h-fit'>
        {/* Username Section */}
        <div className='flex flex-col gap-3 items-center cursor-pointer group' onClick={handleNavProfile}>
          <img 
            src={blogUser?.picture} 
            className='rounded-full border-2 border-[#353535] group-hover:border-[#5D64F4] transition-colors' 
            width={56} 
            height={56}
            alt={blogUser?.name}
          />
          <div className='text-xs text-center max-w-[100px]'>
            <div>{blogUser?.name}</div>
          </div>
        </div>

        {/* Date */}
        <div className='text-xs text-[#979797] text-center'>
          {blog?.releaseDate ? blog.releaseDate.split("T")[0] : ''}
        </div>

        {/* Edit and Delete Buttons - Only show if user owns the post */}
        {isOwnPost && (
          <div className='flex flex-col gap-2'>
              <button
                onClick={() => window.location.href = `/edit/${blog?._id}`}
                className='icon'
                title="Edit post"
              >
                <Edit size={14} />
                
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='icon'
                title="Delete post"
              >
                <Trash2 size={14} />
                
              </button>
            </div>

        )}

          {like ? (
            <div className='icon relative'>
              <ThumbsUp size={18} onClick={handleLike}/>
              <b className='absolute -top-2.5 -right-2.5 bg-red-800 text-white rounded-full px-2 py-1 text-xs'>{noLikes}</b>
            </div>
          ) : (
            <div className='icon relative'>
              <ThumbsUp size={18} onClick={handleLike}/>
              <b className='absolute -top-2.5 -right-2.5 bg-red-800 text-white rounded-full px-2 py-1 text-xs'>{noLikes}</b>
            </div>
          )}
        
        <div className='icon relative'>
          <Share2 size={18}/>
        </div>

        <div className='icon relative'
            onClick={() => {
              (!commentsOpen) ? (openCommentsPanel()) : (closeCommentsPanel())
            }}
            title="Toggle comments"
          >
            <MessageSquare size={18}/>
            <b className='absolute -top-2.5 -right-2.5 bg-red-800 text-white rounded-full px-2 py-1 text-xs'>{comments.length}</b>
          
        </div>
        
        <div className="icon relative">
          {(() => {
            const isInCollection = usersLists?.some(list => 
              list.blogs?.some(b => b._id === blog._id)
            );
            const collectionsWithPost = usersLists?.filter(list => 
              list.blogs?.some(b => b._id === blog._id)
            ) || [];
            
            return (
              <>
                <Bookmark 
                  onClick={() => setListModal(!listModal)} 
                  className={`cursor-pointer hover:scale-110 transition-transform ${
                    isInCollection 
                      ? 'text-[#5D64F4] fill-[#5D64F4] hover:text-[#6d75fd] hover:fill-[#6d75fd]' 
                      : 'hover:text-white'
                  }`}
                  size={18}
                />
                {isInCollection && collectionsWithPost.length > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#5D64F4] rounded-full border-2 border-[#0a1118]"></div>
                )}
              </>
            );
          })()}

          {listModal && (
            <div className="absolute bottom-0 right-full mr-4 flex flex-col bg-[#0f1926] border border-[#1f2735] rounded-lg shadow-xl gap-3 p-4 w-[250px] text-center text-sm z-50 max-h-[400px] overflow-y-auto">
              {(() => {
                const collectionsWithPost = usersLists?.filter(list => 
                  list.blogs?.some(b => b._id === blog._id)
                ) || [];
                const isInAnyCollection = collectionsWithPost.length > 0;
                
                return (
                  <>
                    {isInAnyCollection && (
                      <div className="mb-2 pb-2 border-b border-[#1f2735]">
                        <h4 className='text-[#5D64F4] text-xs font-semibold mb-1'>IN COLLECTIONS:</h4>
                        <div className="flex flex-col gap-1">
                          {collectionsWithPost.map((list) => (
                            <div 
                              key={list._id}
                              className="flex items-center justify-between p-2 bg-[#121b2a] rounded text-left"
                            >
                              <span className="text-white text-xs flex-1 truncate">{list.name}</span>
                              <button
                                onClick={async () => {
                                  await RemoveFromList(list._id, blog._id);
                                  const updatedLists = await getAllList(user?._id || null);
                                  setUsersLists(updatedLists);
                                }}
                                className="ml-2 p-1 hover:bg-[#1f2735] rounded transition-colors"
                                title="Remove from collection"
                              >
                                <CircleXIcon size={14} className="text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <h3 className='text-white mb-2 text-xs font-semibold'>
                      {isInAnyCollection ? 'ADD TO MORE COLLECTIONS:' : 'ADD BLOG TO COLLECTION:'}
                    </h3>
                    {usersLists && usersLists.length > 0 ? (
                      usersLists.map((list, index) => {
                        const isInThisCollection = list.blogs?.some(b => b._id === blog._id);
                        if (isInThisCollection) return null; // Skip collections already shown above
                        
                        return (
                          <div 
                            key={list._id ?? index}
                            className='flex gap-2 justify-between items-center'
                          >
                            <div 
                              className="primary-btn hover:none w-full text-left px-3 py-2"
                              onClick={() => {}}
                            >
                              {list.name}
                            </div>
                            <div 
                              className='primary-btn h-fit px-2 py-2'
                              onClick={async () => {
                                await AddToList(list._id, blog._id);
                                const updatedLists = await getAllList(user?._id || null);
                                setUsersLists(updatedLists);
                              }}
                            >
                              <CirclePlusIcon size={16}/>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-[#9aa4bd] text-xs py-2">No collections yet</div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
      {/* ----------------------- COMMENTS PANEL - RIGHT SIDE ---------------------------------------------------------------------------------------------------- */}
      <div 
        ref={commentsPanel}
        className='fixed top-24 right-0 self-start w-[380px] h-[calc(100vh-120px)] bg-[#EDEDE9] border border-[#000000] flex flex-col overflow-hidden z-50'
        style={{transform: "translateX(100%)"}}
      >
        <div className='flex items-center justify-between p-4 border-b border-[#1f2735]'>
          <h3>
            COMMENTS ({comments.filter(c => {
              const replyToId = typeof c.replyTo === 'string' ? c.replyTo : c.replyTo?._id;
              return !replyToId;
            }).length})
          </h3>
          <button 
            onClick={closeCommentsPanel}
            className='text-[#9aa4bd] hover:text-black transition-colors'
          >
            <X size={20} />
          </button>
        </div>
          
          <div className='flex flex-col gap-4 overflow-y-auto p-4'>
            {/* Add Comment Form */}
            <div>

              
              {replyingTo && (
                <div className='mb-2 p-2 bg-[#EDEDE9] rounded border border-[#000000] text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[#9aa4bd]'>Replying to <span className='text-black'>{replyingTo.user.name}</span></span>
                    <button 
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText("")
                      }}
                      className='text-[#9aa4bd] hover:text-black'
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className='text-[#9aa4bd] text-xs mt-1 truncate'>{replyingTo.comment}</p>
                </div>
              )}

              
              <div className='flex gap-2'>
                <input 
                  className=''
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
                  className='icon'
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
                  <div key={comment._id} className={`flex flex-col gap-3 ${index > 0 ? 'pt-6 border-t border-[#000000]' : ''}`}>
                    <div className='flex gap-3'>
                      <img 
                        src={comment.user.picture} 
                        className="flex-shrink-0 w-8 h-8 rounded-full object-cover" 
                        width={32} 
                        height={32}
                        alt={comment.user.name}
                      />
                      <div className='flex-grow'>
                        <div className='flex items-center gap-2 mb-1'>
                          <div>{comment.user.name}</div>
                          <div className='text-mini'>
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <p>{comment.comment}</p>
                        <div className='flex items-center gap-3'>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyingTo(comment);
                            }}
                            className='text-mini flex gap-[5px] items-center cursor-pointer hover:bg-white/50 rounded-[5px] p-[5px]'
                          >
                            REPLY
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
                              className='text-mini flex gap-[5px] items-center cursor-pointer hover:bg-white/50 rounded-[5px] p-[5px]'
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={12} />
                                  HIDE {replies.length} {replies.length === 1 ? 'REPLY' : 'REPLIES'}
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} />
                                  VIEW {replies.length} {replies.length === 1 ? 'REPLY' : 'REPLIES'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Replies - Accordion */}
                    {replies.length > 0 && isExpanded && (
                      <div className='ml-11 flex flex-col gap-4 pl-4 border-l-2 border-[#1f2735]'>
                        {replies.map((reply) => (
                          <div key={reply._id} className='flex gap-3'>
                            <img 
                              src={reply.user.picture} 
                              className="flex-shrink-0 w-8 h-8 rounded-full object-cover" 
                              width={32} 
                              height={32}
                              alt={reply.user.name}
                            />
                            <div className='flex-grow'>
                              <div className='flex items-center gap-2 mb-1'>
                                <span className='text-white font-medium text-sm'>{reply.user.name}</span>
                                <span className='text-[#9aa4bd] text-xs'>
                                  {new Date(reply.createdAt || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                              <p className='text-[#cdd5e9] text-sm mb-2'>{reply.comment}</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingTo(reply);
                                }}
                                className='text-[#9aa4bd] hover:text-[#5D64F4] text-[10px] uppercase tracking-wide transition-colors font-medium'
                              >
                                REPLY
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
                <div className='text-center text-[#9aa4bd] py-8'>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}
