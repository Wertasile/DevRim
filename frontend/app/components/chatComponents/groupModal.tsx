import React, { useState } from 'react'
import type { Chat, User } from '~/types/types';
import { Search, X } from 'lucide-react';


type groupModalProps = {
    groupName: string;
    setGroupName: React.Dispatch<React.SetStateAction<string>>;
    searchUser: User[];
    setSearchUser: React.Dispatch<React.SetStateAction<User[]>>
    groupUsers: User[];
    setGroupUsers : React.Dispatch<React.SetStateAction<User[]>>;
    setGroupModal : React.Dispatch<React.SetStateAction<boolean>>;
    setChat : React.Dispatch<React.SetStateAction<Chat | null>>

}

const API_URL = import.meta.env.VITE_API_URL;
const GroupModal = ({groupName, setGroupName, searchUser, setSearchUser, groupUsers, setGroupUsers, setGroupModal, setChat}: groupModalProps) => {

    const [input, setInput] = useState("")

    const handleSearch = async (searchValue: string) => {
        if (searchValue === ""){
            setSearchUser([])
        } else{
            const response = await fetch(`${API_URL}/users?search=${searchValue}`, {
                method: 'get',
                credentials: 'include'
            })

            const data : User[] = await response.json()
            console.log(data)
            setSearchUser(data)
        }
    }

    const createGroup = async () => {
        console.log(groupUsers)
        console.log(groupName)
        const response = await fetch(`${API_URL}/chats/group`, {
            method: 'post',
            credentials: 'include',
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({users : groupUsers, name: groupName})
        })

        const gcData = await response.json()

        setChat(gcData)
    }

  return (
    <div className="fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm" onClick={() => {setGroupModal(false)}}>
        
      <div 
        className="w-[400px] max-h-[600px] bg-[#EDEDE9] border border-[#000000] flex flex-col gap-4 p-6 shadow-xl" 
        onClick={(e) => {e.stopPropagation()}}
      >
        <div className="flex items-center justify-between">
          <h3>Create Group Chat</h3>
          <button 
            onClick={() => setGroupModal(false)}
            className="icon"
          >
            <X size={20}/>
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <label htmlFor="groupName" className="text-[#979797] text-sm">Group Name</label>
          <input 
            id="groupName" 
            name="groupName" 
            value={groupName}
            placeholder='Enter group name'
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 bg-[#EDEDE9] border border-[#000000] rounded-lg text-black placeholder-[#979797] focus:outline-none focus:border-[#5D64F4]"
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <label htmlFor="userSearch" className="text-[#979797] text-sm">Search Users</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#979797] pointer-events-none z-10" />
            <input
              id="userSearch"
              name="userSearch"
              value={input ?? ""}
              placeholder="Search users to add"
              onChange={(e) => {
                  setInput(e.target.value);
                  handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#EDEDE9] border border-[#000000] rounded-lg text-black placeholder-[#979797] focus:outline-none focus:border-[#5D64F4] relative z-0"
            />
          </div>
        </div>
        
        {groupUsers.length > 0 && (
          <div className='flex flex-wrap gap-2 p-2 bg-[#EDEDE9] rounded-lg border border-[#000000]'>
            {groupUsers.map( (user) => (
                <div className="flex items-center gap-2 bg-[#D6D6CD] px-3 py-1 rounded-lg text-sm text-black" key={user._id}>
                    <img src={user.picture} width={20} height={20} className="rounded-full"/>
                    <span>{user.name}</span>
                </div>
            ))}
          </div>
        )}
        
        <div className="h-[200px] text-sm overflow-y-auto border border-[#000000] rounded-lg p-3 bg-[#EDEDE9]">
            {searchUser.length > 0 ? (
                searchUser.map((user) => (
                <div
                    key={user._id}
                    className="cursor-pointer p-2 hover:bg-[#D6D6CD] rounded-lg flex flex-row gap-3 items-center transition-colors mb-2"
                    onClick={() => {
                        console.log("Selected user:", user);
                        setGroupUsers( prev => [...prev, user])
                    }}
                >   
                        <img width={32} height={32} src={user.picture} className="rounded-full"/>
                        <div className="text-black">{user.name}</div>
                </div>
                ))
            ) : (
                <div className="text-[#979797] text-center py-4">No users found</div>
            )}
        </div>

        <div>
            <button className='w-full primary-btn py-3 rounded-lg' onClick={createGroup}>
              <span>CREATE GROUP</span>
            </button>
        </div>
        
      </div>
    </div>
  )
}

export default GroupModal