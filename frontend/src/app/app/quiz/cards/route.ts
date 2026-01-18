import { listCards } from '@/lib/db/cards'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const deckId = searchParams.get('deckId')

  if (!deckId) {
    return NextResponse.json({ error: 'deckId is required' }, { status: 400 })
  }

  try {
    const cards = await listCards(deckId)
    return NextResponse.json(cards)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cards' }, { status: 500 })
  }
}
