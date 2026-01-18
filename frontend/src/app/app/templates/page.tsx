import { listTemplates } from '@/lib/db/templates'
import Link from 'next/link'
import { TemplateList } from './TemplateList'

export default async function TemplatesPage() {
  let templates = []
  try {
    templates = await listTemplates()
  } catch (error) {
    console.error('Failed to load templates:', error)
    templates = []
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">Card Templates</h1>
        <Link
          href="/app/templates/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Template
        </Link>
      </div>

      <TemplateList templates={templates} />
    </div>
  )
}
