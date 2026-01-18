'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string, text: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Enter text...',
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      onChange(html, text)
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-3 py-2 ${className}`,
      },
    },
  })

  if (!editor) {
    return null
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run()
  const toggleItalic = () => editor.chain().focus().toggleItalic().run()
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run()
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run()
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 px-2 py-1">
        <button
          type="button"
          onClick={toggleBold}
          className={`rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bold')
              ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-zinc-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('italic')
              ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-zinc-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={toggleBulletList}
          className={`rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList')
              ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-zinc-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={toggleOrderedList}
          className={`rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList')
              ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-zinc-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <button
          type="button"
          onClick={setLink}
          className={`rounded px-2 py-1 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('link')
              ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-zinc-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          title="Link"
        >
          🔗
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[100px] px-3 py-2 text-black dark:text-zinc-50"
      />
    </div>
  )
}
