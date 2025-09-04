import React, { useEffect, useState } from 'react'
import { userContext, useUser } from '~/context/userContext'
import BlogPost from './blogPost'
import type { Route } from '../+types/root'
import type { Blog, List, User } from '~/types/types'
import BlogPostCard from '~/components/blogPostCard'
import fetchUser from '../apiCalls/fetchUser'


const API_URL = import.meta.env.VITE_API_URL;

const profile = ({params}: Route.ComponentProps) => {

    const {user} = useUser()

    const [profile, setProfile] = useState<User>()
    const [blogs, setBlogs] = useState<Blog []>([])

    const [view, setView] = useState<string>("blogs")

    const [lists, setLists] = useState<List[]>()
    const [listModal, setListModal] = useState(false)
    const [newListName, setNewListName] = useState<string>("")

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

    const handleCreateList = () => {
        setListModal(!listModal)
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

        fetchLists()
        
    }

  return (

    <div>
        {listModal && 
        <div className='absolute h-[85vh] w-[100vw] backdrop-blur-sm flex justify-center items-center' onClick={handleCreateList}>
            <div className='bg-blue-100 w-[300px] h-[300px] flex flex-col items-center justify-center gap-5 p-10 rounded-3xl' onClick={(e) => e.stopPropagation()}>
                <label className='hidden' id="list" htmlFor='list'></label>
                <input 
                    name="list" 
                    id="list" 
                    value={newListName ?? ""}
                    onChange={(event) => {setNewListName(event.target.value)}} 
                    placeholder='enter list name'
                />
                <button className="primary-btn" onClick={createList}>CREATE LIST!</button>
            </div>
        </div>
        }
        <div className='flex flex-col md:flex-row p-2 sm:p-10'>
            <div className='w-[350px] md:border-r-[2px] border-black border-solid flex flex-col gap-3 p-2 '>
                <img className="rounded-3xl " src={profile?.picture} width={64} height={64}/>
                <div>
                    <h3>{profile?.name}</h3>
                    <i>{profile?.email}</i>
                </div>

                <p>About</p>
            </div>
            <div className='p-5 flex-grow flex flex-col gap-5'>

                <div className='flex flex-row gap-5 border-solid border-b-[2px] border-[#979797]'>
                    <h3 className='' onClick={() => setView("blogs")}>Blogs</h3>
                    <h3 className='' onClick={() => setView("lists")}>Lists</h3>
                    {/* <h3 className='' onClick={() => setView("about")}>About</h3> */}
                    {profile?._id === user?._id && 
                        <h3 className='' onClick={() => setView("liked")}>Liked</h3>
                    }
                </div>

                <div className='flex justify-between'>
                    <h2 className='uppercase font-semibold'>{view}</h2>
                    {view === "lists" && profile?._id === user?._id && 
                    <button 
                        className='primary-btn cursor-pointer'
                        onClick={handleCreateList}
                    >
                        + CREATE LIST
                    </button>}
                </div>

                {view === "blogs" && (
                    <div className='flex flex-col gap-5'>
                        {blogs.map((b) => (
                            <BlogPostCard key={b._id} id={b._id} user={b.user} title={b.title} releaseDate={b.releaseDate} summary={b.summary} comments={b.comments} likes={b.likes}/>
                        ))}
                    </div>
                    )
                }

                {view === "lists" && (
                    <div className='flex flex-col gap-5'>
                        {lists?.map((list) => (
                            <div className='flex flex-col'>
                                <div>{list.name}</div>
                                <div className='text-[#979797]'>{list.blog?.length} blog(s)</div>
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
                            <BlogPostCard key={index} id={b._id} user={b.user} title={b.title} releaseDate={b.releaseDate} summary={b.summary} comments={b.comments} likes={b.likes}/>
                        ))}
                    </div>
                    )
                }
                    
                
            </div>
        </div>
    </div>
  )
}

export default profile