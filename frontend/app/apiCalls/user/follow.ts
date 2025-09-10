import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const follow = async(followId : string) => {
  const response = await fetch(`${API_URL}/users/follow/${followId}`, {
            method: 'put',
            credentials: 'include'
        })
        const data = await response.json()
        return(data)
}

export default follow