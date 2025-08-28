import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const fetchUser = async(userId : string) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
            method: 'get'
        })
        const data = await response.json()
        return(data)
}

export default fetchUser