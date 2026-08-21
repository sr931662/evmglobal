import { useEffect } from 'react'
import { getLenis } from './useLenis'

/**
 * Locks page scroll for as long as `enabled` is true. Defaults to true so
 * existing callers — a modal rendered as its own component, locking for its
 * whole mounted lifetime — are unaffected. Pass `enabled` explicitly when the
 * lock/unlock needs to track a boolean like `showModal` inside a component
 * that stays mounted regardless (the modal is conditionally rendered inline
 * rather than as a separate component).
 */
export function useScrollLock(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()

    return () => {
      document.body.style.overflow = prev
      getLenis()?.start()
    }
  }, [enabled])
}
