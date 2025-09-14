import React from 'react'

const API_URL = import.meta.env.VITE_API_URL;

const fetchList = async (listId : string) => {
  const response = await fetch(`${API_URL}/lists/${listId}`, {
    method: 'get',
    credentials: 'include'
  })

  const data = await response.json()
  return data
}

export default fetchList