import React from 'react'

const API_URL = import.meta.env.VITE_API_URL;

const deleteMessage = async (messageId: string) => {
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'delete',
    credentials: 'include'
  })
  const data = await response.json()
  return data
}

export default deleteMessage