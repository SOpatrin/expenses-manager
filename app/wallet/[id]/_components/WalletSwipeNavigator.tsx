'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import type { Wallet } from '@/lib/wallets'

const EDGE_THRESHOLD = 30
const MIN_SWIPE_DISTANCE = 60

export function WalletSwipeNavigator({
  wallets,
  currentId,
  children,
}: {
  wallets: Wallet[]
  currentId: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const startRef = useRef<{ x: number; y: number; fromEdge: boolean } | null>(
    null,
  )
  const currentIndex = wallets.findIndex((w) => w.id === currentId)

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    startRef.current = {
      x: t.clientX,
      y: t.clientY,
      fromEdge:
        t.clientX < EDGE_THRESHOLD ||
        t.clientX > window.innerWidth - EDGE_THRESHOLD,
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = startRef.current
    startRef.current = null
    if (!start?.fromEdge) return

    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y

    if (Math.abs(dx) < MIN_SWIPE_DISTANCE || Math.abs(dy) > Math.abs(dx)) return

    if (dx > 0 && currentIndex > 0) {
      router.push(`/wallet/${wallets[currentIndex - 1].id}`)
    } else if (dx < 0 && currentIndex < wallets.length - 1) {
      router.push(`/wallet/${wallets[currentIndex + 1].id}`)
    }
  }

  return (
    <div
      className="w-full max-w-lg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}
