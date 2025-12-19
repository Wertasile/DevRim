import gsap from 'gsap'
import { SlidersHorizontalIcon } from 'lucide-react'
import React, { useRef, useState } from 'react'
import topics from "../data/searchFilters/topics.json"
import frameworks from "../data/searchFilters/frameworks.json"

type FilterModalProps = {
    categories: string[];
    setCategories:React.Dispatch<React.SetStateAction<string[]>>;
}

const FilterModal = ({categories, setCategories}:FilterModalProps) => {

    const filterPanel = useRef(null)
    const [panel, setPanel] = useState(false)

    const closePanel = () => {
        setPanel(false)
        gsap.to(filterPanel.current, {
            x: "100%",
            duration: 0.6
        })
    }

    const openPanel = () => {
        setPanel(true)
        gsap.to(filterPanel.current, {
            x: "0%",
            duration: 0.6
        })
    }

  return (
    <>
        <div
            className='bg-[#121b2a] cursor-pointer h-[41.14px] px-3 flex items-center rounded-lg border border-[#1f2735] hover:bg-[#1f2735] transition-colors'
            onClick={() => {
                (!panel) ? (openPanel()) : (closePanel())
            }}
        >
            <SlidersHorizontalIcon size={18} strokeWidth={'1px'} className='text-white'/>
        </div>
        <div 
            className='fixed overflow-auto w-full sm:max-w-[675px] bg-[#0f1926] rounded-lg flex flex-col gap-7 border-l border-[#1f2735] top-0 right-0 shadow-xl p-6 h-full z-50' 
            style={{transform:"translateX(100%)"}}
            ref={filterPanel}
        >
            <div className='flex justify-between items-center'>
                <h2 className="text-white font-semibold text-xl">Select Filters</h2>
                <button className="text-[#9aa4bd] hover:text-white transition-colors text-xl font-bold cursor-pointer" onClick={closePanel}>×</button>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">Software Development</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                {topics.Topics.SoftwareDevelopmentProgramming.map( (topic, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (categories.includes(topic)) {
                                setCategories( (prev) => prev.filter( p => p !== topic))
                            }else{
                                setCategories( (prev) => [...prev, topic])}
                            }
                        }
                        className={`${categories.includes(topic) ? ("bg-[#5D64F4] text-white") : ("bg-[#121b2a] text-[#9aa4bd] border border-[#1f2735]")} text-xs px-3 py-2 rounded-lg 
                                    text-center hover:bg-[#5D64F4] hover:text-white transition-colors w-[150px] cursor-pointer`}
                    >
                        {topic}
                    </div>
                ))}
                </div>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">Career and Community</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                {topics.Topics.CareerCommunityIndustry.map( (topic, index) => (
                    <div 
                        key={index}
                            onClick={() => {
                            if (categories.includes(topic)) {
                                setCategories( (prev) => prev.filter( p => p !== topic))
                            }else{
                                setCategories( (prev) => [...prev, topic])}
                            }
                        }
                        className={`${categories.includes(topic) ? ("bg-[#5D64F4]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#5D64F4] w-[175px] cursor-pointer`}
                    >
                    {topic}
                    </div>
                ))}
                </div>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">AI and Cloud Technologies</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                    {topics.Topics.AICloudEmergingTech.map( (topic, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                if (categories.includes(topic)) {
                                    setCategories( (prev) => prev.filter( p => p !== topic))
                                }else{
                                    setCategories( (prev) => [...prev, topic])}
                                }
                            }
                            className={`${categories.includes(topic) ? ("bg-[#5D64F4] text-white") : ("bg-[#121b2a] text-[#9aa4bd] border border-[#1f2735]")} text-xs px-3 py-2 rounded-lg 
                                    text-center hover:bg-[#5D64F4] hover:text-white transition-colors w-[150px] cursor-pointer`}
                        >
                        {topic}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">Frameworks</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                    {frameworks.Frameworks.FrameworksLibraries.map( (f, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                if (categories.includes(f)) {
                                    setCategories( (prev) => prev.filter( p => p !== f))
                                }else{
                                    setCategories( (prev) => [...prev, f])}
                                }
                            }
                            className={`${categories.includes(f) ? ("bg-[#5D64F4]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#5D64F4] w-[115px] cursor-pointer`}

                        >
                            {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">Languages</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                    {frameworks.Frameworks.Languages.map( (f, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                if (categories.includes(f)) {
                                    setCategories( (prev) => prev.filter( p => p !== f))
                                }else{
                                    setCategories( (prev) => [...prev, f])}
                                }
                            }
                            className={`${categories.includes(f) ? ("bg-[#5D64F4]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#5D64F4] w-[150px] cursor-pointer`}

                        >
                        {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div>
                <h3 className="text-white font-semibold mb-3">DevOps</h3>
                <div className='flex flex-wrap gap-2 border-b border-[#1f2735] py-4'>
                    {frameworks.Frameworks.CloudDevOps.map( (f, index) => (
                        <div 
                            key={index}
                            onClick={() => {
                                if (categories.includes(f)) {
                                    setCategories( (prev) => prev.filter( p => p !== f))
                                }else{
                                    setCategories( (prev) => [...prev, f])}
                                }
                            }
                            className={`${categories.includes(f) ? ("bg-[#5D64F4]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#5D64F4] w-[150px] cursor-pointer`}

                        >
                        {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div className='bottom-0 right-0 sticky p-4 bg-[#0f1926] border-t border-[#1f2735]'>
                <button className='w-full secondary-btn py-3 rounded-lg' onClick={() => setCategories([])}>
                  <span>REMOVE ALL FILTERS</span>
                </button>
            </div>
            
        </div>
    </>
  )
}

export default FilterModal