import { Heart, MessageCircle } from 'lucide-react'
import React from 'react'
import type { Blog } from '~/types/types'

const BlogPostSmall = ({blog}: {blog: Blog}) => {
  return (
    <div 
      className='bg-gradient-to-br from-[#EDEDE9] to-[#F5F5F1] border border-[#000000] flex flex-col gap-[5px] cursor-pointer rounded-[5px] p-[10px] transition-all duration-300 hover:shadow-lg hover:border-[#5D64F4] hover:transform hover:translate-x-2 hover:bg-gradient-to-br hover:from-[#F5F5F1] hover:to-[#EDEDE9]' 
      onClick={() => window.location.href = `/blog/${blog._id}`}
    >
        <div className='text-small font-bold hover:text-[#5D64F4] transition-colors duration-200'>{blog.title}</div>
        <div className='flex justify-between items-end'>
            {/* LEFT SIDE*/}
            <div className='flex gap-[5px]'>
                <img 
                  src={blog.user.picture} 
                  className='w-[32px] h-[32px] rounded-full border-2 border-transparent hover:border-[#5D64F4] transition-all duration-200' 
                />
                <div className='flex flex-col'>
                    <div className='text-small hover:text-[#5D64F4] transition-colors duration-200'>{blog.user.name}</div>
                    <div className='text-mini'>{blog.releaseDate.split('T')[0]}</div>
                </div>
            </div>
            {/* RIGHT SIDE*/}
            <div className='text-[#353535] flex gap-[5px]'>
                <span className='flex items-center gap-[5px] hover:text-[#E95444] transition-colors duration-200'><Heart size={14}/> {blog.likes?.length ?? 0}</span>
                <span className='flex items-center gap-[5px] hover:text-[#5D64F4] transition-colors duration-200'><MessageCircle size={14}/> {blog.comments?.length ?? 0}</span>
            </div>
        </div>
    </div>
  )
}

export default BlogPostSmall