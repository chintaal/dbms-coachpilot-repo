'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import type { Database } from '@/types/supabase'

type Deck = Database['public']['Tables']['decks'] extends { Row: infer R } ? R : any

export function DeckList({ decks }: { decks: Deck[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck, index) => (
        <motion.div
          key={deck.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link href={`/app/decks/${deck.id}`} className="block">
            <Card hover className="p-6 h-full">
              <h2 className="text-xl font-semibold text-black dark:text-zinc-50 mb-2">
                {deck.title}
              </h2>
              {deck.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {deck.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Created {new Date(deck.created_at).toLocaleDateString()}
              </p>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
