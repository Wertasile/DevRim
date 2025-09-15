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
    <div className='absolute z-1 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs' onClick={() => setListModal(!listModal)}>
        <div className='w-[300px] h-[400px] bg-[#393E46] border-solid border-[1px] border-[#979797] flex flex-col gap-2 items-center justify-center p-2' onClick={(e) => e.stopPropagation()}>
            <label className='hidden' id="list" htmlFor='list'></label>
            <input 
                name="list" 
                id="list" 
                value={listName ?? ""}
                onChange={(event) => {setListName(event.target.value)}} 
                placeholder='enter list name'
            />
            <button className="primary-btn" onClick={createList}><span>CREATE LIST!</span></button>
        </div>
    </div>
  )
}

export default CreateListModal