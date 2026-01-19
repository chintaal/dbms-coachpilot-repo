'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Import,
  Mic,
  FileText,
  BarChart3,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/branding/Logo'
import { signOut } from '@/app/actions/auth'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Review', href: '/app/review', icon: BookOpen },
  { name: 'Quiz', href: '/app/quiz', icon: FileQuestion },
  { name: 'Import', href: '/app/import', icon: Import },
  { name: 'Voice', href: '/app/voice', icon: Mic },
  { name: 'Templates', href: '/app/templates', icon: FileText },
  { name: 'Statistics', href: '/app/stats', icon: BarChart3 },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved))
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <Link href="/app" className="flex items-center">
          <Logo width={isCollapsed && !mobile ? 40 : 150} height={isCollapsed && !mobile ? 40 : 38} />
        </Link>
        {mobile && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => mobile && setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {(!isCollapsed || mobile) && (
                <span className="font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {(!isCollapsed || mobile) && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col
          fixed left-0 top-0 h-screen
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          transition-all duration-300
          z-40
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent />
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 p-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
          <Menu className="h-4 w-4" />
        </button>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
