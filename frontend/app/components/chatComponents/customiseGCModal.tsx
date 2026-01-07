import React, { useState } from 'react'
import { useChat } from '~/context/userContext';
import type { User } from '~/types/types';
import { X } from 'lucide-react';

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
        <div className='w-[400px] bg-[#EDEDE9] border border-[#000000] flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3>Edit Group Name</h3>
              <button 
                onClick={() => setGCModal(false)}
                className="icon"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="gcname" className="form-label">Group Chat Name</label>
              <input 
                  name="gcname" 
                  id="gcname" 
                  value={newGCName ?? ""}
                  onChange={(event) => {setNewGCName(event.target.value)}} 
                  placeholder='Enter group chat name'
                  className="form-input bg-[#EDEDE9] placeholder-[#979797]"
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