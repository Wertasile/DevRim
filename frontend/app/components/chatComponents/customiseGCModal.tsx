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
    <div className='absolute z-2 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs' onClick={() => setGCModal(false)}>
        <div className='w-[300px] h-[400px] bg-[#393E46] border-solid border-[1px] border-[#979797] flex flex-col gap-2 items-center justify-center p-2' onClick={(e) => e.stopPropagation()}>
            <label className='hidden' id="list" htmlFor='list'></label>
            <input 
                name="gcname" 
                id="gcname" 
                value={newGCName ?? ""}
                onChange={(event) => {setNewGCName(event.target.value)}} 
                placeholder='enter group chat name'
            />
            <button className="primary-btn" onClick={saveNameChanges}><span>CREATE LIST!</span></button>
        </div>
    </div>
)
}

export default CustomiseGCModal