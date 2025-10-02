import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react'
import Tiptap from '~/components/tiptap/tiptap'
import { useUser } from '~/context/userContext'
import topics from "../data/searchFilters/topics.json"
import frameworks from "../data/searchFilters/frameworks.json"

const API_URL = import.meta.env.VITE_API_URL;

const BlogAdd = () => {

  const {user} = useUser()

  const [post, setPost] = useState<any | null>(null)
  const [title, setTitle] = useState<String | null>(null)
  const [summary, setSummary] = useState<String | null>(null)

  const [selected, setSelected] = useState<string>("")

  const [categories, setCategories] = useState<string []>([])

  const handleChange = (content: any) => {
    setPost(content)
    console.log(content)
  }

  const savePost = async() => {

    const response = await fetch(`${API_URL}/posts`, {
      method: 'post',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        title,
        summary,
        content: post,
        categories: categories
      })
    })

    window.location.href = "/blog"
    
  }
  
  return (
    <div className='max-w-[80vw] my-0 flex flex-col gap-3 mx-auto'>
      <div>
        <label htmlFor="title" id="title" className='hidden'>TITLE</label>
        <input 
          type='text' 
          id='title' 
          name="title" 
          onChange={(event) => setTitle(event.target.value)} 
          placeholder='Enter your title'
        />
      </div>
      <div>
        <label className="hidden" htmlFor="summary" id="summary">SUMMARY</label>
        <input 
          type='text' 
          id='summary' 
          name="summary"
          className='bg-[#060010]' 
          onChange={(event) => setSummary(event.target.value)} 
          placeholder='Enter your Summary'
        />
      </div>

      <div className='flex gap-2 text-[#979797]'>
        SELECTED : 
        {categories.map( (category, index) => (
          <div className='italic border-r-[2px] border-[#353535] border-solid pr-2' key={index}>{category}</div>
        ))}
      </div>

      <div className='flex justify-between relative'>
        <div className='self-center text-[#979797]'>CATEGORIES: </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "topics") {
                setSelected("")
              }else{
                setSelected("topics")
              }
            }
          }
        >
          <span className='flex'>
          TOPICS <ChevronDown/>
          </span>
        </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "types") {
                setSelected("")
              }else{
                setSelected("types")
              }
            }
          }
        >
          <span className='flex'>
          TYPE <ChevronDown/>
          </span>
        </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "ai") {
                setSelected("")
              }else{
                setSelected("ai")
              }
            }
          }
        >
          <span className='flex'>
          AI <ChevronDown/>
          </span>
        </div>
        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "frameworks") {
                setSelected("")
              }else{
                setSelected("frameworks")
              }
            }
          }
        >
          <span className='flex'>
          FRAMEWORKS <ChevronDown/>
          </span>
        </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "languages") {
                setSelected("")
              }else{
                setSelected("languages")
              }
            }
          }
        >
          <span className='flex'>
          LANGUAGES <ChevronDown/>
          </span>
        </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "cloud") {
                setSelected("")
              }else{
                setSelected("cloud")
              }
            }
          }
        >
          <span className='flex'>
          CLOUD <ChevronDown/>
          </span>
        </div>

        <div className='primary-btn' 
          onClick={() => 
            {
              if (selected === "data") {
                setSelected("")
              }else{
                setSelected("data")
              }
            }
          }
        >
          <span className='flex'>
          DATA <ChevronDown/>
          </span>
        </div>

        {selected === "topics" &&
        <div className='absolute top-10 bg-[#111] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {topics.Topics.SoftwareDevelopmentProgramming.map( (topic, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(topic)) {
                    setCategories( (prev) => prev.filter( p => p !== topic))
                  }else{
                    setCategories( (prev) => [...prev, topic])}
                  }
                }
              >
                {topic}
              </div>
          ))}
        </div>
        }

        {selected === "types" &&
        <div className='absolute top-10 bg-[#111] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {topics.Topics.CareerCommunityIndustry.map( (type, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(type)) {
                    setCategories( (prev) => prev.filter( p => p !== type))
                  }else{
                    setCategories( (prev) => [...prev, type])}
                  }
                }
              >
                {type}
              </div>
          ))}
        </div>
        }

        {selected === "ai" &&
        <div className='absolute top-10 bg-[#111] rounded-3xl grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {topics.Topics.AICloudEmergingTech.map( (el, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(el)) {
                    setCategories( (prev) => prev.filter( p => p !== el))
                  }else{
                    setCategories( (prev) => [...prev, el])}
                  }
                }
              >
                {el}
              </div>
          ))}
        </div>
        }

        {selected === "frameworks" &&
        <div className='absolute top-10 bg-[#111] rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {frameworks.Frameworks.FrameworksLibraries.map( (framework, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(framework)) {
                    setCategories( (prev) => prev.filter( p => p !== framework))
                  }else{
                    setCategories( (prev) => [...prev, framework])}
                  }
                }
              >
                {framework}
              </div>
          ))}
        </div>
        }

        {selected === "languages" &&
        <div className='absolute top-10 bg-[#111] rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {frameworks.Frameworks.Languages.map( (language, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(language)) {
                    setCategories( (prev) => prev.filter( p => p !== language))
                  }else{
                    setCategories( (prev) => [...prev, language])}
                  }
                }
              >
                {language}
              </div>
          ))}
        </div>
        }

        {selected === "cloud" &&
        <div className='absolute top-10 bg-[#111] rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {frameworks.Frameworks.CloudDevOps.map( (cloud, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(cloud)) {
                    setCategories( (prev) => prev.filter( p => p !== cloud))
                  }else{
                    setCategories( (prev) => [...prev, cloud])}
                  }
                }
              >
                {cloud}
              </div>
          ))}
        </div>
        }

        {selected === "data" &&
        <div className='absolute top-10 bg-[#111] rounded-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-3 h-auto w-full z-20 justify-between'>
          {frameworks.Frameworks.DataAI.map( (data, index) => (            
              <div 
                className={`primary-btn text-sm w-[200px]`}
                onClick={() => {
                  if (categories.includes(data)) {
                    setCategories( (prev) => prev.filter( p => p !== data))
                  }else{
                    setCategories( (prev) => [...prev, data])}
                  }
                }
              >
                {data}
              </div>
          ))}
        </div>
        }
      </div>
      <div className='flex-grow'>
        <Tiptap content={post} handleChange={handleChange}/>
      </div>
      <button className='primary-btn w-[150px] mx-auto my-0' onClick={savePost}>SAVE</button>
    </div>
  )
}

export default BlogAdd