import React, { useState } from 'react'
import {Editor, } from '@tiptap/core';
import {AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Heading1, Heading2, Heading3, Highlighter, Image, Italic, List, ListOrdered, Pilcrow, Strikethrough, Underline} from 'lucide-react'
import { Toggle } from '../ui/toggle';
import TextAlign from '@tiptap/extension-text-align';


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

  const onFileUpload = async (event : any) => {
    setSelectedImage(event.target.files[0])

    // const response = await fetch("",{
    //   method:'POST',
    //   headers: {}
    // })

    // const S3_BUCKET = process.env.S3_BUCKET!; // Replace with your bucket name
    // const REGION = process.env.REGION!; // Replace with your region

    // AWS.config.update({
    //   accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY!,
    //   secretAccessKey: process.env.REACT_APP_AWS_SECRET!,
    // });

    // const s3 = new S3({
    //   params: { Bucket: S3_BUCKET },
    //   region: REGION,
    // });

    // const params = {
    //   Bucket: S3_BUCKET,
    //   Key: selectedImage.name,
    //   Body: selectedImage,
    // };

    // try {
    //   const upload = await s3.putObject(params).promise();
    //   console.log(upload);
    //   alert("File uploaded successfully.");

    // } catch (error: any) {
    //   console.error(error);
    //   alert("Error uploading file: " + error.message); // Inform user about the error
    // }

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
  ]

  return (
    <div className="control-group">

      {options.map((option, index) => (
        <Toggle key={index} onPressedChange={option.onClick} pressed={option.pressed}>{option.icon}</Toggle>
      ))}
      <label htmlFor="file-upload" className='custom-file-upload'>
        <Image className="size-4"></Image>
      </label>
      <input type="file" onChange={onFileUpload} id="file-upload"></input>
        
    </div>
  )
}

export default MenuBar