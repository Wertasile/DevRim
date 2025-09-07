// src/Tiptap.tsx
import '../../tiptap.css'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menuBar'
import { BulletList, ListItem } from '@tiptap/extension-list'
import { ImageUploadNode } from '../tiptap-node/image-upload-node'
import { handleImageUpload, MAX_FILE_SIZE } from '~/lib/tiptap-utils'
import { ImageUploadButton } from '../tiptap-ui/image-upload-button'

type TipTapProps = {
  content : any | null;
  handleChange : (content: any) => void;
}

const Tiptap = ({content, handleChange} : TipTapProps) => {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3"
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3"
          }
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ListItem,
      Highlight,
      Image,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      })
    ],
    content: content,
    immediatelyRender: false,
    editorProps: {
        attributes: {
            class: "bg-[#111] rounded-xl border-solid border-[1px] py-[8px] px-[12px] border-[#353535] min-h-[156px]"
        }
    },
    onUpdate: ({editor}) => {
      handleChange(editor.getJSON())
      // console.log(editor.getHTML())
    }
  })

  return (
    <>
      <MenuBar editor={editor}/>
      {/* <ImageUploadButton
        editor={editor}
        text="Add Image"
        hideWhenUnavailable={true}
        showShortcut={true}
        onInserted={() => console.log('Image inserted!')}
        // onClick={addImage}
      /> */}
      <EditorContent editor={editor} />
      
    </>
  )
}

export default Tiptap