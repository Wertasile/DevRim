import React, { useEffect, memo } from 'react'

type searchProps = {
    onChange : (text: string) => void;
    categories: string[];
    onKeyDown:(e: any) => void;
}

const Search = ({onChange, categories, onKeyDown} : searchProps) => {

    console.log("SEARCH RENDERED")
    return (
        <input
            id="blog-search" 
            onChange={ (e) => {onChange(e.target.value)} }
            placeholder='Enter Search term'
            className='w-[full]'
            width={200}
            onKeyDown={onKeyDown}
            type='text'            
        />
    )
}

export default memo(Search)