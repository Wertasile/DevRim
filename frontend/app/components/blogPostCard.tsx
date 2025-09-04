import { MessageSquare, ThumbsUp } from 'lucide-react';
import React, { type JSX } from 'react'
import type { Comment, User } from '~/types/types';

type BlogPostProps = {
  id: string;
  title: string;
  user: User;
  comments: Comment[];
  likes: User[];
  summary : string;
  releaseDate: string;
  content: object;
}
const BlogPostCard = ({id, title, releaseDate, summary, content, user, comments, likes} : BlogPostProps) => {
  const date = releaseDate.split("T")

  const handleNav = () => {
    window.location.href=`/blog/${id}`
  }

  return (
    <div className='py-5 border-b-[1px] border-solid border-[#979797] flex flex-col gap-2' onClick={handleNav}>
      <div className='items-center flex gap-5'>
        <img src={user.picture} className='rounded-3xl' width={32}/>
        <div>{user.name}</div>
      </div>
      
      <div><h2><b>{title}</b></h2></div>
      
      <div className='text-[#979797]'><p>{summary}</p></div>

      <div className='flex gap-5'>
        <div><i>{date[0]}</i></div>
        <div className='flex gap-3'><ThumbsUp/> {likes.length}</div>
        <div className='flex gap-3'><MessageSquare/> {comments.length}</div>
      </div>
    </div>
  )
}

export default BlogPostCard