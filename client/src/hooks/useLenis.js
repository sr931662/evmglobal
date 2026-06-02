import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'

let _lenis = null
export const getLenis = () => _lenis

export function useLenis(enabled = true) {
  const lenisRef = useRef(null)

  useEffect(() => {
    // Tear down any existing instance when switching modes
    if (!enabled) {
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
        _lenis = null
      }
      return
    }

    // Already running — nothing to do
    if (lenisRef.current) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })
    lenisRef.current = lenis
    _lenis = lenis

    let rafId
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
      _lenis = null
    }
  }, [enabled])

  return lenisRef
}
