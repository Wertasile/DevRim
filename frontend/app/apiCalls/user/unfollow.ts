import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const unfollow = async(followId : string) => {
  const response = await fetch(`${API_URL}/users/unfollow/${followId}`, {
            method: 'delete',
            credentials: 'include'
        })
        const data = await response.json()
        return(data)
}

export default unfollow