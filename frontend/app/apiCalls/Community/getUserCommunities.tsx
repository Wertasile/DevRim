import React from 'react'

const API_URL = import.meta.env.VITE_API_URL;

const getUserCommunities = async(userId : string) => {
  const response = await fetch(`${API_URL}/communities/user/${userId}`, {
    method: 'get',
    credentials: 'include'
  })
  const data = await response.json()
  return(data)
}

export default getUserCommunities