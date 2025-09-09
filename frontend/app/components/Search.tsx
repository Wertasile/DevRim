import React, { useEffect, memo } from 'react'

type searchProps = {
    onChange : (text: string) => void;
}

const Search = ({onChange} : searchProps) => {

    console.log("SEARCH RENDERED")
    return (
        <input
            id="blog-search" 
            onChange={ (e) => {onChange(e.target.value)} }
            placeholder='Enter Search term'
            className=''
            type='text'            
        />
    )
}

export default memo(Search)