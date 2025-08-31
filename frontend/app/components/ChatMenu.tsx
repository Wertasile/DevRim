import React from 'react'
import { useChat, useUser } from '~/context/userContext'
import type { Chat } from '~/types/types'

type ChatMenuProps = {
    Chat : Chat,
    // onclick: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

const ChatMenu = ({Chat} : ChatMenuProps) => {

  const {user} = useUser()
  const {chat, setChat} = useChat()

  return (
    <div className='border-b-[1px] border-solid border-[#979797] flex flex-row py-2 justify-between' onClick={() => {setChat(Chat)}}>
        <div>
            {Chat?.chatName === "sender" ? (<h3>{Chat.users.filter((u) => u._id !== user?._id).map( (otherUser) => <h3>{otherUser.name}</h3>)}</h3>) : (<h3>{Chat?._id}</h3>)}
            <p className='font-light text-sm'>{Chat?.latestMessage.content}</p>
        </div>
        <div>
            {Chat?.chatName === "sender" ? 
              (<img 
                src={Chat.users.filter((u) => u._id !== user?._id).map( (otherUser) => otherUser.picture)} 
                width={48}
                className='rounded-3xl '
              />) : 
              (<img 
                src='' 
                width={48}
              />)
            }
            <i className='mt-[5px] text-xs'>{Chat?.updatedAt.split("T")[0]}</i>
        </div>
        
    </div>
  )
}

export default ChatMenu