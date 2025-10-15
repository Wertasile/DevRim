import React from 'react'
const API_URL = import.meta.env.VITE_API_URL;

const logEvent = async(type: String , metadata = {}) => {
  
  try {
    await fetch(`${API_URL}/logs/`, {
      method: "post",
      headers: {
          "Content-Type" : "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ event: type, metadata})
    })
  } catch (error) {
    
  }


  return
}

export default logEvent