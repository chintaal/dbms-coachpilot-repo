'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  Import,
  Mic,
  FileText,
  BarChart3,
  Search,
  Plus,
} from 'lucide-react'
import { modalContent, modalBackdrop, springSmooth } from '@/lib/animations/variants'

const commands = [
  { id: 'dashboard', label: 'Go to Dashboard', href: '/app', icon: LayoutDashboard, keywords: ['home', 'main'] },
  { id: 'review', label: 'Start Review', href: '/app/review', icon: BookOpen, keywords: ['study', 'cards'] },
  { id: 'quiz', label: 'Start Quiz', href: '/app/quiz', icon: FileQuestion, keywords: ['test', 'practice'] },
  { id: 'import', label: 'Import Notes', href: '/app/import', icon: Import, keywords: ['add', 'notes'] },
  { id: 'voice', label: 'Voice Card', href: '/app/voice', icon: Mic, keywords: ['speak', 'audio'] },
  { id: 'templates', label: 'Templates', href: '/app/templates', icon: FileText, keywords: ['template', 'card'] },
  { id: 'stats', label: 'Statistics', href: '/app/stats', icon: BarChart3, keywords: ['analytics', 'progress'] },
  { id: 'create-deck', label: 'Create New Deck', href: '/app', icon: Plus, keywords: ['new', 'add'], action: 'create-deck' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSelect = (command: typeof commands[0]) => {
    if (command.action === 'create-deck') {
      // Trigger create deck modal - this would need to be handled via context or event
      setOpen(false)
      return
    }
    router.push(command.href)
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 pointer-events-none">
            <motion.div
              variants={modalContent}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-2xl rounded-xl glass-strong border border-gray-200/50 dark:border-gray-800/50 shadow-2xl overflow-hidden pointer-events-auto"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Command className="rounded-lg">
                <div className="flex items-center border-b border-gray-200/50 dark:border-gray-800/50 px-4 bg-gradient-glass">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Search className="mr-2 h-4 w-4 text-gray-400" />
                  </motion.div>
                  <Command.Input
                    placeholder="Type a command or search..."
                    className="flex h-12 w-full bg-transparent outline-none placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                </div>
                <Command.List className="max-h-96 overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-gray-500">
                    No results found.
                  </Command.Empty>
                  {commands.map((command, index) => (
                    <motion.div
                      key={command.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Command.Item
                        onSelect={() => handleSelect(command)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all aria-selected:glass aria-selected:text-blue-600 dark:aria-selected:text-blue-400 aria-selected:glow-blue hover:glass-subtle"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <command.icon className="h-4 w-4" />
                        </motion.div>
                        <span>{command.label}</span>
                      </Command.Item>
                    </motion.div>
                  ))}
                </Command.List>
                <div className="border-t border-gray-200/50 dark:border-gray-800/50 px-4 py-2 text-xs text-gray-500 glass-subtle">
                  <kbd className="px-2 py-1 rounded glass">Esc</kbd> to close
                </div>
              </Command>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
