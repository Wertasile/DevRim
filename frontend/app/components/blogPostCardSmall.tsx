import { MessageCircle, ThumbsUp } from 'lucide-react'
import { Share2 } from 'lucide-react'
import { Bookmark } from 'lucide-react'
import React from 'react'
import type { Blog } from '~/types/types'

const BlogPostCardSmall = ({blog} : {blog: Blog}) => {
  return (
    <div 
    key={blog._id} 
    className='bg-[#FEC72F]/50 border-[1px] border-[#000000] overflow-hidden cursor-pointer hover:bg-[#FEC72F]/70 scale-95 hover:scale-100 transition-all'
    onClick={() => window.location.href = `/blog/${blog._id}`}
    >
        {blog.coverImage && (
          <div className='relative h-48 overflow-hidden'>
            <img 
                src={blog.coverImage} 
                alt={blog.title}
                className='w-full h-full object-cover'
            />
          </div>
        )}
        <div className='p-4 flex flex-col justify-between gap-3 group-hover:bg-[#FED259] transition-all'>
            <h3 className='line-clamp-2'>{blog.title}</h3>
            <div className='flex flex-col gap-2'>
                <p className='text-[#353535] text-sm'>{new Date(blog.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <div className='flex items-center gap-4 text-[#353535] text-sm'>
                    <span className='flex items-center gap-1'>
                        <ThumbsUp size={16} />
                        {blog.likes?.length || 0}
                    </span>
                    <span className='flex items-center gap-1'>
                        <MessageCircle size={16} />
                        {blog.comments?.length || 0}
                    </span>
                    <Share2 size={16} className='ml-auto' />
                    <Bookmark size={16} />
                </div>
            </div>    

        </div>
    </div>
  )
}

export default BlogPostCardSmall