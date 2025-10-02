import React, { useEffect, memo } from 'react'

type searchProps = {
    onChange : (text: string) => void;
    categories: string[]
}

const Search = ({onChange, categories} : searchProps) => {

    console.log("SEARCH RENDERED")
    return (
        <input
            id="blog-search" 
            onChange={ (e) => {onChange(e.target.value)} }
            placeholder='Enter Search term'
            className='w-[full]'
            width={200}
            type='text'            
        />
    )
}

export default memo(Search)