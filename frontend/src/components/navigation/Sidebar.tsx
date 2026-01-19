'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
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
import { magneticHover, magneticTap, springSmooth } from '@/lib/animations/variants'

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

  const NavItem = ({ item, mobile }: { item: typeof navigation[0]; mobile: boolean }) => {
    const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href))
    const ref = useRef<HTMLAnchorElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const springX = useSpring(x, { stiffness: 300, damping: 30 })
    const springY = useSpring(y, { stiffness: 300, damping: 30 })

    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = e.clientX - centerX
      const distanceY = e.clientY - centerY
      x.set(distanceX * 0.1)
      y.set(distanceY * 0.1)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    return (
      <motion.div
        style={{ x: springX, y: springY }}
        whileHover={magneticHover}
        whileTap={magneticTap}
      >
        <Link
          ref={ref}
          href={item.href}
          onClick={() => mobile && setIsMobileOpen(false)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`
            relative flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-all duration-200 group
            ${isActive
              ? 'glass-strong text-blue-600 dark:text-blue-400 glow-blue'
              : 'text-gray-700 dark:text-gray-300 hover:glass-subtle'
            }
          `}
        >
          <motion.div
            animate={isActive ? { rotateY: [0, 360] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
          </motion.div>
          {(!isCollapsed || mobile) && (
            <motion.span
              initial={false}
              animate={{ opacity: isCollapsed && !mobile ? 0 : 1 }}
              className="font-medium"
            >
              {item.name}
            </motion.span>
          )}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full"
              initial={false}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>
    )
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : ''}`}>
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <Link href="/app" className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo width={isCollapsed && !mobile ? 40 : 150} height={isCollapsed && !mobile ? 40 : 38} />
          </motion.div>
        </Link>
        {mobile && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-lg glass-subtle hover:glass"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </motion.div>
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} mobile={mobile} />
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <motion.button
          whileHover={magneticHover}
          whileTap={magneticTap}
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:glass-subtle transition-all"
        >
          <LogOut className="h-5 w-5" />
          {(!isCollapsed || mobile) && <span>Sign out</span>}
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 256,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          hidden lg:flex flex-col
          fixed left-0 top-0 h-screen
          glass-strong
          border-r border-gray-200/50 dark:border-gray-800/50
          z-40
          overflow-hidden
        `}
      >
        <SidebarContent />
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleCollapse}
          className="absolute -right-3 top-20 p-1.5 rounded-full glass-strong border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all"
        >
          <Menu className="h-4 w-4" />
        </motion.button>
      </motion.aside>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-strong border border-gray-200/50 dark:border-gray-800/50 shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280, rotateY: -15 }}
              animate={{ x: 0, rotateY: 0 }}
              exit={{ x: -280, rotateY: -15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-64 glass-strong border-r border-gray-200/50 dark:border-gray-800/50 z-50 lg:hidden"
            >
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
