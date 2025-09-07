import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;
const RemoveFromList = async (listId : string, blogId: string) => {
  
    const response = await fetch(`${API_URL}/lists/${listId}/blogs/${blogId}`, {
        method: 'delete',
        credentials: 'include',
        headers: {
            "Content-Type":"application/json"
        }
    })
    const data = await response.json()
    return(data)
}

export default RemoveFromList