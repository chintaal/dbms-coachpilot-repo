'use client'

import { useState, useTransition } from 'react'
import { deleteTemplate } from '@/app/actions/templates'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

type Template = Database['public']['Tables']['card_templates'] extends { Row: infer R } ? R : any

export function TemplateList({ templates }: { templates: Template[] }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    startTransition(async () => {
      const result = await deleteTemplate(templateId)
      if (result.success) {
        router.refresh()
      } else {
        console.error('Failed to delete template:', result.error)
      }
    })
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No templates yet. Create your first template!
        </p>
        <Link
          href="/app/templates/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Template
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
        >
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
              {template.name}
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>
                <span className="font-medium">Front:</span>{' '}
                <span className="line-clamp-2">{template.front_template}</span>
              </div>
              <div>
                <span className="font-medium">Back:</span>{' '}
                <span className="line-clamp-2">{template.back_template}</span>
              </div>
              {template.default_tags && template.default_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.default_tags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/app/templates/${template.id}/edit`}
              className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit
            </Link>
            <button
              onClick={() => handleDelete(template.id)}
              disabled={isPending}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
