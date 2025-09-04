import React, { useDeferredValue, useCallback, useEffect, useState } from 'react'
import BlogPostCard from '../components/blogPostCard'
import type { Blog } from '~/types/types'
import Search from '~/components/Search'
import { NavLink } from 'react-router'

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogHome() {
    const [blogs, setBlogs] = useState<Blog []>([])
    const [searchResults, setSearchResults] = useState<Blog[]>([])

    const [searchInput, setSearchInput] = useState<string>("")
    const deferredInput = useDeferredValue(searchInput)


    // const handleSearch= ((text:string) => {
    //     const searchedBlogs = blogs.filter((b) => (b.title.toLowerCase()).includes(text.toLowerCase()));
    //     setSearchResults(searchedBlogs)
    // })

    const handleSearch= useCallback(((text:string) => {
        const searchedBlogs = blogs.filter((b) => (b.title.toLowerCase()).includes(text.toLowerCase()));
        setSearchResults(searchedBlogs)
    }), [blogs])

    const getBlogs = async () => {
        const response = await fetch(`${API_URL}/posts/`, {
            method: 'get',
            credentials: 'include',
        })
        const data = await response.json()
        console.log(data)
        setBlogs(data)
        setSearchResults(data)
    }

    useEffect(() => {
        console.log("BlogHome mounted")
        getBlogs()
    }, [])

    useEffect(() => {
        console.log(searchResults)
    }, [searchResults])
    
    return (
        <>
            <div id='blog-taskbar'>
                <Search onChange={handleSearch}/>
                <button className='primary-btn'><NavLink to="/blog/new">ADD POST</NavLink></button>
            </div>
            <section id="blogs">
                {searchResults.map((b) => (
                    <BlogPostCard key={b._id} id={b._id} user={b.user} title={b.title} releaseDate={b.releaseDate} summary={b.summary} content={b.content} comments={b.comments} likes={b.likes}/>
                ))}
            </section>
        </>
    )
}
