import React, { useState } from 'react'
import type { List, User } from '~/types/types'
import { X } from 'lucide-react';

type CreateListModalProps = {
  setListModal : React.Dispatch<React.SetStateAction<boolean>>
  listModal : boolean
  setLists : React.Dispatch<React.SetStateAction<List[] | undefined>>
  profile: User | undefined
}

const API_URL = import.meta.env.VITE_API_URL;

const CreateListModal = ({ setListModal, listModal, profile, setLists}: CreateListModalProps) => {

  const [listName, setListName] = useState<string>()

  const fetchLists = async () => {
    const response = await fetch(`${API_URL}/lists/user/${profile?._id}`, {
        method: 'get',
        credentials: 'include'
    })
    const data = await response.json()
    console.log("LSIT ARE")
    console.log(data)
    setLists(data)
  }

  const createList = async () => {
    const response = await fetch(`${API_URL}/lists`, {
        method: 'post',
        credentials: 'include',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({name: listName})
    })
    if (!response.ok){
        console.error("List not create")
        return
    }

    const data = await response.json()
    console.log(data)

    setListModal(!listModal)

    fetchLists()
      
  }

  return (
    <div className='fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm' onClick={() => setListModal(!listModal)}>
        <div className='w-[400px] bg-[#EDEDE9] border border-[#000000] flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3>Create Collection</h3>
              <button 
                onClick={() => setListModal(!listModal)}
                className="icon"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="list" className="form-label">Collection Name</label>
              <input 
                  name="list" 
                  id="list" 
                  value={listName ?? ""}
                  onChange={(event) => {setListName(event.target.value)}} 
                  placeholder='Enter collection name'
                  className="form-input bg-[#EDEDE9] placeholder-[#979797]"
              />
            </div>
            
            <button className="w-full primary-btn py-3 rounded-lg" onClick={createList}>
              <span>CREATE COLLECTION</span>
            </button>
        </div>
    </div>
  )
}

export default CreateListModal