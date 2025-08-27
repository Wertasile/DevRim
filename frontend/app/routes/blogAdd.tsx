import React, { useState } from 'react'
import Tiptap from '~/components/tiptap/tiptap'
import { useUser } from '~/context/userContext'

const BlogAdd = () => {

  const {user} = useUser()

  const [post, setPost] = useState<any | null>(null)
  const [title, setTitle] = useState<String | null>(null)
  const [summary, setSummary] = useState<String | null>(null)

  const handleChange = (content: any) => {
    setPost(content)
    console.log(content)
  }

  const savePost = async() => {

    const response = await fetch("http://localhost:5000/posts", {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        title,
        summary,
        content: post
      })
    })

    window.location.href = "/blog"
    
  }
  
  return (
    <div className='max-w-[80vw] my-0 flex flex-col gap-3 mx-auto'>
      <div>
        <label htmlFor="title" id="title" className='hidden'>TITLE</label>
        <input type='text' id='title' name="title" onChange={(event) => setTitle(event.target.value)} placeholder='Enter your title'/>
      </div>
      <div>
        <label className="hidden" htmlFor="summary" id="summary">SUMMARY</label>
        <input type='text' id='summary' name="summary" onChange={(event) => setSummary(event.target.value)} placeholder='Enter your Summary'/>
      </div>
      <div className='flex-grow'>
        <Tiptap content={post} handleChange={handleChange}/>
      </div>
      <button className='primary-btn' onClick={savePost}>SAVE</button>
    </div>
  )
}

export default BlogAdd