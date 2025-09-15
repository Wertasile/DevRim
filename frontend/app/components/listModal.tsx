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
    <div className='absolute z-1 flex h-[100vh] w-[100vw] justify-center items-center backdrop-blur-xs' onClick={() => setViewListModal(false)}>
        <div className='w-[300px] h-[400px] bg-[#393E46] border-solid border-[1px] border-[#979797] flex flex-col gap-2 p-2' onClick={(e) => e.stopPropagation()}>
          <h3 className='text-center'>{listData?.name}</h3>
          <div>
            {listData?.blogs.map( (blog, index)  => (
              <div key={index} className="cursor-pointer p-1 hover:bg-[#111] flex flex-row gap-2" onClick={() => {window.location.href=`/blog/${blog._id}`}}>
                {blog.title}
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default ListModal