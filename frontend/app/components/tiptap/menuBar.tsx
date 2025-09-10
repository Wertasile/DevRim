import React, { useState } from 'react'
import {Editor, } from '@tiptap/core';
import {AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, CodeIcon, Heading1, Heading2, Heading3, Highlighter, Image, Italic, List, ListOrdered, Pilcrow, Strikethrough, Underline} from 'lucide-react'
import { Toggle } from '../ui/toggle';
import TextAlign from '@tiptap/extension-text-align';

const API_URL = import.meta.env.VITE_API_URL;
console.log("API_URL", API_URL);


type MenuBarProps = {
    editor: Editor | null
}
const MenuBar = ({editor} : MenuBarProps) => {
  
  if (!editor) {
    return null
  }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'video/mp4',
    'video/quicktime',
    'audio/mpeg',
    'audio/wav',
    // Add more supported types as needed
  ];

  const [selectedImage, setSelectedImage] = useState<any>()

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    console.log("selected file:", file); // ✅

    const response = await fetch(`${API_URL}/s3/tiptap-image-upload?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`,{
      method:'get',
      credentials: 'include'
    })
    const { uploadUrl, fileUrl } = await response.json();

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    editor.chain().focus().setImage({src: fileUrl}).run()

  }

  const options = [
    {
      icon: <Heading1 className="size-4"/>,
      onClick:() => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      pressed:editor.isActive('heading', { level: 1 })
    },
    {
      icon: <Heading2 className="size-4"/>,
      onClick:() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      pressed:editor.isActive('heading', { level: 2 })
    },
    {
      icon: <Heading3 className="size-4"/>,
      onClick:() => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      pressed:editor.isActive('heading', { level: 3 })
    },
    {
      icon: <Pilcrow className="size-4"/>,
      onClick:() => editor.chain().focus().setParagraph().run(),
      pressed:editor.isActive('paragraph')
    },
    {
      icon: <Bold className="size-4"/>,
      onClick:() => editor.chain().focus().toggleBold().run(),
      pressed:editor.isActive('bold')
    },    
    {
      icon: <Italic className="size-4"/>,
      onClick:() => editor.chain().focus().toggleItalic().run(),
      pressed:editor.isActive('italic')
    },
    {
      icon: <Strikethrough className="size-4"/>,
      onClick:() => editor.chain().focus().toggleStrike().run(),
      pressed:editor.isActive('strike')
    },
    {
      icon: <Underline className="size-4"/>,
      onClick:() => editor.chain().focus().toggleUnderline().run(),
      pressed:editor.isActive('underline')
    },
    {
      icon: <Highlighter className="size-4"/>,
      onClick:() => editor.chain().focus().toggleHighlight().run(),
      pressed:editor.isActive('highlight')
    },
    {
      icon: <AlignLeft className="size-4"/>,
      onClick:() => editor.chain().focus().setTextAlign('left').run(),
      pressed:editor.isActive({TextAlign: 'left'})
    },
    {
      icon: <AlignCenter className="size-4"/>,
      onClick:() => editor.chain().focus().setTextAlign('center').run(),
      pressed:editor.isActive({TextAlign: 'center'})
    },
    {
      icon: <AlignRight className="size-4"/>,
      onClick:() => editor.chain().focus().setTextAlign('right').run(),
      pressed:editor.isActive({TextAlign: 'right'})
    },
    {
      icon: <AlignJustify className="size-4"/>,
      onClick:() => editor.chain().focus().setTextAlign('justify').run(),
      pressed:editor.isActive({TextAlign: 'justify'})
    },
    {
      icon: <List className="size-4"/>,
      onClick:() => editor.chain().focus().toggleBulletList().run(),
      pressed:editor.isActive('bulletList')
    },
    {
      icon: <ListOrdered className="size-4"/>,
      onClick:() => editor.chain().focus().toggleOrderedList().run(),
      pressed:editor.isActive('orderedList')
    },
    {
      icon: <CodeIcon className="size-4"/>,
      onClick:() => editor.chain().focus().toggleCodeBlock().run(),
      pressed:editor.isActive('codeBlock')
    },
    // {
    //   icon: <Image className="size-4"/>,
    //   onClick:() => {
    //     editor.chain().focus().setImage({src: ''}).run()
    //   },
    //   pressed:editor.isActive('codeBlock')
    // },
  ]

  return (
    <div className="control-group">

      {options.map((option, index) => (
        <Toggle key={index} onPressedChange={option.onClick} pressed={option.pressed}>{option.icon}</Toggle>
      ))}
      <label htmlFor="file-upload" className='custom-file-upload'>
        <Image className="size-4"></Image>
      </label>
      <input type="file" onChange={onFileUpload} id="file-upload"/>
        
    </div>
  )
}

export default MenuBar