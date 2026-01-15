import React, { useEffect, useState } from 'react'
import { userContext, useUser } from '~/context/userContext'
import BlogPost from './blogPost'
import type { Route } from '../+types/root'
import type { Blog, Community, List, User } from '~/types/types'
import BlogPostCard from '~/components/blogPostCard'
import fetchUser from '../apiCalls/fetchUser'
import CreateListModal from '~/components/CreateListModal'
import ScrollTrigger from "gsap/ScrollTrigger";
import ListModal from '~/components/listModal'
import EditListModal from '~/components/EditListModal'
import { DotIcon, UserXIcon, Menu, Compass, MessageSquare, Users, Heart, CircleHelp, Settings, Linkedin, Instagram, Youtube, Bookmark, Share2, ThumbsUp, MessageCircle, CalendarDays, Edit, Trash2, PlusIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import Sidebar from '~/components/Sidebar'
import getUserCommunities from '~/apiCalls/Community/getUserCommunities'
import CommunityCardSmall from '~/components/CommunityCardSmall'
import BlogPostCardSmall from '~/components/blogPostCardSmall'
import BlogPostSmall from '~/components/blogPostSmall'


const API_URL = import.meta.env.VITE_API_URL;

const profile = ({params}: Route.ComponentProps) => {

    const {user} = useUser()

    const [profile, setProfile] = useState<User>()
    const [blogs, setBlogs] = useState<Blog []>([])

    const [view, setView] = useState<string>("collections")

    const [lists, setLists] = useState<List[]>()
    const [listModal, setListModal] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState<List | undefined>(lists?.[0])

    const [viewListModal, setViewListModal] = useState(false)
    const [listIndex, setListIndex] = useState(0)
    const [editListModal, setEditListModal] = useState(false)
    const [editingList, setEditingList] = useState<List | undefined>()
    const [deletingListId, setDeletingListId] = useState<string | null>(null)

    const [userCommunities, setUserCommunities] = useState<Community[]>([])

    const [newListName, setNewListName] = useState<string>("")

    const getProfile = async () => {
        if (!params?.id) return  // ✅ type-safe guard
        const data = await fetchUser(params.id) // ✅ await the call
        console.log(data)
        setProfile(data)
        getUserCommunities(params.id).then((data: Community[]) => {
            setUserCommunities(data);
            console.log(data);
        }).catch((err) => {
            console.error(err);
        });
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

        fetchLists()
    }

    const handleViewList = (index: number) => {
        setListIndex(index)
        setViewListModal(!viewListModal)
    }

    const handleEditList = (list: List, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingList(list)
        setEditListModal(true)
    }

    const handleDeleteList = async (listId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        
        if (!confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
            return
        }

        setDeletingListId(listId)
        try {
            const response = await fetch(`${API_URL}/lists/${listId}`, {
                method: 'delete',
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to delete collection' }));
                throw new Error(errorData.error || 'Failed to delete collection');
            }

            await fetchLists()
        } catch (error) {
            console.error('Error deleting list:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete collection. Please try again.');
        } finally {
            setDeletingListId(null)
        }
    }

    const fetchLists = async () => {
        const response = await fetch(`${API_URL}/lists/user/${profile?._id}`, {
            method: 'get',
            credentials: 'include'
        })
        const data = await response.json()
        console.log("LSIT ARE")
        console.log(data)
        setLists(data)
        setSelectedCollection(data?.[0])
    }

    const createList = async () => {
        const response = await fetch(`${API_URL}/lists`, {
            method: 'post',
            credentials: 'include',
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({name: newListName})
        })
        if (!response.ok){
            console.error("List not create")
            return
        }

        const data = await response.json()
        console.log(data)

        setListModal(false)

        fetchLists()
        
    }


  // Helper function to format username from email
  const getUsername = (email: string | undefined) => {
    if (!email) return '';
    return '@' + email.split('@')[0];
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className='min-h-screen'>
        {listModal && 
            <CreateListModal setListModal={setListModal} listModal={listModal} setLists={setLists} profile={profile} />
        }
        {viewListModal && 
            <ListModal setViewListModal={setViewListModal} list={lists?.[listIndex]} setLists={setLists} profile={profile} user={user || undefined} />
        }
        {editListModal && editingList &&
            <EditListModal setEditListModal={setEditListModal} editListModal={editListModal} setLists={setLists} profile={profile} list={editingList} />
        }
        
        {/* Main Layout Container */}
        <div className='flex flex-row gap-6 px-6 py-8 mx-auto'>
            {/* Left SIDE */}
            <Sidebar/>

            {/* MIDDLE */}
            <div className='flex-grow flex flex-col items-center gap-6'>
                {/* Profile Header */}
                <div className='flex flex-col justify-center w-fullgap-4'>
                    <div className='flex flex-col items-center gap-6'>
                        <img 
                            className="rounded-full border-2 border-[#000000]" 
                            src={profile?.picture} 
                            width={120} 
                            height={120}
                            alt={profile?.name}
                        />
                        <div className='flex flex-col gap-2 flex-grow'>
                            <div className='flex items-center justify-between gap-4'>

                                <div className='flex flex-col gap-2'>
                                    <h1>{profile?.name.toUpperCase()}</h1>
                                    <div className='flex gap-6 mt-2'>
                                        <h3>{profile?.followers?.length || 0} FOLLOWERS</h3>
                                        <h3>{profile?.following?.length || 0} FOLLOWING</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className='flex flex-row gap-4 border-[1px] w-fit border-black bg-[#EDEDE9] border-[3px] overflow-hidden shadow-md'>
                    <button 
                        className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                            view === "highlights" 
                                ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                                : "hover:bg-[#FEC72F]/30 hover:font-medium"
                        }`}
                        onClick={() => setView("highlights")}
                    >
                        <h4>Highlights</h4>
                        {view === "highlights" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                        )}
                    </button>
                    <button 
                        className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                            view === "blogs" 
                                ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                                : "hover:bg-[#FEC72F]/30 hover:font-medium"
                        }`}
                        onClick={() => setView("blogs")}
                    >
                        <h4>Posts</h4>
                        {view === "blogs" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                        )}
                    </button>
                    <button 
                        className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                            view === "collections" 
                                ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                                : "hover:bg-[#FEC72F]/30 hover:font-medium"
                        }`}
                        onClick={() => setView("collections")}
                    >
                        <h4>Collections</h4>
                        {view === "collections" && (
                            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                        )}
                    </button>
                    {profile?._id === user?._id && (
                        <button 
                            className={`cursor-pointer px-4 py-2 transition-all duration-300 relative text-small ${
                                view === "liked" 
                                    ? "bg-[#FEC72F] text-black font-semibold shadow-lg transform scale-105" 
                                    : "hover:bg-[#FEC72F]/30 hover:font-medium"
                            }`}
                            onClick={() => setView("liked")}
                        >
                            <h4>Liked</h4>
                            {view === "liked" && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FEC72F]"></div>
                            )}
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div className='flex flex-col gap-6 w-full'>
                    {view === "highlights" && (
                        <div className='text-[#979797]'>Highlights coming soon...</div>
                    )}

                    {view === "blogs" && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {blogs.map((b, index) => {
                                const formattedDate = formatDate(b.releaseDate);
                                return (
                                    <BlogPostCardSmall blog={b} />
                                );
                            })}
                        </div>
                    )}

                    {view === "collections" && (
                        <div className='flex gap-[30px]'>

                            {/* LEFT SIDE*/}
                            <div className='flex flex-col border-[3px] border-[#000000] bg-white p-[10px] gap-[10px]'>
                                <div className='flex justify-center'>
                                    <button className='primary-btn w-full bg-[#E95444]' onClick={() => setListModal(!listModal)}>Create Collection</button>
                                </div>
                                <div className='flex flex-col gap-[10px] p-[10px]'>
                                {lists?.map((list, index) => (
                                    <div 
                                        className={`cursor-pointer p-4 hover:bg-[#FEC72F]/20 flex items-center justify-between gap-4 transition-all duration-200 ${selectedCollection?._id === list._id ? 'bg-[#FEC72F]/30 border-[#FEC72F]' : ''}`} 
                                        key={list._id || index} 
                                        onClick={() => {
                                            // handleViewList(index)
                                            setSelectedCollection(list)
                                        }}
                                    >
                                        <div className='flex gap-[10px] items-center'>
                                            <h3>{list.name}</h3>
                                            <div className='text-mini'>{list.blogs?.length || 0} blog(s)</div>
                                        </div>
                                        {/* {profile?._id === user?._id && (
                                            <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleEditList(list, e)}
                                                    className='p-2 hover:bg-[#FEC72F]/30 rounded-lg transition-all duration-200'
                                                    title="Edit collection"
                                                >
                                                    <Edit size={16} className='cursor-pointer' />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteList(list._id, e)}
                                                    disabled={deletingListId === list._id}
                                                    className='p-2 hover:bg-[#FEC72F]/30 rounded-lg transition-all duration-200 disabled:opacity-50'
                                                    title="Delete collection"
                                                >
                                                    <Trash2 size={16} className='cursor-pointer' />
                                                </button>
                                            </div>
                                        )} */}
                                    </div>
                                ))}
                                </div>
                            </div>

                            {/* RIGHT SIDE*/}
                            <div className='grow border-[3px] border-[#000000] bg-white p-[10px]'>

                                <div className='mb-4 flex justify-between items-end gap-[10px]' >
                                    <h3 className='font-bold'>{selectedCollection?.name.toUpperCase() || 'No collection selected'}</h3>
                                    <div className='flex items-center gap-[10px]'>
                                        {profile?._id === user?._id && (
                                            <button
                                                onClick={(e) => handleEditList(selectedCollection, e)}
                                                className='icon bg-[#FEC72F]'
                                                title="Edit collection"
                                            >
                                                <Edit size={16} className='cursor-pointer' />
                                            </button>
                                        )}
                                        {/* {profile?._id === user?._id && (
                                            <button 
                                                className='icon bg-[#FEC72F] hover:bg-[#FEC72F] transition-all duration-300 hover:scale-110 hover:shadow-lg'
                                                onClick={() => {
                                                    setListModal(!listModal)
                                                }}
                                            >
                                                <PlusIcon size={16}/>
                                            </button>
                                        )} */}
                                        {profile?._id === user?._id && (
                                            <button
                                            onClick={(e) => handleDeleteList(selectedCollection?._id, e)}
                                                disabled={deletingListId === selectedCollection?._id}
                                                className='icon bg-[#FEC72F] '
                                                title="Delete collection"
                                            >
                                                <Trash2 size={16} className='cursor-pointer' />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* DISPLAY SELECTED COLLECTION*/}    
                                <div>
                                    {selectedCollection && selectedCollection.blogs.length > 0 ? (
                                        <div>
                                            {selectedCollection.blogs.map((blog: Blog, index) => (
                                                <div 
                                                className='cursor-pointer hover:bg-[#FEC72F]/20 transition-all duration-200 border-[1px] bg-[#EDEDE9] text-small p-[10px] py-[15px] border-[#000000] rounded-[5px]' 
                                                key={blog._id}
                                                onClick={() => window.location.href = `/blog/${blog._id}`}
                                                >
                                                    {blog.title}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div>No blogs in this collection</div>
                                    )}
                                </div>        

                            </div>
                        </div>
                    )}

                    {view === "liked" && (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {profile?.liked.map((b, index) => (
                                <BlogPostCardSmall key={b._id} blog={b} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE*/}
            <div className='max-w-[400px] min-w-[400px] flex flex-col gap-[30px]'>

                {/* ABOUT */}
                <div className='w-full bg-[#EDEDE9] border-[3px] border-solid border-[#000000] p-[10px] flex-col gap-[10px] rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'>
                    <h3>{profile?.name.toUpperCase()}</h3>
                    <div className='text-mini'>{profile?.byline}</div>
                    <p className='text-small'>{profile?.about}</p>
                    {/* <div>Joined on {formatDate(profile?.created_at || "")}</div> */}
                </div>

                {/* LOVED TOPICS / COMMUNITIES*/}
                <div className='w-full bg-[#EDEDE9] flex border-[3px] border-solid border-[#000000] flex-col gap-[10px] p-[10px] rounded-lg shadow-lg'>
                    <h3>LOVED TOPICS / COMMUNITIES</h3>
                    {userCommunities && userCommunities.length > 0 && (
                        <div className='flex flex-col gap-[10px] overflow-x-auto'>
                            {userCommunities.map((community: Community) => (
                                <CommunityCardSmall key={community._id} community={community} />
                            ))}
                        </div>
                    )}
                    {userCommunities && userCommunities.length === 0 && (
                        <div>User is not a member of any communities</div>
                    )}
                </div>
            </div>
            
        </div>
    </div>
  )
}

export default profile