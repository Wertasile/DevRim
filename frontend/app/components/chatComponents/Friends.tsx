import { MessageSquareIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import fetchUser from '~/apiCalls/fetchUser'
import { useUser } from '~/context/userContext'
import type { User } from '~/types/types'

const Friends = () => {

    const {user} = useUser()
    const [section, setSection] = useState("Online")

    const [friends, setFriends] = useState<User[]>([])

    const fetchConnections = async () => {
        if (user?.connections) {
            
            for (const connection of user.connections) {
                const userData = await fetchUser(connection);
                setFriends((prev) => [...prev, userData]); // append without mutating
            }

            
        }
    };

    useEffect( () => {
        fetchConnections()
        
    }, [])

  return (
    <div className='p-2 flex flex-col'>
        <div className='flex gap-2 items-center'>
            <div 
                onClick={() => setSection("Online")}
                className=''
            >
                Online
            </div>
            <div 
                onClick={() => setSection("All")}
                className=''
            >
                All
            </div>
            <button 
                onClick={() => setSection("Add Friend")}
                className='primary-btn'
            >
                Online
            </button>
        </div>

            <div className='flex flex-col gap-5'>
                {user?.connections ? (<>{friends.map((user, index) => (
                    <div className='flex flex-row gap-5 items-center justify-between'>
                        <div className='flex gap-2 items-center'>
                            <div><img className="rounded-3xl" src={user.picture} width={48}/></div>
                            <div>{user.name}</div>                        
                        </div>
                        <div className='flex gap-2 items-center'>
                            <MessageSquareIcon/>
                            <div>Disconnect</div>
                        </div>
                        
                    </div>
                ))}</>) : 
                (<div>No Connections</div>)
                }
            </div>
    </div>
  )
}

export default Friends