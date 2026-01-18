import { CreateTemplateForm } from '../CreateTemplateForm'

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-8">Create Template</h1>
      <CreateTemplateForm />
    </div>
  )
}
