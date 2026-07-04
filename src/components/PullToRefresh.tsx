/**
 * PullToRefresh — custom pull-down-to-reload for the app shell.
 * The app locks body scroll (it's a fixed full-screen experience), so the
 * browser's native pull-to-refresh never fires on Android Chrome. This wraps a
 * scroll area and, when dragged down from the top past a threshold, reloads the
 * page — with a buttery rubber-band follow and a spinner.
 */

import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 70
const MAX = 110

export function PullToRefresh({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const pullRef = useRef(0)
  const pulling = useRef(false)
  const startY = useRef(0)

  const set = (v: number) => {
    pullRef.current = v
    setPull(v)
  }

  useEffect(() => {
    const el = scrollRef.current!
    const onStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY
        pulling.current = true
      }
    }
    const onMove = (e: TouchEvent) => {
      if (!pulling.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0 && el.scrollTop <= 0) {
        e.preventDefault() // take over from native scroll while pulling
        set(Math.min(dy * 0.5, MAX)) // damped rubber-band
      } else if (dy <= 0) {
        set(0)
      }
    }
    const onEnd = () => {
      if (!pulling.current) return
      pulling.current = false
      if (pullRef.current >= THRESHOLD) {
        set(THRESHOLD)
        setRefreshing(true)
        window.setTimeout(() => window.location.reload(), 450)
      } else {
        set(0)
      }
    }
    el.addEventListener('touchstart', onStart, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  const ease = pulling.current ? 'none' : 'transform 320ms cubic-bezier(0.22,1,0.36,1)'

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          transform: `translateY(${pull - 34}px)`,
          opacity: Math.min(1, pull / THRESHOLD),
          transition: ease.replace('transform', 'transform, opacity'),
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '2px solid rgba(167,139,250,0.25)',
            borderTopColor: 'var(--accent)',
            transform: `rotate(${pull * 4}deg)`,
            animation: refreshing ? 'ptr-spin 0.7s linear infinite' : undefined,
          }}
        />
      </div>

      <div
        ref={scrollRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          transform: `translateY(${pull}px)`,
          transition: ease,
          ...style,
        }}
      >
        {children}
      </div>
      <style>{`@keyframes ptr-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
