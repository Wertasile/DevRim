import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const joinCommunity = async(communityId : string) => {
  const response = await fetch(`${API_URL}/communities/${communityId}/join`, {
    method: 'post',
    credentials: 'include'
  })
  const data = await response.json()
  return(data)
}

export default joinCommunity