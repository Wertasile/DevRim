import React, { type JSX } from 'react'

type BlogPostProps = {
  id: string;
  title: string;
  summary : string;
  releaseDate: string;
  content: object;
}
const BlogPostCard = ({id, title, releaseDate, summary, content} : BlogPostProps) => {
  const date = releaseDate.split("T")

  const handleNav = () => {
    window.location.href=`/blog/${id}`
  }

  return (
    <div className='blogs_x' onClick={handleNav}>
      <div><h2><b>{title}</b></h2></div>
      <div><i>{date[0]}</i></div> 
      <div><p>{summary}</p></div>
    </div>
  )
}

export default BlogPostCard