'use client'

import { useState, useTransition } from 'react'
import { createTemplate } from '@/app/actions/templates'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function CreateTemplateForm() {
  const [name, setName] = useState('')
  const [frontTemplate, setFrontTemplate] = useState('')
  const [backTemplate, setBackTemplate] = useState('')
  const [tags, setTags] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    startTransition(async () => {
      const result = await createTemplate(name, frontTemplate, backTemplate, tagsArray.length > 0 ? tagsArray : undefined)
      if (result.success) {
        router.push('/app/templates')
        router.refresh()
      } else {
        console.error('Failed to create template:', result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Template Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
          placeholder="e.g., Vocabulary Card"
        />
      </div>
      <div>
        <label htmlFor="frontTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Front Template
        </label>
        <textarea
          id="frontTemplate"
          required
          value={frontTemplate}
          onChange={(e) => setFrontTemplate(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
          placeholder="Use {{term}} or {{definition}} as placeholders"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use placeholders like {'{{term}}'} or {'{{definition}}'} that will be replaced when creating cards
        </p>
      </div>
      <div>
        <label htmlFor="backTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Back Template
        </label>
        <textarea
          id="backTemplate"
          required
          value={backTemplate}
          onChange={(e) => setBackTemplate(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
          placeholder="Use {{term}} or {{definition}} as placeholders"
        />
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Default Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <div className="flex gap-2">
        <Link
          href="/app/templates"
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Creating...' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}
