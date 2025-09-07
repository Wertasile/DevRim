import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const getAllList = async(userId : string | null) => {
  const response = await fetch(`${API_URL}/lists/user/${userId}`, {
    method: 'get',
    credentials: 'include'
  })
  const data = await response.json()
  return(data)
}

export default getAllList