import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const unpinMessage = async(messageId:string,chatId:string) => {
  const response = await fetch(`${API_URL}/chats/unpin/${chatId}`,{
    method: 'put',
    credentials: 'include',
    headers: {
        "Content-Type":"application/json"
    },
    body: JSON.stringify({messageId:messageId})
  })

  const data = await response.json()
  return data
}

export default unpinMessage