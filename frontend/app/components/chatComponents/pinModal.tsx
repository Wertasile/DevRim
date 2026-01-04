import { PinIcon, X } from 'lucide-react'
import React from 'react'
import { useChat } from '~/context/userContext'

type pinModalProps = {
    pinModal: boolean
    setPinModal: React.Dispatch<React.SetStateAction<boolean>>
}

const PinModal = ({pinModal, setPinModal}:pinModalProps) => {
    
    const {chat} = useChat()

  return (
    <>
    <div className='icon' onClick={() => setPinModal(true)}>
      <PinIcon size={20}/>
    </div>
    {pinModal && 
    <div className="fixed left-0 top-0 z-50 w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setPinModal(false)}>
        <div className="w-[400px] max-h-[500px] bg-[#EDEDE9] border border-[#1f2735] flex flex-col gap-4 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3>Pinned Messages</h3>
              <button 
                onClick={() => setPinModal(false)}
                className="icon"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
              {chat?.pinned && chat.pinned.length > 0 ? (
                chat.pinned.map((pinnedMessage, index) => (
                  <div className="flex flex-col gap-2 rounded-lg bg-[#FFFFFF] border border-[#1f2735] p-3" key={index}>
                      <div className='flex justify-between items-center gap-2'>
                          <div className="flex items-center gap-2">
                            <img src={pinnedMessage.sender.picture} width={24} height={24} className="rounded-full"/>
                            <div>{pinnedMessage.sender.name}</div>
                          </div>
                      </div>
                      <div className='text-mini'>{pinnedMessage.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-[#9aa4bd] text-center py-8">No pinned messages</div>
              )}
            </div>
        </div>
    </div>
    }
    </>
  )
}

export default PinModal