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
    <div className='primary-btn' onClick={() => setPinModal(true)}><PinIcon/></div>
    {pinModal && 
    <div className="fixed left-0 top-0 z-50 w-full h-full bg-black/30 flex items-center justify-center"
        onClick={() => setPinModal(false)  
    }>
        <div className="w-[300px] h-[400px] bg-[#393E46] border-solid border-[1px] border-[#979797] flex flex-col gap-2 p-2"
            onClick={(e) => e.stopPropagation()}>
            <h3 className='self-center'>PINNED MESSAGES</h3>
            {chat?.pinned.map((pinnedMessage, index) => (
                <div className="flex flex-col gap-2 rounded-[5px] border-[#979797] border-solid border-[0.5px] p-2" key={index}>
                    <div className='font-bold flex justify-between gap-2'>
                        <div>{pinnedMessage.sender.name}</div>
                        <div className='font-bold'>X</div>
                    </div>
                    <div className='text-sm'>{pinnedMessage.content}</div>
                </div>
            ))}
        </div>
    </div>

    }
    </>
  )
}

export default PinModal