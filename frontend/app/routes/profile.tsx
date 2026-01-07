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
import accept from '~/apiCalls/user/accept'
import decline from '~/apiCalls/user/decline'
import { DotIcon, UserXIcon, Menu, Compass, MessageSquare, Users, Heart, CircleHelp, Settings, Linkedin, Instagram, Youtube, Bookmark, Share2, ThumbsUp, MessageCircle, CalendarDays, Edit, Trash2 } from 'lucide-react'
import disconnect from '~/apiCalls/user/disconnect'
import follow from '~/apiCalls/user/follow'
import unfollow from '~/apiCalls/user/unfollow'
import connect from '~/apiCalls/user/connect'
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

    const [requestReceivedUsers, setRequestReceivedUsers] = useState<User[]>([])
    const [requestSentUsers, setRequestSentUsers] = useState<User[]>([])

    const  [requestView, setRequestView] = useState<"RequestsSent" | "RequestsReceived">("RequestsReceived")

    const [connectionUsers, setConnectionUsers] = useState<User[]>([])
    const [followersUsers, setFollowersUsers] = useState<User[]>([])
    const [followingUsers, setFollowingUsers] = useState<User[]>([])
    const [followersView, setFollowersView] = useState<"followers" | "following">("followers")
    const [following, setFollowing] = useState<boolean>(false)
    const [connected, setConnected] = useState<boolean>(false)
    const [profileFollowingYou, setProfileFollowingYou] = useState<boolean>(false)

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

    const acceptConnection = async (userId: string) => {
        await accept(userId)  
    }

    const declineConnection = async (userId: string) => {
        await decline(userId)
    }

    const handleDisconnect = async (userId:string) => {
        await disconnect(userId)
        setConnectionUsers((prev) => prev.filter(user => user._id !== userId));
        setConnected(false)
    }

    const handleFollow = async () => {
        if (!profile?._id) return

        if (following){
            await unfollow(profile._id)
            setFollowing(false)
        } else{
            await follow(profile._id)
            setFollowing(true)
        }
    }

    const handleConnect = async () => {
        if (!profile?._id) return

        if (connected){
            await disconnect(profile._id)
            setConnected(false)
        } else{
            await connect(profile._id)
            await follow(profile._id)
            setConnected(true)
            setFollowing(true)
        }
    }

    const fetchRequestsSent = async () => {
        if (user?.requestsSent) {
            for (const request of user.requestsSent) {
                const userData = await fetchUser(request);
                setRequestSentUsers((prev) => [...prev, userData]); // append without mutating
                console.log(requestSentUsers)
            }
        }
    };

    const fetchRequestsReceived = async () => {
        if (user?.requestsReceived) {
            for (const request of user.requestsReceived) {
                const userData = await fetchUser(request);
                setRequestReceivedUsers((prev) => [...prev, userData]); // append without mutating
                console.log(requestReceivedUsers)
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

    const fetchFollowers = async () => {
        if (profile?.followers && profile._id === user?._id) {
            setFollowersUsers([]); // Reset before fetching
            // Check if followers are already populated User objects
            if (profile.followers.length > 0 && typeof profile.followers[0] === 'object' && profile.followers[0]._id) {
                // Already populated User objects
                setFollowersUsers(profile.followers as User[]);
            } else {
                // Need to fetch User objects from IDs
                for (const follower of profile.followers) {
                    const followerId = typeof follower === 'string' ? follower : follower._id;
                    const userData = await fetchUser(followerId);
                    setFollowersUsers((prev) => [...prev, userData]);
                }
            }
        }
    };

    const fetchFollowing = async () => {
        if (profile?.following && profile._id === user?._id) {
            setFollowingUsers([]); // Reset before fetching
            // Check if following are already populated User objects
            if (profile.following.length > 0 && typeof profile.following[0] === 'object' && profile.following[0]._id) {
                // Already populated User objects
                setFollowingUsers(profile.following as User[]);
            } else {
                // Need to fetch User objects from IDs
                for (const following of profile.following) {
                    const followingId = typeof following === 'string' ? following : following._id;
                    const userData = await fetchUser(followingId);
                    setFollowingUsers((prev) => [...prev, userData]);
                }
            }
        }
    };

    // user's request list has a list of user who have sent requests, this is to retreive each users data
    useEffect(() => {

    fetchRequestsSent();
    fetchRequestsReceived();
    fetchConnections();
    }, [user]);

    // Fetch followers and following when viewing own profile
    useEffect(() => {
        if (profile?._id === user?._id) {
            fetchFollowers();
            fetchFollowing();
        }
    }, [profile, user]);

    // Check if user is following/connected to profile, and if profile is following user
    useEffect(() => {
        if (profile && user && profile._id !== user._id) {
            // Check if user is following profile
            if (user.following && profile._id) {
                const isFollowing = user.following.some((f: User | string) => {
                    const id = typeof f === 'string' ? f : f._id;
                    return id === profile._id;
                });
                setFollowing(isFollowing);
            }

            // Check if user is connected to profile
            if (user.connections && profile._id) {
                const isConnected = user.connections.includes(profile._id);
                setConnected(isConnected);
            }

            // Check if profile is following user (only if not connected)
            if (profile.followers && user._id) {
                const isProfileFollowingYou = profile.followers.some((f: User | string) => {
                    const id = typeof f === 'string' ? f : f._id;
                    return id === user._id;
                });
                setProfileFollowingYou(isProfileFollowingYou);
            }
        }
    }, [profile, user]);


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
                            className="rounded-full border-2 border-[#353535]" 
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
                                        {profile?._id === user?._id ? (
                                            <>
                                                <h3 
                                                    onClick={() => {
                                                        setView("followersFollowing");
                                                        setFollowersView("followers");
                                                    }}
                                                >
                                                    {profile?.followers?.length || 0} FOLLOWERS
                                                </h3>
                                                <h3 
                                                    onClick={() => {
                                                        setView("followersFollowing");
                                                        setFollowersView("following");
                                                    }}
                                                >
                                                    {profile?.following?.length || 0} FOLLOWING
                                                </h3>
                                            </>
                                        ) : (
                                            <>
                                                <h3>{profile?.followers?.length || 0} FOLLOWERS</h3>
                                                <h3>{profile?.following?.length || 0} FOLLOWING</h3>
                                            </>
                                        )}
                                    </div>
                                    {profile?._id !== user?._id && (
                                    <div className='flex flex-col items-center gap-2'>
                                        {connected ? (
                                            <button 
                                                className='primary-btn' 
                                                onClick={handleConnect}
                                            >
                                                <span>DISCONNECT</span>
                                            </button>
                                        ) : (
                                            <>
                                                <div className='flex gap-2'>
                                                    <button className='primary-btn' onClick={handleFollow}>
                                                        {following ? (<span>UNFOLLOW</span>) : (<span>FOLLOW</span>)}
                                                    </button>
                                                    <button className='primary-btn'onClick={handleConnect}>
                                                        {user?.requestsReceived && profile?._id && user.requestsReceived.includes(profile._id) ? (
                                                            <span>ACCEPT</span>
                                                        ) : user?.requestsSent && profile?._id && user.requestsSent.includes(profile._id) ? (
                                                            <span>PENDING</span>
                                                        ) : (
                                                            <span>CONNECT</span>
                                                        )}
                                                    </button>
                                                </div>
                                                {profileFollowingYou && (
                                                    <span className='text-[#979797] text-sm'>This user is following you</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className='flex flex-row gap-4 border-[1px] w-fit border-black'>
                    <button 
                        className={`px-4 py-2 transition-colors ${view === "highlights" ? 'bg-[#E95444] border-b-[3px] border-black' : ''}`}
                        onClick={() => setView("highlights")}
                    >
                        Highlights
                    </button>
                    <button 
                        className={`px-4 py-2 transition-colors ${view === "blogs" ? 'bg-[#E95444] border-b-[3px] border-black' : ''}`}
                        onClick={() => setView("blogs")}
                    >
                        Posts
                    </button>
                    <button 
                        className={`px-4 py-2 transition-colors ${view === "collections" ? 'bg-[#E95444] border-b-[3px] border-black' : ''}`}
                        onClick={() => setView("collections")}
                    >
                        Collections
                    </button>
                    {profile?._id === user?._id && (
                        <button 
                            className={`px-4 py-2 transition-colors ${view === "liked" ? 'bg-[#E95444] border-b-[3px] border-black' : ''}`}
                            onClick={() => setView("liked")}
                        >
                            Liked
                        </button>
                    )}
                    {profile?._id === user?._id && (
                        <button 
                            className={`px-4 py-2 transition-colors flex items-center gap-2 ${view === "requests" ? 'bg-[#FF5A48] border-b-[3px] border-black' : ''}`}
                            onClick={() => setView("requests")}
                        >
                            Requests {profile?.requestsReceived && profile.requestsReceived.length > 0 && <DotIcon strokeWidth={'4px'} color='yellow'/>}
                        </button>
                    )}
                    {profile?._id === user?._id && (
                        <button 
                            className={`px-4 py-2 transition-colors ${view === "connections" ? 'bg-[#FF5A48] border-b-[3px] border-black' : ''}`}
                            onClick={() => setView("connections")}
                        >
                            Connections
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
                            <div className='flex flex-col'>
                                {lists?.map((list, index) => (
                                    <div 
                                        className={`cursor-pointer p-4 hover:bg-[#EDEDE9] flex items-center justify-between gap-4 border border-[#353535] ${selectedCollection?._id === list._id ? 'bg-[#EDEDE9]' : ''}`} 
                                        key={list._id || index} 
                                        onClick={() => {
                                            // handleViewList(index)
                                            setSelectedCollection(list)
                                        }}
                                    >
                                        <div className='flex gap-2 items-center'>
                                            <div className='text-small'>{list.name}</div>
                                            <div className='text-mini'>{list.blogs?.length || 0} blog(s)</div>
                                        </div>
                                        {profile?._id === user?._id && (
                                            <div className='flex items-center gap-2' onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => handleEditList(list, e)}
                                                    className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors'
                                                    title="Edit collection"
                                                >
                                                    <Edit size={16} className='cursor-pointer' />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteList(list._id, e)}
                                                    disabled={deletingListId === list._id}
                                                    className='p-2 hover:bg-[#EDEDE9] rounded-lg transition-colors disabled:opacity-50'
                                                    title="Delete collection"
                                                >
                                                    <Trash2 size={16} className='cursor-pointer' />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* RIGHT SIDE*/}
                            <div className='grow'>

                                <div className='mb-4 border flex justify-between items-end gap-[10px] border-[#353535] p-2' >
                                    <h3>{selectedCollection?.name.toUpperCase() || 'No collection selected'}</h3>
                                    {profile?._id === user?._id && (
                                        <button 
                                            className='icon'
                                            onClick={() => {
                                                setListModal(!listModal)
                                            }}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>

                                {/* DISPLAY SELECTED COLLECTION*/}    
                                <div>
                                    {selectedCollection && selectedCollection.blogs.length > 0 ? (
                                        <div>
                                            {selectedCollection.blogs.map((blog: Blog, index) => (
                                                <BlogPostSmall blog={blog}/>
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

                    {view === "requests" && (
                        <div>
                            <div className='flex flex-row gap-4 border-b border-[#353535] pb-2 mb-4'>
                                <button 
                                    className={`px-4 py-2 transition-colors ${requestView === "RequestsReceived" ? 'bg-[#FF5A48] border-b-[3px] border-black' : ''}`}
                                    onClick={() => setRequestView("RequestsReceived")}
                                >
                                    Requests Received {profile?.requestsReceived?.length || 0}
                                </button>
                                <button 
                                    className={`px-4 py-2 transition-colors ${requestView === "RequestsSent" ? 'bg-[#FF5A48] border-b-[3px] border-black' : ''}`}
                                    onClick={() => setRequestView("RequestsSent")}
                                >
                                    Requests Sent {profile?.requestsSent?.length || 0}
                                </button>
                            </div>

                            {requestView === "RequestsReceived" && (
                                <div className='flex flex-col gap-5'>
                                    {user?.requestsReceived && user.requestsReceived.length > 0 ? (
                                        requestReceivedUsers?.map((user, index) => (
                                            <div className='flex flex-row gap-3 items-center justify-between p-4 border border-[#353535] rounded-lg' key={index}>
                                                <div className='flex flex-row gap-5 items-center'>
                                                    <img className="rounded-full" src={user.picture} width={48} height={48} alt={user.name}/>
                                                    <div className='text-black'>{user.name}</div>
                                                </div>
                                                <div className='flex gap-3'>
                                                    <button className="primary-btn" onClick={() => {acceptConnection(user._id)}}>
                                                        <span>ACCEPT</span>
                                                    </button>
                                                    <button className="secondary-btn" onClick={() => {declineConnection(user._id)}}>
                                                        DECLINE
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-[#979797]'>No requests received</div>
                                    )}
                                </div>
                            )}

                            {requestView === "RequestsSent" && (
                                <div className='flex flex-col gap-5'>
                                    {user?.requestsSent && user.requestsSent.length > 0 ? (
                                        requestSentUsers?.map((user, index) => (
                                            <div className='flex flex-col gap-3 p-4 border border-[#353535] rounded-lg' key={index}>
                                                <div className='flex flex-row gap-5 items-center'>
                                                    <img className="rounded-full" src={user.picture} width={48} height={48} alt={user.name}/>
                                                    <div className='text-black'>{user.name}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-[#979797]'>No requests sent</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {view === "connections" && (
                        <div className='flex flex-col gap-5'>
                            {user?.connections && user.connections.length > 0 ? (
                                connectionUsers.map((connection, index) => (
                                    <div 
                                        className='flex flex-row gap-5 justify-between items-center cursor-pointer p-4 border border-[#000000] rounded-lg hover:bg-[#D6D6CD] transition-colors'
                                        key={index}
                                    >
                                        <div 
                                            className='flex gap-3 items-center' 
                                            onClick={() => window.location.href = `/profile/${connection._id}`}
                                        >
                                            <img className="rounded-full" src={connection.picture} width={48} height={48} alt={connection.name}/>
                                            <div className='text-white'>{connection.name}</div>
                                        </div>
                                        <div>
                                            <UserXIcon
                                                onClick={() => {handleDisconnect(connection._id)}}
                                                className='p-2 hover:bg-[#211F2D] rounded-lg transition-colors cursor-pointer'
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='text-[#979797]'>No connections</div>
                            )}
                        </div>
                    )}

                    {view === "followersFollowing" && profile?._id === user?._id && (
                        <div>
                            <div className='flex flex-row gap-4 border-b border-[#353535] pb-2 mb-4'>
                                <button 
                                    className={`px-4 py-2 rounded-t-lg transition-colors ${followersView === "followers" ? 'bg-[#5D64F4] text-white' : 'text-[#979797] hover:text-black'}`}
                                    onClick={() => setFollowersView("followers")}
                                >
                                    FOLLOWERS {profile?.followers?.length || 0}
                                </button>
                                <button 
                                    className={`px-4 py-2 rounded-t-lg transition-colors ${followersView === "following" ? 'bg-[#5D64F4] text-white' : 'text-[#979797] hover:text-black'}`}
                                    onClick={() => setFollowersView("following")}
                                >
                                    Following {profile?.following?.length || 0}
                                </button>
                            </div>

                            {followersView === "followers" && (
                                <div className='flex flex-col gap-5'>
                                    {followersUsers && followersUsers.length > 0 ? (
                                        followersUsers.map((follower, index) => (
                                            <div 
                                                className='flex flex-row gap-5 items-center cursor-pointer p-4 border border-[#353535] rounded-lg hover:bg-[#111] transition-colors'
                                                key={index}
                                                onClick={() => window.location.href = `/profile/${follower._id}`}
                                            >
                                                <img className="rounded-full" src={follower.picture} width={48} height={48} alt={follower.name}/>
                                                <div className='text-white'>{follower.name}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-[#979797]'>No followers</div>
                                    )}
                                </div>
                            )}

                            {followersView === "following" && (
                                <div className='flex flex-col gap-5'>
                                    {followingUsers && followingUsers.length > 0 ? (
                                        followingUsers.map((followingUser, index) => (
                                            <div 
                                                className='flex flex-row gap-5 items-center cursor-pointer p-4 border border-[#353535] rounded-lg hover:bg-[#111] transition-colors'
                                                key={index}
                                                onClick={() => window.location.href = `/profile/${followingUser._id}`}
                                            >
                                                <img className="rounded-full" src={followingUser.picture} width={48} height={48} alt={followingUser.name}/>
                                                <div className='text-white'>{followingUser.name}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='text-[#979797]'>Not following anyone</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDE*/}
            <div className='max-w-[400px] min-w-[400px] flex flex-col gap-[30px]'>

                {/* ABOUT */}
                <div className='w-full bg-[#EDEDE9] border-[3px] border-[#000000] p-[5px]'>
                    <h3>{profile?.name.toUpperCase()}</h3>
                    <div className='text-mini'>{profile?.byline}</div>
                    <p className='text-small'>{profile?.about}</p>
                    {/* <div>Joined on {formatDate(profile?.created_at || "")}</div> */}
                </div>

                {/* LOVED TOPICS / COMMUNITIES*/}
                <div className='w-full bg-[#EDEDE9] border-[3px] border-[#000000] p-[5px]'>
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