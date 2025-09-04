import React, { useState } from 'react'
import type { User } from '~/types/types';


type groupModalProps = {
    groupName: string;
    setGroupName: React.Dispatch<React.SetStateAction<string>>;
    searchUser: User[];
    setSearchUser: React.Dispatch<React.SetStateAction<User[]>>
    groupUsers: User[];
    setGroupUsers : React.Dispatch<React.SetStateAction<User[]>>;
    setGroupModal : React.Dispatch<React.SetStateAction<boolean>>

}

const API_URL = import.meta.env.VITE_API_URL;
const GroupModal = ({groupName, setGroupName, searchUser, setSearchUser, groupUsers, setGroupUsers, setGroupModal}: groupModalProps) => {

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
        const response = await fetch(`${API_URL}/chats/group`, {
            method: 'post',
            credentials: 'include',
            headers: {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({users : groupUsers, name: groupName})
        })
    }

  return (
    <div className="absolute z-1 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs" onClick={() => {setGroupModal(false)}}>
        
      <div 
        className="w-[400px] h-[400px] bg-white border-solid border-[1px] border-[#979797] flex flex-col gap-5 items-center justify-center p-2" 
        onClick={(e) => {e.stopPropagation()}}
      >
        <div><h2>Select Connections</h2></div>
        <div>
          <label className="hidden" htmlFor="groupName" id="groupName"></label>
          <input id="groupName" name="groupName" value={groupName}
          placeholder='Enter group name'
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
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
        <div className='h-[50px]'>
            {groupUsers.map( (user) => (
                <div key={user._id}>{user.name}</div>
            ))}
        </div>
        <div className="h-[150px] overflow-y-auto border w-full p-2">
            {searchUser.length > 0 ? (
                searchUser.map((user) => (
                <div
                    key={user._id}
                    className="cursor-pointer p-1 hover:bg-gray-100 flex flex-row gap-2"
                    onClick={() => {
                        console.log("Selected user:", user);
                        setGroupUsers( prev => [...prev, user])
                    }}
                >   
                        <img width={24} src={user.picture}/>
                        <div>{user.name}</div>
                </div>
                ))
            ) : (
                <div className="text-gray-500">No users found</div>
            )}
        </div>

        <div>
            <button className='primary-btn' onClick={createGroup}>CREATE GROUP</button>
        </div>
        
      </div>
    </div>
  )
}

export default GroupModal