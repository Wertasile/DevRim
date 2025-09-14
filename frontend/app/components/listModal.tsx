import React, { useEffect, useState } from 'react'
import fetchList from '~/apiCalls/list/fetchList';
import type { List } from '~/types/types'

type ListModalProps = {
    list : string | undefined;
    setViewListModal: React.Dispatch<React.SetStateAction<boolean>>
}

const ListModal = ({list, setViewListModal}: ListModalProps) => {

  const [listData, setListData] = useState<List>()
  
  const fetchListData = async (list: string) => {
    console.log("ACTIVATED LIST MODAL")
    const data = await fetchList(list)
    setListData(data)
  }

  useEffect(() => {
    if (list) {
      fetchListData(list)
    }

  }, [])

  return (
    <div className='absolute h-[85vh] w-[100vw] flex justify-center items-center z-[10]' onClick={() => setViewListModal(false)}>
        <div className='bg-[#111] w-[300px] h-[300px] flex flex-col gap-5 p-10 rounded-3xl' onClick={(e) => e.stopPropagation()}>
          <h3>{listData?.name}</h3>
          <div>
            {listData?.blogs.map( (blog, index)  => (
              <div key={index} className="cursor-pointer" onClick={() => {window.location.href=`/blog/${blog._id}`}}>
                {blog.title}
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default ListModal