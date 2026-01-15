// Natural Editor - Content editor (title is separate, passed via titleInput prop)
import React from 'react'
import '../../tiptap.css'
import 'highlight.js/styles/github.css'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menuBar'
import { ImageUploadNode } from '../tiptap-node/image-upload-node'
import { handleImageUpload, MAX_FILE_SIZE } from '~/lib/tiptap-utils'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { useEffect } from 'react'
import { X } from 'lucide-react'
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

type NaturalEditorProps = {
  content: any | null;
  handleChange: (content: any) => void;
  onTitleChange?: (title: string) => void;
  onSummaryChange?: (summary: string) => void;
  coverImage?: string;
  showSummaryInput?: boolean;
  summary?: string;
  setSummary?: (summary: string) => void;
  setShowSummaryInput?: (showSummaryInput: boolean) => void;
  titleInput?: React.ReactNode;
  handleRemoveCoverImage?: () => void;
}

const NaturalEditor = ({ content, handleChange, onTitleChange, onSummaryChange, showSummaryInput, summary, setSummary, setShowSummaryInput, titleInput, coverImage, handleRemoveCoverImage }: NaturalEditorProps) => {
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
      Highlight,
      Image.configure({
        inline: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "code-block-styled"
        }
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          // Paragraph placeholder
          if (node.type.name === 'paragraph') {
            return 'Tell your story...';
          }
          // Default placeholder
          return '';
        },
      }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error),
      })
    ],
    content: content ? content : {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: []
        }
      ]
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose max-w-none bg-transparent text-black min-h-[600px] px-8 py-12 focus:outline-none"
      },
      handleKeyDown: (view, event) => {
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      handleChange(json);
    }
  });

  // Set initial focus on editor
  useEffect(() => {
    if (editor && !content) {
      setTimeout(() => {
        editor.commands.focus('start');
      }, 100);
    }
  }, [editor, content]);

  return (
    <div className="w-full border border-[#979797] flex flex-col">
      <div className="sticky top-0 z-10 flex gap-[20px] p-[10px] flex-col bg-[#EDEDE9] border-b border-[#000000] rounded-t-lg shadow-lg">
        <MenuBar editor={editor} />
      </div>
      {titleInput && (
        <div>
          {titleInput}
        </div>
      )}
      {showSummaryInput && (
        <div className='relative mb-4'>
          <div className=' flex items-center justify-between mb-2 '>
            <label htmlFor="summary" className='hidden'>
              SUMMARY
            </label>
            {/* <button
              onClick={() => {
                setShowSummaryInput(false);
                setSummary('');
              }}
              className='p-1 hover:bg-[#EDEDE9] rounded transition-colors'
              title="Close summary"
            >
              <X size={16} className='text-black' />
            </button> */}
          </div>
          <input
            type='text'
            id='summary'
            name="summary"
            value={summary || ''}
            onChange={(e) => setSummary?.(e.target.value)}
            placeholder='Add a brief summary of your post (optional)'
            maxLength={250}
            className="min-w-full py-2 px-8 focus:outline-none placeholder:text-[#9ca3af] placeholder:opacity-60"
            style={{fontSize: '20px', fontWeight: 'medium', fontFamily: 'ManRope'}}
          />
          <p className='absolute -top-5 right-5 text-black/60 text-xs mt-1'>{summary?.length}/250 characters</p>
        </div>
      )}
      {coverImage && (
        <div className='relative w-fit self-center rounded-lg overflow-hidden'>
          <img
            src={coverImage}
            alt="Cover preview"
            className='w-full h-auto'
            style={{ aspectRatio: '2/1', maxWidth: '750px', objectFit:'cover' }}
          />
          <button
            type="button"
            onClick={handleRemoveCoverImage}
            className="absolute top-3 right-3 bg-[#E95444] hover:bg-[#D84335] text-white rounded-full p-2 transition-all duration-200 shadow-lg border-2 border-[#000000]"
            title="Remove cover image"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="prose-wrapper rounded-b-lg">
        <style>{`
          .prose p {
            font-size: 1.125rem;
            line-height: 1.75;
            color: #000000;
            margin-bottom: 1.5rem;
          }
          .prose p:first-of-type {
            margin-top: 0;
          }
          .prose-wrapper {
            max-width: 100%;
          }
          
          .prose p.is-empty::before,
          .tiptap p.is-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
            font-size: 1.125rem;
            line-height: 1.75;
            opacity: 0.6;
          }
          
          /* Ensure placeholders are visible */
          .prose .is-empty,
          .tiptap .is-empty {
            position: relative;
          }
          
          .prose p.is-empty,
          .tiptap p.is-empty {
            min-height: 1.5rem;
          }
          
          /* Code block styling - override tiptap.css */
          .prose pre,
          .tiptap pre,
          .prose pre.code-block-styled,
          .tiptap pre.code-block-styled {
            background-color: #EDEDE9 !important;
            border-radius: 0.375rem;
            padding: 1rem;
            margin: 1.5rem 0;
            overflow-x: auto;
            color: #000000 !important;
          }
          
          .prose pre code,
          .tiptap pre code,
          .code-block-styled,
          .prose pre.code-block-styled code,
          .tiptap pre.code-block-styled code {
            background-color: #EDEDE9 !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            font-size: 0.875rem;
            line-height: 1.5;
            color: #000000 !important;
            padding: 0;
            border-radius: 0;
          }
          
          .prose code:not(pre code),
          .tiptap code:not(pre code) {
            background-color: #EDEDE9 !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
            font-size: 0.875rem;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            color: #000000 !important;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default NaturalEditor;

