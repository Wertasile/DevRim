import React, { useEffect, useState } from 'react'
import { userContext, useUser } from '~/context/userContext'
import BlogPost from './blogPost'
import type { Route } from '../+types/root'
import type { Blog, List, User } from '~/types/types'
import BlogPostCard from '~/components/blogPostCard'
import fetchUser from '../apiCalls/fetchUser'
import CreateListModal from '~/components/CreateListModal'
import ScrollTrigger from "gsap/ScrollTrigger";
import ListModal from '~/components/listModal'
import accept from '~/apiCalls/user/accept'
import decline from '~/apiCalls/user/decline'


const API_URL = import.meta.env.VITE_API_URL;

const profile = ({params}: Route.ComponentProps) => {

    const {user} = useUser()

    const [profile, setProfile] = useState<User>()
    const [blogs, setBlogs] = useState<Blog []>([])

    const [view, setView] = useState<string>("blogs")

    const [lists, setLists] = useState<List[]>()
    const [listModal, setListModal] = useState(false)

    const [viewListModal, setViewListModal] = useState(false)
    const [listIndex, setListIndex] = useState(0)

    const [newListName, setNewListName] = useState<string>("")

    const [requestUsers, setRequestUsers] = useState<User[]>([])
    const [connectionUsers, setConnectionUsers] = useState<User[]>([])

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

        fetchLists()
    }

    const handleViewList = (index: number) => {
        setListIndex(index)
        setViewListModal(!viewListModal)
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

    const acceptConnection = async (userId: string) => {
        await accept(userId)
        
        
    }

    const declineConnection = async (userId: string) => {
        await decline(userId)
    }

    const fetchRequests = async () => {
        if (user?.requests) {
            for (const request of user.requests) {
                const userData = await fetchUser(request);
                setRequestUsers((prev) => [...prev, userData]); // append without mutating
            }
        }
    };

    const fetchConnections = async () => {
        if (user?.connections) {
            for (const connection of user.connections) {
                const userData = await fetchUser(connection);
                setConnectionUsers((prev) => [...prev, userData]); // append without mutating
            }
        }
    };

    // user's request list has a list of user who have sent requests, this is to retreive each users data
    useEffect(() => {

    fetchRequests();
    fetchConnections();
    }, [user]);


  return (

    <div className='min-h-[80vh]'>
        {listModal && 
            <CreateListModal setListModal={setListModal} listModal={listModal} setLists={setLists} profile={profile} />
        }
        {viewListModal && 
            <ListModal setViewListModal={setViewListModal} list={profile?.lists[listIndex]}/>
        }
        <div className='flex flex-col md:flex-row p-2 sm:px-5'>
            <div className='w-[350px] md:border-r-[2px] border-black border-solid flex flex-col gap-3 p-2 '>
                <img className="rounded-3xl " src={profile?.picture} width={64} height={64}/>
                <div>
                    <h3>{profile?.name}</h3>
                    <i>{profile?.email}</i>
                </div>

                <p>About</p>
            </div>
            <div className='p-5 flex-grow flex flex-col gap-5'>

                <div className='flex flex-row sm:gap-5 border-solid border-b-[1px]'>
                    <h3 className={`cursor-pointer p-2 ${view == "blogs" && `bg-[#229197]`}`} onClick={() => setView("blogs")}>Blogs</h3>
                    <h3 className={`cursor-pointer p-2 ${view == "lists" && `bg-[#229197]`}`} onClick={() => setView("lists")}>Lists</h3>
                    {/* <h3 className='' onClick={() => setView("about")}>About</h3> */}
                    {profile?._id === user?._id && 
                        <h3 className={`cursor-pointer p-2 ${view == "liked" && `bg-[#229197]`}`} onClick={() => setView("liked")}>Liked</h3>
                    }
                    {profile?._id === user?._id && 
                        <h3 className={`cursor-pointer p-2 ${view == "requests" && `bg-[#229197]`}`} onClick={() => setView("requests")}>Requests</h3>
                    }
                    {profile?._id === user?._id && 
                        <h3 className={`cursor-pointer p-2 ${view == "connections" && `bg-[#229197]`}`} onClick={() => setView("connections")}>Connections</h3>
                    }
                </div>

                <div className='flex justify-between'>
                    {view === "lists" && profile?._id === user?._id && 
                    <button 
                        className='primary-btn cursor-pointer'
                        onClick={() => setListModal(!listModal)}
                    >
                        <span>+ CREATE LIST</span>
                    </button>}
                </div>

                {view === "blogs" && (
                    <div className='flex flex-col gap-5'>
                        {blogs.map((b) => (
                            <BlogPostCard key={b._id} id={b._id} postUser={b.user} title={b.title} releaseDate={b.releaseDate} summary={b.summary} comments={b.comments} likes={b.likes}/>
                        ))}
                    </div>
                    )
                }

                {view === "lists" && (
                    <div className='flex flex-col gap-5'>
                        {lists?.map((list, index) => (
                            <div className='cursor-pointer p-1 hover:bg-[#111] flex flex-col gap-2' key={index} onClick={() => handleViewList(index)}>
                                <div> - {list.name}</div>
                                <div className='text-[#979797]'>{list.blogs?.length} blog(s)</div>
                            </div>
                        ))}
                    </div>
                    )
                }

                {/* {view === "about" && (
                    <div className='flex flex-col gap-5'>
                        {lists?.map((list) => (
                            <>
                            <div>{list.name}</div>
                            
                            </>
                        ))}
                    </div>
                    )
                } */}

                {view === "liked" && (
                    <div className='flex flex-col gap-5'>
                        {profile?.liked.map((b, index) => (
                            <BlogPostCard key={index} id={b._id} postUser={b.user} title={b.title} releaseDate={b.releaseDate} summary={b.summary} comments={b.comments} likes={b.likes}/>
                        ))}
                    </div>
                    )
                }

                {view === "requests" && (
                    <div className='flex flex-col gap-5'>
                        {user?.requests ? (<>{requestUsers?.map((user, index) => (
                            <div className='flex flex-col gap-3 '>
                                <div className='flex flex-row gap-5 items-center'>
                                    <div><img className="rounded-3xl" src={user.picture} width={48}/></div>
                                    <div>{user.name}</div>
                                </div>
                                <div className='flex gap-3'>
                                    <button className="primary-btn" onClick={() => {acceptConnection(user._id)}}><span>ACCEPT</span></button>
                                    <button className="secondary-btn" onClick={() => {declineConnection(user._id)}}>DECLINE</button>
                                </div>

                            </div>))}</>) : 
                            (<div>No requests</div>)
                        }
                    </div>
                    )
                }

                {view === "connections" && (
                    <div className='flex flex-col gap-5'>
                        {user?.connections ? (<>{connectionUsers.map((user, index) => (
                            <div 
                                className='flex flex-row gap-5 items-center cursor-pointer'
                                onClick={() => window.location.href = `/profile/${user._id}`}
                            >
                                <div><img className="rounded-3xl" src={user.picture} width={48}/></div>
                                <div>{user.name}</div>
                            </div>
                        ))}</>) : 
                        (<div>No Connections</div>)
                        }
                    </div>
                    )
                }

                
            </div>
        </div>
    </div>
  )
}

export default profile