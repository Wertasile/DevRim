import React from 'react'

const API_URL = import.meta.env.VITE_API_URL;

const FetchOwnDetails = async() => {
  
    const response = await fetch(`${API_URL}/me`, {
        method: 'get',
        credentials: 'include'
    })
    const data = await response.json()
    return data

}

export default FetchOwnDetails