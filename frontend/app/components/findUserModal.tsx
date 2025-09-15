import React, { useState } from 'react'
import type { Chat, User } from '~/types/types';


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
    <div className="absolute z-1 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs" onClick={() => {setGroupModal(false)}}>
        
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
        <div className="h-[225px] text-sm overflow-y-auto border w-full p-2">
            {findUsers.length > 0 ? (
                findUsers.map((user) => (
                <div
                    key={user._id}
                    className="cursor-pointer p-1 hover:bg-[#111] flex flex-row gap-2"
                    onClick={() => {fetchChat(user._id)}}
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

export default FindUserModal