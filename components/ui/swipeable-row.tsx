'use client'

import { useRef, useState } from 'react'

const SWIPE_THRESHOLD = 80

interface SwipeableRowProps {
  onDelete: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function SwipeableRow({
  onDelete,
  disabled = false,
  children,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const direction = useRef<'h' | 'v' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    direction.current = null
    setDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (direction.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
        direction.current = 'h'
      } else {
        direction.current = 'v'
        setDragging(false)
        return
      }
    }

    if (direction.current === 'v') return
    setOffset(Math.max(dx, -SWIPE_THRESHOLD - 16))
  }

  const handleTouchEnd = () => {
    setDragging(false)
    if (offset <= -SWIPE_THRESHOLD) {
      onDelete()
    }
    setOffset(0)
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500">
        <span className="text-xs font-medium text-white">Удалить</span>
      </div>
      <div
        className="bg-background relative"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.25s ease-out',
        }}
        onTouchStart={disabled ? undefined : handleTouchStart}
        onTouchMove={disabled ? undefined : handleTouchMove}
        onTouchEnd={disabled ? undefined : handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
