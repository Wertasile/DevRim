import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const connect = async(userId : string) => {
  const response = await fetch(`${API_URL}/users/connect/${userId}`, {
            method: 'put',
            credentials: 'include'
        })
        const data = await response.json()
        return(data)
}

export default connect