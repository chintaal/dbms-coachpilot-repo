import { getTemplate } from '@/lib/db/templates'
import { notFound } from 'next/navigation'
import { EditTemplateForm } from '../../EditTemplateForm'

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params

  try {
    const template = await getTemplate(templateId)
    return (
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Edit Template</h1>
        <EditTemplateForm template={template} />
      </div>
    )
  } catch (error) {
    notFound()
  }
}
