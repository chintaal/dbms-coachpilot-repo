'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import type { Database } from '@/types/supabase'
import { staggerContainer, staggerItem, springBounce } from '@/lib/animations/variants'

type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any

export function DeckList({ decks }: { decks: Deck[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 perspective-2000"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {decks.map((deck, index) => (
        <motion.div
          key={deck.id}
          variants={springBounce}
          custom={index}
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(${index * -10}px)`,
          }}
        >
          <Link href={`/app/decks/${deck.id}`} className="block h-full">
            <Card hover variant="glass-strong" className="p-6 h-full group relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <div className="relative z-10">
                <motion.h2
                  className="text-xl font-semibold text-black dark:text-zinc-50 mb-2"
                  whileHover={{ scale: 1.05 }}
                >
                  {deck.title}
                </motion.h2>
                {deck.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {deck.description}
                  </p>
                )}
                <motion.p
                  className="text-xs text-gray-500 dark:text-gray-500"
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1 }}
                >
                  Created {new Date(deck.created_at).toLocaleDateString()}
                </motion.p>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
