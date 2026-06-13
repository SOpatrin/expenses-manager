'use client'

import { useEffect, useRef } from 'react'

const SWIPE_THRESHOLD = 80
const VELOCITY_THRESHOLD = 0.4 // px/ms

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
  const containerRef = useRef<HTMLDivElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const direction = useRef<'h' | 'v' | null>(null)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocityX = useRef(0)
  const offset = useRef(0)

  const move = (x: number, transition = 'none') => {
    const el = rowRef.current
    if (!el) return
    el.style.transition = transition
    el.style.transform = `translateX(${x}px)`
    offset.current = x
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el || disabled) return
    const onTouchMove = (e: TouchEvent) => {
      if (direction.current === 'h') e.preventDefault()
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [disabled])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    lastX.current = e.touches[0].clientX
    lastTime.current = Date.now()
    velocityX.current = 0
    direction.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const clientX = e.touches[0].clientX
    const dx = clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    if (direction.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && dx < 0) {
        direction.current = 'h'
      } else {
        direction.current = 'v'
        return
      }
    }

    if (direction.current === 'v') return

    const now = Date.now()
    const dt = now - lastTime.current
    if (dt > 0) velocityX.current = (clientX - lastX.current) / dt
    lastX.current = clientX
    lastTime.current = now

    move(Math.max(dx, -SWIPE_THRESHOLD - 16))
  }

  const handleTouchEnd = () => {
    if (
      offset.current <= -SWIPE_THRESHOLD ||
      velocityX.current < -VELOCITY_THRESHOLD
    ) {
      move(-window.innerWidth, 'transform 0.3s ease-in')
      setTimeout(onDelete, 300)
    } else {
      move(0, 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)')
    }
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500">
        <span className="text-xs font-medium text-white">Удалить</span>
      </div>
      <div
        ref={rowRef}
        className="bg-background relative"
        onTouchStart={disabled ? undefined : handleTouchStart}
        onTouchMove={disabled ? undefined : handleTouchMove}
        onTouchEnd={disabled ? undefined : handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
