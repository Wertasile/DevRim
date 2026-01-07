import React from 'react'

const CommunityIcon = ({ title, img }: { title: string, img: string }) => {
  return (
    <div 
      className='flex flex-col gap-[10px] justify-center items-center cursor-pointer p-[10px] transition-all duration-300 rounded-lg border-2 border-transparent hover:border-[#5D64F4] hover:bg-gradient-to-br hover:from-[#FEC72F]/20 hover:to-[#5D64F4]/20 hover:shadow-lg hover:scale-105' 
      onClick={() => window.location.href = `/community/${id}`}
    >
        <div className="relative">
            {
                img ? (
                    <img 
                      src={img} 
                      alt={title} 
                      className="w-[64px] h-[64px] border-2 border-[#000000] object-cover rounded-full transition-all duration-300 hover:border-[#5D64F4] hover:ring-4 hover:ring-[#FEC72F]/50" 
                    />
                ) : (
                    <div className="w-[64px] h-[64px] bg-gradient-to-br from-[#5D64F4] to-[#E95444] rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-[#000000] hover:border-[#FEC72F] transition-all duration-300">
                        {title.charAt(0)}
                    </div>
                )
            }
        </div>
        <div>
            <div className='text-small hover:text-bold hover:text-[#5D64F4] transition-all duration-200'>{title.toUpperCase()}</div>
        </div>
    </div>
  )
}

export default CommunityIcon