import React, { useEffect, useState } from 'react'
import { useChat } from '~/context/userContext'
import type { Chat, User } from '~/types/types'

type AddGCUsersProps = {
    setAddUsersModal: React.Dispatch<React.SetStateAction<boolean>>
}

const API_URL = import.meta.env.VITE_API_URL;

const AddGCUsers = ({setAddUsersModal}: AddGCUsersProps) => {

  const {chat} = useChat()

  const [currentUsers, setCurrentUsers] = useState<User[]>()

  const [input, setInput] = useState<string>("")

  const [searchResults, setSearchResults] = useState<User[]>([])

  const handleSearch = async (searchValue: string) => {
      if (searchValue === ""){
          setSearchResults([])
      } else{
          const response = await fetch(`${API_URL}/users?search=${searchValue}`, {
              method: 'get',
              credentials: 'include'
          })

          const data : User[] = await response.json()
          console.log(data)
          setSearchResults(data)
      }
  }

  const addUser = async (user: User) => {
    setCurrentUsers( (prev) => {
      let prevUsers = prev
      prevUsers?.push(user)
      return prevUsers
    })
  }

  const removeUser = async (user: User) => {
    setCurrentUsers( (prev) => {
      let prevUsers = prev
      const result = prevUsers?.filter((Fuser) => Fuser._id !== user._id)
      return result
    })
  }

  const saveChanges = async () => {
    const response = await fetch (`${API_URL}/chats/groupedit/${chat?._id}`, {
      method: 'put',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({users: currentUsers})
    })

    const data = response.json()
  }

  useEffect(() => {
    setCurrentUsers(chat?.users) 
  }, [chat])
  

  return (
    <div className="absolute z-2 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs" onClick={() => {setAddUsersModal(false)}}>
        
      <div 
        className="w-[300px] h-[400px] bg-[#393E46] border-solid border-[1px] border-[#979797] flex flex-col gap-2 items-center justify-center p-2" 
        onClick={(e) => {e.stopPropagation()}}
      >
        <div><h3>Select User</h3></div>
        <div>
          <label className="hidden" htmlFor="userSearch" id="userSearch"></label>
          <input
                id="userSearch"
                name="userSearch"
                value={input ?? ""}
                placeholder="Enter Users in your group"
                onChange={(e) => {
                    setInput(e.target.value);          // update state
                    handleSearch(e.target.value);          // trigger search
            }}
            />
        </div>
        <div className='text-sm flex flex-wrap gap-2'>
          {currentUsers?.map((user) => (
            <div key={user._id} className='flex gap-2 w-fit p-1 bg-[#111] rounded-[5px]'>
              {user.name}
              <span className='font-bold cursor-pointer' onClick={() => removeUser(user)}> X </span>
            </div>
          ))}
        </div>
        <div className="h-[225px] text-sm overflow-y-auto border w-full p-2">
            {searchResults.length > 0 ? (
                searchResults.map((user) => (
                <div
                    key={user._id}
                    className="cursor-pointer p-1 hover:bg-[#111] flex flex-row gap-2"
                    onClick={() => addUser(user)}
                >   
                        <img width={24} src={user.picture}/>
                        <div>{user.name}</div>
                </div>
                ))
            ) : (
                <div className="text-gray-500">No users found</div>
            )}
        </div>
        
      </div>
    </div>
  )
}

export default AddGCUsers