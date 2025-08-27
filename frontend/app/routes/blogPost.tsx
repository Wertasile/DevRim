import React, { useEffect, useState } from 'react'
import type { Route } from '../+types/root';
import type { Blog, User } from '~/types/types';

import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { ListItem } from '@tiptap/extension-list';
import Image from '@tiptap/extension-image';

export default function BlogPost({ params }: Route.ComponentProps) {
  const [blog, setBlog] = useState<Blog>()
  const [user, setUser] = useState<User | null>(null)

  const getBlog = async () => {
    const response = await fetch(`http://localhost:5000/posts/${params.id}`, {
      method: 'post'
    })
    const data = await response.json()
    setBlog(data)

    const userResponse = await fetch(`http://localhost:5000/users/${data.user}`, {
      method: 'get'
    })
    const userData = await userResponse.json()
    setUser(userData)
  }

  useEffect(() => {
    getBlog()
  }, [])

  if (!blog) return <p>Loading...</p>

  // Generate full HTML from Tiptap JSON using StarterKit
  const html = generateHTML(blog.content, [
    StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3"
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3"
          }
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ListItem,
      Highlight,
      Image,
      
  ])

  return (
    <div id='blog-post'>
      <h2><b>{blog.title}</b></h2>
      <h3>
        <i style={{ color: 'gray' }}>{blog.summary}</i>
      </h3>
      <p>
        <b>{blog.releaseDate.split("T")[0]}</b>
      </p>

      {/* Render full content */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
