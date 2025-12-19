import React, { useState } from 'react'
import type { Chat, User } from '~/types/types';
import { Search } from 'lucide-react';


type FindUserModalProps = {
    findUsers: User[];
    setFindUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setFindUsersModal: React.Dispatch<React.SetStateAction<boolean>>;
    setChat : React.Dispatch<React.SetStateAction<Chat | null>>

}

const API_URL = import.meta.env.VITE_API_URL;
const FindUserModal = ({findUsers, setFindUsers, setFindUsersModal, setChat}: FindUserModalProps) => {

    const [input, setInput] = useState("")

    const handleSearch = async (searchValue: string) => {
        if (searchValue === ""){
            setFindUsers([])
        } else{
            const response = await fetch(`${API_URL}/users?search=${searchValue}`, {
                method: 'get',
                credentials: 'include'
            })

            const data : User[] = await response.json()
            console.log(data)
            setFindUsers(data)
        }
    }

    const fetchChat = async (userId: string) => {
        const response = await fetch(`${API_URL}/chats/`, {
            method: 'post',
            credentials: 'include',
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({userId : userId})
        })

        const chatData = await response.json()

        setFindUsersModal(false)
        setChat(chatData)

    }

  return (
    <div className="fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm" onClick={() => {setFindUsersModal(false)}}>
        
      <div 
        className="w-[400px] max-h-[500px] bg-[#0f1926] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl" 
        onClick={(e) => {e.stopPropagation()}}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">Find User</h3>
          <button 
            onClick={() => setFindUsersModal(false)}
            className="text-[#9aa4bd] hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <label htmlFor="userSearch" className="text-[#9aa4bd] text-sm">Search Users</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9aa4bd] pointer-events-none z-10" />
            <input
              id="userSearch"
              name="userSearch"
              value={input ?? ""}
              placeholder="Search for a user"
              onChange={(e) => {
                  setInput(e.target.value);
                  handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f] relative z-0"
            />
          </div>
        </div>
        
        <div className="h-[300px] text-sm overflow-y-auto border border-[#1f2735] rounded-lg p-3 bg-[#121b2a]">
            {findUsers.length > 0 ? (
                findUsers.map((user) => (
                <div
                    key={user._id}
                    className="cursor-pointer p-3 hover:bg-[#1f2735] rounded-lg flex flex-row gap-3 items-center transition-colors mb-2"
                    onClick={() => {fetchChat(user._id)}}
                >   
                        <img width={32} height={32} src={user.picture} className="rounded-full"/>
                        <div className="text-white">{user.name}</div>
                </div>
                ))
            ) : (
                <div className="text-[#9aa4bd] text-center py-4">No users found</div>
            )}
        </div>
        
      </div>
    </div>
  )
}

export default FindUserModal