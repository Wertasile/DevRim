import React from 'react'

const CommunityIcon = ({ title, img }: { title: string, img: string }) => {
  return (
    <div className='flex flex-col gap-[10px] justify-center items-center cursor-pointer hover:bg-[#EDEDE9] p-[10px] transition-all' onClick={() => window.location.href = `/community/${id}`}>
        <div>
            {
                img ? (
                    <img src={img} alt={title} className="w-[64px] h-[64px] border-2 border-[#000000] object-cover" />
                ) : (
                    <div className="w-10 h-10 bg-red-500 rounded-full">
                        {title.charAt(0)}
                    </div>
                )
            }
        </div>
        <div>
            <div className='text-small hover:text-bold transition-all'>{title.toUpperCase()}</div>
        </div>
    </div>
  )
}

export default CommunityIcon