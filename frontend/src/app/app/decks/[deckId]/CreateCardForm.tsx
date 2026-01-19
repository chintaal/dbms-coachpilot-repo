'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { createCard } from '@/app/actions/cards'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ImageUpload } from '@/components/upload/ImageUpload'
import { useToast } from '@/hooks/useToast'
import type { Database } from '@/types/supabase'

// Use conditional types to handle cases where tables don't exist yet
type Card = Database['public']['Tables']['cards'] extends { Row: infer R } ? R : any
type Template = Database['public']['Tables']['card_templates'] extends { Row: infer R } ? R : any

export function CreateCardForm({ deckId, templates }: { deckId: string; templates: Template[] }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [front, setFront] = useState('')
  const [frontHtml, setFrontHtml] = useState('')
  const [frontImageUrl, setFrontImageUrl] = useState<string | null>(null)
  const [back, setBack] = useState('')
  const [backHtml, setBackHtml] = useState('')
  const [backImageUrl, setBackImageUrl] = useState<string | null>(null)
  const [tags, setTags] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const toast = useToast()

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      // For now, just set the templates as placeholders
      // In a full implementation, you'd have a form to fill in template variables
      setFront(template.front_template)
      setFrontHtml('')
      setBack(template.back_template)
      setBackHtml('')
      setTags(template.default_tags?.join(', ') || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    startTransition(async () => {
      const result = await createCard(
        deckId,
        front,
        back,
        tagsArray.length > 0 ? tagsArray : undefined,
        undefined,
        frontHtml || undefined,
        backHtml || undefined,
        frontImageUrl || undefined,
        backImageUrl || undefined,
        selectedTemplateId || undefined
      )
      if (result.success) {
        setSelectedTemplateId('')
        setFront('')
        setFrontHtml('')
        setFrontImageUrl(null)
        setBack('')
        setBackHtml('')
        setBackImageUrl(null)
        setTags('')
        toast.success('Card created successfully!')
        router.refresh()
      } else {
        toast.error('Failed to create card', result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      {templates.length > 0 && (
        <div>
          <label
            htmlFor="template"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Template (optional)
          </label>
          <select
            id="template"
            value={selectedTemplateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50"
          >
            <option value="">None - Create from scratch</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label
          htmlFor="front"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Front
        </label>
        <RichTextEditor
          content={frontHtml || front}
          onChange={(html, text) => {
            setFrontHtml(html)
            setFront(text)
          }}
          placeholder="Question or term"
          className="mt-1"
        />
      </div>
      <div>
        <label
          htmlFor="back"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Back
        </label>
        <RichTextEditor
          content={backHtml || back}
          onChange={(html, text) => {
            setBackHtml(html)
            setBack(text)
          }}
          placeholder="Answer or definition"
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageUpload
          value={frontImageUrl || undefined}
          onChange={setFrontImageUrl}
          label="Front Image (optional)"
        />
        <ImageUpload
          value={backImageUrl || undefined}
          onChange={setBackImageUrl}
          label="Back Image (optional)"
        />
      </div>
      <div>
        <label
          htmlFor="tags"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-black dark:text-zinc-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="tag1, tag2, tag3"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Card'}
      </button>
    </form>
  )
}
