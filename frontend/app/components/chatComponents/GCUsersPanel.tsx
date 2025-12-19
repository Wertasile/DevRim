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
        <button 
          className='p-2 bg-[#0f1926] border border-[#1f2735] rounded-lg hover:bg-[#1f2735] transition-colors' 
          onClick={openPanel}
        >
          <Users size={18} className="text-white" strokeWidth={'1px'}/>
        </button>
        <div 
            ref={usersPanel} 
            className='fixed flex flex-col gap-4 h-[100vh] top-0 right-0 max-w-[400px] sm:w-[400px] border-l border-[#1f2735] p-6 bg-[#0f1926] shadow-xl z-60'
            style={{transform: "translateX(100%)"}}
        >   
            <div className='flex items-center justify-between'>
                <h3 className="text-white font-semibold text-lg">Group Members</h3>
                <button 
                  className="text-[#9aa4bd] hover:text-white transition-colors text-xl font-bold cursor-pointer"
                  onClick={closePanel}
                >
                  ×
                </button>
            </div>

            <button 
              className='w-full primary-btn py-3 rounded-lg' 
              onClick={() => setAddUsersModal(true)}
            >
              <span>ADD USERS</span>
            </button>

            <div className='flex flex-col gap-3 overflow-y-auto flex-1'>
                {chat?.users && chat.users.length > 0 ? (
                  chat.users.map(( user, index) => (
                    <div 
                      key={index}
                      className='p-3 bg-[#121b2a] border border-[#1f2735] rounded-lg hover:bg-[#1f2735] transition-colors'
                    >
                        <div className="flex items-center gap-3">
                            <img 
                              src={user.picture} 
                              width={40} 
                              height={40}
                              className="rounded-full border border-[#1f2735] object-cover"
                              alt={user.name}
                            />
                            <div className="text-white font-medium">{user.name}</div>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[#9aa4bd] text-center py-8">No members</div>
                )}
            </div>
        </div>
    </>
  )
}

export default GCUsersPanel