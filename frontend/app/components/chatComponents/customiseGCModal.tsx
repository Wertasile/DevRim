import React, { useState } from 'react'
import { useChat } from '~/context/userContext';
import type { User } from '~/types/types';

type customiseGCModalProps = {
    groupName: string;
    setGroupName: React.Dispatch<React.SetStateAction<string>>;
    groupUsers: User[];
    setGroupUsers : React.Dispatch<React.SetStateAction<User[]>>;
    setGCModal : React.Dispatch<React.SetStateAction<boolean>>;  
}

const API_URL = import.meta.env.VITE_API_URL;

const CustomiseGCModal = ({groupName, setGroupName, setGroupUsers, groupUsers, setGCModal} : customiseGCModalProps) => {

    const {chat} = useChat()

    const [newGCName, setNewGCName] = useState<string>(groupName)

    const saveNameChanges = async () => {

        const response = await fetch(`${API_URL}/chats/${chat?._id}`, {
            method: 'put',
            credentials: "include",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({name: newGCName})
        })

        const data = response.json()
        setGCModal(false)

    }

  return (
    <div className='fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm' onClick={() => setGCModal(false)}>
        <div className='w-[400px] bg-[#0f1926] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Edit Group Name</h3>
              <button 
                onClick={() => setGCModal(false)}
                className="text-[#9aa4bd] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="gcname" className="text-[#9aa4bd] text-sm">Group Chat Name</label>
              <input 
                  name="gcname" 
                  id="gcname" 
                  value={newGCName ?? ""}
                  onChange={(event) => {setNewGCName(event.target.value)}} 
                  placeholder='Enter group chat name'
                  className="w-full px-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f]"
              />
            </div>
            
            <button className="w-full primary-btn py-3 rounded-lg" onClick={saveNameChanges}>
              <span>SAVE CHANGES</span>
            </button>
        </div>
    </div>
)
}

export default CustomiseGCModal