import React from 'react'
import fetchUser from '~/apiCalls/fetchUser'
import { useChat, useUser } from '~/context/userContext'
import type { Chat } from '~/types/types'

type ChatMenuProps = {
    Chat : Chat,
    // onclick: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

const ChatMenu = ({Chat} : ChatMenuProps) => {

  const {user} = useUser()
  const {chat, setChat} = useChat()
  
  const fetchlatestMessageUser = async (userId: string) => {
    const userData = await fetchUser(userId)
    return 
  }

  return (
    <div className={`cursor-pointer p-2 ${chat == Chat && ('bg-hover rounded-[5px]')} border-b-[1px] border-solid border-[#353535] flex flex-row py-2 justify-between`} onClick={() => {setChat(Chat)}}>
        <div>
            {Chat?.chatName === "sender" ? (<h3>{Chat.users.filter((u) => u._id !== user?._id).map( (otherUser) => <h3>{otherUser.name}</h3>)}</h3>) : (<h3>{Chat?.chatName}</h3>)}
            <p className='font-light text-sm'>
              {Chat?.latestMessage && Chat?.latestMessage.sender.given_name} : {Chat?.latestMessage && (Chat?.latestMessage.content)}</p>
        </div>
        <div>
            {Chat?.chatName === "sender" ? 
              (<img 
                src={Chat.users.filter((u) => u._id !== user?._id).map( (otherUser) => otherUser.picture)} 
                width={48}
                className='rounded-3xl '
              />) : 
              (<img 
                src='/Images/group_chat.png' 
                width={48}
                className='rounded-3xl border-[2px] border-solid border-[#979797]'
              />)
            }
            <i className='mt-[5px] text-xs'>{Chat?.updatedAt.split("T")[0]}</i>
        </div>
        
    </div>
  )
}

export default ChatMenu