// src/Tiptap.tsx
import '../../tiptap.css'
import 'highlight.js/styles/github.css'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menuBar'
import { BulletList, ListItem } from '@tiptap/extension-list'
import { ImageUploadNode } from '../tiptap-node/image-upload-node'
import { handleImageUpload, MAX_FILE_SIZE } from '~/lib/tiptap-utils'
import { ImageUploadButton } from '../tiptap-ui/image-upload-button'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'

const lowlight = createLowlight()
lowlight.register('javascript', javascript)
lowlight.register('typescript', typescript)
lowlight.register('python', python)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('css', css)
lowlight.register('html', html)
lowlight.register('json', json)
lowlight.register('bash', bash)
lowlight.register('sql', sql)


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
        },
        codeBlock: false, // Disable default code block
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ListItem,
      Highlight,
      Image.configure({
        inline: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-white"
        }
      }),
      Placeholder.configure({
        placeholder: "Tell your Story.."
      }),
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
            class: "bg-[#0E0E11] rounded-xl border-solid text-white border-[1px] py-[8px] px-[12px] border-[#353535] min-h-500"
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