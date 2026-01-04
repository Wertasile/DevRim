import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const leaveCommunity = async(communityId : string) => {
  const response = await fetch(`${API_URL}/communities/${communityId}/leave`, {
    method: 'post',
    credentials: 'include'
  })
  const data = await response.json()
  return(data)
}

export default leaveCommunity