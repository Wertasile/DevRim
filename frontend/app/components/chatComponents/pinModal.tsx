import { PinIcon } from 'lucide-react'
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
    <button className='p-2 bg-[#0f1926] border border-[#1f2735] rounded-lg hover:bg-[#1f2735] transition-colors' onClick={() => setPinModal(true)}>
      <PinIcon size={18} className="text-white" strokeWidth={'1px'}/>
    </button>
    {pinModal && 
    <div className="fixed left-0 top-0 z-50 w-full h-full bg-black/60 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setPinModal(false)}>
        <div className="w-[400px] max-h-[500px] bg-[#0f1926] border border-[#1f2735] rounded-lg flex flex-col gap-4 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className='text-white font-semibold text-lg'>Pinned Messages</h3>
              <button 
                onClick={() => setPinModal(false)}
                className="text-[#9aa4bd] hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
              {chat?.pinned && chat.pinned.length > 0 ? (
                chat.pinned.map((pinnedMessage, index) => (
                  <div className="flex flex-col gap-2 rounded-lg border border-[#1f2735] p-3 bg-[#121b2a]" key={index}>
                      <div className='font-semibold flex justify-between items-center gap-2 text-white'>
                          <div className="flex items-center gap-2">
                            <img src={pinnedMessage.sender.picture} width={24} height={24} className="rounded-full"/>
                            <span>{pinnedMessage.sender.name}</span>
                          </div>
                      </div>
                      <div className='text-sm text-[#9aa4bd]'>{pinnedMessage.content}</div>
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