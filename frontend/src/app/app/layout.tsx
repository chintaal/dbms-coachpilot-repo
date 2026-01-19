import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/navigation/Sidebar'
import { CommandPalette } from '@/components/navigation/CommandPalette'
import { Background3D } from '@/components/three/Background3D'
import { PageTransition } from '@/components/navigation/PageTransition'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black relative overflow-hidden">
      <Background3D />
      <Sidebar />
      <CommandPalette />
      <main className="lg:pl-64 transition-all duration-300 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
