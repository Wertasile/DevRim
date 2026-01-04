import React, { useEffect, useState } from 'react'
import { useChat } from '~/context/userContext'
import type { Chat, User } from '~/types/types'
import { Search, X } from 'lucide-react';

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
    <div className="fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm" onClick={() => {setAddUsersModal(false)}}>
        
      <div 
        className="w-[400px] max-h-[600px] bg-[#EDEDE9] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl" 
        onClick={(e) => {e.stopPropagation()}}
      >
        <div className="flex items-center justify-between">
          <h3 className="">Add Users to Group</h3>
          <button 
            onClick={() => setAddUsersModal(false)}
            className="icon"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <label htmlFor="userSearch" className="text-[#9aa4bd] text-sm">Search Users</label>
          <div className="relative">
            {/* <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9aa4bd] pointer-events-none z-10" /> */}
            <input
              id="userSearch"
              name="userSearch"
              value={input ?? ""}
              placeholder="Search for users to add"
              onChange={(e) => {
                  setInput(e.target.value);
                  handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg focus:outline-none focus:border-[#31415f] relative z-0"
            />
          </div>
        </div>
        
        {currentUsers && currentUsers.length > 0 && (
          <div className='flex flex-wrap gap-2 p-3 bg-[#121b2a] rounded-lg border border-[#1f2735]'>
            <div className="text-[#9aa4bd] text-xs mb-2 w-full">Current Members:</div>
            {currentUsers.map((user) => (
              <div key={user._id} className='flex items-center gap-2 bg-[#1f2735] px-3 py-1 rounded-lg text-sm text-white'>
                {user.name}
                <span className='font-bold cursor-pointer hover:text-red-400 transition-colors' onClick={() => removeUser(user)}> × </span>
              </div>
            ))}
          </div>
        )}
        
        <div className="h-[250px] text-sm overflow-y-auto border border-[#1f2735] rounded-lg p-3 bg-[#121b2a]">
            {searchResults.length > 0 ? (
                searchResults.map((user) => {
                  return (
                  <div
                      key={user._id}
                      className="cursor-pointer p-3 hover:bg-[#1f2735] rounded-lg flex flex-row gap-3 items-center transition-colors mb-2"
                      onClick={() => addUser(user)}
                  >   
                          <img width={32} height={32} src={user.picture} className="rounded-full"/>
                          <div className="text-white">{user.name}</div>
                  </div>
                )
              })
            ) : (
                <div className="text-[#9aa4bd] text-center py-4">No users found</div>
            )}
        </div>
        
        <button 
          className="w-full primary-btn py-3 rounded-lg"
          onClick={saveChanges}
        >
          <span>SAVE CHANGES</span>
        </button>
        
      </div>
    </div>
  )
}

export default AddGCUsers