import React, { useState } from 'react'
import type { List, User } from '~/types/types'

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
        <div className='w-[400px] bg-[#0f1926] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Create Collection</h3>
              <button 
                onClick={() => setListModal(!listModal)}
                className="text-[#9aa4bd] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <label htmlFor="list" className="text-[#9aa4bd] text-sm">Collection Name</label>
              <input 
                  name="list" 
                  id="list" 
                  value={listName ?? ""}
                  onChange={(event) => {setListName(event.target.value)}} 
                  placeholder='Enter collection name'
                  className="w-full px-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f]"
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