import React, { useState, useEffect } from 'react'
import type { List, User } from '~/types/types'

type EditListModalProps = {
  setEditListModal: React.Dispatch<React.SetStateAction<boolean>>
  editListModal: boolean
  setLists: React.Dispatch<React.SetStateAction<List[] | undefined>>
  profile: User | undefined
  list: List | undefined
}

const API_URL = import.meta.env.VITE_API_URL;

const EditListModal = ({ setEditListModal, editListModal, profile, setLists, list }: EditListModalProps) => {

  const [listName, setListName] = useState<string>('')

  useEffect(() => {
    if (list) {
      setListName(list.name)
    }
  }, [list])

  const fetchLists = async () => {
    const response = await fetch(`${API_URL}/lists/user/${profile?._id}`, {
        method: 'get',
        credentials: 'include'
    })
    const data = await response.json()
    setLists(data)
  }

  const updateList = async () => {
    if (!list?._id) return
    
    if (!listName?.trim()) {
      alert('Collection name cannot be empty')
      return
    }

    const response = await fetch(`${API_URL}/lists/${list._id}`, {
        method: 'put',
        credentials: 'include',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({name: listName.trim()})
    })
    
    if (!response.ok){
        const errorData = await response.json().catch(() => ({ error: 'Failed to update collection' }));
        alert(errorData.error || 'Failed to update collection')
        return
    }

    await fetchLists()
    setEditListModal(false)
  }

  return (
    <div className='fixed z-50 flex h-[100vh] w-[100vw] justify-center items-center bg-black/60 backdrop-blur-sm' onClick={() => setEditListModal(false)}>
        <div className='w-[400px] bg-[#0f1926] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl' onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">Edit Collection</h3>
              <button 
                onClick={() => setEditListModal(false)}
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
                  value={listName}
                  onChange={(event) => {setListName(event.target.value)}} 
                  placeholder='Enter collection name'
                  className="w-full px-4 py-2 bg-[#121b2a] border border-[#1f2735] rounded-lg text-white placeholder-[#9aa4bd] focus:outline-none focus:border-[#31415f]"
              />
            </div>
            
            <button className="w-full primary-btn py-3 rounded-lg" onClick={updateList}>
              <span>SAVE CHANGES</span>
            </button>
        </div>
    </div>
  )
}

export default EditListModal

