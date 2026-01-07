// Natural Editor - First line is title, second line is content
import '../../tiptap.css'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extensions'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import MenuBar from './menuBar'
import { ImageUploadNode } from '../tiptap-node/image-upload-node'
import { handleImageUpload, MAX_FILE_SIZE } from '~/lib/tiptap-utils'
import CodeBlock from '@tiptap/extension-code-block'
import { useEffect } from 'react'
import { TextSelection } from '@tiptap/pm/state'

type NaturalEditorProps = {
  content: any | null;
  handleChange: (content: any) => void;
  onTitleChange?: (title: string) => void;
  onSummaryChange?: (summary: string) => void;
}

const NaturalEditor = ({ content, handleChange, onTitleChange, onSummaryChange }: NaturalEditorProps) => {
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
      Highlight,
      Image.configure({
        inline: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-white"
        }
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          // First line (heading) placeholder
          if (node.type.name === 'heading') {
            return 'Title';
          }
          // Second line (paragraph) placeholder
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
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '' }]
        },
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
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        
        // If we're in the first heading (title) and press Enter, move to next paragraph
        if (event.key === 'Enter' && $from.parent.type.name === 'heading' && $from.depth === 1) {
          // Check if we're in the first node
          const firstNode = state.doc.firstChild;
          if (firstNode && firstNode.type.name === 'heading' && $from.before() === 1) {
            event.preventDefault();
            // Move to the second node (content) or create it if it doesn't exist
            const secondNodePos = firstNode.nodeSize;
            const resolvedPos = state.doc.resolve(secondNodePos);
            const selection = TextSelection.create(state.doc, resolvedPos.pos);
            view.dispatch(state.tr.setSelection(selection));
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      handleChange(json);
      
      // Extract title from first heading
      if (json.content && json.content[0] && json.content[0].type === 'heading') {
        const titleNode = json.content[0];
        if (titleNode.content && Array.isArray(titleNode.content)) {
          // Extract all text from title node (handles multiple text nodes)
          const title = titleNode.content
            .filter((node: any) => node.type === 'text')
            .map((node: any) => node.text || '')
            .join('');
          onTitleChange?.(title);
        } else {
          onTitleChange?.('');
        }
      } else {
        onTitleChange?.('');
      }
    }
  });

  // Set initial focus on title
  useEffect(() => {
    if (editor && !content) {
      setTimeout(() => {
        editor.commands.focus('start');
        editor.commands.setHeading({ level: 1 });
      }, 100);
    }
  }, [editor, content]);

  return (
    <div className="w-full overflow-hidden">
      <div className="border border-[#1f2735] bg-[#EDEDE9] px-4 py-2">
        <MenuBar editor={editor} />
      </div>
      <div className="prose-wrapper">
        <style>{`
          .prose h1 {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 2rem;
            color: #000000;
            border-bottom: none;
            padding-bottom: 0;
            text-align: center;
          }
          .prose h1:focus {
            outline: none;
          }
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
          
          /* Placeholder styles - Medium-like */
          .prose h1.is-empty::before,
          .tiptap h1.is-empty::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
            font-size: 2.5rem;
            font-weight: 700;
            text-align: center;
            width: 100%;
            display: block;
            opacity: 0.6;
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
          
          .prose h1.is-empty:first-child::before,
          .tiptap h1.is-empty:first-child::before {
            display: block;
            text-align: center;
            width: 100%;
          }
          
          /* Ensure placeholders are visible */
          .prose .is-empty,
          .tiptap .is-empty {
            position: relative;
          }
          
          /* Make sure empty nodes show placeholders */
          .prose h1.is-empty:first-child,
          .tiptap h1.is-empty:first-child {
            min-height: 3rem;
          }
          
          .prose p.is-empty,
          .tiptap p.is-empty {
            min-height: 1.5rem;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default NaturalEditor;

