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
            className='bg-[#393E46] text-[353535] cursor-pointer h-[41.14px] px-2 flex items-center rounded-[5px] items-center border-solid border-[0.5px] border-[#353535]'
            onClick={() => {
                (!panel) ? (openPanel()) : (closePanel())
            }}
        >
            <SlidersHorizontalIcon className=''/>
        </div>
        <div 
            className='fixed overflow-auto w-full sm:max-w-[675px] bg-[#111] rounded-[5px] flex flex-col gap-7 border-l-solid border-[0.5px] border-[#353535] top-0 right-0 shadow-md p-2 h-full z-1' 
            style={{transform:"translateX(100%)"}}
            ref={filterPanel}
        >
            <div className='flex justify-between'>
                <h2>SELECT FILTERS</h2>
                <b className="cursor-pointer" onClick={closePanel}>X</b>
            </div>

            <div>
                <h3>SOFTWARE DEVELOPMENT</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                        className={`${categories.includes(topic) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[150px] cursor-pointer`}
                    >
                        {topic}
                    </div>
                ))}
                </div>
            </div>

            <div>
                <h3>CAREER AND COMMUNITY</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                        className={`${categories.includes(topic) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[175px] cursor-pointer`}
                    >
                    {topic}
                    </div>
                ))}
                </div>
            </div>

            <div>
                <h3>AI AND CLOUD TECHNOLOGIES</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                            className={`${categories.includes(topic) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[150px] cursor-pointer`}
                        >
                        {topic}
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3>FRAMEWORKS</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                            className={`${categories.includes(f) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[115px] cursor-pointer`}

                        >
                            {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div>
                <h3>LANGUAGES</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                            className={`${categories.includes(f) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[150px] cursor-pointer`}

                        >
                        {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div>
                <h3>DEVOPS</h3>
                <div className='flex flex-wrap gap-2 border-b-[2px] border-[#353535] border-solid py-2'>
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
                            className={`${categories.includes(f) ? ("bg-[#00ADB5]") : ("bg-[#353535]")} text-xs p-1 rounded-[5px] 
                                    text-center hover:bg-[#00ADB5] w-[150px] cursor-pointer`}

                        >
                        {f}
                        </div>
                    ) )}
                </div>
            </div>

            <div className='bottom-0 right-0 sticky p-1'>
                <button className='secondary-btn' onClick={() => setCategories([])}>REMOVE FILTER</button>
            </div>
            
        </div>
    </>
  )
}

export default FilterModal