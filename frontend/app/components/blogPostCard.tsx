import { MessageSquare, ThumbsUp } from 'lucide-react';
import React, { type JSX } from 'react'
import { useUser } from '~/context/userContext';
import type { Comment, User } from '~/types/types';

type BlogPostProps = {
  id: string;
  title: string;
  postUser: User;
  comments: Comment[];
  likes: User[];
  summary : string;
  releaseDate: string;
  content: object;
}
const BlogPostCard = ({id, title, releaseDate, summary, content, postUser, comments, likes} : BlogPostProps) => {
  const date = releaseDate.split("T")

  const {user} = useUser()

  const handleNav = () => {
    window.location.href=`/blog/${id}`
  }

  return (
    <div className='sm:py-5 border-b-[1px] border-solid border-[#979797] flex flex-col gap-2 cursor-pointer' onClick={handleNav}>
      {postUser._id == user?._id ? 
      (
      <div className='items-center flex gap-5'>
        <img src={postUser.picture} className='rounded-3xl' width={32}/>
        <i>Your publication</i>
      </div>
      
      ):(
      <div className='items-center flex gap-5'>
        <img src={postUser.picture} className='rounded-3xl' width={32}/>
        <div>{postUser.name}</div>
      </div>
      
      )}

      <div><h2>{title}</h2></div>
      
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