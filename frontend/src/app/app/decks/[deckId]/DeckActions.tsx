'use client'

import { useState } from 'react'
import { exportDeckAction } from '@/app/actions/deck-export'
import { importDeckAction } from '@/app/actions/deck-import'
import { useRouter } from 'next/navigation'

interface DeckActionsProps {
  deckId: string
}

export function DeckActions({ deckId }: DeckActionsProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const router = useRouter()

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportDeckAction(deckId)
      if (result.success && result.json && result.filename) {
        // Create download
        const blob = new Blob([result.json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = result.filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        console.error('Failed to export deck:', result.error)
      }
    } catch (error) {
      console.error('Failed to export deck:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportError(null)

    try {
      const result = await importDeckAction(file)
      if (result.success && result.deckId) {
        router.push(`/app/decks/${result.deckId}`)
        router.refresh()
      } else {
        setImportError(result.error || 'Failed to import deck')
      }
    } catch (error) {
      setImportError('Failed to import deck')
    } finally {
      setImporting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  return (
    <div className="mb-6 flex gap-4">
      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {exporting ? 'Exporting...' : 'Export Deck'}
      </button>
      <label className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50">
        {importing ? 'Importing...' : 'Import Deck'}
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
          disabled={importing}
          className="hidden"
        />
      </label>
      {importError && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{importError}</p>
        </div>
      )}
    </div>
  )
}
