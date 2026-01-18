import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Auth Test</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">User Data:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ user, error }, null, 2)}
        </pre>
      </div>
      {!user && (
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          No user authenticated. This is expected if you haven't logged in yet.
        </p>
      )}
    </div>
  )
}
