import React from 'react'

const fetchUser = async(userId : string) => {
  const response = await fetch(`http://localhost:5000/users/${userId}`, {
            method: 'get'
        })
        const data = await response.json()
        return(data)
}

export default fetchUser