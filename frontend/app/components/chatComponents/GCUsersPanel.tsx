import { Users } from 'lucide-react'
import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { Chat, User } from '~/types/types'

type GCUsersPanelProps = {
    chat: Chat | null,
    setAddUsersModal: React.Dispatch<React.SetStateAction<boolean>> 
}

const GCUsersPanel = ({chat, setAddUsersModal}:GCUsersPanelProps) => {

    const usersPanel = useRef(null)

    useGSAP(() => {

    },[])

    const openPanel = () => {
        gsap.to(usersPanel.current, {
            x: "0%",
            duration: 0.4
        })
    }

    const closePanel = () => {
        gsap.to(usersPanel.current, {
            x: "100%",
            duration: 0.4
        })
    }

  return (
    <>
        <div className='primary-btn' onClick={openPanel}><Users  strokeWidth={'1px'}/></div>
        <div 
            ref={usersPanel} 
            className='fixed flex flex-col gap-2 h-[100vh] top-0 right-0 max-w-[400px] sm:w-[400px] border-l-[2px] border-solid border-[#979797] p-2 bg-[#13111C]'
            style={{transform: "translateX(100%)"}}
        >   
            <div className='flex justify-between'>
                <div className='primary-btn w-[150px]' onClick={() => setAddUsersModal(true)}><span>ADD USERS</span></div>
                <div className='' onClick={closePanel}>CLOSE</div>
            </div>

            <div className='flex flex-col gap-2 overflow-auto'>
                {chat?.users.map(( user, index) => (
                    <div className='p-2 bg-[#111] rounded-[5px]'>
                        <div className="flex gap-2">
                            <img src={user.picture} width={32}/>
                            {user.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </>
  )
}

export default GCUsersPanel